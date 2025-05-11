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
    const [isClearingTrick, setIsClearingTrick] = useState<boolean>(false)
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
        setHeartsBroken(result.newHeartsBroken)
        
        if (result.trickComplete) {
            // Trick is complete
            console.log('Trick complete! Winner:', result.winnerIndex)
            
            // Mark that we're in the process of clearing a trick
            setIsClearingTrick(true)
            
            // Update tricks and scores immediately
            setTricks(result.newTricks)
            setScores(result.scores)
            
            // Store the current trick cards in a local variable before clearing
            const completedTrick = [...result.newTrickCards]
            console.log('Completed trick (before clearing):', completedTrick)
            
            // Check if hand is over (all players have played all their cards)
            const handIsOver = result.newHands.every(hand => hand.length === 0);
            
            // Delay clearing the trick cards
            setTimeout(() => {
                console.log('Clearing trick cards now')
                setTrickCards([]) // Reset the trick cards array
                setLeadPlayer(result.winnerIndex)
                setCurrentTurn(result.winnerIndex)
                setIsClearingTrick(false) // Mark that we're done clearing
                
                if (handIsOver) {
                    console.log('Hand is over! Final scores:', result.scores);
                    // Wait a bit longer before starting a new hand
                    setTimeout(() => {
                        // Deal new cards for the next hand
                        dealCards();
                    }, 2000);
                }
                
                // Check if game is over (someone has reached 100 points)
                if (checkGameEnd(result.newHands) || result.scores.some(score => score >= 100)) {
                    setGameOver(true);
                    console.log('Game over! Final scores:', result.scores);
                }
            }, 1000) // 1 second delay
        } else {
            // Move to next player clockwise
            // Player positions: 0 = South (human), 1 = North, 2 = West, 3 = East
            // Clockwise order: 0 → 2 → 1 → 3 → 0
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
                tricks,
                scores,
                heartsBroken,
                isClearingTrick,
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
