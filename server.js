// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example socket.io setup (you can adjust this to match your game's logic)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example event listener for player actions (adjust as needed)
  socket.on('playerAction', (action) => {
    console.log('Player action received:', action);
    // Handle player action, update game state, etc.
    io.emit('updateGameState', { /* updated game state here */ });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
