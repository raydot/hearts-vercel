import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PlayingField from './PlayingField';
import { Card as CardType } from '@/types';

describe('PlayingField Component', () => {
  // Mock empty hands for basic tests
  const emptyHands: CardType[][] = [[], [], [], []];
  
  // Mock populated hands for more complex tests
  const populatedHands: CardType[][] = [
    [{ suit: 'hearts', rank: 'A' }, { suit: 'clubs', rank: '2' }], // Player
    [{ suit: 'diamonds', rank: 'K' }, { suit: 'spades', rank: 'Q' }], // Computer 1
    [{ suit: 'hearts', rank: '10' }, { suit: 'clubs', rank: '7' }], // Computer 2
    [{ suit: 'diamonds', rank: '3' }, { suit: 'spades', rank: '5' }]  // Computer 3
  ];
  
  const mockOnCardClick = vi.fn();
  
  beforeEach(() => {
    mockOnCardClick.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  test('renders the playing field with green felt background', () => {
    render(
      <PlayingField 
        playerHands={emptyHands} 
        currentTurn={0} 
        onCardClick={mockOnCardClick} 
      />
    );
    
    const playingField = screen.getByTestId('playing-field');
    expect(playingField).toHaveClass('playingField');
    expect(playingField).toHaveClass('green-felt');
  });
  
  test('positions players correctly around the table', () => {
    render(
      <PlayingField 
        playerHands={emptyHands} 
        currentTurn={0} 
        onCardClick={mockOnCardClick} 
      />
    );
    
    const topPlayer = screen.getByTestId('player-top');
    const leftPlayer = screen.getByTestId('player-left');
    const rightPlayer = screen.getByTestId('player-right');
    const bottomPlayer = screen.getByTestId('player-bottom');
    
    expect(topPlayer).toBeInTheDocument();
    expect(leftPlayer).toBeInTheDocument();
    expect(rightPlayer).toBeInTheDocument();
    expect(bottomPlayer).toBeInTheDocument();
    
    // Check that they have the correct position classes
    expect(topPlayer).toHaveClass('top');
    expect(leftPlayer).toHaveClass('left');
    expect(rightPlayer).toHaveClass('right');
    // The bottom player has a different class name (human-player)
    expect(bottomPlayer).toHaveClass('human-player');
  });
  
  test('highlights the current player\'s turn', () => {
    render(
      <PlayingField 
        playerHands={emptyHands} 
        currentTurn={2} // Computer 2's turn
        onCardClick={mockOnCardClick} 
      />
    );
    
    const topPlayer = screen.getByTestId('player-top'); // Computer 1
    const leftPlayer = screen.getByTestId('player-left'); // Computer 2
    const rightPlayer = screen.getByTestId('player-right'); // Computer 3
    const bottomPlayer = screen.getByTestId('player-bottom'); // Human
    
    expect(topPlayer).not.toHaveClass('active');
    expect(leftPlayer).toHaveClass('active');
    expect(rightPlayer).not.toHaveClass('active');
    expect(bottomPlayer).not.toHaveClass('active');
  });
  

  test('renders the player\'s hand with actual cards', () => {
    render(
      <PlayingField 
        playerHands={populatedHands} 
        currentTurn={0} 
        onCardClick={mockOnCardClick} 
      />
    );
    
    // Check that PlayerHand component is rendered with cards
    const playerCards = screen.getAllByTestId('card');
    expect(playerCards).toHaveLength(2); // Player has 2 cards
    
    // Check that the cards are rendered with correct content
    expect(playerCards[0]).toHaveTextContent('2'); // 2 of clubs should be first (sorted)
    expect(playerCards[0]).toHaveTextContent('♣');
    expect(playerCards[1]).toHaveTextContent('A'); // Ace of hearts should be second
    expect(playerCards[1]).toHaveTextContent('♥');
  });
  
  test('renders a center play area for trick cards', () => {
    render(
      <PlayingField 
        playerHands={emptyHands} 
        currentTurn={0} 
        onCardClick={mockOnCardClick} 
        trickCards={[
          { suit: 'clubs', rank: '2' },
          { suit: 'clubs', rank: '5' }
        ]}
      />
    );
    
    const centerArea = screen.getByTestId('center-play-area');
    expect(centerArea).toBeInTheDocument();
    expect(centerArea).toHaveClass('center-play-area');
    
    // Check that trick cards are displayed
    const trickCards = screen.getAllByTestId('trick-card');
    expect(trickCards).toHaveLength(2);
  });
});
