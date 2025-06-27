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
    const [isProcessingTrickEnd, setIsProcessingTrickEnd] = useState<boolean>(false);

    // Deal cards function
    const dealCards = useCallback(() => {
        // Use game engine to create hands
        const newHands = gameEngine.dealCards()
        console.log('GameStateProvider: dealCards - newHands[0] (Human):', JSON.stringify(newHands[0]));
        console.log('GameStateProvider: dealCards - newHands[3] (Comp3):', JSON.stringify(newHands[3]));
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
        // Prevent playing cards during trick processing
        if (isProcessingTrickEnd) {
            console.log('Prevented card play during trick processing');
            return;
        }

        console.log(`[playCard] Player ${playerIndex} playing card:`, card);
        console.log(`[playCard] Current trick player indices:`, trickPlayerIndices);
        console.log(`[playCard] Current trick cards:`, trickCards);
        console.log(`[playCard] Current lead player:`, leadPlayer);

        // Add the player index to the trick player indices
        const newTrickPlayerIndices = [...trickPlayerIndices, playerIndex];
        setTrickPlayerIndices(newTrickPlayerIndices);
        console.log(`[playCard] Updated trick player indices:`, newTrickPlayerIndices);

        // Pass trickPlayerIndices to gameEngine.playCard
        const result = gameEngine.playCard(
            card,
            playerIndex,
            playerHands,
            trickCards,
            tricks,
            heartsBroken,
            leadPlayer,
            newTrickPlayerIndices // Pass the updated trick player indices
        );
        console.log(`[playCard] Game engine result:`, {
            trickComplete: result.trickComplete,
            winnerIndex: result.winnerIndex,
            newTrickCards: result.newTrickCards
        });

        setPlayerHands(result.newHands);
        setTrickCards(result.newTrickCards);
        
        setHeartsBroken(result.newHeartsBroken)
        
        if (result.trickComplete) {
            setIsProcessingTrickEnd(true); // Set lock immediately
            console.log('[playCard] Trick complete! Winner:', result.winnerIndex);
            console.log('[playCard] Trick player indices at completion:', newTrickPlayerIndices);
            console.log('[playCard] Trick cards at completion:', result.newTrickCards);
            
            setTimeout(() => {
                console.log('[playCard] Starting trick clearing visual phase for winner:', result.winnerIndex)
                setIsClearingTrick(true);
                setTrickAnimationTargetPlayer(result.winnerIndex);

                setTimeout(() => {
                    console.log('[playCard] Clearing trick data from state');
                    setIsClearingTrick(false);
                    setTrickAnimationTargetPlayer(null);
                    setTrickCards([]);
                    setTrickPlayerIndices([]);
                    
                    setTricks(result.newTricks);
                    setScores(result.scores);
                    
                    console.log('[playCard] Setting next turn to winner:', result.winnerIndex);
                    setCurrentTurn(result.winnerIndex);
                    setLeadPlayer(result.winnerIndex);
                    
                    const handIsOver = result.newHands.every(hand => hand.length === 0);
                    
                    if (handIsOver) {
                        console.log('Hand is over! Final scores:', result.scores);
                        if (result.scores.some(score => score >= 100)) {
                            setGameOver(true);
                            console.log('Game over! Final scores after hand:', result.scores);
                        } else {
                            // Wait a bit longer before starting a new hand
                            setTimeout(() => {
                                dealCards();
                            }, 2000); // Delay before new hand deal
                        }
                    } else if (checkGameEnd(result.newHands) || result.scores.some(score => score >= 100)) {
                        setGameOver(true);
                        console.log('Game over! Final scores:', result.scores);
                    }
                    
                    setIsProcessingTrickEnd(false); // Clear lock at the very end
                }, 1000); // Duration for the clearing animation / visual phase
            }, 500); // Short delay to show the 4th card
        } else {
            // Move to next player clockwise
            // Player positions: 0 = South (human), 1 = West, 2 = North, 3 = East
            // Clockwise order: 0 → 1 → 2 → 3 → 0 
            let nextPlayer;
            switch(playerIndex) {
                case 0: nextPlayer = 1; break; // South → West
                case 1: nextPlayer = 2; break; // North → East
                case 2: nextPlayer = 3; break; // West → North
                case 3: nextPlayer = 0; break; // East → South
                default: nextPlayer = 0;
            }
            console.log(`Moving to next player: ${nextPlayer}`)
            setCurrentTurn(nextPlayer)
        }
    }, [playerHands, trickCards, tricks, heartsBroken, leadPlayer, dealCards, setPlayerHands, setTrickCards, setTrickPlayerIndices, setHeartsBroken, setIsProcessingTrickEnd, setIsClearingTrick, setTrickAnimationTargetPlayer, setTricks, setScores, setCurrentTurn, setLeadPlayer, setGameOver, isProcessingTrickEnd, trickPlayerIndices]);

    // Handle computer moves
    const handleComputerTurn = useCallback(() => {
        if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd) { 
            console.log(`Computer ${currentTurn}'s turn to play`)
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
    }, [currentTurn, gameOver, playerHands, trickCards, heartsBroken, tricks, playCard, isClearingTrick, isProcessingTrickEnd]);

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
                isProcessingTrickEnd, 
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
