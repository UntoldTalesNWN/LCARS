// public/main.js

// Connect to the server using Socket.io
const socket = io();

// Log socket connection status
socket.on('connect', () => {
  console.log('Connected to the server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Create a grid game board
const gameBoard = document.getElementById('game-board');
const playerHand = document.createElement('div'); // Div to hold drawn cards (player's hand)
playerHand.id = 'player-hand';
document.body.appendChild(playerHand); // Append to the body after the grid

function createGrid(size) {
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    cell.dataset.index = i; // Store index or ID for reference

    // Add event listener for placing a card
    cell.addEventListener('click', () => handleCellClick(i, cell));

    gameBoard.appendChild(cell);
  }
}

// Handle cell click events for placing a card
function handleCellClick(index, cell) {
  if (selectedCard) {
    console.log(`Placing ${selectedCard} on cell ${index}`);
    cell.textContent = selectedCard; // Display the card on the grid cell
    socket.emit('placeCard', { card: selectedCard, index }); // Notify the server
    selectedCard = null; // Clear selected card after placing
    updateHandDisplay(); // Update the display of the player's hand
  }
}

// Function to draw a card
function drawCard() {
  console.log('Drawing a card...');
  socket.emit('drawCard');
}

// Listen for a drawn card from the server
socket.on('cardDrawn', (card) => {
  console.log('Card drawn:', card);
  playerHand.appendChild(createCardElement(card));
});

// Notify if the deck is empty
socket.on('deckEmpty', () => {
  alert('The deck is empty!');
});

// Listen for card placement from other players
socket.on('cardPlaced', ({ card, index }) => {
  console.log(`Card ${card} placed at index ${index}`);
  const cell = document.querySelector(`.grid-cell[data-index="${index}"]`);
  if (cell) {
    cell.textContent = card;
  }
});

// Create a card element for the player's hand
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.textContent = card;
  cardElement.addEventListener('click', () => selectCard(cardElement));
  return cardElement;
}

// Select a card from the player's hand
let selectedCard = null;

function selectCard(cardElement) {
  selectedCard = cardElement.textContent;
  console.log(`Selected card: ${selectedCard}`);
}

// Update display of player's hand
function updateHandDisplay() {
  playerHand.innerHTML = '';
}

// Create a 5x5 grid (adjust the size if needed)
createGrid(5);

// Button to draw a card
const drawButton = document.createElement('button');
drawButton.textContent = 'Draw Card';
drawButton.onclick = drawCard;
document.body.insertBefore(drawButton, gameBoard); // Place draw button above the grid
