// src/App.js
// import SocketProvider from "@/context/SocketProvider"
import PlayingField from "@/components/PlayingField/PlayingField"
import useComputerPlayers from "@/hooks/useComputerPlayers"

function App() {
  const computerPlayerIndices = [1, 2, 3]
  useComputerPlayers(computerPlayerIndices)

  return (
    <div className="App">
      <h2>Davey&apos;s Place</h2>
      <PlayingField />
    </div>
  )
}

export default App
