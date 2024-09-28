import { createContext, useEffect, useState } from "react"
import PropTypes from "prop-types"
import io from "socket.io-client"

const SocketContext = createContext()

const socket = io("http://localhost:3000")

const SocketProvider = ({ children }) => {
  const [playerHands, setPlayerHands] = useState([], [], [], [])
  const [currentTurn, setCurrentTurn] = useState(0)

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("dealCards", (newHands) => {
      console.log("Received new hands", newHands)
      setPlayerHands(newHands)
    })

    socket.on("nextTurn", (nextTurn) => {
      setCurrentTurn(nextTurn)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    return () => {
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

  return (
    <SocketContext.Provider
      value={{ socket, playerHands, currentTurn, endTurn }}
    >
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export { SocketContext }
export default SocketProvider
