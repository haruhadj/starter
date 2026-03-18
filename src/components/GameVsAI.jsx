import { useState, useEffect } from 'react'
import Board from './Board'
import { getAIMove } from './AI'

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

function GameVsAI({ difficulty = 'normal', playerSymbol = 'X' }) {
  const [currentDifficulty, setCurrentDifficulty] = useState(difficulty);
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [isThinking, setIsThinking] = useState(false)
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 })

  const winnerInfo = calculateWinner(squares)
  const winner = winnerInfo?.winner
  const winningLine = winnerInfo?.line
  const isDraw = !winner && squares.every(s => s !== null)

  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X'
  const isPlayerTurn = (xIsNext && playerSymbol === 'X') || (!xIsNext && playerSymbol === 'O')

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && !winner && !isDraw) {
      setIsThinking(true)

      const thinkingTime = difficulty === 'impossible' ? 500 :
        difficulty === 'hard' ? 400 : 300

      const timer = setTimeout(() => {
        const aiMove = getAIMove(squares, aiSymbol, playerSymbol, difficulty)
        if (aiMove !== -1) {
          const newSquares = [...squares]
          newSquares[aiMove] = aiSymbol
          setSquares(newSquares)
          setXIsNext(!xIsNext)
        }
        setIsThinking(false)
      }, thinkingTime)

      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, winner, isDraw, squares, aiSymbol, playerSymbol, difficulty, xIsNext])

  // Update scores when game ends
  useEffect(() => {
    if (winner || isDraw) {
      if (winner === playerSymbol) {
        setScores(s => ({ ...s, player: s.player + 1 }))
      } else if (winner === aiSymbol) {
        setScores(s => ({ ...s, ai: s.ai + 1 }))
      } else {
        setScores(s => ({ ...s, draws: s.draws + 1 }))
      }
    }
  }, [winner, isDraw, winner, aiSymbol, playerSymbol])

  const handleClick = (i) => {
    if (!isPlayerTurn || winner || squares[i]) return

    const newSquares = [...squares]
    newSquares[i] = playerSymbol
    setSquares(newSquares)
    setXIsNext(!xIsNext)
  }

  const resetGame = () => {
    setSquares(Array(9).fill(null))
    setXIsNext(true)
  }

  const status = winner
    ? winner === playerSymbol ? '🎉 You win!' : '🤖 AI wins!'
    : isDraw
      ? '🤝 Draw!'
      : isPlayerTurn
        ? 'Your turn'
        : 'AI thinking...'

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Difficulty selector */}
      <div className="flex gap-2">
        {['hard', 'impossible'].map((level) => (
          <button
            key={level}
            onClick={() => {
              setCurrentDifficulty(level); // 2. Update the state here!
              setSquares(Array(9).fill(null));
              setXIsNext(true);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentDifficulty === level // 3. Compare against the state
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="flex gap-4 sm:gap-8">
        <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-purple-500/30">
          <p className="text-sm text-gray-400">You</p>
          <p className="text-2xl font-bold text-purple-400">{scores.player}</p>
        </div>
        <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Draws</p>
          <p className="text-2xl font-bold text-gray-400">{scores.draws}</p>
        </div>
        <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-pink-500/30">
          <p className="text-sm text-gray-400">AI</p>
          <p className="text-2xl font-bold text-pink-400">{scores.ai}</p>
        </div>
      </div>

      {/* Status */}
      <div className={`text-xl sm:text-2xl font-bold px-6 py-3 rounded-xl min-w-[200px] ${winner
          ? winner === playerSymbol
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse'
            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
          : isDraw
            ? 'bg-gray-800 text-gray-300 border border-gray-700'
            : isPlayerTurn
              ? 'bg-gray-800 text-purple-400 border border-purple-500/30'
              : 'bg-gray-800 text-orange-400 border border-orange-500/30'
        }`}>
        {status}
        {isThinking && !winner && !isDraw && (
          <span className="inline-block ml-2 animate-spin">●</span>
        )}
      </div>

      {/* Board */}
      <Board
        squares={squares}
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

export default GameVsAI
