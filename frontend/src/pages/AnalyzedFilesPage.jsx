import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Header from '../components/Header';

const AnalyzedFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Implement Firebase fetching of analyzed files
    const fetchAnalyzedFiles = async () => {
      try {
        setLoading(true);
        // Will be implemented when Firebase is set up
        // const filesData = await getAnalyzedFiles();
        // setFiles(filesData);
      } catch (err) {
        setError('Failed to fetch analyzed files');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyzedFiles();
  }, []);

  return (
    <>
      <div className="w-full flex justify-center bg-background drop-shadow-2xl">
        <Header />
      </div>

      <div className="min-h-screen bg-background text-primary_text p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Analyzed Files</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No files have been analyzed yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{file.name}</h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(file.analyzedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => window.location.href = `/playground?fileId=${file.id}`}
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      View Analysis
                    </button>
                    <span className="text-xs text-gray-500">
                      {file.queryCount} queries
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyzedFilesPage;
