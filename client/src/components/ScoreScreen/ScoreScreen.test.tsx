import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'jotai';
import ScoreScreen from '@/components/ScoreScreen/ScoreScreen';

// Mock the useGameActions hook
vi.mock('@/hooks/useGameActions', () => ({
  useGameActions: () => ({
    handleNextRound: vi.fn(),
    handleNewGame: vi.fn()
  })
}));

// Mock Jotai atoms
vi.mock('@/state/atoms', () => ({
  gameOverAtom: { init: false },
  roundScoresAtom: { init: [5, 8, 0, 13] },
  totalScoresAtom: { init: [15, 28, 10, 23] },
  currentRoundAtom: { init: 2 },
  shootingPlayerAtom: { init: null }
}));

describe('ScoreScreen Component', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider>
        {component}
      </Provider>
    );
  };
  
  it('renders score screen component', () => {
    renderWithProvider(<ScoreScreen />);
    
    // Basic test to ensure component renders without crashing
    // More specific tests would require proper atom mocking setup
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
