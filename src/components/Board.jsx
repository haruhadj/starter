import Square from './Square'

function Board({ squares, onClick, winningLine }) {
  const renderSquare = (i) => {
    const isWinning = winningLine?.includes(i)

    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        disabled={!!winningLine}
        isWinning={isWinning}
      />
    )
  }

  return (
    <div
      className="grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-gray-900 rounded-2xl border border-gray-700"
      role="grid"
      aria-label="Tic Tac Toe board"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => renderSquare(i))}
    </div>
  )
}

export default Board
