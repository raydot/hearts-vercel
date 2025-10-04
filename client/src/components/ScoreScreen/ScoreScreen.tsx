import React from 'react';
import './ScoreScreen.css';

interface ScoreScreenProps {
  gameState: {
    scores: number[];
    gameOver: boolean;
    gamePhase: string;
  };
  onNextRound: () => void;
  onNewGame: () => void;
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({ gameState, onNextRound, onNewGame }) => {
  const { scores, gameOver } = gameState;
  
  // For now, we'll use placeholder values for round scores and shooting player
  // TODO: Track these properly in the reducer state
  const roundScores = [0, 0, 0, 0]; // Placeholder
  const shootingPlayer = null; // Placeholder
  
  // Player names are static
  const playerNames = ['You', 'Computer 1', 'Computer 2', 'Computer 3'];
  // Find the winner (lowest score in Hearts)
  const winner = scores.indexOf(Math.min(...scores));
  
  return (
    <div className="score-screen-overlay">
      <div className="score-screen-card">
        <h2>Round Complete!</h2>
        
        {gameOver && (
          <h3 className="winner-announcement">{playerNames[winner]} Wins!</h3>
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
              className={`score-row ${scores[index] >= 50 ? 'danger-score' : ''}`}
              data-testid={`player-score-row-${index}`}
            >
              <div className="player-column">{name}</div>
              <div className="score-column round-score">+{roundScores[index]}</div>
              <div className="score-column total-score">{scores[index]}</div>
            </div>
          ))}
        </div>
        
        <div className="score-screen-footer">
          {gameOver ? (
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
