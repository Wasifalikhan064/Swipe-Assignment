import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";

const apiKey = import.meta.env.VITE_APP_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const extractData = async (file) => {
  try {
    if (
      file.type.includes("sheet") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {
      return await processExcelFile(file);
    } else if (file.type.includes("pdf") || file.type.includes("image")) {
      return await handleFileExtraction(file);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error("Extraction error:", error);
    return {
      success: false,
      error: error.message || "Failed to extract data from file",
    };
  }
};

const processExcelFile = async (uploadedFile) => {
  try {
    if (!uploadedFile || !(uploadedFile instanceof Blob)) {
      throw new Error("Please upload a valid Excel file.");
    }

    const fileReader = new FileReader();
    let organizedData;

     await new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        try {
          const rawData = new Uint8Array(event.target.result);
          const workbook = XLSX.read(rawData, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonContent = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

          if (!jsonContent || jsonContent.length === 0) {
            throw new Error(
              "The Excel file is empty or improperly structured."
            );
          }

          const contentAsString = JSON.stringify(jsonContent);

          const aiModel = genAI.getGenerativeModel({
            model: "gemini-1.5-pro-latest",
          });

          const requestPrompt = `Here's the data from the Excel file: ${contentAsString}
 The task is to extract and organize the following into three structured JSON objects:

1. **Invoices**:
    - Extract transaction data such as invoice details (serial number, customer name, product, etc.)
    - Columns: Serial Number, Customer Name, Product Name, Quantity, Tax, Total Amount, Date
    - Please ensure that all quantities, totals, taxes, and dates are formatted correctly.
    - Date should be in ISO 8601 format (YYYY-MM-DD).
    - Extract transaction data including invoice details such as:
      Serial Number
      Customer Name (if available, else leave blank)
      Product Name
      Quantity (as a number)
      Tax (as a percentage, without the "%" symbol)
      Total Amount (as a number, inclusive of taxes)
      Date (in ISO 8601 format: YYYY-MM-DD)
      Ensure all numerical values (quantity, tax, total amount) are parsed as numbers.

2. **Products**:
    - Extract information about each product in the invoices.
    - Columns: Product Name, Category, Unit Price, Tax, Price with Tax, Stock Quantity
    - Please include a "Category" if it's available in the data, or leave it empty if not.
    - Price with Tax = Unit Price + Tax (calculate this based on available data).
    - Ensure all quantities, prices, and tax are formatted as numbers.
    - Extract detailed information about each unique product mentioned in the invoices:
      Product Name
      Category (if available, else leave blank)
      Unit Price (as a number, exclusive of taxes)
      Tax (as a percentage)
      Price with Tax (calculate if not provided: Unit Price + (Unit Price * Tax / 100))
      Stock Quantity (if available, else leave as null)
      Duplicate products, so each product appears only once with its consolidated details.

      3. **Customers**:
    - Extract customer information, including details from the invoices.
    - Columns: Customer Name, Phone Number, Total Purchase Amount.
    - If the "Phone Number" is not available, leave it empty.
    - Ensure that the "Total Purchase Amount" is the total spent by each customer (sum of their invoice totals).
    - Extract and consolidate customer details from the invoices:
      Customer Name (use a placeholder like "Unknown" if not available)
      Phone Number (if available, else leave blank)
      Total Purchase Amount (sum of all their invoice totals, inclusive of taxes)
      For Excel files follow the strict format of schema given above also strictly ensure that neither extra space nor extra character should be present ,neither any single syntax error should occur neither JSON input should unexpectedly end
- Output the result in valid JSON format with the structure:
{
    "Invoices": [
        {
            "Serial Number": "<value>",
            "Customer Name": "<value>",
            "Product Name": "<value>",
            "Quantity": <value>,
            "Tax": <value>,
            "Total Amount": <value>,
            "Date": "<value>"
        }
    ],
    "Products": [
        {
            "Product Name": "<value>",
            "Quantity": "<value>"
            "Unit Price": <value>,
            "Tax": <value>,
            "Price with Tax": <value>,
        }
    ],
    "Customers": [
        {
            "Customer Name": "<value>",
            "Phone Number": "<value>",
            "Total Purchase Amount": <value>
        }
    ]
}

Formatting Guidelines:

Ensure all numerical values (e.g., quantity, totals, tax, prices) are properly formatted as numbers, not strings.
Dates must strictly follow ISO 8601 format (YYYY-MM-DD).
Leave missing or unavailable data fields empty (e.g., "" or null).
De duplicate products and customers, ensuring consolidated details.
Edge Cases:

Handle cases where invoice rows might have duplicate or redundant product names within the same invoice (e.g., "Shipping Charges" repeated).
Summarize purchase totals by customer correctly, even if the customer's name is missing or repeated.
Account for possible variations in data formats (e.g., different numeric precision or redundant trailing zeros).

Provide the output in valid JSON format, and ensure all values are aligned with the specified schema.`;

          const modelResponse = await aiModel.generateContent([
            contentAsString,
            requestPrompt,
          ]);
          const response = await modelResponse.response;
          let res = response.text();
          res = res.substring(7);
          res = res.slice(0, -3);
          res = res
            .trim() // Remove leading and trailing whitespace
            .replace(/^[^{\[]*/, "") // Remove anything before the first `{` or `[`
            .replace(/[^}\]]*$/, "") // Remove anything after the last `}` or `]`
            .replace(/```json|```/g, "") // Remove Markdown markers
            .replace(/,\s*([\]}])/g, "$1") // Remove trailing commas
            .replace(/[\u0000-\u001F\u007F]/g, "") // Remove non-printable characters
            .replace(/\/\/.*$/gm, "") // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
            .replace(/\s+/g, " "); // Normalize whitespace

          //console.log("Gemini response:", res);

          const parsedJson = JSON.parse(res);
          organizedData = {
            invoices: parsedJson?.Invoices || [],
            products: parsedJson?.Products || [],
            customers: parsedJson?.Customers || [],
          };
          resolve(organizedData);
        } catch (err) {
          console.error("Error processing the Excel file:", err);
          reject(err);
        }
      };

      fileReader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };

      fileReader.readAsArrayBuffer(uploadedFile);
    });
    return {
      success: true,
      data: organizedData,
    };
  } catch (error) {
    console.error("Error processing the Excel file:", error);
    throw error;
  }
};

