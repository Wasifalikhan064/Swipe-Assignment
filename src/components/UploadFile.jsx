import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setData } from '../redux/data/dataSlice';
import { extractData } from '../utils/DataExtraction'; 
import { Label, Spinner, FileInput, Button, Alert, Card } from 'flowbite-react';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const allowedFiles = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
  ];

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (!allowedFiles.includes(selectedFile.type) || selectedFile.size === 0)) {
      setError('Invalid file .Only PDF, Excel, and image file formats are allowed.');
      setFile(null);
      e.target.value = null;
    } else {
      setError(null);
      setFile(selectedFile);
    }
  };

  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a valid file to upload.');
      return;
    }
    setLoading(true);
    try {
      const response = await extractData(file);
      dispatch(setData(response.data));
    } catch (err) {
      setError('Failed to process the file. Please try again.');
      console.error('File processing error:', err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Card className="max-w-md mx-auto mt-10 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4">Upload Document</h2>
      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}
      <form className="space-y-4">
        <div>
          <Label htmlFor="fileUpload" value="Select File" className="font-medium" />
          <FileInput
            id="fileUpload"
            onChange={handleFile}
            className={error && !file ? 'border-red-500' : ''}
          />
        </div>
        <div className="text-center">
          <Button
            color="primary"
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Extracting...
              </>
            ) : (
              'Extract'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UploadFile;
