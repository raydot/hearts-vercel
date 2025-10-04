import React from 'react';
import { ScorePanel } from '@/components/ui/score-panel';

interface ScoreDisplayProps {
  scores: number[];
  playerNames: string[];
  currentPlayerIndex?: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  scores, 
  playerNames,
  currentPlayerIndex = -1
}) => {
  return (
    <ScorePanel 
      scores={scores}
      playerNames={playerNames}
      currentPlayerIndex={currentPlayerIndex}
    />
  );
};

export default ScoreDisplay;