const handleFileExtraction = async (uploadedFile) => {
  try {
    // Load the generative AI model
    const aiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
    });

    // Convert the file into base64 and metadata for processing
    const artifactData = await generateArtifactFromFile(uploadedFile);

    // Prepare the prompt for AI model
    const extractionPrompt = `
      Analyze the provided document, which could be an image, PDF, or Excel, and extract structured data as follows:
      Use OCR technology to accurately extract text before processing the data
      **Invoices**:
      - Fields: Serial Number, Customer Name, Product Name, Quantity, Tax, Total Amount, Date.
      - Ensure all values are accurately extracted, with numbers as numerical values and dates in ISO 8601 format.

      **Products**:
    
     - Fields: Product Name, Quantity, Unit Price, Tax, Price with Tax, Discount.
     - Price with Tax = Unit Price + Tax.
     - Extract "Discount" if available in the document. If not present, leave it empty.


      **Customers**:
      - Fields: Customer Name, Phone Number, Total Purchase Amount.
      - If phone number is missing, leave it blank.
      - Total Purchase Amount should sum all invoice totals for each customer.

      Format the output as valid JSON:
      {
          "Invoices": [
              {
                  "Serial Number": "<value>",
                  "Customer Name": "<value>",
                  "Product Name": "<value>",
                  "Quantity": <value>,
                  "Tax": <value>,
                  "Total Amount": <value>,
                  "Date": "<value>"
              }
          ],
          "Products": [
              {    
                "Product Name": "<value>",
                "Quantity": "<value>"
                "Unit Price": <value>,
                "Tax": <value>,
                "Price with Tax": <value>,
              }
          ],
          "Customers": [
              {
                  "Customer Name": "<value>",
                  "Phone Number": "<value>",
                  "Total Purchase Amount": <value>
              }
          ]
      }

      Ensure correctness and handle missing fields gracefully. Respond only with JSON.
    `;

    // Generate AI-based content
    const generatedContent = await aiModel.generateContent([
      artifactData,
      extractionPrompt,
    ]);
    const aiResponse = await generatedContent.response.text();

    //console.log("AI Raw Response:", aiResponse);

    // Extract valid JSON part from the response (assuming it contains extra characters)
    const jsonResponseStart = aiResponse.indexOf("{");
    const jsonResponseEnd = aiResponse.lastIndexOf("}") + 1;
    const jsonContent = aiResponse.substring(
      jsonResponseStart,
      jsonResponseEnd
    );

    // Parse the JSON and map to required structure
    const parsedJson = JSON.parse(jsonContent);
    const outputData = {
      invoices: parsedJson?.Invoices || [],
      products: parsedJson?.Products || [],
      customers: parsedJson?.Customers || [],
    };

    return { success: true, data: outputData };
  } catch (err) {
    console.error("Error during file extraction:", err);
    return { success: false, error: err.message };
  }
};

const generateArtifactFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const fileBase64 = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: fileBase64,
          mimeType: file.type,
        },
      });
    };

    reader.onerror = (err) => reject(new Error("Error reading file"));

    reader.readAsDataURL(file);
  });
};
