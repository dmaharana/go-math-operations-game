import React from "react";
import CellInput from "./CellInput";

const GameTable = ({
  numbers,
  operation,
  answers,
  selectedCell,
  isInputDisabled,
  getOperatorSymbol,
  isHighlighted,
  getCellStyle,
  calculateExpectedAnswer,
  calculateRowTotal,
  calculateColumnTotal,
  calculateGrandTotal,
  handleInputChange,
  setSelectedCell,
  inputRefs,
}) => {
  return (
    <div className="overflow-x-auto rounded shadow">
      <table className="w-full border-collapse bg-white max-w-xs mx-auto md:max-w-none">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">
              <span className="inline-block p-1">{getOperatorSymbol()}</span>
            </th>
            {numbers.colHeaders.map((num, index) => (
              <th
                key={index}
                className={`border p-2 text-center ${
                  isHighlighted(index, "col") ? "bg-blue-200" : "bg-gray-100"
                }`}
              >
                {num}
              </th>
            ))}
            {numbers.colHeaders.length > 1 && (
              <th className="border p-2 text-center bg-gray-200 font-bold">
                Total
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {numbers.rowHeaders.map((rowNum, rowIndex) => (
            <tr key={rowIndex}>
              <th
                className={`border p-2 text-center ${
                  isHighlighted(rowIndex, "row") ? "bg-blue-200" : "bg-gray-100"
                }`}
              >
                {rowNum}
              </th>
              {numbers.colHeaders.map((colNum, colIndex) => (
                <td
                  key={colIndex}
                  className={`border p-2 ${getCellStyle(
                    `${rowIndex}-${colIndex}`,
                    calculateExpectedAnswer(rowNum, colNum)
                  )}`}
                >
                  <CellInput
                    cellId={`${rowIndex}-${colIndex}`}
                    value={answers[`${rowIndex}-${colIndex}`] || ""}
                    onChange={(e) =>
                      handleInputChange(e, `${rowIndex}-${colIndex}`)
                    }
                    onFocus={() =>
                      setSelectedCell({ row: rowIndex, col: colIndex })
                    }
                    disabled={isInputDisabled}
                    className="w-full h-full p-1 text-center focus:outline-none bg-transparent"
                    placeholder="?"
                    inputRef={(el) =>
                      (inputRefs.current[`${rowIndex}-${colIndex}`] = el)
                    }
                  />
                </td>
              ))}
              {numbers.colHeaders.length > 1 && (
                <td
                  className={`border p-2 ${getCellStyle(
                    `row-total-${rowIndex}`,
                    calculateRowTotal(rowIndex)
                  )}`}
                >
                  <CellInput
                    cellId={`row-total-${rowIndex}`}
                    value={answers[`row-total-${rowIndex}`] || ""}
                    onChange={(e) =>
                      handleInputChange(e, `row-total-${rowIndex}`)
                    }
                    onFocus={() =>
                      setSelectedCell({
                        row: rowIndex,
                        col: numbers.colHeaders.length,
                      })
                    }
                    disabled={isInputDisabled}
                    className="w-full h-full p-1 text-center focus:outline-none bg-transparent font-bold"
                    placeholder="Total?"
                    inputRef={(el) =>
                      (inputRefs.current[`row-total-${rowIndex}`] = el)
                    }
                  />
                </td>
              )}
            </tr>
          ))}
          <tr>
            <th className="border p-2 text-center bg-gray-200 font-bold">
              Total
            </th>
            {numbers.colHeaders.map((_, colIndex) => (
              <td
                key={colIndex}
                className={`border p-2 ${getCellStyle(
                  `col-total-${colIndex}`,
                  calculateColumnTotal(colIndex)
                )}`}
              >
                <CellInput
                  cellId={`col-total-${colIndex}`}
                  value={answers[`col-total-${colIndex}`] || ""}
                  onChange={(e) =>
                    handleInputChange(e, `col-total-${colIndex}`)
                  }
                  onFocus={() =>
                    setSelectedCell({
                      row: numbers.rowHeaders.length,
                      col: colIndex,
                    })
                  }
                  disabled={isInputDisabled}
                  className="w-full h-full p-1 text-center focus:outline-none bg-transparent font-bold"
                  placeholder="Total?"
                  inputRef={(el) =>
                    (inputRefs.current[`col-total-${colIndex}`] = el)
                  }
                />
              </td>
            ))}
            {numbers.colHeaders.length > 1 && (
              <td
                className={`border p-2 ${getCellStyle(
                  "grand-total",
                  calculateGrandTotal()
                )}`}
              >
                <CellInput
                  cellId="grand-total"
                  value={answers["grand-total"] || ""}
                  onChange={(e) => handleInputChange(e, "grand-total")}
                  onFocus={() =>
                    setSelectedCell({
                      row: numbers.rowHeaders.length,
                      col: numbers.colHeaders.length,
                    })
                  }
                  disabled={isInputDisabled}
                  className="w-full h-full p-1 text-center focus:outline-none bg-transparent font-bold"
                  placeholder="Grand Total?"
                  inputRef={(el) => (inputRefs.current["grand-total"] = el)}
                />
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GameTable;
