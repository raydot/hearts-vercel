// server.js
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { shuffleAndDeal } from "./src/shuffleAndDeal.js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.development.local" })

console.log("environment variables", process.env)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
})

// More routes can be added, example, this root route:
app.get("/", (req, res) => {
  res.send("Server is running!!")
})

io.on("connection", (socket) => {
  console.log("New client connected")

  // Deal cards to the client
  const hands = shuffleAndDeal()
  socket.emit("dealCards", hands)

  // socket.on("ping", () => {
  //   console.log("Ping!")
  //   socket.emit("pong")
  // })

  // Handle endTurn event
  socket.on("endTurn", (nextTurn) => {
    console.log("Ending turn. Next turn:", nextTurn)
    io.emit("nextTurn", nextTurn)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

const PORT = process.env.VITE_PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
