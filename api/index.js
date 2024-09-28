// api/index.js
import { Server } from "socket.io";

function shuffleAndDeal() {
  const suits = ["hearts", "spades", "diamonds", "clubs"];
  const ranks = ["A", "K", "Q", "J"];
  let deck = [];

  // Create a deck of cards.
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  // Shuffle the deck
  for (let i = 0; i < deck.length; i++) {
    const j = (Math.floor(Math.random() * i + 1)[(deck[i], deck[j])] = [
      deck[j],
      deck[i],
    ]);
  }

  // Deal the cards to four players
  const hands = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }

  return hands;
}

export default (req, res) => {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.IO");

    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("New client connected");

      // Deal cards to the client
      const hands = shuffleAndDeal();
      socket.emit("dealCards", hands);

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket.IO already set up");
  }
  res.end();
};
