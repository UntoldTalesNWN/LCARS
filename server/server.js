const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors'); // Import the CORS package

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Set up CORS
app.use(cors({
    origin: 'https://lcars-wtyx.onrender.com', // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomId) => {
        socket.join(roomId);
        io.to(roomId).emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size <= 2) {
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
        io.to(roomId).emit('cardPlayed', { [card.id]: { ...card, position } });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Catch-all handler to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
