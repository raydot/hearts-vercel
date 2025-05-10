import { createContext, useCallback, useState, ReactNode } from "react"
import { checkGameEnd } from "@/cardOps/gameLogic"
import { getComputerMove } from "@/logicOps/computerPlayerLogic"
import { Card, GameStateContextType } from "@/types"
import * as gameEngine from "@/engine/gameEngine"

export const GameStateContext = createContext<GameStateContextType | undefined>(undefined)

interface GameStateProviderProps {
    children: ReactNode
}

const GameStateProvider = ({ children }: GameStateProviderProps) => {
    const [playerHands, setPlayerHands] = useState<Card[][]>([[], [], [], []])
    const [currentTurn, setCurrentTurn] = useState<number>(0)
    const [gameOver, setGameOver] = useState<boolean>(false)
    const [trickCards, setTrickCards] = useState<Card[]>([])
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
            setTricks(result.newTricks)
            setScores(result.scores)
            setTrickCards([])
            setLeadPlayer(result.winnerIndex)
            setCurrentTurn(result.winnerIndex)
            
            // Check if game is over
            if (checkGameEnd(result.newHands)) {
                setGameOver(true)
            }
        } else {
            // Move to next player
            setCurrentTurn((playerIndex + 1) % 4)
        }
    }, [playerHands, trickCards, tricks, heartsBroken, leadPlayer])

    // Handle computer moves
    const handleComputerTurn = useCallback(() => {
        if (currentTurn !== 0 && !gameOver) {
            // Simple delay to make it feel more natural
            setTimeout(() => {
                const computerCard = getComputerMove(currentTurn, playerHands)
                if (computerCard) {
                    playCard(computerCard, currentTurn)
                }
            }, 500)
        }
    }, [currentTurn, gameOver, playerHands, playCard])

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
                dealCards,
                playCard,
                handleComputerTurn
            }}
        >
            {children}
        </GameStateContext.Provider>
    )
}

export default GameStateProvider
