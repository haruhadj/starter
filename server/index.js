import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// In-memory game state storage
const games = new Map()

// Generate unique game ID
function generateGameId() {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Calculate winner (same logic as frontend)
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

// API Routes

// Create new game
app.post('/api/games', (req, res) => {
  const gameId = generateGameId()
  const gameData = {
    id: gameId,
    squares: Array(9).fill(null),
    xIsNext: true,
    moves: [],
    createdAt: new Date().toISOString(),
  }

  games.set(gameId, gameData)

  res.status(201).json({
    success: true,
    data: gameData,
  })
})

// Get game state
app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId)

  if (!game) {
    return res.status(404).json({
      success: false,
      error: 'Game not found',
    })
  }

  const winnerInfo = calculateWinner(game.squares)
  const isDraw = !winnerInfo && game.squares.every(s => s !== null)

  res.json({
    success: true,
    data: {
      ...game,
      winner: winnerInfo?.winner,
      winningLine: winnerInfo?.line,
      isDraw,
    },
  })
})

// Make a move
app.post('/api/games/:gameId/moves', (req, res) => {
  const { gameId } = req.params
  const { squareIndex, player } = req.body

  const game = games.get(gameId)

  if (!game) {
    return res.status(404).json({
      success: false,
      error: 'Game not found',
    })
  }

  // Check if game is over
  const winnerInfo = calculateWinner(game.squares)
  if (winnerInfo || game.squares.every(s => s !== null)) {
    return res.status(400).json({
      success: false,
      error: 'Game is already finished',
    })
  }

  // Validate player turn
  if ((player === 'X' && !game.xIsNext) || (player === 'O' && game.xIsNext)) {
    return res.status(400).json({
      success: false,
      error: 'Not your turn',
    })
  }

  // Validate square is empty
  if (game.squares[squareIndex] !== null) {
    return res.status(400).json({
      success: false,
      error: 'Square already occupied',
    })
  }

  // Make the move
  game.squares[squareIndex] = player
  game.xIsNext = !game.xIsNext
  game.moves.push({
    squareIndex,
    player,
    timestamp: new Date().toISOString(),
  })

  games.set(gameId, game)

  const newWinnerInfo = calculateWinner(game.squares)
  const isDraw = !newWinnerInfo && game.squares.every(s => s !== null)

  res.json({
    success: true,
    data: {
      ...game,
      winner: newWinnerInfo?.winner,
      winningLine: newWinnerInfo?.line,
      isDraw,
    },
  })
})

// Reset game
app.post('/api/games/:gameId/reset', (req, res) => {
  const game = games.get(req.params.gameId)

  if (!game) {
    return res.status(404).json({
      success: false,
      error: 'Game not found',
    })
  }

  game.squares = Array(9).fill(null)
  game.xIsNext = true
  game.moves = []

  games.set(req.params.gameId, game)

  res.json({
    success: true,
    data: game,
  })
})

// Delete game
app.delete('/api/games/:gameId', (req, res) => {
  if (!games.has(req.params.gameId)) {
    return res.status(404).json({
      success: false,
      error: 'Game not found',
    })
  }

  games.delete(req.params.gameId)

  res.json({
    success: true,
    message: 'Game deleted',
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🎮 Tic-Tac-Toe API server running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
  console.log(`   Create game: POST http://localhost:${PORT}/api/games`)
})
