import React from 'react';
import './ScoreScreen.css';

interface ScoreScreenProps {
  isGameOver: boolean;
  roundScores: number[];
  totalScores: number[];
  playerNames: string[];
  currentRound: number;
  shootingPlayer: number | null;
  onNextRound: () => void;
  onNewGame: () => void;
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({
  isGameOver,
  roundScores,
  totalScores,
  playerNames,
  currentRound,
  shootingPlayer,
  onNextRound,
  onNewGame
}) => {
  // Find the winner (lowest score in Hearts)
  const winnerIndex = totalScores.indexOf(Math.min(...totalScores));
  
  return (
    <div className="score-screen-overlay">
      <div className="score-screen-card">
        <h2>{isGameOver ? 'Game Over!' : `Round ${currentRound} Complete`}</h2>
        
        {isGameOver && (
          <h3 className="winner-announcement">{playerNames[winnerIndex]} Wins!</h3>
        )}
        
        {shootingPlayer !== null && (
          <div className="moon-shot-alert">
            <h3>{playerNames[shootingPlayer]} shot the moon!</h3>
            <p>26 points have been subtracted from their score.</p>
          </div>
        )}
        
        <div className="score-table">
          <div className="score-header-row">
            <div className="player-column">Player</div>
            <div className="score-column">This Round</div>
            <div className="score-column">Total</div>
          </div>
          
          {playerNames.map((name, index) => (
            <div 
              key={`player-score-${index}`}
              className={`score-row ${totalScores[index] >= 50 ? 'danger-score' : ''}`}
              data-testid={`player-score-row-${index}`}
            >
              <div className="player-column">{name}</div>
              <div className="score-column round-score">+{roundScores[index]}</div>
              <div className="score-column total-score">{totalScores[index]}</div>
            </div>
          ))}
        </div>
        
        <div className="score-screen-footer">
          {isGameOver ? (
            <button 
              className="primary-button"
              onClick={onNewGame}
            >
              New Game
            </button>
          ) : (
            <button 
              className="primary-button"
              onClick={onNextRound}
            >
              Next Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreScreen;
