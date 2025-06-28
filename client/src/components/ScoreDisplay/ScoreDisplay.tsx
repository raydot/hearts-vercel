import React from 'react';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  scores: number[];
  playerNames: string[];
  currentPlayerIndex?: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  scores, 
  playerNames,
  currentPlayerIndex 
}) => {
  return (
    <div className="score-display">
      <h3>Current Scores</h3>
      <div className="score-list">
        {scores.map((score, index) => (
          <div 
            key={`player-score-${index}`} 
            className={`score-item ${currentPlayerIndex === index ? 'current-player' : ''}`}
          >
            <span className="player-name">{playerNames[index]}</span>
            <span className="player-score">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreDisplay;
