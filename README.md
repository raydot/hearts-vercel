# Hearts Card Game

A web-based implementation of the classic Hearts card game, built with React, Socket.io, and Express.

![Hearts Game Screenshot](client/public/screenshot.png)

## Features

- Single-player mode against computer opponents
- Real-time gameplay with Socket.io
- Proper Hearts game rules implementation
- Responsive design that works on desktop and mobile devices
- Clean, intuitive user interface

## Project Structure

This project is organized into two main directories:

- `client/`: Frontend React application built with Vite
- `server/`: Backend Express server with Socket.io for real-time communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/raydot/hearts-vercel.git
   cd hearts-vercel
   ```

2. Install dependencies for both client and server:

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

### Running the Application

1. Start the server:

   ```bash
   cd server
   npm start
   ```

2. In a separate terminal, start the client:

   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the client terminal (typically http://localhost:5173)

## Deployment

This application is configured for deployment on Vercel:

1. The client can be deployed directly to Vercel
2. The server can be deployed as a serverless function

## Game Rules

Hearts is a trick-taking card game where the goal is to have the lowest score by avoiding hearts and the Queen of Spades:

- Each heart card is worth 1 point
- The Queen of Spades is worth 13 points
- The player with the lowest score at the end wins

## Security Features

- NextAuth.js for password protection
- Content Security Policy (CSP) headers via middleware
- Rate limiting for API routes
- OpenAI API usage monitoring

## License

This project is licensed under the Unlicense - see the LICENSE file in the client directory for details.

## Acknowledgments

- Card design inspired by traditional playing cards
- Game logic based on the classic Hearts card game rules

## The Problem Space

Hearts is a useful laboratory for exploring reasoning under uncertainty. Unlike perfect information games, you can only see your own cards and must infer opponent strategies from observed play. This creates interesting challenges:

- Incomplete information: 39 of 52 cards are hidden at game start
- Adversarial reasoning: Opponents actively try to deceive or exploit you
- Intermediate-term planning: Decisions affect outcomes several tricks ahead
- Measurable outcomes: Clear success metrics for evaluating different approaches

The goal isn't just to build a better card game AI, but to explore how AI agents can:

- Track what they know vs. don't know explicitly
- Identify what information would reduce uncertainty
- Make decisions that account for different failure modes

If the reasoning approach works for Hearts, it may transfer to other domains where similar challenges exist.
