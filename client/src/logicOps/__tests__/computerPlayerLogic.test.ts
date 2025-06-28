import { describe, it, expect } from 'vitest';
import { getComputerMove } from '../computerPlayerLogic';
import { Card } from '@/types';

describe('getComputerMove', () => {
  const playerIndex = 1;

  it('should return null if the player has no cards', () => {
    const playerHands: Card[][] = [[], [], [], []];
    const move = getComputerMove(playerIndex, playerHands);
    expect(move).toBeNull();
  });

  it('should play the 2 of clubs if leading the very first trick', () => {
    const playerHands: Card[][] = [
      [],
      [{ suit: 'hearts', rank: 'A' }, { suit: 'clubs', rank: '2' }],
      [],
      []
    ];
    const move = getComputerMove(playerIndex, playerHands, [], false, [[], [], [], []]);
    expect(move).toEqual({ suit: 'clubs', rank: '2' });
  });

  it('should follow suit if possible', () => {
    const playerHands: Card[][] = [
      [],
      [{ suit: 'hearts', rank: 'A' }, { suit: 'diamonds', rank: '5' }],
      [],
      []
    ];
    const trickCards: Card[] = [{ suit: 'diamonds', rank: '3' }];
    const move = getComputerMove(playerIndex, playerHands, trickCards);
    expect(move).toEqual({ suit: 'diamonds', rank: '5' });
  });

  it('should not lead with a heart if hearts are not broken', () => {
    const playerHands: Card[][] = [
      [],
      [{ suit: 'hearts', rank: 'A' }, { suit: 'clubs', rank: '10' }],
      [],
      []
    ];
    const move = getComputerMove(playerIndex, playerHands, [], false);
    expect(move).toEqual({ suit: 'clubs', rank: '10' });
  });

  it('should be able to lead with a heart if hearts are broken', () => {
    const playerHands: Card[][] = [
      [],
      [{ suit: 'hearts', rank: 'A' }, { suit: 'clubs', rank: '10' }],
      [],
      []
    ];
    const move = getComputerMove(playerIndex, playerHands, [], true);
    // The first card is a heart, so it should be played
    expect(move).toEqual({ suit: 'hearts', rank: 'A' });
  });

  it('should play any card if it cannot follow suit', () => {
    const playerHands: Card[][] = [
      [],
      [{ suit: 'spades', rank: 'Q' }],
      [],
      []
    ];
    const trickCards: Card[] = [{ suit: 'diamonds', rank: '3' }];
    const move = getComputerMove(playerIndex, playerHands, trickCards);
    expect(move).toEqual({ suit: 'spades', rank: 'Q' });
  });

  it('should play the first available card as a last resort', () => {
    const playerHands: Card[][] = [
      [],
      [{ suit: 'spades', rank: 'Q' }, { suit: 'hearts', rank: 'K' }],
      [],
      []
    ];
    const move = getComputerMove(playerIndex, playerHands, [], true);
    expect(move).toEqual({ suit: 'spades', rank: 'Q' });
  });
});
