import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const DatasetTitle = ({ datasetId, creationTime, tags, likedByUser }) => {

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-4xl font-extrabold text-primary_text mb-1">
          {`Dataset #${datasetId + 1}`}
        </h1>
        <div className="text-lg text-primary/80">
          <p>{new Date(creationTime * 1000).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-primary/10 text-primary/80 py-1 px-3 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-2" onClick={handleLikeClick}>
          {likedByUser ? (
            <FaHeart size={24} className="text-red-500" />
          ) : (
            <FaRegHeart size={24} className="text-gray-500" />
          )}
          <span className="text-lg text-primary/80">
            {likedByUser ? "Liked" : "Like"}
          </span>
        </button>
      </div>
    </>
  );
};

export default DatasetTitle;
