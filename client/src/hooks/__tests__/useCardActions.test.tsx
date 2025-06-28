import { renderHook, act } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { useCardActions } from '../useCardActions';
import { Card } from '../../types';
import {
  playerHandsAtom,
  currentTurnAtom,
  gamePhaseAtom,
  trickCardsAtom,
  isProcessingTrickEndAtom,
  isClearingTrickAtom,
  heartsBrokenAtom,
  gameOverAtom,
  leadPlayerAtom,
  tricksAtom,
  totalScoresAtom
} from '../../state/atoms';
import { isValidMove } from '../../cardOps/gameLogic';
import * as trickUtils from '../../cardOps/trickUtils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('../../cardOps/gameLogic');
vi.mock('../../cardOps/trickUtils');

describe('useCardActions', () => {
  let store: ReturnType<typeof createStore>;

  // Helper function to wrap component with Jotai Provider using the same store
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  // Reset mocks and create a new store before each test
  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock implementations
    vi.mocked(isValidMove).mockReturnValue(true);
    vi.spyOn(trickUtils, 'getTrickWinner').mockReturnValue(1); // Player 1 wins
    vi.spyOn(trickUtils, 'calculateTrickPoints').mockReturnValue(5);
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isCardPlayable', () => {
    it('should return true for valid moves during player turn', () => {
      // Set initial state in the store
      act(() => {
        store.set(currentTurnAtom, 0);
        store.set(gamePhaseAtom, 'PLAYING');
        store.set(gameOverAtom, false);
        store.set(isProcessingTrickEndAtom, false);
        store.set(isClearingTrickAtom, false);
      });
      
      const { result } = renderHook(() => useCardActions(), { wrapper });
      
      const card: Card = { suit: 'clubs', rank: '2' };
      
      // Test the hook method
      expect(result.current.isCardPlayable(card)).toBe(true);
      expect(isValidMove).toHaveBeenCalled();
    });
    
    it("should return false when it is not the player's turn", () => {
      act(() => {
        store.set(currentTurnAtom, 1); // Not player's turn
      });

      const { result } = renderHook(() => useCardActions(), { wrapper });
      
      const card: Card = { suit: 'clubs', rank: '2' };
      
      expect(result.current.isCardPlayable(card)).toBe(false);
      expect(isValidMove).not.toHaveBeenCalled();
    });
  });

  describe('handleCardClick', () => {
    it('should process a valid card play and update state', () => {
      const initialPlayerHands: Card[][] = [
        [{ suit: 'clubs', rank: '2' }, { suit: 'hearts', rank: 'A' }],
        [], [], []
      ];
      const cardToPlay: Card = { suit: 'clubs', rank: '2' };

      act(() => {
        store.set(playerHandsAtom, initialPlayerHands);
        store.set(currentTurnAtom, 0);
        store.set(gamePhaseAtom, 'PLAYING');
        store.set(trickCardsAtom, []);
        store.set(gameOverAtom, false);
        store.set(isProcessingTrickEndAtom, false);
        store.set(isClearingTrickAtom, false);
        store.set(heartsBrokenAtom, false);
      });
      
      const { result } = renderHook(() => useCardActions(), { wrapper });
      
      act(() => {
        result.current.handleCardClick(cardToPlay);
      });
      
      // handleCardClick calls isCardPlayable, which in turn calls isValidMove.
      // We verify that the underlying logic was triggered.
      expect(isValidMove).toHaveBeenCalled();

      // Assert state changes
      const updatedHands = store.get(playerHandsAtom);
      expect(updatedHands[0]).not.toContainEqual(cardToPlay);

      const updatedTrickCards = store.get(trickCardsAtom);
      expect(updatedTrickCards).toContainEqual(cardToPlay);

      const updatedTurn = store.get(currentTurnAtom);
      expect(updatedTurn).toBe(1);
    });
  });

  describe('handleTrickCompletion', () => {
    it('should process trick completion correctly', () => {
      act(() => {
        store.set(isProcessingTrickEndAtom, false);
        store.set(isClearingTrickAtom, false);
        store.set(totalScoresAtom, [0, 0, 0, 0]);
        store.set(tricksAtom, [[], [], [], []]);
        store.set(leadPlayerAtom, 0);
      });
      
      const { result } = renderHook(() => useCardActions(), { wrapper });

      const completedTrickCards: Card[] = [
        { suit: 'clubs', rank: '2' }, { suit: 'clubs', rank: '5' },
        { suit: 'clubs', rank: '7' }, { suit: 'clubs', rank: 'K' }
      ];
      const playerIndices = [0, 1, 2, 3];
      
      act(() => {
        result.current.handleTrickCompletion(completedTrickCards, playerIndices);
      });
      
      expect(trickUtils.getTrickWinner).toHaveBeenCalled();
      expect(trickUtils.calculateTrickPoints).toHaveBeenCalled();
      
      expect(store.get(isProcessingTrickEndAtom)).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(store.get(isClearingTrickAtom)).toBe(false);
      expect(store.get(isProcessingTrickEndAtom)).toBe(false);
    });
    
    it('should prevent duplicate trick handling', () => {
      act(() => {
        store.set(isProcessingTrickEndAtom, true);
        store.set(isClearingTrickAtom, true);
      });
      
      const { result } = renderHook(() => useCardActions(), { wrapper });
      
      const completedTrickCards: Card[] = [];
      const playerIndices: number[] = [];
      
      act(() => {
        result.current.handleTrickCompletion(completedTrickCards, playerIndices);
      });
      
      expect(trickUtils.getTrickWinner).not.toHaveBeenCalled();
      expect(trickUtils.calculateTrickPoints).not.toHaveBeenCalled();
    });
  });
});