export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

import { calculateExpectedAnswer } from "./gameCalculations";

export const calculateResults = (answers, numbers, operation, timer, calculateExpectedAnswer) => {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  // Check normal cells
  for (let r = 0; r < numbers.rowHeaders.length; r++) {
    for (let c = 0; c < numbers.colHeaders.length; c++) {
      const cellId = `${r}-${c}`;
      const expectedAnswer = calculateExpectedAnswer(
        numbers.rowHeaders[r],
        numbers.colHeaders[c],
        operation
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

  // Calculate totals if needed
  const answeredCells = correct + incorrect;
  const averageTimePerAnswer = answeredCells > 0 ? timer / answeredCells : 0;

  return {
    correct,
    incorrect,
    unanswered,
    totalTime: timer,
    averageTimePerAnswer,
  };
};
