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

// Create a grid game board
const gameBoard = document.getElementById('game-board');

function createGrid(size) {
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    cell.dataset.index = i; // Optional: Store index or ID for reference

    // Add event listener for interaction
    cell.addEventListener('click', () => handleCellClick(i, cell));

    gameBoard.appendChild(cell);
  }
}

// Handle cell click events
function handleCellClick(index, cell) {
  console.log(`Cell ${index} clicked`);
  // Example: Toggle cell state or perform an action
  cell.style.backgroundColor = cell.style.backgroundColor === 'lightblue' ? '#fff' : 'lightblue';

  // Emit an action related to the grid, like placing a card
  socket.emit('cellClick', { index });
}

// Create a 5x5 grid (adjust the size if needed)
createGrid(5);
