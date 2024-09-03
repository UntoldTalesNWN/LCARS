import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

const cardImages = [
    { id: 1, src: '/images/cards/card1.png', name: 'Card 1' },
    { id: 2, src: '/images/cards/card2.png', name: 'Card 2' },
    { id: 3, src: '/images/cards/card3.png', name: 'Card 3' },
    { id: 4, src: '/images/cards/card4.png', name: 'Card 4' },
    { id: 5, src: '/images/cards/card5.png', name: 'Card 5' },
    { id: 6, src: '/images/cards/card6.png', name: 'Card 6' },
    { id: 7, src: '/images/cards/card7.png', name: 'Card 7' },
    // Add more cards as needed
];

function App() {
    const [roomId, setRoomId] = useState('');
    const [gameState, setGameState] = useState({});
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [hand, setHand] = useState([]);

    useEffect(() => {
        socket.on('roomCreated', (roomId) => {
            console.log(`Room ${roomId} created.`);
        });

        socket.on('playerJoined', (playerId) => {
            console.log(`Player ${playerId} joined the room.`);
        });

        socket.on('receiveMessage', (message) => {
            setChat((prev) => [...prev, message]);
        });

        socket.on('cardPlayed', (gameState) => {
            setGameState(gameState);
        });

        // Clean up on component unmount
        return () => {
            socket.off('roomCreated');
            socket.off('playerJoined');
            socket.off('receiveMessage');
            socket.off('cardPlayed');
        };
    }, []);

    const createRoom = () => {
        const newRoomId = Math.random().toString(36).substring(2, 7);
        setRoomId(newRoomId);
        socket.emit('createRoom', newRoomId);
    };

    const joinRoom = () => {
        if (roomId) socket.emit('joinRoom', roomId);
    };

    const sendMessage = () => {
        socket.emit('sendMessage', roomId, message);
        setMessage('');
    };

    const drawCard = () => {
        const newCard = {
            id: Math.random(),
            src: cardImages[Math.floor(Math.random() * cardImages.length)].src, // Random card from available images
            name: 'New Card',
            rotation: 0,
            faceDown: false,
            flipped: false
        };
        setHand([...hand, newCard]);
    };

    const playCard = (card, position) => {
        socket.emit('playCard', roomId, { ...card, position });
    };

    const rotateCard = (card, direction) => {
        setHand(hand.map(c => 
            c.id === card.id 
                ? { ...c, rotation: (c.rotation || 0) + (direction === 'clockwise' ? 90 : -90) } 
                : c
        ));
    };

    const flipCard = (card) => {
        setHand(hand.map(c => 
            c.id === card.id 
                ? { ...c, flipped: !c.flipped } 
                : c
        ));
    };

    return (
        <div className="App">
            <div className="lobby">
                <button onClick={createRoom}>Create Room</button>
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Room ID"
                />
                <button onClick={joinRoom}>Join Room</button>
            </div>

            <div className="chat">
                <div className="chat-messages">
                    {chat.map((msg, idx) => <div key={idx}>{msg}</div>)}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message"
                />
                <button onClick={sendMessage}>Send</button>
            </div>

            <div className="game-board">
                {Object.values(gameState).map((card) => (
                    <img
                        key={card.id}
                        src={card.flipped ? '/images/cards/back.png' : card.src}
                        alt="Card"
                        style={{
                            position: 'absolute',
                            top: card.position?.y || 0,
                            left: card.position?.x || 0,
                            transform: `rotate(${card.rotation || 0}deg)`,
                            visibility: card.faceDown ? 'hidden' : 'visible'
                        }}
                    />
                ))}
            </div>

            <div className="hand">
                <button onClick={drawCard}>Draw Card</button>
                {hand.map((card) => (
                    <div key={card.id}>
                        <img
                            src={card.flipped ? '/images/cards/back.png' : card.src}
                            alt={card.name}
                            style={{ transform: `rotate(${card.rotation || 0}deg)` }}
                            className="card-image"
                            onClick={() => flipCard(card)}
                        />
                        <button onClick={() => rotateCard(card, 'clockwise')}>Rotate Clockwise</button>
                        <button onClick={() => rotateCard(card, 'counterclockwise')}>Rotate Counter</button>
                        <button onClick={() => flipCard(card)}>{card.faceDown ? 'Face Up' : 'Face Down'}</button>
                        <button onClick={() => playCard(card, { x: 100, y: 100 })}>Play Card</button> {/* Example position */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
