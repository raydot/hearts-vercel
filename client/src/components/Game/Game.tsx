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
    <div className="fixed inset-0 w-full h-full flex flex-col">
      <GameStateDebug />
      
      {/* Centered start/game over screens */}
      {(gameOver || (gamePhase === 'DEALING' && (playerHands.length === 0 || playerHands[0].length === 0))) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          {gameOver ? (
            <div className="bg-white p-8 rounded-lg shadow-2xl border-2 border-gray-300 max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Game Over!</h2>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Final Scores:</h3>
                <ul className="space-y-2 text-lg text-gray-700">
                  <li className="font-medium">You: {scores[0]}</li>
                  <li>Computer 1: {scores[1]}</li>
                  <li>Computer 2: {scores[2]}</li>
                  <li>Computer 3: {scores[3]}</li>
                </ul>
              </div>
              <button 
                onClick={dealCards} 
                className="w-full px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-md"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-2xl border-4 border-gray-800 max-w-md">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1f2937' }}>Welcome to Hearts!</h2>
              <p className="mb-8 text-lg" style={{ color: '#4b5563' }}>Click the button below to start the game.</p>
              <button 
                onClick={() => {
                  console.log('Game: Start Game button clicked');
                  dealCards();
                }} 
                className="w-full px-10 py-5 rounded-xl transition-colors shadow-lg"
                style={{ 
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                Start Game
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Game title in top-left */}
      <div className="absolute top-4 left-4 z-40">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Hearts</h1>
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