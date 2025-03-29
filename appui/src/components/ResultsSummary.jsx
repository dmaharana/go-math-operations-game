import React from "react";

const ResultsSummary = ({ results, formatTime }) => {
  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Results Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p>
            <span className="font-semibold">Total Time:</span>{" "}
            {formatTime(results.totalTime)}
          </p>
          <p>
            <span className="font-semibold">Average Time Per Answer:</span>{" "}
            {results.averageTimePerAnswer.toFixed(2)} seconds
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold text-green-600">Correct Answers:</span>{" "}
            {results.correct}
          </p>
          <p>
            <span className="font-semibold text-red-600">Incorrect Answers:</span>{" "}
            {results.incorrect}
          </p>
          <p>
            <span className="font-semibold text-gray-600">Unanswered:</span>{" "}
            {results.unanswered}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;
