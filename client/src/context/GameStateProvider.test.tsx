import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import GameStateProvider, { GameStateContext } from './GameStateProvider';
import { Card } from '@/types';
import * as gameEngine from '@/engine/gameEngine';

// Mock the game engine functions
vi.mock('@/engine/gameEngine', () => ({
  dealCards: vi.fn(),
  findStartingPlayer: vi.fn(),
  playCard: vi.fn(),
  validateMove: vi.fn(),
}));

// Mock the gameLogic functions
vi.mock('@/cardOps/gameLogic', () => ({
  checkGameEnd: vi.fn(),
  isValidMove: vi.fn(),
  determineTrickWinner: vi.fn(),
  calculateScore: vi.fn(),
}));

// Mock the computerPlayerLogic
vi.mock('@/logicOps/computerPlayerLogic', () => ({
  getComputerMove: vi.fn(),
}));

describe('GameStateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should initialize with default state', () => {
    const TestComponent = () => {
      const context = React.useContext(GameStateContext);
      if (!context) throw new Error('Context not provided');
      
      return (
        <div>
          <div data-testid="current-turn">{context.currentTurn}</div>
          <div data-testid="game-over">{context.gameOver.toString()}</div>
        </div>
      );
    };

    render(
      <GameStateProvider>
        <TestComponent />
      </GameStateProvider>
    );

    expect(screen.getByTestId('current-turn').textContent).toBe('0');
    expect(screen.getByTestId('game-over').textContent).toBe('false');
  });

  it('should follow clockwise turn order: South → West → North → East', async () => {
    // Create a test component that can play cards
    const TestComponent = () => {
      const context = React.useContext(GameStateContext);
      if (!context) throw new Error('Context not provided');
      
      return (
        <div>
          <div data-testid="current-turn">{context.currentTurn}</div>
          <button 
            data-testid="play-card-button"
            onClick={() => {
              const mockCard: Card = { suit: 'clubs', rank: '2' };
              context.playCard(mockCard, context.currentTurn);
            }}
          >
            Play Card
          </button>
        </div>
      );
    };

    // Mock the playCard function to return appropriate values
    const mockPlayCardResult = {
      newHands: [[{ suit: 'clubs', rank: '3' }], [], [], []],
      newTrickCards: [{ suit: 'clubs', rank: '2' }],
      newTricks: [[], [], [], []],
      newHeartsBroken: false,
      trickComplete: false,
      winnerIndex: 0,
      scores: [0, 0, 0, 0]
    };
    
    (gameEngine.playCard as any).mockReturnValue(mockPlayCardResult);

    render(
      <GameStateProvider>
        <TestComponent />
      </GameStateProvider>
    );

    // Initial turn should be South (0)
    expect(screen.getByTestId('current-turn').textContent).toBe('0');

    // Play a card as South (0)
    await act(async () => {
      screen.getByTestId('play-card-button').click();
    });

    // Next turn should be West (1) - clockwise from South
    expect(screen.getByTestId('current-turn').textContent).toBe('1');

    // Update mock to simulate West (1) playing a card
    mockPlayCardResult.newTrickCards = [
      { suit: 'clubs', rank: '2' },
      { suit: 'clubs', rank: '4' }
    ];

    // Play a card as West (1)
    await act(async () => {
      screen.getByTestId('play-card-button').click();
    });

    // Next turn should be North (2) - clockwise from West
    expect(screen.getByTestId('current-turn').textContent).toBe('2');

    // Update mock to simulate North (2) playing a card
    mockPlayCardResult.newTrickCards = [
      { suit: 'clubs', rank: '2' },
      { suit: 'clubs', rank: '4' },
      { suit: 'clubs', rank: '5' }
    ];

    // Play a card as North (2)
    await act(async () => {
      screen.getByTestId('play-card-button').click();
    });

    // Next turn should be East (3) - clockwise from North
    expect(screen.getByTestId('current-turn').textContent).toBe('3');

    // Update mock to simulate East (3) playing a card and completing the trick
    mockPlayCardResult.newTrickCards = [
      { suit: 'clubs', rank: '2' },
      { suit: 'clubs', rank: '4' },
      { suit: 'clubs', rank: '5' },
      { suit: 'clubs', rank: '6' }
    ];
    mockPlayCardResult.trickComplete = true;
    mockPlayCardResult.winnerIndex = 0; // South wins the trick

    // Make sure the mock function returns the updated result
    (gameEngine.playCard as any).mockReturnValue({
      ...mockPlayCardResult,
      trickComplete: true,
      winnerIndex: 0 // South wins the trick
    });

    // Play a card as East (3)
    await act(async () => {
      screen.getByTestId('play-card-button').click();
    });

    // Advance timers to trigger the setTimeout for clearing trick
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Winner of the trick (South) should be the next player
    expect(screen.getByTestId('current-turn').textContent).toBe('0');
  });
});
