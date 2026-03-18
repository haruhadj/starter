import { useState, useEffect } from 'react'
import Board from './Board'

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] }
    }
  }
  return null
}

function GamePVP({ roomCode, onLeave }) {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [scores, setScores] = useState({ player1: 0, player2: 0, draws: 0 })

  const winnerInfo = calculateWinner(squares)
  const winner = winnerInfo?.winner
  const winningLine = winnerInfo?.line
  const isDraw = !winner && squares.every(s => s !== null)

  const currentPlayer = xIsNext ? 'Player 1 (X)' : 'Player 2 (O)'

  const handleClick = (i) => {
    if (winner || squares[i]) return

    const newSquares = [...squares]
    newSquares[i] = xIsNext ? 'X' : 'O'
    setSquares(newSquares)
    setXIsNext(!xIsNext)
  }

  const resetGame = () => {
    setSquares(Array(9).fill(null))
    setXIsNext(true)
  }

  // Update scores when game ends
  useState(() => {
    if (winner || isDraw) {
      if (winner === 'X') {
        setScores(s => ({ ...s, player1: s.player1 + 1 }))
      } else if (winner === 'O') {
        setScores(s => ({ ...s, player2: s.player2 + 1 }))
      } else {
        setScores(s => ({ ...s, draws: s.draws + 1 }))
      }
    }
  }, [winner, isDraw])

  const status = winner
    ? winner === 'X' ? '🎉 Player 1 wins!' : '🎉 Player 2 wins!'
    : isDraw
    ? '🤝 Draw!'
    : `${currentPlayer}'s turn`

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Room Code Header - only show if roomCode is provided */}
      {roomCode && (
        <div className="bg-gray-800 rounded-xl px-6 py-3 border border-purple-500/30">
          <p className="text-sm text-gray-400 mb-1">Room Code</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-mono font-bold text-purple-400 tracking-wider">{roomCode}</p>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="text-xs text-gray-500 hover:text-gray-300"
              title="Copy code"
            >
              📋
            </button>
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div className="flex gap-4 sm:gap-8">
        <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-purple-500/30">
          <p className="text-sm text-gray-400">Player 1</p>
          <p className="text-2xl font-bold text-purple-400">{scores.player1}</p>
        </div>
        <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Draws</p>
          <p className="text-2xl font-bold text-gray-400">{scores.draws}</p>
        </div>
        <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-pink-500/30">
          <p className="text-sm text-gray-400">Player 2</p>
          <p className="text-2xl font-bold text-pink-400">{scores.player2}</p>
        </div>
      </div>

      {/* Status */}
      <div className={`text-xl sm:text-2xl font-bold px-6 py-3 rounded-xl min-w-[200px] ${winner
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse'
          : isDraw
            ? 'bg-gray-800 text-gray-300 border border-gray-700'
            : 'bg-gray-800 text-purple-400 border border-purple-500/30'
        }`}>
        {status}
      </div>

      {/* Board */}
      <Board
        squares={squares}
        onClick={handleClick}
        winningLine={winningLine}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
        >
          New Game
        </button>
        <button
          onClick={onLeave}
          className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
        >
          {roomCode ? 'Leave Room' : 'Back to Menu'}
        </button>
      </div>
    </div>
  )
}

export default GamePVP
