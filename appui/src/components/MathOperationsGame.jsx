import React, { useState, useEffect, useRef, useCallback } from "react";
import ResultsHistory from "./ResultsHistory";
import GameControls from "./GameControls";
import GameSidebar from "./GameSidebar";
import GameTable from "./GameTable";
import ResultsSummary from "./ResultsSummary";
import {
  generateRandomNumbers,
  calculateExpectedAnswer,
  calculateRowTotal,
  calculateColumnTotal,
  calculateGrandTotal,
  getOperatorSymbol
} from "../utils/gameCalculations";
import { formatTime, calculateResults } from "../utils/timerUtils";

const MathOperationsGame = () => {
  // State for the game
  const [numbers, setNumbers] = useState({ rowHeaders: [], colHeaders: [] });
  const [answers, setAnswers] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameState, setGameState] = useState("ready"); // ready, playing, paused, completed
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [results, setResults] = useState({
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    totalTime: 0,
    averageTimePerAnswer: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("game");
  const [operation, setOperation] = useState("addition"); // addition, subtraction, multiplication, division
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [gridSize, setGridSize] = useState(() => {
    // Default to 10x1 for mobile, 10x10 for desktop
    return window.innerWidth < 768 ? { rows: 10, cols: 1 } : { rows: 10, cols: 10 };
  });
  const [resultsHistory, setResultsHistory] = useState([]);                                                                                   


  const isInputDisabled = gameState !== "playing";

  // Ref for input focus management
  const inputRefs = useRef({});

  // Generate random numbers based on operation and difficulty
  const generateRandomNumbers = useCallback(() => {
    const generateNumber = () => {
      let min = 10;
      let max = 99;

      switch (difficulty) {
        case "easy":
          min = operation === "division" ? 2 : 1;
          max = operation === "division" ? 10 : 20;
          break;
        case "medium":
          min = operation === "division" ? 2 : 10;
          max = operation === "division" ? 12 : 99;
          break;
        case "hard":
          min = operation === "division" ? 2 : 30;
          max = operation === "division" ? 20 : 999;
          break;
        default:
          break;
      }

      // For division, ensure we generate numbers that divide evenly
      if (operation === "division") {
        // Generate divisors (these will be column headers)
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      // For medium difficulty, ensure 2-digit numbers with non-zero unit place
      else if (difficulty === "medium") {
        let num;
        do {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (num % 10 === 0); // Ensure units digit is not zero
        return num;
      }
      // For other operations, follow the original logic with adjusted ranges
      else {
        let num;
        do {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (operation === "multiplication" && num === 0); // Avoid zeros for multiplication
        return num;
      }
    };

    let rowHeaders = Array(gridSize.rows).fill().map(generateNumber);
    let colHeaders = Array(gridSize.cols).fill().map(generateNumber);

    // For division, ensure dividends are multiples of divisors
    if (operation === "division") {
      rowHeaders = colHeaders.map((divisor) => {
        // Create dividends that are multiples of the divisors
        const multiplier = Math.floor(Math.random() * 12) + 1; // Random multiplier between 1 and 12
        return divisor * multiplier;
      });
    }

    setNumbers({ rowHeaders, colHeaders });
    setAnswers({});
    return { rowHeaders, colHeaders };
  }, [operation, difficulty, gridSize]);


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && gridSize.cols > 1) {
        setGridSize({ rows: 10, cols: 1 });
      } else if (!isMobile && gridSize.cols === 1) {
        setGridSize({ rows: 10, cols: 10 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSize]);

  // Initialize the game
  useEffect(() => {
    generateRandomNumbers();
  }, [operation, difficulty, gridSize]);

  // Timer control functions
  const startTimer = () => {
    if (gameState === "ready" || gameState === "paused") {
      setGameState("playing");
      const interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const pauseTimer = () => {
    if (gameState === "playing") {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setGameState("paused");
    }
  };
	
  // Load results from localStorage on component mount                                                                                        
  useEffect(() => {                                                                                                                           
    const savedResults = localStorage.getItem('mathGameResults');                                                                             
    if (savedResults) {                                                                                                                       
      setResultsHistory(JSON.parse(savedResults));                                                                                            
    }                                                                                                                                         
  }, []);

  const stopGame = () => {
    if (gameState === "playing" || gameState === "paused") {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setGameState("completed");
             
      const newResults = calculateResults(answers, numbers, operation, timer, calculateExpectedAnswer);                                       
      setResults(newResults);                                                                                                                 
                                                                                                                                              
      // Save to history                                                                                                                      
      const historyEntry = {                                                                                                                  
        ...newResults,                                                                                                                        
        operation,                                                                                                                            
        difficulty,                                                                                                                           
        gridSize,                                                                                                                             
        timestamp: new Date().toISOString()                                                                                                   
      };                                                                                                                                      
                                                                                                                                              
      // Keep only the most recent 100 results
      const updatedHistory = [...resultsHistory, historyEntry].slice(-100);
      setResultsHistory(updatedHistory);                                                                                                      
      localStorage.setItem('mathGameResults', JSON.stringify(updatedHistory));
    }
  };

  const resetGame = () => {
    clearInterval(timerInterval);
    setTimerInterval(null);
    setTimer(0);
    setGameState("ready");
    generateRandomNumbers();
    setSelectedCell(null);
    setResults({
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      totalTime: 0,
      averageTimePerAnswer: 0,
    });
  };

  const newNumberSet = () => {
    if (gameState !== "playing") {
      generateRandomNumbers();
      setSelectedCell(null);
    }
  };

  // Navigation functions
  const moveToCell = (rowIndex, colIndex) => {
    // Get the appropriate cell id based on position
    let cellId;

    const maxRowIndex = numbers.rowHeaders.length;
    const maxColIndex = numbers.colHeaders.length;

    // Make sure indices are in valid range
    if (
      rowIndex >= 0 &&
      rowIndex <= maxRowIndex &&
      colIndex >= 0 &&
      colIndex <= maxColIndex
    ) {
      setSelectedCell({ row: rowIndex, col: colIndex });

      // Determine which cell type we're dealing with
      if (rowIndex === maxRowIndex && colIndex === maxColIndex) {
        // Grand total cell
        cellId = "grand-total";
      } else if (rowIndex === maxRowIndex) {
        // Column total cell
        cellId = `col-total-${colIndex}`;
      } else if (colIndex === maxColIndex) {
        // Row total cell
        cellId = `row-total-${rowIndex}`;
      } else {
        // Regular cell
        cellId = `${rowIndex}-${colIndex}`;
      }

      // Focus the input element
      if (inputRefs.current[cellId]) {
        inputRefs.current[cellId].focus();
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === "completed") return;

      if (!selectedCell) {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
          moveToCell(0, 0); // Start at first cell if no cell is selected
          return;
        }
      }

      const { row, col } = selectedCell || { row: 0, col: 0 };
      const maxRowIndex = numbers.rowHeaders.length;
      const maxColIndex = numbers.colHeaders.length;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveToCell(row - 1, col);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveToCell(row + 1, col);
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveToCell(row, col - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveToCell(row, col + 1);
          break;
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            // Move backward
            if (col > 0) {
              moveToCell(row, col - 1);
            } else if (row > 0) {
              moveToCell(row - 1, maxColIndex);
            }
          } else {
            // Move forward
            if (col < maxColIndex) {
              moveToCell(row, col + 1);
            } else if (row < maxRowIndex) {
              moveToCell(row + 1, 0);
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCell, gameState, numbers]);

  // Handle input change
  const handleInputChange = (e, cellId) => {
    const value = e.target.value;

    // Allow numbers and decimals for division
    if (
      value === "" ||
      (operation === "division"
        ? /^-?\d*\.?\d*$/.test(value)
        : /^-?\d*$/.test(value))
    ) {
      setAnswers((prev) => ({
        ...prev,
        [cellId]: value,
      }));
    }
  };

  //   useEffect(() => {
  //     // Start timer when the first input is changed
  //     if (Object.keys(answers).length > 0 && gameState === "ready") {
  //       startTimer();
  //     }
  //   }, [answers, gameState]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Determine cell styling
  const getCellStyle = (cellId, expectedAnswer) => {
    const isSelected =
      selectedCell &&
      (cellId === `${selectedCell.row}-${selectedCell.col}` ||
        (cellId === `row-total-${selectedCell.row}` &&
          selectedCell.col === numbers.colHeaders.length) ||
        (cellId === `col-total-${selectedCell.col}` &&
          selectedCell.row === numbers.rowHeaders.length) ||
        (cellId === "grand-total" &&
          selectedCell.row === numbers.rowHeaders.length &&
          selectedCell.col === numbers.colHeaders.length));

    if (isInputDisabled) {
      if (!(cellId in answers) || answers[cellId] === "") {
        return "bg-gray-200"; // Unanswered - gray
      } else if (parseFloat(answers[cellId]) === expectedAnswer) {
        return "bg-green-200"; // Correct - green
      } else {
        return "bg-red-200"; // Incorrect - red
      }
    }

    return isSelected ? "bg-blue-100" : "bg-white";
  };

  // Determine if a row or column should be highlighted
  const isHighlighted = (index, type) => {
    if (selectedCell === null) return false;
    return (
      (type === "row" && selectedCell.row === index) ||
      (type === "col" && selectedCell.col === index)
    );
  };

  // Get operator symbol
  const getOperatorSymbol = () => {
    switch (operation) {
      case "addition":
        return "+";
      case "subtraction":
        return "-";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        return "+";
    }
  };

  // Change operation and reset game
  const changeOperation = (newOperation) => {
    if (gameState === "playing") {
      pauseTimer();
    }
    setOperation(newOperation);
    resetGame();
  };

  // Change difficulty and reset game
  const changeDifficulty = (newDifficulty) => {
    if (gameState === "playing") {
      pauseTimer();
    }
    setDifficulty(newDifficulty);
    resetGame();
  };

  const changeGridSize = useCallback(
    (newSize) => {
      if (gameState === "playing") {
        pauseTimer();
      }
      setGridSize(newSize);
      setGameState("ready");
      setTimer(0);
      generateRandomNumbers();
      setAnswers({});
      setSelectedCell(null);
      setResults({
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        totalTime: 0,
        averageTimePerAnswer: 0,
      });
    },
    [gameState, pauseTimer, generateRandomNumbers]
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <GameSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        operation={operation}
        changeOperation={changeOperation}
        difficulty={difficulty}
        changeDifficulty={changeDifficulty}
        gridSize={gridSize}
        changeGridSize={changeGridSize}
      />

      <div className="flex-grow">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-20 md:top-6 md:left-6 text-white p-2 rounded hover:bg-gray-700 bg-gray-800"
            aria-label="Open sidebar"
          >
            ≡
          </button>
        )}
        <div className="container mx-auto p-4 max-w-4xl mt-4">
          <h1 className="text-2xl font-bold text-center mb-4">
            Math {operation.charAt(0).toUpperCase() + operation.slice(1)}{" "}
            Practice Game
          </h1>

          <GameControls
            gameState={gameState}
            timer={timer}
            formatTime={formatTime}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            stopGame={stopGame}
            resetGame={resetGame}
            newNumberSet={newNumberSet}
            gridSize={gridSize}
            changeGridSize={changeGridSize}
          />

          <div className="text-center mb-4 text-gray-600 text-sm">
            Use keyboard arrow keys or Tab to navigate between cells. Calculate
            totals for rows, columns, and the entire grid!
          </div>

          <div className="flex mb-4 border-b">
            <button
              onClick={() => setActiveTab("game")}
              className={`px-4 py-2 font-medium ${activeTab === "game" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            >
              Game
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 font-medium ${activeTab === "history" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            >
              Performance History
            </button>
          </div>

          {activeTab === "game" ? (
            <div className="flex items-start gap-4">
            <GameTable
              numbers={numbers}
              operation={operation}
              answers={answers}
              selectedCell={selectedCell}
              isInputDisabled={isInputDisabled}
              getOperatorSymbol={getOperatorSymbol}
              isHighlighted={isHighlighted}
              getCellStyle={getCellStyle}
              calculateExpectedAnswer={(a, b) => calculateExpectedAnswer(a, b, operation)}
              calculateRowTotal={(rowIndex) => calculateRowTotal(rowIndex, numbers, operation)}
              calculateColumnTotal={(colIndex) => calculateColumnTotal(colIndex, numbers, operation)}
              calculateGrandTotal={() => calculateGrandTotal(numbers, operation)}
              handleInputChange={handleInputChange}
              setSelectedCell={setSelectedCell}
              inputRefs={inputRefs}
            />
            <div className="flex flex-col gap-2 mt-8">
              <span className="text-sm font-medium">Grid Size:</span>
              <div className="text-xs text-gray-500 mb-1">
                {window.innerWidth < 768 ? "Mobile: 10x1" : "Desktop: 10x10"}
              </div>
              {[
                { rows: 10, cols: 1, label: "10x1" },
                { rows: 3, cols: 3, label: "3x3" },
                { rows: 5, cols: 5, label: "5x5" },
                { rows: 10, cols: 10, label: "10x10" },
              ].map((size) => (
                <button
                  key={size.label}
                  onClick={() => changeGridSize(size)}
                  disabled={gameState === "playing"}
                  className={`px-3 py-2 rounded text-sm ${
                    gridSize.rows === size.rows && gridSize.cols === size.cols
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  } ${
                    gameState === "playing"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
            </div>
          ) : (
            <ResultsHistory resultsHistory={resultsHistory} />
          )}

          {activeTab === "game" && gameState === "completed" && (
            <ResultsSummary results={results} formatTime={formatTime} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MathOperationsGame;
