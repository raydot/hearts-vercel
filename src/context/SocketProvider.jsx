import { createContext, useEffect, useState } from "react"
import PropTypes from "prop-types"
import io from "socket.io-client"

export const SocketContext = createContext()

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
})

console.log("Socket initialized", socket.connected)

const SocketProvider = ({ children }) => {
  const [playerHands, setPlayerHands] = useState([[], [], [], []])
  const [currentTurn, setCurrentTurn] = useState(0)

  useEffect(() => {
    console.log("useEffect called") // Debugging log

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

    // socket.on("pong", () => {
    //   console.log("Pong received from server")
    // })

    // Send a ping message every 5 seconds
    // const pingInterval = setInterval(() => {
    //   console.log("Sending ping to server")
    //   socket.emit("ping")
    // }, 5000)

    return () => {
      console.log("Cleaning up event listeners")
      // clearInterval(pingInterval)
      socket.off("connect")
      socket.off("dealCards")
      socket.off("nextTurn")
      socket.off("disconnect")
    }
  }, [])

  const endTurn = () => {
    const nextTurn = (currentTurn + 1) % playerHands.length
    socket.emit("endTurn", nextTurn)
  }

  console.log("Providing context values:", {
    playerHands,
    currentTurn,
    endTurn,
  }) // Debugging log

  return (
    <SocketContext.Provider value={{ currentTurn, endTurn, playerHands }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
