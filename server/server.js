const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Set up Socket.io with CORS settings
const io = new Server(server, {
    cors: {
        origin: "https://lcars-dab8.onrender.com", // The URL of your frontend
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Socket.io event handling
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
