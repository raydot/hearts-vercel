import { Provider } from 'jotai';
import { renderHook, act } from '@testing-library/react';
import { useAtom } from 'jotai';
import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  playerHandsAtom,
  trickCardsAtom,
  currentTurnAtom,
  heartsBrokenAtom,
  roundScoresAtom,
  totalScoresAtom,
  gameOverAtom,
  gamePhaseAtom,
  isProcessingTrickEndAtom,
  isClearingTrickAtom
} from '../atoms';
import { Card } from '../../types';

// Helper function to wrap component with Jotai Provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('Game State Atoms', () => {
  describe('playerHandsAtom', () => {
    it('should initialize with empty hands', () => {
      const { result } = renderHook(() => useAtom(playerHandsAtom), { wrapper });
      expect(result.current[0]).toEqual([[], [], [], []]);
    });

    it('should update player hands correctly', () => {
      const { result } = renderHook(() => useAtom(playerHandsAtom), { wrapper });
      
      const newHands: Card[][] = [
        [{ suit: 'clubs', rank: '2' }],
        [{ suit: 'diamonds', rank: 'K' }],
        [{ suit: 'clubs', rank: '5' }],
        [{ suit: 'diamonds', rank: '2' }]
      ];
      
      act(() => {
        result.current[1](newHands);
      });
      
      expect(result.current[0]).toEqual(newHands);
    });
  });

  describe('trickCardsAtom', () => {
    it('should initialize with empty trick cards', () => {
      const { result } = renderHook(() => useAtom(trickCardsAtom), { wrapper });
      expect(result.current[0]).toEqual([]);
    });

    it('should update trick cards correctly', () => {
      const { result } = renderHook(() => useAtom(trickCardsAtom), { wrapper });
      
      const newTrickCards: Card[] = [
        { suit: 'clubs', rank: '2' },
        { suit: 'diamonds', rank: 'K' }
      ];
      
      act(() => {
        result.current[1](newTrickCards);
      });
      
      expect(result.current[0]).toEqual(newTrickCards);
    });
  });

  describe('currentTurnAtom', () => {
    it('should initialize with player 0\'s turn', () => {
      const { result } = renderHook(() => useAtom(currentTurnAtom), { wrapper });
      expect(result.current[0]).toBe(0);
    });

    it('should update current turn correctly', () => {
      const { result } = renderHook(() => useAtom(currentTurnAtom), { wrapper });
      
      act(() => {
        result.current[1](2); // Set to player 2's turn
      });
      
      expect(result.current[0]).toBe(2);
    });
  });

  describe('heartsBrokenAtom', () => {
    it('should initialize with hearts not broken', () => {
      const { result } = renderHook(() => useAtom(heartsBrokenAtom), { wrapper });
      expect(result.current[0]).toBe(false);
    });

    it('should update hearts broken status correctly', () => {
      const { result } = renderHook(() => useAtom(heartsBrokenAtom), { wrapper });
      
      act(() => {
        result.current[1](true); // Set hearts broken to true
      });
      
      expect(result.current[0]).toBe(true);
    });
  });

  // Skip tricksWonAtom tests since it's not defined in the current atoms.ts file
  // We'll test other atoms instead

  describe('roundScoresAtom', () => {
    it('should initialize with zero scores', () => {
      const { result } = renderHook(() => useAtom(roundScoresAtom), { wrapper });
      expect(result.current[0]).toEqual([0, 0, 0, 0]);
    });

    it('should update round scores correctly', () => {
      const { result } = renderHook(() => useAtom(roundScoresAtom), { wrapper });
      
      const newScores = [0, 13, 5, 8];
      
      act(() => {
        result.current[1](newScores);
      });
      
      expect(result.current[0]).toEqual(newScores);
    });
  });

  describe('totalScoresAtom', () => {
    it('should initialize with zero scores', () => {
      const { result } = renderHook(() => useAtom(totalScoresAtom), { wrapper });
      expect(result.current[0]).toEqual([0, 0, 0, 0]);
    });

    it('should update total scores correctly', () => {
      const { result } = renderHook(() => useAtom(totalScoresAtom), { wrapper });
      
      const newScores = [10, 25, 15, 30];
      
      act(() => {
        result.current[1](newScores);
      });
      
      expect(result.current[0]).toEqual(newScores);
    });
  });

  describe('gameOverAtom', () => {
    it('should initialize with game not over', () => {
      const { result } = renderHook(() => useAtom(gameOverAtom), { wrapper });
      expect(result.current[0]).toBe(false);
    });

    it('should update game over status correctly', () => {
      const { result } = renderHook(() => useAtom(gameOverAtom), { wrapper });
      
      act(() => {
        result.current[1](true); // Set game over to true
      });
      
      expect(result.current[0]).toBe(true);
    });
  });

  describe('gamePhaseAtom', () => {
    it('should initialize with DEALING phase', () => {
      const { result } = renderHook(() => useAtom(gamePhaseAtom), { wrapper });
      expect(result.current[0]).toBe('DEALING');
    });

    it('should update game phase correctly', () => {
      const { result } = renderHook(() => useAtom(gamePhaseAtom), { wrapper });
      
      act(() => {
        result.current[1]('PLAYING'); // Set game phase to PLAYING
      });
      
      expect(result.current[0]).toBe('PLAYING');
      
      act(() => {
        result.current[1]('TRICK_COMPLETED'); // Set game phase to TRICK_COMPLETED
      });
      
      expect(result.current[0]).toBe('TRICK_COMPLETED');
    });
  });

  describe('isProcessingTrickEndAtom', () => {
    it('should initialize with processing trick end as false', () => {
      const { result } = renderHook(() => useAtom(isProcessingTrickEndAtom), { wrapper });
      expect(result.current[0]).toBe(false);
    });

    it('should update processing trick end status correctly', () => {
      const { result } = renderHook(() => useAtom(isProcessingTrickEndAtom), { wrapper });
      
      act(() => {
        result.current[1](true); // Set processing trick end to true
      });
      
      expect(result.current[0]).toBe(true);
    });
  });

  describe('isClearingTrickAtom', () => {
    it('should initialize with clearing trick as false', () => {
      const { result } = renderHook(() => useAtom(isClearingTrickAtom), { wrapper });
      expect(result.current[0]).toBe(false);
    });

    it('should update clearing trick status correctly', () => {
      const { result } = renderHook(() => useAtom(isClearingTrickAtom), { wrapper });
      
      act(() => {
        result.current[1](true); // Set clearing trick to true
      });
      
      expect(result.current[0]).toBe(true);
    });
  });
});
