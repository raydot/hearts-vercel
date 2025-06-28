import { useEffect } from 'react';
import PlayingField from '@/components/PlayingField/PlayingField';
import { useAtom } from 'jotai';
import { currentTurnAtom, gameOverAtom, playerHandsAtom, roundScoresAtom, gamePhaseAtom, isClearingTrickAtom, isProcessingTrickEndAtom } from '@/state/atoms';
import { useGameActions } from '../../hooks/useGameActions';
import GameStateDebug from '@/components/Debug/GameStateDebug';
import './Game.css';

const Game = () => {
  // Use Jotai atoms for state
  const [playerHands] = useAtom(playerHandsAtom);
  const [currentTurn] = useAtom(currentTurnAtom);
  const [gameOver] = useAtom(gameOverAtom);
  const [scores] = useAtom(roundScoresAtom);
  const [gamePhase] = useAtom(gamePhaseAtom);
  const [isClearingTrick] = useAtom(isClearingTrickAtom);
  const [isProcessingTrickEnd] = useAtom(isProcessingTrickEndAtom);
  
  // Use our game actions hook for game functions
  const { dealCards, handleComputerTurn } = useGameActions();

  // Handle computer turns
  useEffect(() => {
    if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd && gamePhase === 'PLAYING') {
      console.log(`Game: Computer turn triggered - Player ${currentTurn}'s turn`);
      handleComputerTurn();
    }
  }, [currentTurn, gameOver, handleComputerTurn, isClearingTrick, isProcessingTrickEnd, gamePhase]);
  
  // Log state changes
  useEffect(() => {
    console.log('Game: Current turn updated:', currentTurn);
  }, [currentTurn]);
  
  useEffect(() => {
    console.log('Game: Player hands updated:', playerHands);
  }, [playerHands]);
  
  useEffect(() => {
    console.log('Game: Game phase updated:', gamePhase);
  }, [gamePhase]);

  // useEffect(() => {
  //   console.log('Game.tsx: currentTurn updated:', currentTurn);
  // }, [currentTurn]);

  // useEffect(() => {
  //   console.log('Game.tsx: trickPlayerIndices updated:', JSON.stringify(trickPlayerIndices));
  //   console.log('Game.tsx: currentTrickCards updated:', JSON.stringify(trickCards));
  // }, [trickPlayerIndices, trickCards]);

  // We're now using the handleCardClick from useCardActions hook

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
          ) : playerHands.length === 0 || playerHands[0].length === 0 ? (
            <div className="start-game">
              <h2>Welcome to Hearts!</h2>
              <p>Click the button below to start the game.</p>
              <button onClick={dealCards} className="start-button">
                Start Game
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {playerHands.length > 0 && playerHands[0].length > 0 && (
        <PlayingField />
      )}
    </div>
  );
};

export default Game;