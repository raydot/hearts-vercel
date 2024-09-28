// src/App.js
import SocketProvider from "@/context/SocketProvider"
import PlayingField from "./components/PlayingField/PlayingField"

function App() {
  return (
    <SocketProvider>
      <div className="App">
        <h2>Davey&apos;s Place</h2>
        <PlayingField />
      </div>
    </SocketProvider>
  )
}

export default App
