import React from 'react'

interface ScoreScreenProps {
  gameState: {
    scores: number[]
    roundScores: number[]
    roundNumber: number
    gameOver: boolean
    gamePhase: string
  }
  onNextRound: () => void
  onNewGame: () => void
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({
  gameState,
  onNextRound,
  onNewGame
}) => {
  const { scores, roundScores, roundNumber, gameOver } = gameState

  // Player names are static
  const playerNames = ['You', 'Computer 1', 'Computer 2', 'Computer 3']
  // Find the winner (lowest score in Hearts)
  const winner = scores.indexOf(Math.min(...scores))

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-gray-300 max-w-2xl w-full mx-4">
        <h2 className="text-4xl font-bold mb-2 text-center text-gray-900">
          {gameOver ? 'Game Over!' : `Round ${roundNumber} Complete!`}
        </h2>

        {gameOver && (
          <h3 className="text-2xl font-semibold mb-6 text-center text-green-600">
            {playerNames[winner]} Wins!
          </h3>
        )}

        {/* Score Table */}
        <div className="mb-8">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 mb-3 pb-2 border-b-2 border-gray-300">
            <div className="font-bold text-gray-700">Player</div>
            <div className="font-bold text-gray-700 text-center">
              This Round
            </div>
            <div className="font-bold text-gray-700 text-center">Total</div>
          </div>

          {/* Score Rows */}
          {playerNames.map((name, index) => (
            <div
              key={`player-score-${index}`}
              className={`grid grid-cols-3 gap-4 py-3 px-2 rounded-lg ${
                scores[index] >= 50 ? 'bg-red-50' : 'bg-gray-50'
              }`}
              data-testid={`player-score-row-${index}`}
            >
              <div className="font-medium text-gray-900">{name}</div>
              <div className="text-center text-red-600 font-semibold">
                +{roundScores[index]}
              </div>
              <div className="text-center text-gray-900 font-bold text-lg">
                {scores[index]}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          {gameOver ? (
            <button
              className="px-10 py-4 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors shadow-lg"
              onClick={onNewGame}
            >
              New Game
            </button>
          ) : (
            <button
              className="px-10 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg"
              style={{ backgroundColor: 'rgb(22, 163, 74)' }}
              onClick={onNextRound}
            >
              Next Round
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScoreScreen
