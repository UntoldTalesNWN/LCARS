// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serve frontend files

let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomId) => {
        rooms[roomId] = { players: [socket.id], gameState: {} };
        socket.join(roomId);
        io.to(roomId).emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < 2) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);
            io.to(roomId).emit('playerJoined', socket.id);
        } else {
            socket.emit('roomError', 'Room is full or does not exist.');
        }
    });

    socket.on('sendMessage', (roomId, message) => {
        io.to(roomId).emit('receiveMessage', message);
    });

    socket.on('playCard', (roomId, card, position) => {
        // Update the game state
        rooms[roomId].gameState[card.id] = { ...card, position };
        io.to(roomId).emit('cardPlayed', rooms[roomId].gameState);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Handle player disconnection
        // Cleanup rooms, notify other players, etc.
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
