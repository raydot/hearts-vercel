import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'jotai';
import Game from '../Game';
import { useGameActions } from '../../../hooks/useGameActions';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playerHandsAtom, currentTurnAtom, gameOverAtom, gamePhaseAtom } from '../../../state/atoms';
import { useAtom } from 'jotai';

// Mock the hooks and components
vi.mock('../../../hooks/useGameActions');
vi.mock('@/components/PlayingField/PlayingField', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="playing-field">Playing Field</div>
  };
});

vi.mock('@/components/Debug/GameStateDebug', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="game-state-debug">Game State Debug</div>
  };
});

// Mock implementation of useGameActions
const mockHandleComputerTurn = vi.fn();
const mockDealCards = vi.fn();

(useGameActions as any).mockReturnValue({
  handleComputerTurn: mockHandleComputerTurn,
  dealCards: mockDealCards,
  handleNextRound: vi.fn(),
  handleNewGame: vi.fn(),
  handleTrickCompletion: vi.fn()
});

// Helper component to set up atom state for testing
const TestSetupProvider = ({ 
  children,
  initialPlayerHands = [[], [], [], []],
  initialCurrentTurn = 0,
  initialGameOver = false,
  initialGamePhase = 'DEALING'
}: { 
  children: React.ReactNode,
  initialPlayerHands?: any[][],
  initialCurrentTurn?: number,
  initialGameOver?: boolean,
  initialGamePhase?: string
}) => {
  const [, setPlayerHands] = useAtom(playerHandsAtom);
  const [, setCurrentTurn] = useAtom(currentTurnAtom);
  const [, setGameOver] = useAtom(gameOverAtom);
  const [, setGamePhase] = useAtom(gamePhaseAtom);
  
  React.useEffect(() => {
    setPlayerHands(initialPlayerHands);
    setCurrentTurn(initialCurrentTurn);
    setGameOver(initialGameOver);
    setGamePhase(initialGamePhase as any);
  }, []);
  
  return <>{children}</>;
};

describe('Game Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the start game button when no cards are dealt', () => {
    render(
      <Provider>
        <Game />
      </Provider>
    );
    
    expect(screen.getByText('Welcome to Hearts!')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('should render the playing field when cards are dealt', () => {
    render(
      <Provider>
        <TestSetupProvider initialPlayerHands={[
          [{ suit: 'clubs', rank: '2' }],
          [{ suit: 'diamonds', rank: 'K' }],
          [{ suit: 'clubs', rank: '5' }],
          [{ suit: 'diamonds', rank: '2' }]
        ]}>
          <Game />
        </TestSetupProvider>
      </Provider>
    );
    
    expect(screen.getByTestId('playing-field')).toBeInTheDocument();
  });

  it('should show game over screen when game is over', () => {
    render(
      <Provider>
        <TestSetupProvider 
          initialPlayerHands={[
            [{ suit: 'clubs', rank: '2' }],
            [{ suit: 'diamonds', rank: 'K' }],
            [{ suit: 'clubs', rank: '5' }],
            [{ suit: 'diamonds', rank: '2' }]
          ]}
          initialGameOver={true}
        >
          <Game />
        </TestSetupProvider>
      </Provider>
    );
    
    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('should trigger computer turn when it is computer\'s turn', () => {
    render(
      <Provider>
        <TestSetupProvider 
          initialPlayerHands={[
            [{ suit: 'clubs', rank: '2' }],
            [{ suit: 'diamonds', rank: 'K' }],
            [{ suit: 'clubs', rank: '5' }],
            [{ suit: 'diamonds', rank: '2' }]
          ]}
          initialCurrentTurn={1} // Computer's turn
          initialGamePhase={'PLAYING' as any}
        >
          <Game />
        </TestSetupProvider>
      </Provider>
    );
    
    // Wait for useEffect to run
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(mockHandleComputerTurn).toHaveBeenCalled();
  });

  it('should not trigger computer turn when it is player\'s turn', () => {
    render(
      <Provider>
        <TestSetupProvider 
          initialPlayerHands={[
            [{ suit: 'clubs', rank: '2' }],
            [{ suit: 'diamonds', rank: 'K' }],
            [{ suit: 'clubs', rank: '5' }],
            [{ suit: 'diamonds', rank: '2' }]
          ]}
          initialCurrentTurn={0} // Player's turn
          initialGamePhase={'PLAYING' as any}
        >
          <Game />
        </TestSetupProvider>
      </Provider>
    );
    
    // Wait for useEffect to run
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(mockHandleComputerTurn).not.toHaveBeenCalled();
  });

  it('should not trigger computer turn when game phase is not PLAYING', () => {
    render(
      <Provider>
        <TestSetupProvider 
          initialPlayerHands={[
            [{ suit: 'clubs', rank: '2' }],
            [{ suit: 'diamonds', rank: 'K' }],
            [{ suit: 'clubs', rank: '5' }],
            [{ suit: 'diamonds', rank: '2' }]
          ]}
          initialCurrentTurn={1} // Computer's turn
          initialGamePhase={'TRICK_COMPLETED'} // Not in PLAYING phase
        >
          <Game />
        </TestSetupProvider>
      </Provider>
    );
    
    // Wait for useEffect to run
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(mockHandleComputerTurn).not.toHaveBeenCalled();
  });

  it('should call dealCards when start game button is clicked', () => {
    render(
      <Provider>
        <Game />
      </Provider>
    );
    
    const startButton = screen.getByText('Start Game');
    startButton.click();
    
    expect(mockDealCards).toHaveBeenCalled();
  });

  it('should call dealCards when play again button is clicked', () => {
    render(
      <Provider>
        <TestSetupProvider 
          initialPlayerHands={[
            [{ suit: 'clubs', rank: '2' }],
            [{ suit: 'diamonds', rank: 'K' }],
            [{ suit: 'clubs', rank: '5' }],
            [{ suit: 'diamonds', rank: '2' }]
          ]}
          initialGameOver={true}
        >
          <Game />
        </TestSetupProvider>
      </Provider>
    );
    
    const playAgainButton = screen.getByText('Play Again');
    playAgainButton.click();
    
    expect(mockDealCards).toHaveBeenCalled();
  });
});
