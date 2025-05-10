import { createContext, useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import io from "socket.io-client"
import { checkGameEnd } from "@/cardOps/gameLogic"
import { getComputerMove } from "@/logicOps/computerPlayerLogic"

export const SocketContext = createContext()

// const socket = io("http://localhost:3000", {
//   transports: ["websocket"],
// })

// const socket = io("/", {
//   transports: ["websocket"],
// })
// Try a more explicit configuration
const socket = io(import.meta.env.DEV ? "http://localhost:3000" : "/", {
  transports: ["websocket"],
  path: "/socket.io"
})

console.log("Socket initialized", socket.connected)

const SocketProvider = ({ children }) => {
  const [playerHands, setPlayerHands] = useState([[], [], [], []])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const updatePlayerHands = useCallback((newHands) => {
    setPlayerHands(newHands)
    socket.emit("updateHands", newHands)
  }, [])

  const endTurn = useCallback(() => {
    console.log("Ending turn") // Debugging log
    console.log("Current turn:", currentTurn) // Debugging log
    const nextTurn = (currentTurn + 1) % playerHands.length

    console.log("Ending turn. Next turn:", nextTurn) // Debugging log
    socket.emit("endTurn", nextTurn)
    if (checkGameEnd(playerHands)) {
      setGameOver(true)
    }
  }, [currentTurn, playerHands])

  const handleComputerMove = useCallback(
    (playerIndex) => {
      console.log("handleComputerMove for player:", playerIndex) // Debugging log
      const card = getComputerMove(playerIndex, playerHands)
      if (card) {
        const newHands = playerHands.map((hand, index) => {
          if (index === playerIndex) {
            return hand.filter(
              (c) => c.suit !== card.suit || c.rank !== card.rank
            )
          }
          return hand
        })
        updatePlayerHands(newHands)
        console.log("Computer played: ", card)
        setTimeout(() => {
          endTurn()
        }, 500) // Add a slight delay to simulate thinking time
      }
    },
    [playerHands, updatePlayerHands, endTurn]
  )

  useEffect(() => {
    console.log("Setting up socket event listeners") // Debugging log

    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("dealCards", (newHands) => {
      console.log("Received new hands", newHands)
      setPlayerHands(newHands)
    })

    socket.on("nextTurn", (nextTurn) => {
      console.log("Next turn", nextTurn)
      setCurrentTurn(nextTurn)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    return () => {
      console.log("Cleaning up event listeners")
      socket.off("connect")
      socket.off("dealCards")
      socket.off("nextTurn")
      socket.off("disconnect")
    }
  }, [])

  useEffect(() => {
    console.log("useEffect for currentTurn called with:", currentTurn) // Debugging log
    if (currentTurn !== 0 && currentTurn !== 1) {
      // Assuming player 0 is the human player
      handleComputerMove(currentTurn)
    }
  }, [currentTurn, handleComputerMove])

  console.log("Providing context values:", {
    playerHands,
    currentTurn,
    endTurn,
    gameOver,
    updatePlayerHands,
  }) // Debugging log

  return (
    <SocketContext.Provider
      value={{ currentTurn, endTurn, playerHands, gameOver, updatePlayerHands }}
    >
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default SocketProvider
