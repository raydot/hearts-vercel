import React from "react"
import "./Player.css"

interface PlayerProps {
  name: string
  isComputer: boolean
  position: "top" | "left" | "right" | "bottom"
}

const Player: React.FC<PlayerProps> = ({ name, isComputer, position }) => {
  return (
    <div className={`player-info ${position}`}>
      <div className="player-marker" />
      <div className="player-name-block">
        <div className="player-name">{name}</div>
        {isComputer && <div className="player-type">(Computer)</div>}
      </div>
    </div>
  )
}

export default Player
