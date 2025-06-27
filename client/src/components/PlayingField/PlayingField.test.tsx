import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PlayingField from './PlayingField';
import { Card as CardType } from '@/types';
import { GameStateContext } from '@/context/GameStateProvider';

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
  
  // Mock GameStateContext
  const mockGameStateContext = {
    playerHands: emptyHands,
    currentTurn: 0,
    gameOver: false,
    trickCards: [],
    trickPlayerIndices: [],
    tricks: [[], [], [], []],
    scores: [0, 0, 0, 0],
    heartsBroken: false,
    isClearingTrick: false,
    trickAnimationTargetPlayer: null,
    isProcessingTrickEnd: false,
    dealCards: vi.fn(),
    playCard: vi.fn(),
    handleComputerTurn: vi.fn(),
    isCardPlayable: vi.fn().mockReturnValue(true)
  };
  
  // Wrap component with context provider
  const renderWithContext = (ui: React.ReactElement, contextValue = mockGameStateContext) => {
    return render(
      <GameStateContext.Provider value={contextValue}>
        {ui}
      </GameStateContext.Provider>
    );
  };
  
  beforeEach(() => {
    mockOnCardClick.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  test('renders the playing field with green felt background', () => {
    renderWithContext(
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
    renderWithContext(
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
    renderWithContext(
      <PlayingField 
        playerHands={emptyHands} 
        currentTurn={2} // Computer 2's turn
        onCardClick={mockOnCardClick} 
      />
    );
    
    const topPlayer = screen.getByTestId('player-top'); // Computer 2 (North)
    const leftPlayer = screen.getByTestId('player-left'); // Computer 1 (West)
    const rightPlayer = screen.getByTestId('player-right'); // Computer 3 (East)
    const bottomPlayer = screen.getByTestId('player-bottom'); // Human (South)
    
    expect(topPlayer).toHaveClass('active'); // Computer 2's turn (currentTurn=2)
    expect(leftPlayer).not.toHaveClass('active');
    expect(rightPlayer).not.toHaveClass('active');
    expect(bottomPlayer).not.toHaveClass('active');
  });
  

  test('renders the player\'s hand with actual cards', () => {
    renderWithContext(
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
    // Create a context with trick cards
    const contextWithTrickCards = {
      ...mockGameStateContext,
      trickCards: [
        { suit: 'clubs', rank: '2' },
        { suit: 'clubs', rank: '5' }
      ],
      trickPlayerIndices: [0, 1]
    };
    
    renderWithContext(
      <PlayingField 
        playerHands={emptyHands} 
        currentTurn={0} 
        onCardClick={mockOnCardClick} 
      />,
      contextWithTrickCards
    );
    
    const centerArea = screen.getByTestId('center-play-area');
    expect(centerArea).toBeInTheDocument();
    expect(centerArea).toHaveClass('center-play-area');
    
    // Check that trick cards are displayed
    const trickCards = screen.getAllByTestId('trick-card');
    expect(trickCards).toHaveLength(2);
  });
});
