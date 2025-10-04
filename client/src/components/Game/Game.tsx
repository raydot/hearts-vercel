import React, { useEffect } from 'react';
import PlayingField from '@/components/PlayingField/PlayingField';
import { useGameState } from '../../hooks/useGameState';
import GameStateDebug from '@/components/Debug/GameStateDebug';
import ScoreScreen from '@/components/ScoreScreen/ScoreScreen';

const Game = () => {
  // Use reducer-based game state
  const gameState = useGameState();
  const {
    playerHands,
    currentTurn,
    gameOver,
    scores,
    gamePhase,
    showCompletedTrick,
    dealCards,
    nextRound,
    newGame
  } = gameState;

  // Debug: Log game state
  console.log('Game: Render with state:', {
    currentTurn,
    gamePhase,
    playerHandLengths: playerHands.map((hand: any) => hand.length),
    showCompletedTrick
  });

  // Handle computer turns automatically
  useEffect(() => {
    // Only trigger computer turns if:
    // 1. Game is in PLAYING phase
    // 2. It's a computer player's turn (1, 2, or 3)
    // 3. Game is not processing another action
    // 4. Not showing completed trick
    if (gamePhase === 'PLAYING' && currentTurn > 0 && !gameState.isProcessing && !showCompletedTrick) {
      console.log('Game: Triggering computer turn for player', currentTurn);
      // Small delay to make computer moves visible
      const timer = setTimeout(() => {
        gameState.handleComputerTurn();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gamePhase, gameState.isProcessing, showCompletedTrick, gameState.handleComputerTurn]);

  // Handle round completion
  useEffect(() => {
    if (gamePhase === 'ROUND_COMPLETE') {
      console.log('Game: Round complete, checking if game should end');
      
      // Check if any player has reached 100+ points (game over)
      const maxScore = Math.max(...scores);
      if (maxScore >= 100) {
        console.log('Game: Game over! Max score:', maxScore);
        // TODO: Handle game over properly
        return;
      } else {
        console.log('Game: Starting next round');
        // Start next round after a brief delay to show final trick
        const timer = setTimeout(() => {
          nextRound();
          // Deal new cards for the next round
          dealCards();
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [gamePhase, scores, nextRound, dealCards]);

  return (
    <div className="game">
      <GameStateDebug />
      <div className="game-header">
        <h1>Hearts</h1>
        <div className="game-info">
          {gameOver ? (
            <div className="game-over">
              <h2>Game Over!</h2>
              <div className="scores">
                <h3>Final Scores:</h3>
                <ul>
                  <li>You: {scores[0]}</li>
                  <li>Computer 1: {scores[1]}</li>
                  <li>Computer 2: {scores[2]}</li>
                  <li>Computer 3: {scores[3]}</li>
                </ul>
              </div>
              <button onClick={dealCards} className="start-button">
                Play Again
              </button>
            </div>
          ) : gamePhase === 'DEALING' && (playerHands.length === 0 || playerHands[0].length === 0) ? (
            <div className="start-game">
              <h2>Welcome to Hearts!</h2>
              <p>Click the button below to start the game.</p>
              <button onClick={() => {
                console.log('Game: Start Game button clicked');
                dealCards();
              }} className="start-button">
                Start Game
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {(() => {
        // Show PlayingField if game is active (has cards) but NOT if showing score screen
        const shouldShow = (playerHands.length > 0 && playerHands[0].length > 0) && !gameState.showScoreScreen;
        console.log('Game: Should show PlayingField?', shouldShow, {
          playerHandsLength: playerHands.length,
          firstHandLength: playerHands[0]?.length,
          gamePhase,
          showScoreScreen: gameState.showScoreScreen
        });
        return shouldShow && <PlayingField gameState={gameState} />;
      })()}
      {gameState.showScoreScreen && (
        <ScoreScreen 
          gameState={gameState}
          onNextRound={() => {
            nextRound();
            dealCards();
          }}
          onNewGame={newGame}
        />
      )}
    </div>
  );
};

export default Game;