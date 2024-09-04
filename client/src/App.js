import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useDrag, useDrop } from 'react-dnd';
import './App.css';

localStorage.debug = '*'; // Enables debug logging for socket.io

const socket = io('https://lcars-j17k.onrender.com'); // Use your deployed server URL
const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://lcars-j17k.onrender.com'; // Corrected line 8
socket.current = io('https://lcars-j17k.onrender.com');

const cardImages = [
    { id: 1, src: `${BASE_URL}/images/cards/card1.png`, name: 'Card 1' },
    { id: 2, src: `${BASE_URL}/images/cards/card2.png`, name: 'Card 2' },
    { id: 3, src: `${BASE_URL}/images/cards/card3.png`, name: 'Card 3' },
    { id: 4, src: `${BASE_URL}/images/cards/card4.png`, name: 'Card 4' },
    { id: 5, src: `${BASE_URL}/images/cards/card5.png`, name: 'Card 5' },
    { id: 6, src: `${BASE_URL}/images/cards/card6.png`, name: 'Card 6' },
    { id: 7, src: `${BASE_URL}/images/cards/card7.png`, name: 'Card 7' },
];

const ItemTypes = {
    CARD: 'card',
};

const DraggableCard = ({ card, updateCardPosition }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'card',
        item: { id: card.id, card },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const offset = monitor.getSourceClientOffset();
            if (offset) {
                updateCardPosition(card.id, offset); // Update card position after drag ends
            }
        },
    }));

    return (
        <img
            ref={drag}
            src={card.flipped ? `${BASE_URL}/images/cards/back.png` : card.src}
            alt={card.name}
            style={{
                position: 'absolute',
                top: card.position?.y || 0,
                left: card.position?.x || 0,
                transform: `rotate(${card.rotation || 0}deg)`,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                zIndex: isDragging ? 1000 : 'auto',
            }}
            className="card-image"
        />
    );
};

function GameBoard({ gameState, updateCardPosition }) {
    const [, drop] = useDrop(() => ({
        accept: 'card',
        drop: (item, monitor) => {
            const offset = monitor.getSourceClientOffset();
            if (offset) {
                updateCardPosition(item.card.id, offset); // Update position when a card is dropped
            }
        },
    }));

    return (
        <div ref={drop} className="game-board" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {Object.values(gameState).map((card) => (
                <DraggableCard key={card.id} card={card} updateCardPosition={updateCardPosition} />
            ))}
        </div>
    );
}

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
        const randomCard = cardImages[Math.floor(Math.random() * cardImages.length)];
        setHand([...hand, randomCard]);
    };

    const handleCardDrop = (card, position) => {
        const newGameState = {
            ...gameState,
            [card.id]: {
                ...card,
                position: { x: position.x, y: position.y },
            },
        };
        setGameState(newGameState);
        socket.emit('playCard', roomId, card, position);
    };

    const updateCardPosition = (cardId, position) => {
        const newGameState = {
            ...gameState,
            [cardId]: {
                ...gameState[cardId],
                position: { x: position.x, y: position.y },
            },
        };
        setGameState(newGameState);
        socket.emit('playCard', roomId, newGameState[cardId], position);
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
                    {chat.map((msg, idx) => (
                        <div key={idx}>{msg}</div>
                    ))}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message"
                />
                <button onClick={sendMessage}>Send</button>
            </div>

            <GameBoard gameState={gameState} onDropCard={handleCardDrop} />

            <div className="hand">
                <button onClick={drawCard}>Draw Card</button>
                {hand.map((card) => (
                    <DraggableCard key={card.id} card={card} />
                ))}
            </div>
        </div>
    );
}

export default App;
