import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import { useCsvFileHandler } from "../hooks/useCsvFileHandler";
import AskAISection from "../components/AskAISection";

const PlayGroundPage = () => {
  const [fileInfo, setFileInfo] = useState({
    name: "",
    uploaded: false,
    isUploading: false,
    loading: false,
  });

  const { fullCsv, parseCsvFile, error } = useCsvFileHandler();

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 1 * 1024 * 1024) {
        alert("File size exceeds 1MB. Please upload a smaller file.");
        return;
      }

      setFileInfo({ name: file.name, uploaded: true, isUploading: true, loading: true });
      await parseCsvFile(file);
      setFileInfo((prev) => ({ ...prev, isUploading: false, loading: false }));
    }
  };

  useEffect(() => {
    if (error) console.error("Error loading CSV data:", error);
  }, [error]);

  return (
    <>
      <div className="w-full flex justify-center bg-background drop-shadow-2xl">
        <Header />
      </div>

      <div className="min-h-screen bg-background text-primary_text p-4 flex flex-col items-center">
        <div className="w-full lg:w-2/3 bg-background p-4 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4">Upload and Play</h1>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-primary_text font-bold mb-2" htmlFor="file-upload">
                Dataset File
              </label>

              {!fileInfo.uploaded && !fileInfo.isUploading && (
                <div className="flex items-center justify-center w-full border rounded-lg flex-grow">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CSV (MAX. 1 MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                  </label>
                </div>
              )}

              {fileInfo.uploaded && !fileInfo.isUploading && (
                <div className="mt-4 text-primary_text font-semibold">
                  <p>
                    File Uploaded: <span className="text-green-500">{fileInfo.name}</span>
                  </p>
                </div>
              )}
            </div>
          </form>

          {fileInfo.loading && <div className="mt-4">Loading CSV...</div>}

          {fileInfo.uploaded && fullCsv && !fileInfo.loading && !fileInfo.isUploading && (
            <AskAISection csvData={[fullCsv]} />
          )}
        </div>
      </div>
    </>
  );
};

export default PlayGroundPage;
