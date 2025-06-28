import { renderHook, act } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { useGameActions } from '../useGameActions';
import { Card } from '../../types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import * as gameEngine from '../../engine/gameEngine';
import { getComputerMove } from '../../logicOps/computerPlayerLogic';
import { getTrickWinner, calculateTrickPoints } from '../../cardOps/trickUtils';
import { currentTurnAtom, gamePhaseAtom, playerHandsAtom, isClearingTrickAtom, isProcessingTrickEndAtom } from '../../state/atoms';

// Mock dependencies
vi.mock('../../engine/gameEngine');
vi.mock('../../logicOps/computerPlayerLogic');
vi.mock('../../cardOps/trickUtils');

describe('useGameActions', () => {
  let store: ReturnType<typeof createStore>;

  // Reset mocks and create a new store before each test
  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock gameEngine functions
    vi.mocked(gameEngine.dealCards).mockReturnValue([
      [{ suit: 'clubs', rank: '2' }, { suit: 'hearts', rank: 'A' }],
      [{ suit: 'diamonds', rank: 'K' }, { suit: 'spades', rank: 'Q' }],
      [{ suit: 'clubs', rank: '5' }, { suit: 'hearts', rank: '7' }],
      [{ suit: 'diamonds', rank: '2' }, { suit: 'spades', rank: '3' }]
    ]);
    vi.mocked(gameEngine.findStartingPlayer).mockReturnValue(0); // Player with 2 of clubs

    // Mock logicOps functions
    vi.mocked(getComputerMove).mockReturnValue({ suit: 'diamonds', rank: 'K' });

    // Mock trickUtils functions
    vi.mocked(getTrickWinner).mockReturnValue(1); // Player 1 wins the trick
    vi.mocked(calculateTrickPoints).mockReturnValue(5);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to create a wrapper with the current store
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  describe('dealCards', () => {
    it('should deal cards and set up initial game state', () => {
      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      act(() => {
        result.current.dealCards();
      });

      expect(gameEngine.dealCards).toHaveBeenCalled();
      expect(gameEngine.findStartingPlayer).toHaveBeenCalled();
    });
  });

  describe('handleComputerTurn', () => {
    it('should handle computer turn correctly', () => {
      // Set initial state: it's a computer's turn during the PLAYING phase
      act(() => {
        store.set(currentTurnAtom, 1);
        store.set(gamePhaseAtom, 'PLAYING');
        store.set(playerHandsAtom, [
          [],
          [{ suit: 'diamonds', rank: 'K' }], // Computer's hand
          [],
          []
        ]);
      });

      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      act(() => {
        result.current.handleComputerTurn();
      });

      // Advance timers to execute the move logic within setTimeout
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(getComputerMove).toHaveBeenCalled();
    });

    it('should not make a move if game phase is not PLAYING', () => {
      // Set initial state: game phase is DEALING
      act(() => {
        store.set(currentTurnAtom, 1);
        store.set(gamePhaseAtom, 'DEALING');
      });

      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      act(() => {
        result.current.handleComputerTurn();
      });

      expect(getComputerMove).not.toHaveBeenCalled();
    });
  });

  describe('handleTrickCompletion', () => {
    const completedTrickCards: Card[] = [
      { suit: 'clubs', rank: '2' },
      { suit: 'clubs', rank: '5' },
      { suit: 'clubs', rank: '7' },
      { suit: 'clubs', rank: 'K' }
    ];
    const playerIndices = [0, 1, 2, 3];

    it('should handle trick completion correctly', () => {
      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      act(() => {
        result.current.handleTrickCompletion(completedTrickCards, playerIndices);
      });

      expect(getTrickWinner).toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1500);
      });
    });

    it('should prevent duplicate trick handling', () => {
      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      // Trigger trick completion the first time
      act(() => {
        result.current.handleTrickCompletion(completedTrickCards, playerIndices);
      });

      // Manually set the processing flags to simulate the state after the first call
      act(() => {
        store.set(isProcessingTrickEndAtom, true);
        store.set(isClearingTrickAtom, true);
      });

      // Attempt to trigger it again
      act(() => {
        result.current.handleTrickCompletion(completedTrickCards, playerIndices);
      });

      // Verify that getTrickWinner was only called once from the first call
      expect(getTrickWinner).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleNextRound', () => {
    it('should reset state and deal new cards for the next round', () => {
      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      act(() => {
        result.current.handleNextRound();
      });

      expect(gameEngine.dealCards).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(500);
      });
    });
  });

  describe('handleNewGame', () => {
    it('should reset all state and start a new game', () => {
      const { result } = renderHook(() => useGameActions(), { wrapper: createWrapper() });

      act(() => {
        result.current.handleNewGame();
      });

      expect(gameEngine.dealCards).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(500);
      });
    });
  });
});
