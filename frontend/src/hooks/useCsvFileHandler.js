import { useState } from "react";
import Papa from "papaparse";

export const useCsvFileHandler = () => {
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      setError(null);
      setParsedData(null);

      Papa.parse(file, {
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            // Filter out empty rows and rows with only whitespace
            const cleanData = result.data.filter(row => 
              Object.values(row).some(value => value && value.trim())
            );
            setParsedData(cleanData);
            resolve(cleanData);
          } else {
            const err = new Error("No valid data found in CSV");
            setError(err.message);
            reject(err);
          }
        },
        error: (err) => {
          const errorMsg = `Error parsing CSV file: ${err.message}`;
          setError(errorMsg);
          reject(new Error(errorMsg));
        },
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
      });
    });
  };

  return {
    error,
    parsedData,
    parseCsvFile,
  };
};
