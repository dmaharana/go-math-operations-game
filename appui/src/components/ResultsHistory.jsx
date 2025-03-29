import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResultsHistory = ({ resultsHistory }) => {
  const [filters, setFilters] = useState({
    operation: 'all',
    difficulty: 'all',
    gridSize: 'all'
  });

  const filteredResults = useMemo(() => {
    return resultsHistory.filter(result => {
      return (
        (filters.operation === 'all' || result.operation === filters.operation) &&
        (filters.difficulty === 'all' || result.difficulty === filters.difficulty) &&
        (filters.gridSize === 'all' || 
          `${result.gridSize.rows}x${result.gridSize.cols}` === filters.gridSize)
      );
    });
  }, [resultsHistory, filters]);

  const chartData = {
    labels: filteredResults.map((_, index) => `Attempt #${index + 1}`),
    datasets: [
      {
        label: 'Average Time Per Answer (seconds)',
        data: filteredResults.map(result => result.averageTimePerAnswer.toFixed(2)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Seconds'
        }
      }
    }
  };

  const clearHistory = () => {
    setResultsHistory([]);
    localStorage.removeItem('mathGameResults');
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Performance History</h2>
        {resultsHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear History
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Operation</label>
          <select
            className="w-full p-2 border rounded"
            value={filters.operation}
            onChange={(e) => setFilters({...filters, operation: e.target.value})}
          >
            <option value="all">All Operations</option>
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="multiplication">Multiplication</option>
            <option value="division">Division</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            className="w-full p-2 border rounded"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Grid Size</label>
          <select
            className="w-full p-2 border rounded"
            value={filters.gridSize}
            onChange={(e) => setFilters({...filters, gridSize: e.target.value})}
          >
            <option value="all">All Sizes</option>
            <option value="10x1">10x1</option>
            <option value="3x3">3x3</option>
            <option value="5x5">5x5</option>
            <option value="10x10">10x10</option>
          </select>
        </div>
      </div>

      {filteredResults.length > 0 ? (
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p className="text-gray-500">No results match the selected filters</p>
      )}
    </div>
  );
};

export default ResultsHistory;
