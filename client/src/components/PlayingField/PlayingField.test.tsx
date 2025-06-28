import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PlayingField from './PlayingField';
import { Card as CardType } from '@/types';
import { Provider } from 'jotai';
import { playerHandsAtom, trickCardsAtom, trickPlayerIndicesAtom, isClearingTrickAtom, trickAnimationTargetPlayerAtom, roundScoresAtom, currentTurnAtom, gameOverAtom, heartsBrokenAtom, tricksAtom } from '@/state/atoms';
import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';

// Mock the useCardActions hook
vi.mock('@/hooks/useCardActions', () => ({
  useCardActions: () => ({
    handleCardClick: vi.fn(),
    isCardPlayable: () => true
  })
}));

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
  
  // Jotai test initializer component
  interface TestInitializerProps {
    playerHands?: CardType[][];
    currentTurn?: number;
    trickCards?: CardType[];
    trickPlayerIndices?: number[];
    isClearingTrick?: boolean;
    trickAnimationTargetPlayer?: number | null;
    scores?: number[];
    children: React.ReactNode;
  }
  
  // Component to initialize Jotai atoms with test values
  const TestInitializer: React.FC<TestInitializerProps> = ({ 
    playerHands = emptyHands,
    currentTurn = 0,
    trickCards = [],
    trickPlayerIndices = [],
    isClearingTrick = false,
    trickAnimationTargetPlayer = null,
    scores = [0, 0, 0, 0],
    children 
  }) => {
    // Initialize atoms with test values
    useHydrateAtoms([
      [playerHandsAtom, playerHands],
      [currentTurnAtom, currentTurn],
      [trickCardsAtom, trickCards],
      [trickPlayerIndicesAtom, trickPlayerIndices],
      [isClearingTrickAtom, isClearingTrick],
      [trickAnimationTargetPlayerAtom, trickAnimationTargetPlayer],
      [roundScoresAtom, scores],
      [gameOverAtom, false],
      [heartsBrokenAtom, false],
      [tricksAtom, [[], [], [], []]]
    ]);
    
    return <>{children}</>;
  };
  
  // Wrap component with Jotai provider
  const renderWithJotai = (ui: React.ReactElement, initialValues = {}) => {
    return render(
      <Provider>
        <TestInitializer {...initialValues}>
          {ui}
        </TestInitializer>
      </Provider>
    );
  };
  
  beforeEach(() => {
    mockOnCardClick.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  test('renders the playing field with green felt background', () => {
    renderWithJotai(
      <PlayingField />
    );
    
    const playingField = screen.getByTestId('playing-field');
    expect(playingField).toHaveClass('playingField');
    expect(playingField).toHaveClass('green-felt');
  });
  
  test('positions players correctly around the table', () => {
    renderWithJotai(
      <PlayingField />
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
    renderWithJotai(
      <PlayingField />,
      { currentTurn: 2 } // Computer 2's turn
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
    renderWithJotai(
      <PlayingField />,
      { playerHands: populatedHands }
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
    renderWithJotai(
      <PlayingField />,
      {
        trickCards: [
          { suit: 'clubs', rank: '2' },
          { suit: 'clubs', rank: '5' }
        ],
        trickPlayerIndices: [0, 1]
      }
    );
    
    const centerArea = screen.getByTestId('center-play-area');
    expect(centerArea).toBeInTheDocument();
    expect(centerArea).toHaveClass('center-play-area');
    
    // Check that trick cards are displayed
    const trickCards = screen.getAllByTestId('trick-card');
    expect(trickCards).toHaveLength(2);
  });
});
