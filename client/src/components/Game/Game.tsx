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
    tricks,
    scores,
    heartsBroken,
    dealCards,
    playCard,
    handleComputerTurn
  } = gameState;

  // Handle computer turns
  useEffect(() => {
    if (currentTurn !== 0 && !gameOver) {
      handleComputerTurn();
    }
  }, [currentTurn, gameOver, handleComputerTurn]);

  const handleCardClick = (card: CardType) => {
    if (currentTurn === 0 && !gameOver) {
      playCard(card, 0);
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
          ) : (
            <div className="game-status">
              <p>
                {currentTurn === 0
                  ? "Your turn"
                  : `Computer ${currentTurn}'s turn`}
              </p>
              <div className="trick-cards">
                {trickCards.length > 0 && (
                  <div className="current-trick">
                    <h3>Current Trick:</h3>
                    <div className="trick-display">
                      {trickCards.map((card, index) => (
                        <div key={index} className="trick-card">
                          {card.suit} {card.rank}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="scores-display">
                <h3>Scores:</h3>
                <ul>
                  <li>You: {scores[0]}</li>
                  <li>Computer 1: {scores[1]}</li>
                  <li>Computer 2: {scores[2]}</li>
                  <li>Computer 3: {scores[3]}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      {playerHands.length > 0 && playerHands[0].length > 0 && (
        <PlayingField 
          playerHands={playerHands}
          currentTurn={currentTurn}
          onCardClick={handleCardClick}
        />
      )}
    </div>
  );
};

export default Game;