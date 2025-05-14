import React, { useContext } from "react"
import PlayerHand from "@/components/PlayerHand/PlayerHand"
import Player from "@/components/Player/Player"
import Card from "@/components/Card/Card"
import { Card as CardType } from "@/types"
import { GameStateContext } from "@/context/GameStateProvider"

import "./PlayingField.css"

interface PlayingFieldProps {
  playerHands: CardType[][]
  currentTurn: number
  onCardClick: (card: CardType) => void
  trickCards?: CardType[]
  trickPlayerIndices?: number[]
  isCardPlayable?: (card: CardType) => boolean
}

const PlayingField: React.FC<PlayingFieldProps> = ({
  playerHands,
  currentTurn,
  onCardClick,
  trickCards: propsTrickCards = [],
  trickPlayerIndices: propsTrickPlayerIndices = [],
  isCardPlayable = () => true,
}) => {
  const context = useContext(GameStateContext);
  if (!context) {
    console.error("GameStateContext not found");
    return null;
  }

  const {
    trickCards: contextTrickCards,
    trickPlayerIndices: contextTrickPlayerIndices,
    isClearingTrick,
    trickAnimationTargetPlayer
  } = context;

  const currentTrickCards = propsTrickCards.length > 0 ? propsTrickCards : contextTrickCards;
  const currentTrickPlayerIndices = propsTrickPlayerIndices.length > 0 ? propsTrickPlayerIndices : contextTrickPlayerIndices;

  const playerHand = playerHands[0] || []

  let trickContainerClassName = "";
  if (isClearingTrick) {
    trickContainerClassName = "trick-clearing";
    if (trickAnimationTargetPlayer !== null) {
      trickContainerClassName += ` clearing-to-player-${trickAnimationTargetPlayer}`;
    }
  }

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
          {currentTrickCards && currentTrickCards.length > 0 ? (
            <div className={trickContainerClassName}>
              {currentTrickCards.slice(0, 4).map((card, index) => {
                let positionStyle = {};
                let position = 'bottom'; 

                const playerIndex = currentTrickPlayerIndices[index];

                if (playerIndex === 0) {
                    position = 'bottom'; 
                } else if (playerIndex === 1) {
                    position = 'top';    
                } else if (playerIndex === 2) {
                    position = 'left';   
                } else if (playerIndex === 3) {
                    position = 'right';  
                } else {
                    position = 'bottom'; 
                }
                
                switch(position) {
                  case 'bottom': 
                    positionStyle = { bottom: '-30px', left: '50%', transform: 'translateX(-50%)' };
                    break;
                  case 'top': 
                    positionStyle = { top: '-30px', left: '50%', transform: 'translateX(-50%)' };
                    break;
                  case 'left': 
                    positionStyle = { left: '-30px', top: '50%', transform: 'translateY(-50%)' };
                    break;
                  case 'right': 
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
