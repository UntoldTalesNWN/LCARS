// public/main.js

// Connect to the server using Socket.io
const socket = io();

// Example: Listen for a connection event
socket.on('connect', () => {
  console.log('Connected to the server with ID:', socket.id);
});

// Example: Emit a player action (customize as per your game's logic)
function playerAction(action) {
  socket.emit('playerAction', action);
}

// Example: Listen for game state updates from the server
socket.on('updateGameState', (gameState) => {
  console.log('Game state updated:', gameState);
  // Update the UI or game state in the client as needed
});

// Example: Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
