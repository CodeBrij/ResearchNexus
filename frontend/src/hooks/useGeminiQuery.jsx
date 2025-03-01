import { useState, useEffect } from "react";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "AIzaSyBChAK_4ODI1fv5eosNcN74RUiTadU9EEc";

const useGeminiQuery = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryPrompt, setQueryPrompt] = useState(null);

  useEffect(() => {
    const loadQueryPrompt = async () => {
      try {
        const res = await fetch("/query_prompt.txt");
        if (res.ok) {
          const text = await res.text();
          setQueryPrompt(text);
        } else {
          throw new Error("Failed to load query prompt.");
        }
      } catch (err) {
        setError("Error loading query prompt: " + err.message);
      }
    };
    loadQueryPrompt();
  }, []);

  const askQuery = async (queryText, csvData) => {
    if (!queryPrompt) {
      setError("Query prompt is not loaded yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const csvPreview = csvData.slice(0, 5);
      const formattedCsvData = csvPreview
        .map((row) => Object.values(row).join(", "))
        .join("\n");

      const prompt = queryPrompt
        .replace("{{csvData}}", formattedCsvData)
        .replace("{{queryText}}", queryText);

      const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching from Gemini API: ${response.statusText}`);
      }

      const data = await response.json();
      if (data?.candidates && data.candidates.length > 0) {
        const answer = data.candidates[0]?.content?.parts[0]?.text;
        setResponse(answer || "No answer generated.");
      } else {
        throw new Error("Unexpected response structure from Gemini API");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, askQuery };
};

export default useGeminiQuery;
