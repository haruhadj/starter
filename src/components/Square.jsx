function Square({ value, onClick, disabled, isWinning }) {
  const baseClasses = "w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl font-bold rounded-xl transition-all duration-200 ease-in-out"

  const stateClasses = value
    ? "bg-gradient-to-br from-purple-600/30 to-purple-700/30 border-2 border-purple-500/50"
    : "bg-gray-800 border-2 border-gray-700 hover:border-purple-500"

  const winningClasses = isWinning
    ? "ring-4 ring-purple-500 scale-105 shadow-lg shadow-purple-500/40"
    : ""

  const hoverClasses = !value && !disabled
    ? "hover:scale-105 hover:shadow-md cursor-pointer"
    : ""

  const textClasses = value === 'X'
    ? 'text-purple-400'
    : 'text-pink-400'

  return (
    <button
      className={`${baseClasses} ${stateClasses} ${winningClasses} ${hoverClasses} ${textClasses}`}
      onClick={onClick}
      disabled={disabled || value}
      aria-label={value ? `Square with ${value}` : 'Empty square'}
    >
      {value}
    </button>
  )
}

export default Square
