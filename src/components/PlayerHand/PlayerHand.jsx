import { useContext } from "react"
import { SocketContext } from "@/context/SocketProvider"
import Card from "../Card/Card"
import { handSorter } from "../../cardOps/handSorter"
import "./PlayerHand.css"
import "@/components/Card/Card.css"

// console.log("SC:", SocketContext)

const PlayerHand = () => {
  const { playerHands } = useContext(SocketContext)
  const playerHand = playerHands[0] || []

  const sortedPlayerHand = [...playerHand].sort(handSorter)

  return (
    <div className="card-container">
      {sortedPlayerHand.map((card, index) => (
        <Card key={index} suit={card.suit} rank={card.rank} />
      ))}
    </div>
  )
}

export default PlayerHand
