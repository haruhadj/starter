// AI opponent logic with difficulty levels

// Calculate winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

// Check if game is over
function isGameOver(squares) {
  return calculateWinner(squares) !== null || squares.every(s => s !== null)
}

// Minimax algorithm for impossible AI
function minimax(squares, depth, isMaximizing, aiPlayer, humanPlayer) {
  const winner = calculateWinner(squares)

  if (winner === aiPlayer) return 10 - depth
  if (winner === humanPlayer) return depth - 10
  if (squares.every(s => s !== null)) return 0

  if (isMaximizing) {
    let bestScore = -Infinity
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = aiPlayer
        const score = minimax(squares, depth + 1, false, aiPlayer, humanPlayer)
        squares[i] = null
        bestScore = Math.max(score, bestScore)
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = humanPlayer
        const score = minimax(squares, depth + 1, true, aiPlayer, humanPlayer)
        squares[i] = null
        bestScore = Math.min(score, bestScore)
      }
    }
    return bestScore
  }
}

// Get best move using minimax
function getBestMove(squares, aiPlayer, humanPlayer) {
  let bestScore = -Infinity
  let bestMove = -1

  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      squares[i] = aiPlayer
      const score = minimax(squares, 0, false, aiPlayer, humanPlayer)
      squares[i] = null
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }

  return bestMove
}

// Get random available move
function getRandomMove(squares) {
  const available = squares.map((s, i) => s === null ? i : null).filter(s => s !== null)
  if (available.length === 0) return -1
  return available[Math.floor(Math.random() * available.length)]
}

// Find winning move for player
function findWinningMove(squares, player) {
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      squares[i] = player
      if (calculateWinner(squares) === player) {
        squares[i] = null
        return i
      }
      squares[i] = null
    }
  }
  return -1
}

// Find blocking move
function findBlockingMove(squares, opponent) {
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      squares[i] = opponent
      if (calculateWinner(squares) === opponent) {
        squares[i] = null
        return i
      }
      squares[i] = null
    }
  }
  return -1
}

// Get center if available
function getCenter(squares) {
  return squares[4] === null ? 4 : -1
}

// Get random corner
function getRandomCorner(squares) {
  const corners = [0, 2, 6, 8]
  const available = corners.filter(i => squares[i] === null)
  if (available.length === 0) return -1
  return available[Math.floor(Math.random() * available.length)]
}

// Get random side
function getRandomSide(squares) {
  const sides = [1, 3, 5, 7]
  const available = sides.filter(i => squares[i] === null)
  if (available.length === 0) return -1
  return available[Math.floor(Math.random() * available.length)]
}

// AI move based on difficulty
export function getAIMove(squares, aiPlayer, humanPlayer, difficulty) {
  switch (difficulty) {
    case 'normal':
      return getNormalAIMove(squares, aiPlayer, humanPlayer)
    case 'hard':
      return getHardAIMove(squares, aiPlayer, humanPlayer)
    case 'impossible':
    default:
      return getImpossibleAIMove(squares, aiPlayer, humanPlayer)
  }
}

// Normal: 40% chance of smart move, 60% random
function getNormalAIMove(squares, aiPlayer, humanPlayer) {
  // Random chance for smart move
  if (Math.random() < 0.4) {
    // Try to win
    const winningMove = findWinningMove(squares, aiPlayer)
    if (winningMove !== -1) return winningMove

    // Block opponent
    const blockingMove = findBlockingMove(squares, humanPlayer)
    if (blockingMove !== -1) return blockingMove

    // Take center
    const center = getCenter(squares)
    if (center !== -1) return center

    // Random corner
    const corner = getRandomCorner(squares)
    if (corner !== -1) return corner

    // Random side
    const side = getRandomSide(squares)
    if (side !== -1) return side
  }

  return getRandomMove(squares)
}

// Hard: Always makes smart moves but limited depth
function getHardAIMove(squares, aiPlayer, humanPlayer) {
  // Try to win
  const winningMove = findWinningMove(squares, aiPlayer)
  if (winningMove !== -1) return winningMove

  // Block opponent
  const blockingMove = findBlockingMove(squares, humanPlayer)
  if (blockingMove !== -1) return blockingMove

  // Take center
  const center = getCenter(squares)
  if (center !== -1) return center

  // Take corner
  const corner = getRandomCorner(squares)
  if (corner !== -1) return corner

  // Take side
  const side = getRandomSide(squares)
  if (side !== -1) return side

  return getRandomMove(squares)
}

// Impossible: Uses minimax for perfect play
function getImpossibleAIMove(squares, aiPlayer, humanPlayer) {
  // First move optimization - if AI is O and center is empty, take it
  if (squares.every(s => s === null) || (squares.filter(s => s !== null).length === 1 && squares[4] === null)) {
    if (squares[4] === null) return 4
    return 0
  }

  // Use minimax for perfect play
  return getBestMove(squares, aiPlayer, humanPlayer)
}
