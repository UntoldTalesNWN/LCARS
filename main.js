// main.js
const socket = io();

const startGameBtn = document.getElementById('startGameBtn');
const gameArea = document.getElementById('gameArea');

// Handle game start
startGameBtn.addEventListener('click', () => {
  socket.emit('startGame');
});

// Update players
socket.on('updatePlayers', (players) => {
  gameArea.innerHTML = '';
  for (const playerId in players) {
    const playerDiv = document.createElement('div');
    playerDiv.textContent = `Player: ${playerId}`;
    gameArea.appendChild(playerDiv);
  }
});

// Display a message
socket.on('message', (msg) => {
  alert(msg);
});

// Game start event
socket.on('gameStarted', (gameState) => {
  console.log('Game started!', gameState);
  // Render initial game state here
});

// Card played event
socket.on('cardPlayed', (data) => {
  console.log('Card played:', data);
  // Update the game UI based on the card played
});