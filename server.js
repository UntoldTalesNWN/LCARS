// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Sample deck of cards (simple numbered cards for demonstration)
let cardDeck = Array.from({ length: 20 }, (_, i) => `Card ${i + 1}`);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle drawing a card
  socket.on('drawCard', () => {
    if (cardDeck.length > 0) {
      const drawnCard = cardDeck.pop(); // Draw the top card from the deck
      socket.emit('cardDrawn', drawnCard); // Send the drawn card to the client
    } else {
      socket.emit('deckEmpty'); // Notify if the deck is empty
    }
  });

  // Handle placing a card on the grid
  socket.on('placeCard', ({ card, index }) => {
    // Broadcast the placed card and position to all clients
    io.emit('cardPlaced', { card, index });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
