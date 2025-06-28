import { useContext, useEffect } from 'react';
import { GameStateContext } from '@/context/GameStateProvider';
import PlayingField from '@/components/PlayingField/PlayingField';
import { Card as CardType } from '@/types';
import './Game.css';

const Game = () => {
  const gameState = useContext(GameStateContext);

  if (!gameState) {
    throw new Error("Game must be used within a GameStateProvider");
  }

  const {
    playerHands,
    currentTurn,
    gameOver,
    trickCards,
    trickPlayerIndices,
    tricks,
    scores,
    heartsBroken,
    isClearingTrick,
    dealCards,
    playCard,
    handleComputerTurn,
    isCardPlayable
  } = gameState;

  // Handle computer turns
  useEffect(() => {
    if (currentTurn !== 0 && !gameOver) {
      handleComputerTurn();
    }
  }, [currentTurn, gameOver, handleComputerTurn]);

  // useEffect(() => {
  //   console.log('Game.tsx: currentTurn updated:', currentTurn);
  // }, [currentTurn]);

  // useEffect(() => {
  //   console.log('Game.tsx: trickPlayerIndices updated:', JSON.stringify(trickPlayerIndices));
  //   console.log('Game.tsx: currentTrickCards updated:', JSON.stringify(trickCards));
  // }, [trickPlayerIndices, trickCards]);

  const handleCardClick = (card: CardType) => {
    // console.log('Card clicked:', card);
    if (currentTurn === 0 && !gameOver) {
      // Check if the move is valid
      if (isCardPlayable(card)) {
        // console.log('Playing card:', card);
        playCard(card, 0);
      } else {
        console.error('Invalid move!');
      }
    } else {
      console.error('Not your turn or game is over');
    }
  };

  return (
    <div className="game">
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
        <PlayingField 
          playerHands={playerHands}
          currentTurn={currentTurn}
          onCardClick={handleCardClick}
          trickCards={trickCards}
          trickPlayerIndices={trickPlayerIndices}
          isCardPlayable={isCardPlayable}
          isClearingTrick={isClearingTrick}
        />
      )}
    </div>
  );
};

export default Game;