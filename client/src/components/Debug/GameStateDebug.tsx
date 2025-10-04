import { useGameState } from '../../hooks/useGameState';

const GameStateDebug: React.FC = () => {
  // Get state from the reducer
  const gameState = useGameState();
  const {
    playerHands,
    currentTurn,
    gameOver,
    trickCards,
    heartsBroken,
    gamePhase,
    trickPlayerIndices,
    scores,
    currentRound,
    showCompletedTrick,
    isProcessing
  } = gameState;

  const debugStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'auto',
    zIndex: 1000,
    fontSize: '12px',
    fontFamily: 'monospace'
  };

  const toggleDebug = () => {
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    }
  };

  return (
    <div>
      <button 
        onClick={toggleDebug}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 1001,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '5px 10px',
          cursor: 'pointer'
        }}
      >
        Debug
      </button>
      <div id="debug-panel" style={{...debugStyle, display: 'none'}}>
        <h3>Game State Debug</h3>
        <div>
          <strong>Game Phase:</strong> {gamePhase}
        </div>
        <div>
          <strong>Current Round:</strong> {currentRound}
        </div>
        <div>
          <strong>Current Turn:</strong> {currentTurn} {currentTurn === 0 ? '(Human)' : `(Computer ${currentTurn})`}
        </div>
        <div>
          <strong>Game Over:</strong> {gameOver ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Hearts Broken:</strong> {heartsBroken ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Is Processing:</strong> {isProcessing ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Show Completed Trick:</strong> {showCompletedTrick ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Scores:</strong> {JSON.stringify(scores)}
        </div>
        <div>
          <strong>Trick Cards:</strong> 
          <pre>{JSON.stringify(trickCards, null, 2)}</pre>
        </div>
        <div>
          <strong>Trick Player Indices:</strong> 
          <pre>{JSON.stringify(trickPlayerIndices, null, 2)}</pre>
        </div>
        <div>
          <strong>Player Hands:</strong>
          <pre>{JSON.stringify(playerHands, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default GameStateDebug;
