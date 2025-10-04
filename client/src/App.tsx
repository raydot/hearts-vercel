import React from "react"
import { Provider } from 'jotai'
import Game from "@/components/Game/Game"

const App: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col">
      <Provider>
        <Game />
      </Provider>
    </div>
  )
}

export default App
