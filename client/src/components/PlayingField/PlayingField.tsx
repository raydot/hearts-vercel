import React from 'react';
import PlayerHand from '../PlayerHand/PlayerHand';
import Player from '../Player/Player';
import CardComponent from '../Card/Card';
import ScoreDisplay from '../ScoreDisplay/ScoreDisplay';
import { useCardActions } from '@/hooks/useCardActions';
import { GameState } from '@/hooks/useGameReducer';
import { Card } from '@/types';
import './PlayingField.css';

interface PlayingFieldProps {
  gameState: GameState & { playCard: (playerIndex: number, card: Card) => void };
}

const PlayingField: React.FC<PlayingFieldProps> = ({ gameState }) => {
  // Get card actions from our hook - pass the gameState
  const { handleCardClick, isCardPlayable } = useCardActions(gameState as GameState & { playCard: (playerIndex: number, card: Card) => void });
  // Use passed game state
  const {
    playerHands,
    trickCards,
    trickPlayerIndices,
    scores,
    currentTurn
  } = gameState;
  
  // For now, we'll use simple state for trick clearing animation
  // This can be moved to the reducer later if needed
  const isClearingTrick = gameState.showCompletedTrick;
  const trickAnimationTargetPlayer = null; // Simplified for now
  
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
        currentPlayerIndex={currentTurn} 
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
          
          {trickCards && trickCards.length > 0 ? (
            <div className={trickContainerClassName}>
              {trickCards.slice(0, 4).map((card, index) => {
                let positionStyle = {};
                let position = 'bottom'; 

                const playerIndex = trickPlayerIndices[index];

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
                    <CardComponent 
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
            onCardClick={handleCardClick} 
            isCardPlayable={isCardPlayable}
          />
        </div>
      </div>
    </div>
  )
}

export default PlayingField