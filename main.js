// public/main.js

// Connect to the server using Socket.io
const socket = io();

// Create a grid game board
const gameBoard = document.getElementById('game-board');
const playerHand = document.createElement('div'); // Div to hold drawn cards (player's hand)
playerHand.id = 'player-hand';
document.body.appendChild(playerHand); // Append to the body after the grid

// Define card image paths (adjust names as needed)
const cardImages = [
  'card1.png', 'card2.png', 'card3.png', 'card4.png', 'card5.png',
  'card6.png', 'card7.png', 'card8.png', 'card9.png', 'card10.png',
  'card11.png', 'card12.png', 'card13.png', 'card14.png', 'card15.png',
  'card16.png', 'card17.png', 'card18.png', 'card19.png', 'card20.png'
];

// Handle cell click events for placing a card
function handleCellClick(index, cell) {
  if (selectedCard) {
    console.log(`Placing ${selectedCard} on cell ${index}`);
    cell.style.backgroundImage = `url('/cards/${selectedCard}')`; // Set background image
    cell.style.backgroundSize = 'cover'; // Ensure the image covers the cell
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
    cell.style.backgroundImage = `url('/cards/${card}')`;
    cell.style.backgroundSize = 'cover';
  }
});

// Create a card element for the player's hand
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card-in-hand');
  cardElement.style.backgroundImage = `url('/cards/${card}')`; // Set image
  cardElement.style.backgroundSize = 'cover'; // Ensure the image covers the element
  cardElement.addEventListener('click', () => selectCard(cardElement));
  return cardElement;
}

// Select a card from the player's hand
let selectedCard = null;

function selectCard(cardElement) {
  selectedCard = cardElement.style.backgroundImage.slice(5, -2); // Extract filename
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
drawButton.onclick = drawCard; // Attach event handler to button
document.body.insertBefore(drawButton, gameBoard); // Place button above the grid
