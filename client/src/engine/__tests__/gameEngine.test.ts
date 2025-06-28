import { describe, it, expect, vi } from 'vitest';
import {
  createDeck,
  dealCards,
  sortHand,
  findStartingPlayer,
  playCard,
  validateMove,
} from '../gameEngine';
import { Card, Suit, Rank } from '@/types';
import * as gameLogic from '@/cardOps/gameLogic';

describe('Game Engine', () => {
  describe('createDeck', () => {
    it('should create a deck of 52 cards', () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });

    it('should contain 13 cards of each suit', () => {
      const deck = createDeck();
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
      suits.forEach(suit => {
        const suitCards = deck.filter(card => card.suit === suit);
        expect(suitCards.length).toBe(13);
      });
    });

    it('should be shuffled', () => {
      const deck1 = createDeck();
      const deck2 = createDeck();
      // It's highly improbable that two shuffled decks are identical
      expect(deck1).not.toEqual(deck2);
    });
  });

  describe('dealCards', () => {
    it('should deal 13 cards to each of the 4 players', () => {
      const hands = dealCards();
      expect(hands.length).toBe(4);
      hands.forEach(hand => {
        expect(hand.length).toBe(13);
      });
    });

    it('should deal all 52 cards', () => {
      const hands = dealCards();
      const totalCards = hands.reduce((acc, hand) => acc + hand.length, 0);
      expect(totalCards).toBe(52);
    });

    it('should return sorted hands', () => {
        const hands = dealCards();
        hands.forEach(hand => {
            const sortedHand = [...hand].sort((a, b) => {
                const suitOrder: Record<Suit, number> = { 'clubs': 0, 'diamonds': 1, 'spades': 2, 'hearts': 3 };
                const rankOrder: Record<Rank, number> = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
                if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit];
                return rankOrder[a.rank] - rankOrder[b.rank];
            });
            expect(hand).toEqual(sortedHand);
        });
    });
  });

  describe('sortHand', () => {
    it('should sort cards by suit then rank', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'clubs', rank: '2' },
        { suit: 'spades', rank: 'Q' },
        { suit: 'diamonds', rank: '5' },
        { suit: 'clubs', rank: 'K' },
      ];
      const sorted = sortHand(hand);
      const expected: Card[] = [
        { suit: 'clubs', rank: '2' },
        { suit: 'clubs', rank: 'K' },
        { suit: 'diamonds', rank: '5' },
        { suit: 'spades', rank: 'Q' },
        { suit: 'hearts', rank: 'A' },
      ];
      expect(sorted).toEqual(expected);
    });
  });

  describe('findStartingPlayer', () => {
    it('should find the player with the 2 of clubs', () => {
      const hands: Card[][] = [
        [{ suit: 'hearts', rank: '3' }],
        [{ suit: 'clubs', rank: '2' }],
        [{ suit: 'diamonds', rank: 'K' }],
        [{ suit: 'spades', rank: 'A' }],
      ];
      const startingPlayer = findStartingPlayer(hands);
      expect(startingPlayer).toBe(1);
    });
  });

  describe('playCard', () => {
    const playerHands: Card[][] = [
      [{ suit: 'clubs', rank: '3' }, { suit: 'hearts', rank: 'Q' }],
      [{ suit: 'clubs', rank: '5' }],
      [{ suit: 'clubs', rank: '7' }],
      [{ suit: 'clubs', rank: 'K' }],
    ];
    const card: Card = { suit: 'clubs', rank: '3' };

    it('should update hands and trick cards correctly when trick is not complete', () => {
      const result = playCard(card, 0, playerHands, [], [[],[],[],[]], false, []);
      expect(result.newHands[0]).not.toContain(card);
      expect(result.newTrickCards).toEqual([card]);
      expect(result.trickComplete).toBe(false);
      expect(result.winnerIndex).toBe(-1);
    });

    it('should break hearts when a heart is played', () => {
        const heartCard: Card = { suit: 'hearts', rank: 'Q' };
        const result = playCard(heartCard, 0, playerHands, [], [[],[],[],[]], false, []);
        expect(result.newHeartsBroken).toBe(true);
    });

    it('should complete the trick and find the winner when 4 cards are played', () => {
      const trickCards: Card[] = [
        { suit: 'clubs', rank: '2' },
        { suit: 'clubs', rank: '5' },
        { suit: 'clubs', rank: '7' },
      ];
      const finalCard: Card = { suit: 'clubs', rank: 'K' };
      const hands: Card[][] = [[],[],[],[{ suit: 'clubs', rank: 'K' }]];
      const trickPlayerIndices = [0, 1, 2];
      
      vi.spyOn(gameLogic, 'calculateScore').mockReturnValue({ scores: [0, 5, 0, 0], shootingPlayer: null });

      const result = playCard(finalCard, 3, hands, trickCards, [[],[],[],[]], false, trickPlayerIndices);

      expect(result.trickComplete).toBe(true);
      expect(result.newTrickCards.length).toBe(4);
      expect(result.winnerIndex).toBe(3);
      expect(result.newTricks[3][0]).toEqual([...trickCards, finalCard]);
      expect(result.scores).toEqual([0, 5, 0, 0]);
    });
  });

  describe('validateMove', () => {
    it('should call isValidMove with the correct arguments', () => {
      const spy = vi.spyOn(gameLogic, 'isValidMove').mockReturnValue(true);
      const args = {
        card: { suit: 'clubs', rank: '2' } as Card,
        playerIndex: 0,
        playerHands: [[{ suit: 'clubs', rank: '2' }]] as Card[][],
        trickCards: [] as Card[],
        heartsBroken: false,
        tricks: [[], [], [], []] as Card[][][],
      };

      const result = validateMove(
        args.card,
        args.playerIndex,
        args.playerHands,
        args.trickCards,
        args.heartsBroken,
        args.tricks
      );

      expect(spy).toHaveBeenCalledWith(
        args.card,
        args.playerIndex,
        args.playerHands,
        args.trickCards,
        args.heartsBroken,
        args.tricks
      );
      expect(result).toBe(true);
      spy.mockRestore();
    });
  });
});
