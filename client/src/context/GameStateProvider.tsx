import { createContext, useCallback, useState, ReactNode } from "react"
import { checkGameEnd, isValidMove } from "@/cardOps/gameLogic"
import { getComputerMove } from "@/logicOps/computerPlayerLogic"
import { Card, GameStateContextType } from "@/types"
import * as gameEngine from "@/engine/gameEngine"

// Create the context with a default undefined value
const GameStateContext = createContext<GameStateContextType | undefined>(undefined)

interface GameStateProviderProps {
    children: ReactNode
}

// Define the provider component
const GameStateProvider = ({ children }: GameStateProviderProps) => {
    const [playerHands, setPlayerHands] = useState<Card[][]>([[], [], [], []])
    const [currentTurn, setCurrentTurn] = useState<number>(0)
    const [gameOver, setGameOver] = useState<boolean>(false)
    const [trickCards, setTrickCards] = useState<Card[]>([])
    const [trickPlayerIndices, setTrickPlayerIndices] = useState<number[]>([])
    const [isClearingTrick, setIsClearingTrick] = useState<boolean>(false)
    const [trickAnimationTargetPlayer, setTrickAnimationTargetPlayer] = useState<number | null>(null)
    const [tricks, setTricks] = useState<Card[][][]>([[], [], [], []])
    const [scores, setScores] = useState<number[]>([0, 0, 0, 0])
    const [heartsBroken, setHeartsBroken] = useState<boolean>(false)
    const [leadPlayer, setLeadPlayer] = useState<number>(0)

    // Deal cards function
    const dealCards = useCallback(() => {
        // Use game engine to create hands
        const newHands = gameEngine.dealCards()
        setPlayerHands(newHands)
        
        // Find player with 2 of clubs to start
        const startingPlayer = gameEngine.findStartingPlayer(newHands)
        
        // Reset game state
        setCurrentTurn(startingPlayer)
        setLeadPlayer(startingPlayer)
        setGameOver(false)
        setTrickCards([])
        setTricks([[], [], [], []])
        setScores([0, 0, 0, 0])
        setHeartsBroken(false)
    }, [])

    // Play a card
    const playCard = useCallback((card: Card, playerIndex: number) => {
        console.log(`Player ${playerIndex} playing ${card.rank} of ${card.suit}`)
        
        // Use game engine to handle the card play
        const result = gameEngine.playCard(
            card,
            playerIndex,
            playerHands,
            trickCards,
            tricks,
            heartsBroken,
            leadPlayer
        )
        
        // Update state based on the result
        setPlayerHands(result.newHands)
        setTrickCards(result.newTrickCards)
        
        // Update the player indices for the trick cards
        // This tracks which player played each card in the trick
        // Append the current player's index to the array of player indices for the current trick.
        // This ensures that trickPlayerIndices always corresponds to trickCards.
        setTrickPlayerIndices(prev => [...prev, playerIndex]);
        
        setHeartsBroken(result.newHeartsBroken)
        
        if (result.trickComplete) {
            // Trick is complete
            console.log('Trick complete! Winner:', result.winnerIndex)
            
            // Update tricks and scores immediately (these don't directly affect card display before clearing)
            setTricks(result.newTricks)
            setScores(result.scores)
            
            // Store the current trick cards in a local variable before clearing
            // const completedTrick = [...result.newTrickCards] // Not strictly needed here anymore for this logic
            // console.log('Completed trick (before clearing):', completedTrick)
            
            // Check if hand is over (all players have played all their cards)
            const handIsOver = result.newHands.every(hand => hand.length === 0);
            
            // Delay setting isClearingTrick to allow the 4th card to render first
            setTimeout(() => {
                console.log('Starting trick clearing visual phase for winner:', result.winnerIndex)
                setTrickAnimationTargetPlayer(result.winnerIndex); // Set target for animation
                setIsClearingTrick(true); // Now, activate the clearing visual state

                // After the visual clearing phase (e.g., animation duration), clear data and set up next turn/hand.
                setTimeout(() => {
                    console.log('Clearing trick cards data now')
                    setTrickCards([]) // Reset the trick cards array
                    setTrickPlayerIndices([]) // Reset the player indices
                    setLeadPlayer(result.winnerIndex)
                    setCurrentTurn(result.winnerIndex)
                    setIsClearingTrick(false) // Mark that we're done clearing visually
                    setTrickAnimationTargetPlayer(null); // Reset animation target
                    
                    if (handIsOver) {
                        console.log('Hand is over! Final scores:', result.scores);
                        // Wait a bit longer before starting a new hand
                        setTimeout(() => {
                            // Deal new cards for the next hand
                            dealCards();
                        }, 2000); // Delay before new hand deal
                    }
                    
                    // Check if game is over (someone has reached 100 points)
                    // This check should probably happen after scores are updated and before a new hand is dealt if handIsOver is true
                    if (!handIsOver && (checkGameEnd(result.newHands) || result.scores.some(score => score >= 100))) {
                        setGameOver(true);
                        console.log('Game over! Final scores:', result.scores);
                    } else if (handIsOver && result.scores.some(score => score >= 100)){
                        // If hand is over and scores hit limit, it's game over.
                        setGameOver(true);
                        console.log('Game over! Final scores after hand:', result.scores);
                    }
                }, 1000); // Duration for the clearing animation / visual phase
            }, 500); // Short delay (e.g., 150ms) to show the 4th card before visual clearing starts
        } else {
            // Move to next player clockwise
            // Player positions: 0 = South (human), 1 = North, 2 = West, 3 = East
            // Clockwise order (north, east, south, west): 1 → 3 → 0 → 2 → 1
            let nextPlayer;
            switch(playerIndex) {
                case 0: nextPlayer = 2; break; // South → West
                case 1: nextPlayer = 3; break; // North → East
                case 2: nextPlayer = 1; break; // West → North
                case 3: nextPlayer = 0; break; // East → South
                default: nextPlayer = 0;
            }
            console.log(`Moving to next player: ${nextPlayer}`)
            setCurrentTurn(nextPlayer)
        }
    }, [playerHands, trickCards, tricks, heartsBroken, leadPlayer])

    // Handle computer moves
    const handleComputerTurn = useCallback(() => {
        if (currentTurn !== 0 && !gameOver) {
            console.log(`Computer ${currentTurn}'s turn to play`)
            // Simple delay to make it feel more natural
            setTimeout(() => {
                const computerCard = getComputerMove(currentTurn, playerHands, trickCards, heartsBroken, tricks)
                console.log(`Computer ${currentTurn} chose:`, computerCard)
                if (computerCard) {
                    playCard(computerCard, currentTurn)
                } else {
                    console.error(`Computer ${currentTurn} couldn't find any card to play - this should never happen!`)
                }
            }, 500)
        }
    }, [currentTurn, gameOver, playerHands, trickCards, heartsBroken, tricks, playCard])

    // Function to check if a card is playable based on game rules
    const isCardPlayable = useCallback((card: Card): boolean => {
        if (currentTurn !== 0) return false; // Not player's turn
        return isValidMove(card, 0, playerHands, trickCards, heartsBroken, tricks);
    }, [currentTurn, playerHands, trickCards, heartsBroken, tricks]);

    return (
        <GameStateContext.Provider
            value={{
                playerHands,
                currentTurn,
                gameOver,
                trickCards,
                trickPlayerIndices,
                tricks,
                scores,
                heartsBroken,
                isClearingTrick,
                trickAnimationTargetPlayer,
                dealCards,
                playCard,
                handleComputerTurn,
                isCardPlayable
            }}
        >
            {children}
        </GameStateContext.Provider>
    )
}

// Export both the context and provider
export { GameStateContext }
export default GameStateProvider
