import React from "react"
import PlayerHand from "@/components/PlayerHand/PlayerHand"
import Player from "@/components/Player/Player"
import Card from "@/components/Card/Card"
import { Card as CardType } from "@/types"

import "./PlayingField.css"

interface PlayingFieldProps {
  playerHands: CardType[][]
  currentTurn: number
  onCardClick: (card: CardType) => void
  trickCards?: CardType[]
  isCardPlayable?: (card: CardType) => boolean
  isClearingTrick?: boolean
}

const PlayingField: React.FC<PlayingFieldProps> = ({
  playerHands,
  currentTurn,
  onCardClick,
  trickCards,
  isCardPlayable,
  isClearingTrick
}) => {
  // Make sure the player has a hand
  const playerHand = playerHands[0] || []

  return (
    <div className="playingField green-felt" data-testid="playing-field" style={{ width: '100%', minWidth: '800px' }}>
      <div className="felt-table">
        <div className={`player top ${currentTurn === 1 ? "active" : ""}`} data-testid="player-top">
          <Player name="Computer 1" isComputer={true} position="top" />
        </div>
        <div className={`player left ${currentTurn === 2 ? "active" : ""}`} data-testid="player-left">
          <Player name="Computer 2" isComputer={true} position="left" />
        </div>
        <div className={`player right ${currentTurn === 3 ? "active" : ""}`} data-testid="player-right">
          <Player name="Computer 3" isComputer={true} position="right" />
        </div>
        
        {/* Center play area for trick cards */}
        <div className="center-play-area" data-testid="center-play-area">
          {trickCards && trickCards.length > 0 ? (
            // Only show up to 4 cards (a complete trick)
            // Add a visual indicator if we're in the clearing phase
            <div className={isClearingTrick ? 'trick-clearing' : ''}>
              {trickCards.slice(0, 4).map((card, index) => (
                <div 
                  key={`trick-${card.suit}-${card.rank}-${index}`} 
                  className="trick-card-wrapper" 
                  data-testid="trick-card"
                  style={{
                    position: 'absolute',
                    transform: `translate(${(index % 2) * 40 - 20}px, ${Math.floor(index / 2) * 40 - 20}px)`
                  }}
                >
                  <Card 
                    suit={card.suit} 
                    rank={card.rank} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-trick-area">Play a card</div>
          )}
        </div>
        
        <div className={`human-player ${currentTurn === 0 ? "active" : ""}`} data-testid="player-bottom">
          <Player name="You" isComputer={false} position="bottom" />
          <PlayerHand 
            playerHand={playerHand} 
            onCardClick={onCardClick} 
            isCardPlayable={isCardPlayable}
          />
        </div>
      </div>
    </div>
  )
}

export default PlayingField
