import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ScoreScreen from '@/components/ScoreScreen/ScoreScreen';

describe('ScoreScreen Component', () => {
  // Test data
  const roundScores = [5, 8, 0, 13];
  const totalScores = [15, 28, 10, 23];
  const playerNames = ['You', 'Computer 1', 'Computer 2', 'Computer 3'];
  
  test('renders round end screen correctly', () => {
    const handleNextRound = vi.fn();
    
    render(
      <ScoreScreen 
        isGameOver={false}
        roundScores={roundScores}
        totalScores={totalScores}
        playerNames={playerNames}
        currentRound={2}
        shootingPlayer={null}
        onNextRound={handleNextRound}
        onNewGame={vi.fn()}
      />
    );
    
    // Check if round number is displayed
    expect(screen.getByText('Round 2 Complete')).toBeInTheDocument();
    
    // Check if all player names are displayed
    playerNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    
    // Check if round scores are displayed
    roundScores.forEach(score => {
      expect(screen.getByText(`+${score}`)).toBeInTheDocument();
    });
    
    // Check if total scores are displayed
    totalScores.forEach(score => {
      expect(screen.getByText(score.toString(), { exact: false })).toBeInTheDocument();
    });
    
    // Check if Next Round button is present
    const nextButton = screen.getByText('Next Round');
    expect(nextButton).toBeInTheDocument();
    
    // Test button click
    fireEvent.click(nextButton);
    expect(handleNextRound).toHaveBeenCalledTimes(1);
  });
  
  test('renders game over screen correctly', () => {
    const handleNewGame = vi.fn();
    
    render(
      <ScoreScreen 
        isGameOver={true}
        roundScores={roundScores}
        totalScores={totalScores}
        playerNames={playerNames}
        currentRound={4}
        shootingPlayer={null}
        onNextRound={vi.fn()}
        onNewGame={handleNewGame}
      />
    );
    
    // Check if game over message is displayed
    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    
    // Check if winner is displayed (lowest score wins in Hearts)
    expect(screen.getByText('Computer 2 Wins!')).toBeInTheDocument();
    
    // Check if New Game button is present
    const newGameButton = screen.getByText('New Game');
    expect(newGameButton).toBeInTheDocument();
    
    // Test button click
    fireEvent.click(newGameButton);
    expect(handleNewGame).toHaveBeenCalledTimes(1);
  });
  
  test('highlights player with 50 or more points', () => {
    const dangerScores = [15, 52, 10, 23];
    
    render(
      <ScoreScreen 
        isGameOver={true}
        roundScores={roundScores}
        totalScores={dangerScores}
        playerNames={playerNames}
        currentRound={4}
        shootingPlayer={null}
        onNextRound={vi.fn()}
        onNewGame={vi.fn()}
      />
    );
    
    // Check if the player with score over 50 has danger class
    const playerElements = screen.getAllByTestId(/player-score-row/);
    expect(playerElements[1]).toHaveClass('danger-score');
  });
});
