import React from "react"
import GameStateProvider from "@/context/GameStateProvider"
import Game from "@/components/Game/Game"
import "./App.css"

const App: React.FC = () => {
  return (
    <div className="App">
      <GameStateProvider>
        <Game />
      </GameStateProvider>
    </div>
  )
}

export default App
