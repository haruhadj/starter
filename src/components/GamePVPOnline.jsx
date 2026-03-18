import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Board from './Board'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`

function GamePVPOnline({ roomCode, onLeave, isHost = false, onRoomCode }) {
  const [socket, setSocket] = useState(null)
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [playerSymbol, setPlayerSymbol] = useState(null)
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(true)
  const [scores, setScores] = useState({ player: 0, opponent: 0, draws: 0 })
  const [waitingForOpponent, setWaitingForOpponent] = useState(true)
  const [connectionError, setConnectionError] = useState(null)
  const hasRequestedCreateRoom = useRef(false)

  // Initialize socket connection (once)
  useEffect(() => {
    const newSocket = io(SOCKET_URL)

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Create or join room when socket is ready
  useEffect(() => {
    if (!socket) return

    if (isHost) {
      if (hasRequestedCreateRoom.current) return
      hasRequestedCreateRoom.current = true

      // Host creates new room on server; server is source of truth for room code
      socket.emit('create_room', (response) => {
        if (response?.roomCode) {
          console.log('Room created:', response.roomCode)
          onRoomCode?.(response.roomCode)
        }
      })
      return
    }

    if (!roomCode) return

    // Guest joins existing room
    socket.emit('join_room', roomCode.toUpperCase(), (response) => {
      if (response?.error) {
        console.error('Failed to join:', response.error)
        setConnectionError(response.error)
        setWaitingForOpponent(false)
      } else {
        console.log('Joined room:', response?.roomCode)
        setWaitingForOpponent(false)
      }
    })
  }, [socket, isHost, roomCode, onRoomCode])

  // Listen for socket events
  useEffect(() => {
    if (!socket) return

    const handleConnectError = (err) => {
      const msg = err?.message || 'Failed to connect'
      setConnectionError(msg)
      setWaitingForOpponent(false)
    }

    const handleRoomCreated = (data) => {
      if (data?.roomCode) onRoomCode?.(data.roomCode)
    }

    const handleRoomJoined = (data) => {
      setPlayerSymbol(data.playerSymbol)
      setWaitingForOpponent(false)
    }

    const handlePlayerSymbol = (data) => {
      setPlayerSymbol(data.symbol)
    }

    const handleGuestJoined = () => {
      setWaitingForOpponent(false)
    }

    const handleMoveMade = (data) => {
      setSquares(data.squares)
      setXIsNext(data.xIsNext)
      if (data.winner && data.winner !== 'draw') {
        setWinner(data.winner)
        updateScore(data.winner)
      } else if (data.winner === 'draw') {
        setIsDraw(true)
        updateScore('draw')
      }
    }

    const handleGameReset = (data) => {
      setSquares(data.squares)
      setXIsNext(data.xIsNext)
      setWinner(null)
      setIsDraw(false)
    }

    const handleOpponentLeft = () => {
      setOpponentConnected(false)
    }

    const handleOpponentDisconnected = () => {
      setOpponentConnected(false)
    }

    socket.on('room_created', handleRoomCreated)
    socket.on('room_joined', handleRoomJoined)
    socket.on('player_symbol', handlePlayerSymbol)
    socket.on('guest_joined', handleGuestJoined)
    socket.on('move_made', handleMoveMade)
    socket.on('game_reset', handleGameReset)
    socket.on('opponent_left', handleOpponentLeft)
    socket.on('opponent_disconnected', handleOpponentDisconnected)
    socket.on('connect_error', handleConnectError)

    return () => {
      socket.off('room_created', handleRoomCreated)
      socket.off('room_joined')
      socket.off('player_symbol')
      socket.off('guest_joined')
      socket.off('move_made')
      socket.off('game_reset')
      socket.off('opponent_left')
      socket.off('opponent_disconnected')
      socket.off('connect_error', handleConnectError)
    }
  }, [socket])

  const updateScore = (result) => {
    if (result === 'draw') {
      setScores(s => ({ ...s, draws: s.draws + 1 }))
    } else if (result === playerSymbol) {
      setScores(s => ({ ...s, player: s.player + 1 }))
    } else {
      setScores(s => ({ ...s, opponent: s.opponent + 1 }))
    }
  }

  const handleClick = (i) => {
    if (winner || squares[i] || !opponentConnected) return

    // Check if it's player's turn
    const isPlayerTurn = (playerSymbol === 'X' && xIsNext) ||
                         (playerSymbol === 'O' && !xIsNext)
    if (!isPlayerTurn) return

    socket.emit('make_move', {
      roomCode,
      squareIndex: i,
      player: playerSymbol,
    })
  }

  const resetGame = () => {
    socket.emit('reset_game', roomCode)
  }

  const leaveRoom = () => {
    socket.emit('leave_room', roomCode)
    onLeave()
  }

  const isPlayerTurn = !winner && !isDraw && opponentConnected &&
    ((playerSymbol === 'X' && xIsNext) || (playerSymbol === 'O' && !xIsNext))

  const status = winner
    ? winner === playerSymbol ? '🎉 You win!' : '🤖 Opponent wins!'
    : isDraw
    ? '🤝 Draw!'
    : !opponentConnected
    ? 'Opponent disconnected'
    : isPlayerTurn
    ? 'Your turn'
    : 'Opponent thinking...'

  if (waitingForOpponent) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Waiting for opponent...</p>
          <p className="text-3xl font-mono font-bold text-purple-400 tracking-wider">
            {roomCode}
          </p>
          {connectionError && (
            <p className="text-sm text-red-400 mt-3">
              {connectionError}
            </p>
          )}
        </div>
        <div className="animate-spin text-4xl">●</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Room Code Header */}
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

      {/* Player indicator */}
      <div className="text-sm text-gray-400">
        You are playing as <span className={`font-bold ${playerSymbol === 'X' ? 'text-purple-400' : 'text-pink-400'}`}>{playerSymbol}</span>
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
          <p className="text-sm text-gray-400">Opponent</p>
          <p className="text-2xl font-bold text-pink-400">{scores.opponent}</p>
        </div>
      </div>

      {/* Status */}
      <div className={`text-xl sm:text-2xl font-bold px-6 py-3 rounded-xl min-w-[200px] ${winner
          ? winner === playerSymbol
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse'
            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
          : isDraw
            ? 'bg-gray-800 text-gray-300 border border-gray-700'
            : !opponentConnected
            ? 'bg-gray-800 text-red-400 border border-red-500/30'
            : isPlayerTurn
              ? 'bg-gray-800 text-purple-400 border border-purple-500/30'
              : 'bg-gray-800 text-orange-400 border border-orange-500/30'
        }`}>
        {status}
      </div>

      {/* Board */}
      <Board
        squares={squares}
        onClick={handleClick}
        winningLine={null}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          disabled={!opponentConnected}
        >
          New Game
        </button>
        <button
          onClick={leaveRoom}
          className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Leave Room
        </button>
      </div>

      {!opponentConnected && (
        <p className="text-red-400 text-sm">Opponent has disconnected</p>
      )}
    </div>
  )
}

export default GamePVPOnline
