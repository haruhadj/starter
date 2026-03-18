import http from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    // Allow Vite dev server from localhost or LAN IP (when using --host)
    origin: (origin, callback) => {
      // Non-browser clients or same-origin requests may not send an Origin header
      if (!origin) return callback(null, true)

      const allowed = [
        /^http:\/\/localhost:5173$/,
        /^http:\/\/127\.0\.0\.1:5173$/,
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/,
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:5173$/,
      ]

      const isAllowed = allowed.some((re) => re.test(origin))
      return callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed)
    },
    methods: ['GET', 'POST'],
  },
})

// Store active rooms
const rooms = new Map()

function generateRoomCode() {
  // 4-character code (e.g. "A1BZ")
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  // Create new room
  socket.on('create_room', (callback) => {
    const roomCode = generateRoomCode()

    rooms.set(roomCode, {
      host: socket.id,
      guest: null,
      squares: Array(9).fill(null),
      xIsNext: true,
      winner: null,
    })

    socket.join(roomCode)
    socket.emit('room_created', { roomCode, isHost: true })

    console.log(`Room created: ${roomCode} by ${socket.id}`)

    if (callback) callback({ roomCode })
  })

  // Join existing room
  socket.on('join_room', (roomCode, callback) => {
    const room = rooms.get(roomCode?.toUpperCase())

    if (!room) {
      if (callback) callback({ error: 'Room not found' })
      return
    }

    if (room.guest) {
      if (callback) callback({ error: 'Room is full' })
      return
    }

    room.guest = socket.id
    rooms.set(roomCode.toUpperCase(), room)

    socket.join(roomCode.toUpperCase())

    // Notify host that guest joined
    io.to(room.host).emit('guest_joined', { guestId: socket.id })

    // Send room data to guest
    socket.emit('room_joined', {
      roomCode: roomCode.toUpperCase(),
      isHost: false,
      playerSymbol: 'O', // Guest is always O
    })

    // Notify host of their symbol
    io.to(room.host).emit('player_symbol', { symbol: 'X' })

    console.log(`Player ${socket.id} joined room ${roomCode}`)

    if (callback) callback({ success: true, roomCode: roomCode.toUpperCase() })
  })

  // Make a move
  socket.on('make_move', (data) => {
    const { roomCode, squareIndex, player } = data
    const room = rooms.get(roomCode)

    if (!room) return

    // Validate move
    if (room.squares[squareIndex] !== null) return
    if (room.winner) return

    // Check if it's the right player's turn
    const isXturn = room.xIsNext
    if ((player === 'X' && !isXturn) || (player === 'O' && isXturn)) return

    // Update room state
    room.squares[squareIndex] = player
    room.xIsNext = !room.xIsNext

    // Check for winner
    const winner = calculateWinner(room.squares)
    if (winner) {
      room.winner = winner
    } else if (room.squares.every(s => s !== null)) {
      room.winner = 'draw'
    }

    rooms.set(roomCode, room)

    // Broadcast move to all players in room
    io.to(roomCode).emit('move_made', {
      squares: room.squares,
      xIsNext: room.xIsNext,
      winner: room.winner,
      lastMove: { squareIndex, player },
    })

    console.log(`Move made in room ${roomCode}: ${player} at ${squareIndex}`)
  })

  // Reset game
  socket.on('reset_game', (roomCode) => {
    const room = rooms.get(roomCode)
    if (!room) return

    room.squares = Array(9).fill(null)
    room.xIsNext = true
    room.winner = null

    rooms.set(roomCode, room)

    io.to(roomCode).emit('game_reset', {
      squares: room.squares,
      xIsNext: room.xIsNext,
    })
  })

  // Leave room
  socket.on('leave_room', (roomCode) => {
    const room = rooms.get(roomCode)
    if (!room) return

    // Notify other player
    io.to(roomCode).emit('opponent_left')

    // Clean up room
    rooms.delete(roomCode)

    console.log(`Room ${roomCode} closed`)
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)

    // Find and clean up any rooms this player was in
    for (const [code, room] of rooms.entries()) {
      if (room.host === socket.id || room.guest === socket.id) {
        io.to(code).emit('opponent_disconnected')
        rooms.delete(code)
        console.log(`Room ${code} cleaned up due to disconnect`)
      }
    }
  })
})

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

const PORT = 3001
server.listen(PORT, () => {
  console.log(`🎮 Socket.IO server running on http://localhost:${PORT}`)
})
