import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerHand from './PlayerHand';
import { Card as CardType } from '@/types';

describe('PlayerHand Component', () => {
  const mockOnCardClick = vi.fn();
  
  beforeEach(() => {
    mockOnCardClick.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  test('renders all cards in the player\'s hand', () => {
    const cards: CardType[] = [
      { suit: 'hearts', rank: 'A' },
      { suit: 'clubs', rank: '2' },
      { suit: 'diamonds', rank: 'K' }
    ];
    
    render(<PlayerHand playerHand={cards} onCardClick={mockOnCardClick} />);
    
    // Should render 3 cards
    const cardElements = screen.getAllByRole('button');
    expect(cardElements).toHaveLength(3);
  });
  
  test('sorts cards by suit and rank', () => {
    const cards: CardType[] = [
      { suit: 'hearts', rank: 'A' },
      { suit: 'clubs', rank: '2' },
      { suit: 'diamonds', rank: 'K' },
      { suit: 'spades', rank: 'Q' }
    ];
    
    render(<PlayerHand playerHand={cards} onCardClick={mockOnCardClick} />);
    
    // Get all card elements
    const cardElements = screen.getAllByTestId('card');
    
    // Check order: clubs, diamonds, spades, hearts
    expect(cardElements[0]).toHaveTextContent('2');
    expect(cardElements[0]).toHaveTextContent('♣');
    
    expect(cardElements[1]).toHaveTextContent('K');
    expect(cardElements[1]).toHaveTextContent('♦');
    
    expect(cardElements[2]).toHaveTextContent('Q');
    expect(cardElements[2]).toHaveTextContent('♠');
    
    expect(cardElements[3]).toHaveTextContent('A');
    expect(cardElements[3]).toHaveTextContent('♥');
  });
  
  test('calls onCardClick with the correct card when clicked', async () => {
    const cards: CardType[] = [
      { suit: 'hearts', rank: 'A' },
      { suit: 'clubs', rank: '2' }
    ];
    
    render(<PlayerHand playerHand={cards} onCardClick={mockOnCardClick} />);
    
    const cardElements = screen.getAllByTestId('card');
    await userEvent.click(cardElements[0]);
    
    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
    expect(mockOnCardClick).toHaveBeenCalledWith(expect.objectContaining({
      suit: 'clubs',
      rank: '2'
    }));
  });
  
  test('applies fanned layout to cards', () => {
    const cards: CardType[] = [
      { suit: 'hearts', rank: 'A' },
      { suit: 'clubs', rank: '2' },
      { suit: 'diamonds', rank: 'K' }
    ];
    
    render(<PlayerHand playerHand={cards} onCardClick={mockOnCardClick} />);
    
    const container = screen.getByTestId('card-container');
    expect(container).toHaveClass('fanned-cards');
  });
  
  test('applies playable class to cards when they are playable', () => {
    const cards: CardType[] = [
      { suit: 'hearts', rank: 'A' },
      { suit: 'clubs', rank: '2' }
    ];
    
    // Mock implementation where only the 2 of clubs is playable
    const isPlayable = (card: CardType) => card.suit === 'clubs' && card.rank === '2';
    
    render(
      <PlayerHand 
        playerHand={cards} 
        onCardClick={mockOnCardClick} 
        isCardPlayable={isPlayable}
      />
    );
    
    // Find all card elements first
    const cardElements = screen.getAllByTestId('card');
    
    // Get the parent wrapper for each card
    const clubsCardParent = cardElements[0].parentElement;
    const heartsCardParent = cardElements[1].parentElement;
    
    // Check that the wrappers have the correct classes
    expect(clubsCardParent).toHaveClass('playable'); // 2 of clubs
    expect(heartsCardParent).toHaveClass('not-playable'); // Ace of hearts
  });
});
