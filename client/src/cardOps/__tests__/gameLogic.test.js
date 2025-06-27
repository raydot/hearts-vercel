import { determineTrickWinner } from '../gameLogic';

// Assuming Card, Suit, Rank can be imported like this or adjust as per your project structure
// import { Card, Suit, Rank } from '@/types'; 
// If using Vitest, you might use vi.mock or ensure types are available globally/via setup

// Mock getCardValue or ensure it's imported if it's not in the same file and tested separately
// For simplicity, this example assumes getCardValue works correctly or is part of the same module.

// If Card, Suit, Rank are not enums but string literals, adjust the test data accordingly.
// Example: { suit: 'Spades', rank: 'A' } instead of { suit: Suit.Spades, rank: Rank.Ace }
// The snippet you showed used string literals, so I'll follow that pattern.

describe('determineTrickWinner', () => {
  // Helper to create card objects if needed, or define them directly
  const createCard = (suit, rank) => ({ suit, rank });

  it('should return -1 if trickCards length is not 4', () => {
    const trickCards = [createCard('Spades', 'A'), createCard('Spades', 'K')];
    expect(determineTrickWinner(trickCards, 0)).toBe(-1);
  });

  it('should correctly determine winner when leader plays highest card', () => {
    const leadPlayerIndex = 0; // South leads
    const trickCards = [
      createCard('Spades', 'A'), // South (Leader)
      createCard('Spades', '2'), // West
      createCard('Spades', '3'), // North
      createCard('Spades', '4')  // East
    ];
    expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(0); // South should win
  });

  it('should correctly determine winner when non-leader plays highest card of lead suit', () => {
    const leadPlayerIndex = 1; // West leads
    const trickCards = [
      createCard('Clubs', '2'), // West (Leader)
      createCard('Clubs', 'A'), // North (Plays Ace of Clubs)
      createCard('Clubs', '3'), // East
      createCard('Clubs', '4')  // South
    ];
    // North is player (1+1)%4 = 2. North played the 2nd card in trickCards (index 1).
    // Expected winner index: (leadPlayerIndex + highestCardIndexInTrickArray) % 4
    // (1 + 1) % 4 = 2
    expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(2); // North should win
  });

  it('should correctly identify North (player 2) as winner when North leads and plays highest card', () => {
    const leadPlayerIndex = 2; // North leads (current S=0, W=1, N=2, E=3)
    const trickCards = [
      createCard('Hearts', 'K'), // North (Leader, plays King of Hearts)
      createCard('Hearts', '2'), // East
      createCard('Hearts', '3'), // South
      createCard('Hearts', '4')  // West
    ];
    // North is player (2+0)%4 = 2. North played the 1st card (index 0).
    expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(2); // North (player 2) should win
  });

  it('should correctly identify winner when lead suit is Spades and Queen of Spades is not highest', () => {
    const leadPlayerIndex = 0; // South leads
    const trickCards = [
      createCard('Spades', 'K'), // South (Leader)
      createCard('Spades', 'Q'), // West (Queen of Spades)
      createCard('Spades', 'A'), // North (Ace of Spades - wins)
      createCard('Spades', '2')  // East
    ];
    // North played 3rd card (index 2). (0 + 2) % 4 = 2.
    expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(2); // North should win
  });

  it('should handle scenario where players play off-suit (and lead suit wins)', () => {
    const leadPlayerIndex = 3; // East leads
    const trickCards = [
      createCard('Diamonds', 'J'), // East (Leader)
      createCard('Spades', 'A'),   // South (Off-suit, Ace of Spades)
      createCard('Diamonds', 'K'), // West (Follows suit, King of Diamonds - wins)
      createCard('Hearts', 'Q')    // North (Off-suit, Queen of Hearts)
    ];
    // West played 3rd card (index 2). (3 + 2) % 4 = 1.
    expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(1); // West should win
  });

   it('DEBUG: North wins with Ace, but East (player 3) was reported as winner', () => {
    // This test models the reported bug scenario with S=0, W=1, N=2, E=3.
    // Let's assume North (player 2) leads the trick.
    const leadPlayerIndex = 2; // North leads.
    const trickCards = [
      // Cards are in order of play: N, E, S, W
      createCard('Spades', 'A'), // North's card (highest spade, should win)
      createCard('Spades', 'K'), // East's card
      createCard('Spades', 'Q'), // South's card
      createCard('Spades', 'J')  // West's card
    ];
    // Expected: North (player 2) wins because they led and played the Ace (index 0 in trickCards).
    // (leadPlayerIndex + highestRankIndexInTrick) % 4 = (2 + 0) % 4 = 2.
    const winner = determineTrickWinner(trickCards, leadPlayerIndex);
    console.log(`[DEBUG TEST] leadPlayerIndex: ${leadPlayerIndex}, trickCards: ${JSON.stringify(trickCards)}, calculated winner: ${winner}`);
    expect(winner).toBe(2); // North (player 2) should win.
  });

});
