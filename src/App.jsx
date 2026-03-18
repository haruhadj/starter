import { useState } from 'react'
import GameVsAI from './components/GameVsAI'
import GamePVP from './components/GamePVP'
import GamePVPOnline from './components/GamePVPOnline'

function App() {
  const [gameMode, setGameMode] = useState('pve')
  const [difficulty, setDifficulty] = useState('hard')
  const [playerSymbol, setPlayerSymbol] = useState('X')
  const [roomCode, setRoomCode] = useState(null)
  const [joinCode, setJoinCode] = useState('')
  const [pvpType, setPvpType] = useState('local')
  const [isHost, setIsHost] = useState(false)

  const handleCreateRoom = (online = false) => {
    setPvpType(online ? 'online' : 'local')
    // Online rooms must be created on the socket server (server generates the code).
    // Local rooms can still use a locally generated code.
    const newCode = online ? 'CREATING…' : Math.random().toString(36).substring(2, 6).toUpperCase()
    setRoomCode(newCode)
    setIsHost(true)
    setGameMode('pvp')
  }

  const handleJoinRoom = (online = false) => {
    if (joinCode.trim().length >= 4) {
      setPvpType(online ? 'online' : 'local')
      setRoomCode(joinCode.trim().toUpperCase())
      setIsHost(false)
      setGameMode('pvp')
      setJoinCode('')
    }
  }

  const handleLeaveRoom = () => {
    setRoomCode(null)
    setGameMode('pve')
    setPvpType('local')
    setIsHost(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Tic Tac Toe
          </h1>
          <p className="text-gray-400">
            {gameMode === 'pvp' ? 'Player vs Player' : 'Challenge the AI'}
          </p>
        </header>

        {/* Game Card */}
        <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800">
          {gameMode === 'pvp' && roomCode ? (
            pvpType === 'online'
              ? (
                  <GamePVPOnline
                    roomCode={roomCode}
                    isHost={isHost}
                    onRoomCode={(code) => setRoomCode(code)}
                    onLeave={handleLeaveRoom}
                  />
                )
              : <GamePVP roomCode={roomCode} onLeave={handleLeaveRoom} />
          ) : (
            <GameVsAI difficulty={difficulty} playerSymbol={playerSymbol} />
          )}
        </div>

        {/* Settings */}
        <div className="mt-6 bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">
            {gameMode === 'pvp' ? 'Room' : 'Settings'}
          </h2>

          {gameMode === 'pve' && (
            <>
              {/* Mode Selection */}
              <div className="flex justify-center gap-3 mb-4">
                <button
                  onClick={() => setGameMode('pvp')}
                  className="px-6 py-2 rounded-xl font-bold transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                >
                  ⚔️ PVP Mode
                </button>
              </div>

              {/* Symbol Selection */}
              <div className="flex justify-center gap-3 mb-4">
                <button
                  onClick={() => setPlayerSymbol('X')}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${
                    playerSymbol === 'X'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Play as X
                </button>
                <button
                  onClick={() => setPlayerSymbol('O')}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${
                    playerSymbol === 'O'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Play as O
                </button>
              </div>

              {/* Difficulty Info */}
              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">
                  <strong className="text-purple-400">Hard:</strong> Blocks and wins when possible
                </p>
                <p>
                  <strong className="text-purple-400">Impossible:</strong> Perfect AI (minimax) - unbeatable
                </p>
              </div>
            </>
          )}

          {gameMode === 'pvp' && (
            <div className="text-center">
              {roomCode ? (
                <>
                  <p className="text-gray-400 mb-2">Room Code:</p>
                  <p className="text-3xl font-mono font-bold text-purple-400 tracking-wider mb-4">
                    {roomCode}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(roomCode)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    📋 Copy Code
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex gap-2 justify-center mb-4">
                    <button
                      onClick={() => setPvpType('local')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pvpType === 'local'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Local
                    </button>
                    <button
                      onClick={() => setPvpType('online')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pvpType === 'online'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      🌐 Online
                    </button>
                  </div>

                  {pvpType === 'online' ? (
                    <>
                      <button
                        onClick={() => handleCreateRoom(true)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 block w-full"
                      >
                        Create Online Room
                      </button>
                      <div className="text-gray-500">or</div>
                      <div>
                        <input
                          type="text"
                          placeholder="Enter room code"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom(true)}
                          className="w-full px-4 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 text-center font-mono uppercase tracking-wider"
                          maxLength={8}
                        />
                        <button
                          onClick={() => handleJoinRoom(true)}
                          className="mt-3 px-8 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 block w-full"
                        >
                          Join Online Room
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCreateRoom(false)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 block w-full"
                      >
                        Create Local Room
                      </button>
                      <div className="text-gray-500">or</div>
                      <div>
                        <input
                          type="text"
                          placeholder="Enter room code"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom(false)}
                          className="w-full px-4 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 text-center font-mono uppercase tracking-wider"
                          maxLength={8}
                        />
                        <button
                          onClick={() => handleJoinRoom(false)}
                          className="mt-3 px-8 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 block w-full"
                        >
                          Join Local Room
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>Built with React + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  )
}

export default App
