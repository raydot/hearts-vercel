import { useContext } from "react"
import PlayerHand from "@/components/PlayerHand/PlayerHand"
import { SocketContext } from "@/context/SocketProvider"
import "./PlayingField.css"

const PlayingField = () => {
  const { currentTurn, endTurn } = useContext(SocketContext)

  return (
    <div className="playingField">
      <div className={`player top ${currentTurn === 1 ? "active" : ""}`}>
        Player 2
      </div>
      <div className={`player left ${currentTurn === 2 ? "active" : ""}`}>
        Player 3
      </div>
      <div className={`player right ${currentTurn === 3 ? "active" : ""}`}>
        Player 4
      </div>
      <PlayerHand />
      <button onClick={endTurn}>End Turn</button>
    </div>
  )
}

export default PlayingField
