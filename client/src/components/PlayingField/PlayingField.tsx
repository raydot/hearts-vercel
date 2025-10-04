import React from 'react'
import PlayerHand from '../PlayerHand/PlayerHand'
import Player from '../Player/Player'
import CardComponent from '../Card/Card'
import ScoreDisplay from '../ScoreDisplay/ScoreDisplay'
import { useCardActions } from '@/hooks/useCardActions'
import { GameState } from '@/hooks/useGameReducer'
import { Card } from '@/types'
import { cn } from '@/lib/utils'

interface PlayingFieldProps {
  gameState: GameState & { playCard: (playerIndex: number, card: Card) => void }
}

const PlayingField: React.FC<PlayingFieldProps> = ({ gameState }) => {
  // Get card actions from our hook - pass the gameState
  const { handleCardClick, isCardPlayable } = useCardActions(
    gameState as GameState & {
      playCard: (playerIndex: number, card: Card) => void
    }
  )
  // Use passed game state
  const { playerHands, trickCards, trickPlayerIndices, scores, currentTurn } =
    gameState

  // For now, we'll use simple state for trick clearing animation
  // This can be moved to the reducer later if needed
  const isClearingTrick = gameState.showCompletedTrick
  const trickAnimationTargetPlayer = null // Simplified for now

  const playerHand = playerHands[0] || []

  let trickContainerClassName = ''
  if (isClearingTrick) {
    trickContainerClassName = 'trick-clearing'
    if (trickAnimationTargetPlayer !== null) {
      trickContainerClassName += ` clearing-to-player-${trickAnimationTargetPlayer}`
    }
  }

  // Player names for the score display
  const playerNames = ['You', 'Computer 1', 'Computer 2', 'Computer 3']

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-gray-900 overflow-hidden min-h-[600px] min-w-[800px]"
      data-testid="playing-field"
    >
      {/* Score Display */}
      <ScoreDisplay
        scores={scores}
        playerNames={playerNames}
        currentPlayerIndex={currentTurn}
      />

      <div className="relative w-[95%] h-[95%] min-h-[550px] min-w-[700px] rounded-[50px] bg-felt-500 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex justify-center items-center overflow-hidden border-[15px] border-wood-500 m-5 felt-texture">
        <div
          className={cn(
            'absolute top-[30px] left-1/2 -translate-x-[calc(50%+75px)] flex flex-col items-center z-10',
            currentTurn === 2 && 'opacity-100'
          )}
          data-testid="player-top"
        >
          <Player name="Computer 2" isComputer={true} position="top" />
        </div>
        <div
          className={cn(
            'absolute left-[30px] top-1/2 -translate-y-1/2 flex flex-col items-center z-10',
            currentTurn === 1 && 'opacity-100'
          )}
          data-testid="player-left"
        >
          <Player name="Computer 1" isComputer={true} position="left" />
        </div>
        <div
          className={cn(
            'absolute right-[30px] top-1/2 -translate-y-1/2 flex flex-col items-center z-10',
            currentTurn === 3 && 'opacity-100'
          )}
          data-testid="player-right"
        >
          <Player name="Computer 3" isComputer={true} position="right" />
        </div>

        {/* Center play area for trick cards */}
        <div
          className="absolute w-[300px] h-[300px] flex justify-center items-center -translate-y-[50px]"
          data-testid="center-play-area"
        >
          {/* Winner indicator that appears during trick clearing */}
          {isClearingTrick && trickAnimationTargetPlayer !== null && (
            <div
              className="absolute text-2xl text-white font-bold"
              data-testid="winner-indicator"
            >
              <span>+</span>
            </div>
          )}

          {trickCards && trickCards.length > 0 ? (
            <div className={trickContainerClassName}>
              {trickCards.slice(0, 4).map((card, index) => {
                let positionStyle = {}
                let position = 'bottom'

                const playerIndex = trickPlayerIndices[index]

                if (playerIndex === 0) {
                  position = 'bottom'
                } else if (playerIndex === 1) {
                  position = 'left'
                } else if (playerIndex === 2) {
                  position = 'top'
                } else if (playerIndex === 3) {
                  position = 'right'
                } else {
                  position = 'bottom'
                }

                switch (position) {
                  case 'bottom':
                    positionStyle = {
                      bottom: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }
                    break
                  case 'top':
                    positionStyle = {
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }
                    break
                  case 'left':
                    positionStyle = {
                      left: '-30px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }
                    break
                  case 'right':
                    positionStyle = {
                      right: '-30px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }
                    break
                  default:
                    positionStyle = { position: 'relative' }
                }

                return (
                  <div
                    key={`trick-${card.suit}-${card.rank}-${index}`}
                    className={`trick-card-wrapper trick-card-${position}`}
                    data-testid="trick-card"
                    style={{
                      position: 'absolute',
                      ...positionStyle
                    }}
                  >
                    <CardComponent suit={card.suit} rank={card.rank} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-white/50 text-lg">Play a card</div>
          )}
        </div>

        <div
          className={cn(
            'absolute bottom-[30px] left-0 w-full flex flex-col items-center z-10',
            currentTurn === 0 && 'opacity-100'
          )}
          data-testid="player-bottom"
        >
          <div className="relative w-full flex justify-center">
            <div className="absolute left-1/2 -translate-x-[calc(50%-75px)]">
              <Player name="You" isComputer={false} position="bottom" />
            </div>
          </div>
          <PlayerHand
            playerHand={playerHand}
            onCardClick={handleCardClick}
            isCardPlayable={isCardPlayable}
          />
        </div>
      </div>
    </div>
  )
}

export default PlayingField
