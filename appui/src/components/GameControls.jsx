import React from "react";

const GameControls = ({
  gameState,
  timer,
  formatTime,
  startTimer,
  pauseTimer,
  stopGame,
  resetGame,
  newNumberSet,
  gridSize,
  changeGridSize,
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
      <div className="text-xl">
        Timer: <span className="font-mono">{formatTime(timer)}</span>
      </div>
      <div className="space-x-2 flex flex-wrap gap-2">
        <button
          onClick={startTimer}
          disabled={gameState === "completed" || gameState === "playing"}
          className={`px-4 py-2 rounded ${
            gameState === "completed" || gameState === "playing"
              ? "bg-gray-300"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          Start
        </button>
        <button
          onClick={pauseTimer}
          disabled={gameState !== "playing"}
          className={`px-4 py-2 rounded ${
            gameState !== "playing"
              ? "bg-gray-300"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
        >
          Pause
        </button>
        <button
          onClick={stopGame}
          disabled={gameState === "ready" || gameState === "completed"}
          className={`px-4 py-2 rounded ${
            gameState === "ready" || gameState === "completed"
              ? "bg-gray-300"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          Stop
        </button>
        <button
          onClick={resetGame}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Reset
        </button>
        <button
          onClick={newNumberSet}
          disabled={gameState === "playing"}
          className={`px-4 py-2 rounded ${
            gameState === "playing"
              ? "bg-gray-300"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
          title="Generate new numbers without resetting timer"
        >
          New Numbers
        </button>
      </div>
    </div>
  );
};

export default GameControls;
