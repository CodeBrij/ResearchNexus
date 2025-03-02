import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
const DashboardPage = () => {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("Artificial Intelligence"); // Default topic
  const [page, setPage] = useState(0);
  const papersPerPage = 10; // Display 10 papers at a time

  // Extract keywords from title & summary
  const extractKeywords = (text) => {
    const stopWords = ["the","does", "great", "success", "and", "shows", "for", "with", "a", "of", "in", "to", "is", "on", "at", "by", "this", "an", "that", "from"];
    const words = text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
      .split(" ")
      .filter((word) => word.length > 3 && !stopWords.includes(word.toLowerCase()));

    return [...new Set(words)].slice(0, 7); // Get 7 unique words
  };

  // Fetch All Papers
  const fetchAllPapers = async () => {
    const searchQuery = query.replace(" ", "+");
    let allPapers = [];
    let start = 0;
    const batchSize = 100; // Fetch 100 papers per request

    try {
      while (true) {
        const url = `https://export.arxiv.org/api/query?search_query=all:${searchQuery}&start=${start}&max_results=${batchSize}`;
        const response = await fetch(url);
        const text = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const entries = xml.getElementsByTagName("entry");

        if (entries.length === 0) break; // Stop fetching if no more papers

        for (let entry of entries) {
          const title = entry.getElementsByTagName("title")[0].textContent;
          const summary = entry.getElementsByTagName("summary")[0].textContent;
          const link = entry.getElementsByTagName("id")[0].textContent;
          const pdfLink = link.replace("abs", "pdf") + ".pdf";

          const tags = extractKeywords(title + " " + summary);

          allPapers.push({ title, summary, link, pdfLink, tags });
        }

        start += batchSize;
      }

      setPapers(allPapers);
      setFilteredPapers(allPapers);
      setPage(0); // Reset to first page when new search is made
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  useEffect(() => {
    fetchAllPapers();
  }, [query]);

  // Search Papers
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredPapers(papers);
      return;
    }

    setFilteredPapers(
      papers.filter((paper) =>
        paper.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    );
    setPage(0); // Reset to first page after search
  };

  // Update Query
  const handleQueryChange = (e) => {
    if (e.key === "Enter") {
      setQuery(e.target.value);
    }
  };

  // Pagination Controls
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);
  const startIndex = page * papersPerPage;
  const displayedPapers = filteredPapers.slice(startIndex, startIndex + papersPerPage);

  return (
    <>
    <div className="w-full flex justify-center bg-background drop-shadow-2xl">
        <Header />
      </div>
    <div className="min-h-screen bg-background text-primary_text p-6">
      <h1 className="text-4xl text-primary font-bold mb-6 text-center">ArXiv Research Paper Analyzer</h1>

      {/* Search Box */}
      <div className="flex flex-col items-center mb-6">
        <input
          type="text"
          placeholder="Enter topic (e.g., Machine Learning) & press Enter"
          className="input input-bordered input-primary w-full max-w-md text-secondary_text mb-4"
          onKeyDown={handleQueryChange}
        />
        <input
          type="text"
          placeholder="Search papers by tags..."
          className="input input-bordered input-primary w-full max-w-md text-secondary_text"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Pagination Controls */}
      {filteredPapers.length > papersPerPage && (
        <div className="flex justify-between items-center mb-4">
          <button
            className={`btn btn-primary ${page === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            ← Previous
          </button>
          <span className="text-lg font-semibold">Page {page + 1} of {totalPages}</span>
          <button
            className={`btn btn-primary ${page >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {/* Paper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedPapers.length > 0 ? (
          displayedPapers.map((paper, index) => (
            <div key={index} className="card bg-base-100 p-4 shadow-lg">
              <h2 className="text-xl font-bold text-blue-500">{paper.title}</h2>
              <p className="text-black text-sm my-2">{paper.summary.slice(0, 300)}...</p>
              <div className="flex flex-wrap gap-2 my-2">
                {paper.tags.map((tag, i) => (
                  <span key={i} className="badge badge-accent text-black font-semibold">{tag}</span>
                ))}
              </div>
              <a href={paper.link} target="_blank" className="mt-5 btn btn-primary w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 hover:text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02]">Read More</a>
            </div>
          ))
        ) : (
          <Spinner/>
        )}
      </div>
    </div>
    </>
  );
};

export default DashboardPage;
