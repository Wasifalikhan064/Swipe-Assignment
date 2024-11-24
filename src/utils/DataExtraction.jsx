import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";

const apiKey=import.meta.env.VITE_APP_KEY
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

    const parsedData = await new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        try {
          const rawData = new Uint8Array(event.target.result);
          const workbook = XLSX.read(rawData, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonContent = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (!jsonContent || jsonContent.length === 0) {
            throw new Error("The Excel file is empty or improperly structured.");
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

2. **Products**:
    - Extract information about each product in the invoices.
    - Columns: Product Name, Category, Unit Price, Tax, Price with Tax, Stock Quantity
    - Please include a "Category" if it's available in the data, or leave it empty if not.
    - Price with Tax = Unit Price + Tax (calculate this based on available data).
    - Ensure all quantities, prices, and tax are formatted as numbers.

3. **Customers**:
    - Extract customer information, including details from the invoices.
    - Columns: Customer Name, Phone Number, Total Purchase Amount.
    - If the "Phone Number" is not available, leave it empty.
    - Ensure that the "Total Purchase Amount" is the total spent by each customer (sum of their invoice totals).

Please format the output as follows:

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

Make sure the values are formatted correctly: 
- All numerical values (quantity, total, tax, price) should be numbers.
- Dates should be in ISO 8601 format (YYYY-MM-DD).
- If a piece of information is missing, leave it empty, or flag uncertain entries where needed.

Provide the output in valid JSON format, and ensure all values are aligned with the specified schema.`;

          const modelResponse = await aiModel.generateContent([contentAsString, requestPrompt]);
          const response = await modelResponse.response;
          let aiOutput = response.text();

          // Trim extra characters at the start and end of the response
          aiOutput = aiOutput.slice(7, -3);

          // Further cleanup: Remove non-printable characters
          aiOutput = aiOutput.replace(/[\u0000-\u001F\u007F]/g, "");

          console.log("Raw AI Response:", aiOutput);

          // Function to check if a string is valid JSON
          const isValidJSON = (str) => {
            try {
              JSON.parse(str);
              return true;
            } catch (e) {
              return false;
            }
          };

          // Check if the AI output is valid JSON
          if (isValidJSON(aiOutput)) {
            const parsedJson = JSON.parse(aiOutput);
            organizedData = {
              invoices: parsedJson?.Invoices || [],
              products: parsedJson?.Products || [],
              customers: parsedJson?.Customers || [],
            };
            resolve(organizedData);
          } else {
            console.error("Invalid JSON format:", aiOutput);
            reject(new Error("AI response format is invalid."));
          }
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

    //console.log("Structured Data:", parsedData);

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
    const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

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
    const generatedContent = await aiModel.generateContent([artifactData, extractionPrompt]);
    const aiResponse = await generatedContent.response.text();

    //console.log("AI Raw Response:", aiResponse);

    // Extract valid JSON part from the response (assuming it contains extra characters)
    const jsonResponseStart = aiResponse.indexOf("{");
    const jsonResponseEnd = aiResponse.lastIndexOf("}") + 1;
    const jsonContent = aiResponse.substring(jsonResponseStart, jsonResponseEnd);

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