// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { shuffleAndDeal } from "./src/cardOps/shuffleAndDeal.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// More routes can be added, example:
// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// }

io.on("connection", (socket) => {
  console.log("New client connected");

  // Deal cards to the client
  const hands = shuffleAndDeal();
  socket.emit("dealCards", hands);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
