import { isValidMove } from "@/cardOps/gameLogic"

export const getComputerMove = (playerIndex, playerHands) => {
  console.log("getCOMPUTER MOVE")
  const computerHand = playerHands[playerIndex]
  for (let card of computerHand) {
    if (isValidMove(card, playerIndex, playerHands)) {
      return card
    }
  }
  return null
}
