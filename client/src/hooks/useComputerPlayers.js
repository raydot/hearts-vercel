import { useCallback, useContext, useEffect } from "react"
import { SocketContext } from "../context/SocketProvider"

const useComputerPlayers = (computerPlayerIndices) => {
  const { currentTurn, playerHands, socket } = useContext(SocketContext)
  // const socket = useContext(SocketContext.socket)

  console.log("Context value in useComputerPlayers", {
    currentTurn,
    playerHands,
  })

  const handleComputerTurn = useCallback(
    (playerIndex) => {
      socket.emit("computerTurn", playerIndex)
    },
    [socket]
  )

  useEffect(() => {
    console.log("Current turn in useEffect:", currentTurn)
    if (computerPlayerIndices.includes(currentTurn)) {
      handleComputerTurn(currentTurn)
    }
  }, [currentTurn, computerPlayerIndices, handleComputerTurn])
}

export default useComputerPlayers
