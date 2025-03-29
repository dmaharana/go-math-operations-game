import React from "react";

const GameSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  operation,
  changeOperation,
  difficulty,
  changeDifficulty,
}) => {
  return (
    <div
      className={`transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-0"
      } bg-gray-800 text-white overflow-hidden fixed h-full z-10 md:relative`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Math Game Settings</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-white"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Operation</h3>
          <div className="space-y-2">
            {["addition", "subtraction", "multiplication", "division"].map(
              (op) => (
                <button
                  key={op}
                  onClick={() => changeOperation(op)}
                  className={`w-full py-2 px-3 rounded text-left ${
                    operation === op
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Difficulty</h3>
          <div className="space-y-2">
            {["easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => changeDifficulty(diff)}
                className={`w-full py-2 px-3 rounded text-left ${
                  difficulty === diff
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSidebar;
