import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const useCsvData = (previewIpfsLink) => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Preview Link:", previewIpfsLink);

  useEffect(() => {
    if (!previewIpfsLink) {
      setLoading(false);
      setError("No IPFS link provided");
      return;
    }

    const fetchCsvData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${previewIpfsLink}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }

        const text = await response.text();
        const parsedData = Papa.parse(text, { header: true });

        if (parsedData.errors.length > 0) {
          throw new Error("Error parsing CSV file");
        }

        setCsvData(parsedData.data);
      } catch (err) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCsvData();
  }, [previewIpfsLink]);

  return { csvData, loading, error };
};

export default useCsvData;
