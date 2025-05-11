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
            // Add a visual indicator if we're in the clearing phase
            <div className={isClearingTrick ? 'trick-clearing' : ''}>
              {trickCards.slice(0, 4).map((card, index) => {
                // Position cards based on which player played them
                // Calculate positions for each player's card
                let positionStyle = {};
                
                // Determine the player position based on the lead player and card index
                // Player positions: 0 = South (human), 1 = North, 2 = West, 3 = East
                const playerPositions = ['bottom', 'top', 'left', 'right'];
                const position = playerPositions[index];
                
                // Set position based on which player played the card
                switch(position) {
                  case 'bottom': // South (human)
                    positionStyle = { bottom: '-30px', left: '50%', transform: 'translateX(-50%)' };
                    break;
                  case 'top': // North
                    positionStyle = { top: '-30px', left: '50%', transform: 'translateX(-50%)' };
                    break;
                  case 'left': // West
                    positionStyle = { left: '-30px', top: '50%', transform: 'translateY(-50%)' };
                    break;
                  case 'right': // East
                    positionStyle = { right: '-30px', top: '50%', transform: 'translateY(-50%)' };
                    break;
                  default:
                    positionStyle = { position: 'relative' };
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
                    <Card 
                      suit={card.suit} 
                      rank={card.rank} 
                    />
                  </div>
                );
              })}
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
