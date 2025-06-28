// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

export interface Card {
    suit: Suit
    rank: Rank
}

// Game state types
export interface GameState {
    playerHands: Card[][]
    currentTurn: number
    gameOver: boolean
    trickCards: Card[]
    tricks: Card[][][]
    scores: number[]
    heartsBroken: boolean
}

// Context types
export interface GameStateContextType {
    playerHands: Card[][]
    currentTurn: number
    gameOver: boolean
    trickCards: Card[]
    trickPlayerIndices: number[]
    tricks: Card[][][]
    scores: number[]
    heartsBroken: boolean
    isClearingTrick: boolean
    trickAnimationTargetPlayer: number | null
    isProcessingTrickEnd: boolean
    currentRound: number
    roundScores: number[]
    totalScores: number[]
    showScoreScreen: boolean
    leadPlayer: number
    shootingPlayer: number | null
    gamePhase: 'DEALING' | 'PLAYING' | 'TRICK_COMPLETED' | 'ROUND_ENDED' | 'SCORE_SCREEN' | 'GAME_OVER'
    setGamePhase: (phase: 'DEALING' | 'PLAYING' | 'TRICK_COMPLETED' | 'ROUND_ENDED' | 'SCORE_SCREEN' | 'GAME_OVER') => void
    dealCards: () => void
    playCard: (card: Card, playerIndex: number) => void
    handleComputerTurn: () => void
    isCardPlayable: (card: Card) => boolean
    handleNextRound: () => void
    handleNewGame: () => void
}
