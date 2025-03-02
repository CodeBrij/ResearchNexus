import React, { useState, useEffect } from "react";
import { FaRobot, FaClipboard } from "react-icons/fa";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import useGeminiQuery from "../hooks/useGeminiQuery";

const AskAISection = ({ csvData }) => {
  const { response, loading: queryLoading, error, askQuery } = useGeminiQuery();
  const [userQuery, setUserQuery] = useState("");
  const [responses, setResponses] = useState([]);

  // Handle errors from the Gemini API
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Add new responses to the list
  useEffect(() => {
    if (response) {
      setResponses(prev => [...prev, response]);
    }
  }, [response]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) {
      toast.error("Please enter a valid query.");
      return;
    }
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      toast.error("No dataset available. Please upload a CSV file first.");
      return;
    }

    try {
      await askQuery(userQuery, csvData);
      setUserQuery("");
    } catch (err) {
      toast.error("Failed to process query. Please try again.");
    }
  };

  const handleCopyClick = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy code"));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center mb-6">
        <h4 className="text-2xl font-semibold text-primary_text">Ask AI</h4>
        <FaRobot className="w-10 ml-2" />
      </div>

      <form onSubmit={handleQuerySubmit} className="mt-4">
        <div className="relative">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="w-full p-4 pr-20 border rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ask a question about your dataset..."
            required
            disabled={queryLoading}
          />
          <button
            type="submit"
            disabled={queryLoading}
            className="absolute right-2 top-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {queryLoading ? "Analyzing..." : "Ask"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-6">
        {responses.map((resp, index) => (
          <div
            key={index}
            className="p-6 rounded-lg bg-gray-800/50 text-primary_text shadow-lg"
          >
            <h5 className="font-semibold text-xl mb-4">Response {index + 1}:</h5>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ inline, children, ...props }) {
                    const codeString = String(children).replace(/\n$/, "");
                    
                    if (inline) {
                      return (
                        <code
                          className="bg-gray-700 px-2 py-1 rounded text-primary_text"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative">
                        <button
                          onClick={() => handleCopyClick(codeString)}
                          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                          title="Copy code"
                        >
                          <FaClipboard className="text-gray-300" />
                        </button>
                        <SyntaxHighlighter
                          style={a11yDark}
                          language="javascript"
                          className="rounded-lg !mt-0"
                          customStyle={{
                            padding: "2rem",
                            marginTop: "0",
                          }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  p({ children, ...props }) {
                    return Array.isArray(children) && 
                      children.some((child) => child?.type === "pre" || child?.type === "code") ? (
                      <div {...props}>{children}</div>
                    ) : (
                      <p className="whitespace-pre-wrap" {...props}>{children}</p>
                    );
                  },
                  pre({ children, ...props }) {
                    return <div {...props}>{children}</div>;
                  },
                }}
              >
                {resp}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AskAISection;
