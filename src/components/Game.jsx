import { useState, useEffect } from 'react'
import Board from './Board'

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ]

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] }
    }
  }
  return null
}

function Game({ onMove, initialXIsNext = true }) {
  const [history, setHistory] = useState([Array(9).fill(null)])
  const [stepNumber, setStepNumber] = useState(0)
  const [xIsNext, setXIsNext] = useState(initialXIsNext)

  const currentSquares = history[stepNumber]
  const winnerInfo = calculateWinner(currentSquares)
  const winner = winnerInfo?.winner
  const winningLine = winnerInfo?.line

  const isDraw = !winner && currentSquares.every(square => square !== null)

  const handleClick = (i) => {
    if (winner || currentSquares[i]) return

    const newHistory = history.slice(0, stepNumber + 1)
    const current = newHistory[newHistory.length - 1]
    const squares = [...current]
    squares[i] = xIsNext ? 'X' : 'O'

    setHistory([...newHistory, squares])
    setStepNumber(newHistory.length)
    setXIsNext(!xIsNext)

    // Notify parent component of the move
    onMove?.({
      squares,
      xIsNext: !xIsNext,
      moveIndex: i,
      player: xIsNext ? 'X' : 'O',
    })
  }

  const resetGame = () => {
    setHistory([Array(9).fill(null)])
    setStepNumber(0)
    setXIsNext(true)
  }

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status */}
      <div className={`text-2xl sm:text-3xl font-bold px-6 py-3 rounded-xl ${
        winner
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse'
          : isDraw
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      }`}>
        {status}
      </div>

      {/* Board */}
      <Board
        squares={currentSquares}
        onClick={handleClick}
        winningLine={winningLine}
      />

      {/* Reset Button */}
      <button
        onClick={resetGame}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
      >
        New Game
      </button>
    </div>
  )
}

export default Game
