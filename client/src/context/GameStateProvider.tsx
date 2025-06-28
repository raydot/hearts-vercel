import { createContext, useCallback, useState, ReactNode } from "react"
import { checkGameEnd, isValidMove } from "@/cardOps/gameLogic"
import { getComputerMove } from "@/logicOps/computerPlayerLogic"
import { Card, GameStateContextType } from "@/types"
import * as gameEngine from "@/engine/gameEngine"
import ScoreScreen from "@/components/ScoreScreen/ScoreScreen"

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
    
    // New state for round management and score screen
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [showScoreScreen, setShowScoreScreen] = useState<boolean>(false);
    const [roundScores, setRoundScores] = useState<number[]>([0, 0, 0, 0]);
    const [totalScores, setTotalScores] = useState<number[]>([0, 0, 0, 0]);
    const [shootingPlayer, setShootingPlayer] = useState<number | null>(null);
    const playerNames = ['You', 'Computer 1', 'Computer 2', 'Computer 3'];

    // Deal cards function
    const dealCards = useCallback(() => {
        // Use game engine to create hands
        const newHands = gameEngine.dealCards()
        // console.log('GameStateProvider: dealCards - newHands[0] (Human):', JSON.stringify(newHands[0]));
        // console.log('GameStateProvider: dealCards - newHands[3] (Comp3):', JSON.stringify(newHands[3]));
        setPlayerHands(newHands)
        
        // Find player with 2 of clubs to start
        const startingPlayer = gameEngine.findStartingPlayer(newHands)
        
        // Reset game state for new round
        setCurrentTurn(startingPlayer)
        setLeadPlayer(startingPlayer)
        setGameOver(false)
        setTrickCards([])
        setTricks([[], [], [], []])
        setScores([0, 0, 0, 0]) // Reset round scores
        setHeartsBroken(false)
        setShowScoreScreen(false)
    }, [])

    // Play a card
    const playCard = useCallback((card: Card, playerIndex: number) => {
        // Prevent playing cards during trick processing
        if (isProcessingTrickEnd) {
            console.log('Prevented card play during trick processing');
            return;
        }

        // console.log(`[playCard] Player ${playerIndex} playing card:`, card);
        // console.log(`[playCard] Current trick player indices:`, trickPlayerIndices);
        // console.log(`[playCard] Current trick cards:`, trickCards);
        // console.log(`[playCard] Current lead player:`, leadPlayer);

        // Add the player index to the trick player indices
        const newTrickPlayerIndices = [...trickPlayerIndices, playerIndex];
        setTrickPlayerIndices(newTrickPlayerIndices);
        // console.log(`[playCard] Updated trick player indices:`, newTrickPlayerIndices);

        // Pass trickPlayerIndices to gameEngine.playCard
        const result = gameEngine.playCard(
            card,
            playerIndex,
            playerHands,
            trickCards,
            tricks,
            heartsBroken,

            newTrickPlayerIndices // Pass the updated trick player indices
        );
        // console.log(`[playCard] Game engine result:`, {
        //     trickComplete: result.trickComplete,
        //     winnerIndex: result.winnerIndex,
        //     newTrickCards: result.newTrickCards
        // });

        setPlayerHands(result.newHands);
        setTrickCards(result.newTrickCards);
        
        setHeartsBroken(result.newHeartsBroken)
        
        if (result.trickComplete) {
            setIsProcessingTrickEnd(true); // Set lock immediately
            // console.log('[playCard] Trick complete! Winner:', result.winnerIndex);
            // console.log('[playCard] Trick player indices at completion:', newTrickPlayerIndices);
            // console.log('[playCard] Trick cards at completion:', result.newTrickCards);
            
            setTimeout(() => {
                // console.log('[playCard] Starting trick clearing visual phase for winner:', result.winnerIndex)
                setIsClearingTrick(true);
                setTrickAnimationTargetPlayer(result.winnerIndex);

                setTimeout(() => {
                    // console.log('[playCard] Clearing trick data from state');
                    setIsClearingTrick(false);
                    setTrickAnimationTargetPlayer(null);
                    setTrickCards([]);
                    setTrickPlayerIndices([]);
                    
                    setTricks(result.newTricks);
                    setScores(result.scores);
                    
                    //console.log('[playCard] Setting next turn to winner:', result.winnerIndex);
                    setCurrentTurn(result.winnerIndex);
                    setLeadPlayer(result.winnerIndex);
                    
                    const handIsOver = result.newHands.every(hand => hand.length === 0);
                    
                    if (handIsOver) {
                        console.log('Round is over! Round scores:', result.scores);
                        
                        // Save round scores
                        setRoundScores(result.scores);
                        
                        // Check if someone shot the moon
                        if (result.shootingPlayer !== null) {
                            const playerNames = ['South (You)', 'West', 'North', 'East'];
                            console.log(`${playerNames[result.shootingPlayer]} shot the moon! Subtracting 26 points.`);
                            
                            // Set the shooting player for UI display
                            setShootingPlayer(result.shootingPlayer);
                            
                            // For now, we subtract 26 from the shooting player's total score
                            // In the future, this could be a player choice
                            const newTotalScores = [...totalScores];
                            newTotalScores[result.shootingPlayer] -= 26;
                            setTotalScores(newTotalScores);
                        } else {
                            // Reset shooting player
                            setShootingPlayer(null);
                            
                            // Normal scoring - add round scores to total scores
                            const newTotalScores = totalScores.map((score, idx) => score + result.scores[idx]);
                            setTotalScores(newTotalScores);
                        }
                        
                        // Get the latest total scores for game over check
                        const latestTotalScores = result.shootingPlayer !== null
                            ? (() => {
                                const scores = [...totalScores];
                                scores[result.shootingPlayer] -= 26;
                                return scores;
                              })()
                            : totalScores.map((score, idx) => score + result.scores[idx]);
                            
                        // Check if game is over (any player has 50+ points)
                        if (latestTotalScores.some((score: number) => score >= 50)) {
                            setGameOver(true);
                            console.log('Game over! Final scores after round:', latestTotalScores);
                        }
                        
                        // When the round is over, we need to be careful about when to show the score screen
                        // We want to make sure all players get to play their final cards
                        
                        // If this is the human player's last card, DON'T show score screen yet
                        // Let the computer players finish the trick first
                        if (playerIndex === 0) {
                            console.log('Human played final card - letting computers finish the trick');
                            // Don't set showScoreScreen here - let the computers play
                        } else {
                            // If a computer player played the last card, we can show the score screen
                            // But only after a delay to see the final trick completion
                            console.log('Computer played final card - showing score screen after delay');
                            setTimeout(() => setShowScoreScreen(true), 2000);
                        }
                    } else if (checkGameEnd(result.newHands)) {
                        // This is a safety check for any other game end condition
                        setGameOver(true);
                        console.log('Game over due to other conditions! Final scores:', result.scores);
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
                case 1: nextPlayer = 2; break; // West → North
                case 2: nextPlayer = 3; break; // North → East
                case 3: nextPlayer = 0; break; // East → South
                default: nextPlayer = 0;
            }
            // console.log(`Moving to next player: ${nextPlayer}`)
            setCurrentTurn(nextPlayer)
        }
    }, [playerHands, trickCards, tricks, heartsBroken, leadPlayer, dealCards, setPlayerHands, setTrickCards, setTrickPlayerIndices, setHeartsBroken, setIsProcessingTrickEnd, setIsClearingTrick, setTrickAnimationTargetPlayer, setTricks, setScores, setCurrentTurn, setLeadPlayer, setGameOver, isProcessingTrickEnd, trickPlayerIndices]);

    // Handle computer moves
    const handleComputerTurn = useCallback(() => {
        // Check if the round is over (all hands empty)
        const allHandsEmpty = playerHands.every(hand => hand.length === 0);
        
        // Check if we're in the final trick
        const isLastTrick = allHandsEmpty;
        
        // Check if we need to show the score screen after all computer players have played their final cards
        const finalTrickComplete = trickPlayerIndices.length === 4 && isLastTrick;
        
        console.log('Computer turn check:', { 
            currentTurn, 
            allHandsEmpty, 
            trickPlayerIndices: trickPlayerIndices.length,
            finalTrickComplete,
            showScoreScreen,
            isProcessingTrickEnd,
            isClearingTrick
        });
        
        if (finalTrickComplete && !showScoreScreen && !isProcessingTrickEnd && !isClearingTrick) {
            // If this is the final trick and all players have played, show the score screen
            // Add a longer delay to ensure the players can see the final trick completion
            console.log('Final trick complete! Showing score screen after delay...');
            setTimeout(() => setShowScoreScreen(true), 2000);
            return;
        }
        
        if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd) { 
                // console.log(`Computer ${currentTurn}'s turn to play - hand size: ${playerHands[currentTurn].length}`)
            setTimeout(() => {
                // Make sure we still have the right conditions when the timeout executes
                if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd) {
                    const computerCard = getComputerMove(currentTurn, playerHands, trickCards, heartsBroken, tricks)
                    // console.log(`Computer ${currentTurn} chose:`, computerCard)
                    if (computerCard) {
                        playCard(computerCard, currentTurn)
                    } else {
                        console.error(`Computer ${currentTurn} couldn't find any card to play - this should never happen!`)
                    }
                } else {
                    console.log('Conditions changed during timeout - skipping computer play')
                }
            }, 800) // Slightly longer delay to make computer moves more visible
        }
    }, [currentTurn, gameOver, playerHands, trickCards, heartsBroken, tricks, playCard, isClearingTrick, isProcessingTrickEnd]);

    // Function to check if a card is playable based on game rules
    const isCardPlayable = useCallback((card: Card): boolean => {
        if (currentTurn !== 0) return false; // Not player's turn
        if (isProcessingTrickEnd || isClearingTrick) return false; // Don't allow playing during animations
        return isValidMove(card, 0, playerHands, trickCards, heartsBroken, tricks);
    }, [currentTurn, playerHands, trickCards, heartsBroken, tricks, isProcessingTrickEnd, isClearingTrick]);
    
    // Handle next round
    const handleNextRound = useCallback(() => {
        setCurrentRound(prev => prev + 1);
        setShowScoreScreen(false);
        setShootingPlayer(null); // Reset shooting player for next round
        dealCards();
    }, [dealCards]);
    
    // Handle new game
    const handleNewGame = useCallback(() => {
        setCurrentRound(1);
        setTotalScores([0, 0, 0, 0]);
        setShowScoreScreen(false);
        setGameOver(false);
        dealCards();
    }, [dealCards]);

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
                currentRound,
                roundScores,
                totalScores,
                showScoreScreen,
                leadPlayer,
                dealCards,
                playCard,
                handleComputerTurn,
                isCardPlayable,
                handleNextRound,
                handleNewGame,
                shootingPlayer
            }}
        >
            {children}
            {showScoreScreen && (
                <ScoreScreen
                    isGameOver={gameOver}
                    roundScores={roundScores}
                    totalScores={totalScores}
                    playerNames={playerNames}
                    currentRound={currentRound}
                    shootingPlayer={shootingPlayer}
                    onNextRound={handleNextRound}
                    onNewGame={handleNewGame}
                />
            )}
        </GameStateContext.Provider>
    )
}

// Export both the context and provider
export { GameStateContext }
export default GameStateProvider
