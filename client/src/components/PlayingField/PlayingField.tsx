import React, { useContext } from "react"
import PlayerHand from "@/components/PlayerHand/PlayerHand"
import Player from "@/components/Player/Player"
import Card from "@/components/Card/Card"
import ScoreDisplay from "@/components/ScoreDisplay/ScoreDisplay"
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
  isClearingTrick?: boolean
}

const PlayingField: React.FC<PlayingFieldProps> = ({
  playerHands,
  currentTurn,
  onCardClick,
  trickCards: propsTrickCards = [],
  trickPlayerIndices: propsTrickPlayerIndices = [],
  isCardPlayable = () => true,
  isClearingTrick: propsIsClearingTrick,
}) => {
  // console.log('PlayingField: Received playerHands[0] (Human):', JSON.stringify(playerHands[0]));
  // console.log('PlayingField: Received playerHands[3] (Comp3):', JSON.stringify(playerHands[3]));

  const context = useContext(GameStateContext);
  if (!context) {
    console.error("GameStateContext not found");
    return null;
  }

  const {
    trickCards: contextTrickCards,
    trickPlayerIndices: contextTrickPlayerIndicesFromContext,
    isClearingTrick: contextIsClearingTrick,
    trickAnimationTargetPlayer,
    scores,
    currentTurn: contextCurrentTurn
  } = context;
  
  // Use prop value if provided, otherwise use context value
  const isClearingTrick = propsIsClearingTrick !== undefined ? propsIsClearingTrick : contextIsClearingTrick;

  const currentTrickCards = propsTrickCards.length > 0 ? propsTrickCards : contextTrickCards;
  const actualTrickPlayerIndices = propsTrickPlayerIndices.length > 0 ? propsTrickPlayerIndices : contextTrickPlayerIndicesFromContext;

  // console.log('PlayingField: Received propsTrickPlayerIndices:', JSON.stringify(propsTrickPlayerIndices));
  // console.log('PlayingField: Context trickPlayerIndices:', JSON.stringify(contextTrickPlayerIndicesFromContext));
  // console.log('PlayingField: actualTrickPlayerIndices being used:', JSON.stringify(actualTrickPlayerIndices));
  // console.log('PlayingField: currentTrickCards being used:', JSON.stringify(currentTrickCards));

  const playerHand = playerHands[0] || []

  let trickContainerClassName = "";
  if (isClearingTrick) {
    trickContainerClassName = "trick-clearing";
    if (trickAnimationTargetPlayer !== null) {
      trickContainerClassName += ` clearing-to-player-${trickAnimationTargetPlayer}`;
    }
  }

  // Player names for the score display
  const playerNames = ['You', 'Computer 1', 'Computer 2', 'Computer 3'];

  return (
    <div className="playingField green-felt" data-testid="playing-field" style={{ width: '100%', minWidth: '800px' }}>
      {/* Score Display */}
      <ScoreDisplay 
        scores={scores} 
        playerNames={playerNames} 
        currentPlayerIndex={contextCurrentTurn} 
      />
      
      <div className="felt-table">
        <div className={`player top ${currentTurn === 2 ? "active" : ""}`} data-testid="player-top">
          <Player name="Computer 2" isComputer={true} position="top" />
        </div>
        <div className={`player left ${currentTurn === 1 ? "active" : ""}`} data-testid="player-left">
          <Player name="Computer 1" isComputer={true} position="left" />
        </div>
        <div className={`player right ${currentTurn === 3 ? "active" : ""}`} data-testid="player-right">
          <Player name="Computer 3" isComputer={true} position="right" />
        </div>
        
        {/* Center play area for trick cards */}
        <div className="center-play-area" data-testid="center-play-area">
          {/* Winner indicator that appears during trick clearing */}
          {isClearingTrick && trickAnimationTargetPlayer !== null && (
            <div 
              className={`winner-indicator winner-indicator-${trickAnimationTargetPlayer}`}
              data-testid="winner-indicator"
            >
              <span style={{ fontSize: '24px', color: '#fff', fontWeight: 'bold' }}>+</span>
            </div>
          )}
          
          {currentTrickCards && currentTrickCards.length > 0 ? (
            <div className={trickContainerClassName}>
              {currentTrickCards.slice(0, 4).map((card, index) => {
                let positionStyle = {};
                let position = 'bottom'; 

                const playerIndex = actualTrickPlayerIndices[index];

                if (playerIndex === 0) {
                    position = 'bottom'; 
                } else if (playerIndex === 1) {
                    position = 'left';    
                } else if (playerIndex === 2) {
                    position = 'top';   
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
