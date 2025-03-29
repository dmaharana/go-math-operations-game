import React, { useState, useEffect, useRef, useCallback } from "react";
import GameControls from "./GameControls";
import GameSidebar from "./GameSidebar";
import GameTable from "./GameTable";
import ResultsSummary from "./ResultsSummary";

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
  const [operation, setOperation] = useState("addition"); // addition, subtraction, multiplication, division
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard

  const isInputDisabled = gameState !== "playing";

  // Ref for input focus management
  const inputRefs = useRef({});

  // Generate random numbers based on operation and difficulty
  const generateRandomNumbers = () => {
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

    let rowHeaders = Array(10).fill().map(generateNumber);
    let colHeaders = Array(10).fill().map(generateNumber);

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
  };

  // Initialize the game
  useEffect(() => {
    generateRandomNumbers();
  }, [operation, difficulty]);

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

  const stopGame = () => {
    if (gameState === "playing" || gameState === "paused") {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setGameState("completed");

      // Calculate results
      let correct = 0;
      let incorrect = 0;
      let unanswered = 0;

      // Check normal cells
      for (let r = 0; r < numbers.rowHeaders.length; r++) {
        for (let c = 0; c < numbers.colHeaders.length; c++) {
          const cellId = `${r}-${c}`;
          const expectedAnswer = calculateExpectedAnswer(
            numbers.rowHeaders[r],
            numbers.colHeaders[c]
          );

          if (!(cellId in answers) || answers[cellId] === "") {
            unanswered++;
          } else if (parseFloat(answers[cellId]) === expectedAnswer) {
            correct++;
          } else {
            incorrect++;
          }
        }
      }

      // Check row totals
      for (let r = 0; r < numbers.rowHeaders.length; r++) {
        const cellId = `row-total-${r}`;
        const expectedTotal = calculateRowTotal(r);

        if (!(cellId in answers) || answers[cellId] === "") {
          unanswered++;
        } else if (parseFloat(answers[cellId]) === expectedTotal) {
          correct++;
        } else {
          incorrect++;
        }
      }

      // Check column totals
      for (let c = 0; c < numbers.colHeaders.length; c++) {
        const cellId = `col-total-${c}`;
        const expectedTotal = calculateColumnTotal(c);

        if (!(cellId in answers) || answers[cellId] === "") {
          unanswered++;
        } else if (parseFloat(answers[cellId]) === expectedTotal) {
          correct++;
        } else {
          incorrect++;
        }
      }

      // Check grand total
      const grandTotalCellId = "grand-total";
      const expectedGrandTotal = calculateGrandTotal();

      if (!(grandTotalCellId in answers) || answers[grandTotalCellId] === "") {
        unanswered++;
      } else if (parseFloat(answers[grandTotalCellId]) === expectedGrandTotal) {
        correct++;
      } else {
        incorrect++;
      }

      const totalCells =
        numbers.rowHeaders.length * numbers.colHeaders.length +
        numbers.rowHeaders.length +
        numbers.colHeaders.length +
        1;
      const answeredCells = correct + incorrect;
      const averageTimePerAnswer =
        answeredCells > 0 ? timer / answeredCells : 0;

      setResults({
        correct,
        incorrect,
        unanswered,
        totalTime: timer,
        averageTimePerAnswer,
      });
    }
  };

  const resetGame = () => {
    clearInterval(timerInterval);
    setTimerInterval(null);
    setTimer(0);
    setGameState("ready");
    generateRandomNumbers();
    setSelectedCell(null);
  };

  const newNumberSet = () => {
    if (gameState !== "playing") {
      generateRandomNumbers();
      setSelectedCell(null);
    }
  };

  // Calculate expected answer based on the operation
  const calculateExpectedAnswer = (a, b) => {
    switch (operation) {
      case "addition":
        return a + b;
      case "subtraction":
        return a - b;
      case "multiplication":
        return a * b;
      case "division":
        return a / b;
      default:
        return a + b;
    }
  };

  // Calculate row totals
  const calculateRowTotal = (rowIndex) => {
    let total = 0;
    for (let c = 0; c < numbers.colHeaders.length; c++) {
      const cellId = `${rowIndex}-${c}`;
      const expectedAnswer = calculateExpectedAnswer(
        numbers.rowHeaders[rowIndex],
        numbers.colHeaders[c]
      );
      total += expectedAnswer;
    }
    return total;
  };

  // Calculate column totals
  const calculateColumnTotal = (colIndex) => {
    let total = 0;
    for (let r = 0; r < numbers.rowHeaders.length; r++) {
      const cellId = `${r}-${colIndex}`;
      const expectedAnswer = calculateExpectedAnswer(
        numbers.rowHeaders[r],
        numbers.colHeaders[colIndex]
      );
      total += expectedAnswer;
    }
    return total;
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    let total = 0;
    for (let r = 0; r < numbers.rowHeaders.length; r++) {
      for (let c = 0; c < numbers.colHeaders.length; c++) {
        const expectedAnswer = calculateExpectedAnswer(
          numbers.rowHeaders[r],
          numbers.colHeaders[c]
        );
        total += expectedAnswer;
      }
    }
    return total;
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <GameSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        operation={operation}
        changeOperation={changeOperation}
        difficulty={difficulty}
        changeDifficulty={changeDifficulty}
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
          />

          <div className="text-center mb-4 text-gray-600 text-sm">
            Use keyboard arrow keys or Tab to navigate between cells. Calculate
            totals for rows, columns, and the entire grid!
          </div>

          <GameTable
            numbers={numbers}
            operation={operation}
            answers={answers}
            selectedCell={selectedCell}
            isInputDisabled={isInputDisabled}
            getOperatorSymbol={getOperatorSymbol}
            isHighlighted={isHighlighted}
            getCellStyle={getCellStyle}
            calculateExpectedAnswer={calculateExpectedAnswer}
            calculateRowTotal={calculateRowTotal}
            calculateColumnTotal={calculateColumnTotal}
            calculateGrandTotal={calculateGrandTotal}
            handleInputChange={handleInputChange}
            setSelectedCell={setSelectedCell}
            inputRefs={inputRefs}
          />

          {gameState === "completed" && (
            <ResultsSummary results={results} formatTime={formatTime} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MathOperationsGame;
