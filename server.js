// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Game state
let players = {};
let gameDeck = []; // Implement your deck logic here
let currentTurn = null;

// Serve static files
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Add player to the game
  players[socket.id] = {
    id: socket.id,
    hand: [],
  };

  // Notify players of the updated game state
  io.emit('updatePlayers', players);

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });

  // Start game when enough players
  socket.on('startGame', () => {
    if (Object.keys(players).length >= 2) {
      startGame();
    } else {
      socket.emit('message', 'Need at least 2 players to start.');
    }
  });

  // Player action (e.g., playing a card)
  socket.on('playCard', (card) => {
    // Implement game logic to handle card play
    console.log(`Player ${socket.id} played:`, card);
    // Update game state and notify players
    io.emit('cardPlayed', { player: socket.id, card });
    // Handle turn logic and update currentTurn
  });
});

// Start the game with initial setup
function startGame() {
  console.log('Starting the game...');
  // Initialize deck, deal cards, set the first player, etc.
  io.emit('gameStarted', { players, deck: gameDeck });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});