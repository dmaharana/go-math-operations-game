export const calculateExpectedAnswer = (a, b, operation) => {
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

export const calculateRowTotal = (rowIndex, numbers, operation) => {
  let total = 0;
  for (let c = 0; c < numbers.colHeaders.length; c++) {
    total += calculateExpectedAnswer(
      numbers.rowHeaders[rowIndex],
      numbers.colHeaders[c],
      operation
    );
  }
  return total;
};

export const calculateColumnTotal = (colIndex, numbers, operation) => {
  let total = 0;
  for (let r = 0; r < numbers.rowHeaders.length; r++) {
    total += calculateExpectedAnswer(
      numbers.rowHeaders[r],
      numbers.colHeaders[colIndex],
      operation
    );
  }
  return total;
};

export const calculateGrandTotal = (numbers, operation) => {
  let total = 0;
  for (let r = 0; r < numbers.rowHeaders.length; r++) {
    for (let c = 0; c < numbers.colHeaders.length; c++) {
      total += calculateExpectedAnswer(
        numbers.rowHeaders[r],
        numbers.colHeaders[c],
        operation
      );
    }
  }
  return total;
};

export const getOperatorSymbol = (operation) => {
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

export const generateRandomNumbers = (operation, difficulty, gridSize) => {
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

    if (operation === "division") {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    else if (difficulty === "medium") {
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (num % 10 === 0);
      return num;
    }
    else {
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (operation === "multiplication" && num === 0);
      return num;
    }
  };

  let rowHeaders = Array(gridSize.rows).fill().map(generateNumber);
  let colHeaders = Array(gridSize.cols).fill().map(generateNumber);

  if (operation === "division") {
    rowHeaders = colHeaders.map((divisor) => {
      const multiplier = Math.floor(Math.random() * 12) + 1;
      return divisor * multiplier;
    });
  }

  return { rowHeaders, colHeaders };
};
