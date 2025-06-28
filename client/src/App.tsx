import React from "react"
import { Provider } from 'jotai'
import Game from "@/components/Game/Game"
import "./App.css"

const App: React.FC = () => {
  return (
    <div className="App">
      <Provider>
        <Game />
      </Provider>
    </div>
  )
}

export default App
