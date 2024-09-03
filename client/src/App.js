import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useDrag, useDrop } from 'react-dnd';
import './App.css';

const socket = io('http://localhost:3000');
const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://lcars-dab8.onrender.com';

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

function DraggableCard({ card }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CARD,
        item: { id: card.id, src: card.src, name: card.name },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <img
            ref={drag}
            src={card.flipped ? `${BASE_URL}/images/cards/back.png` : card.src}
            alt={card.name}
            style={{
                transform: `rotate(${card.rotation || 0}deg)`,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
            }}
            className="card-image"
        />
    );
}

function GameBoard({ gameState, onDropCard }) {
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.CARD,
        drop: (item, monitor) => {
            const offset = monitor.getSourceClientOffset();
            if (offset) {
                onDropCard(item, offset);
            }
        },
    }));

    return (
        <div ref={drop} className="game-board">
            {Object.values(gameState).map((card) => (
                <img
                    key={card.id}
                    src={card.flipped ? `${BASE_URL}/images/cards/back.png` : card.src}
                    alt="Card"
                    style={{
                        position: 'absolute',
                        top: card.position?.y || 0,
                        left: card.position?.x || 0,
                        transform: `rotate(${card.rotation || 0}deg)`,
                        visibility: card.faceDown ? 'hidden' : 'visible',
                    }}
                />
            ))}
        </div>
    );
}

function Ap
