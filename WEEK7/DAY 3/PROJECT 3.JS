const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your frontend files

let gameState = {
    players: {
        p1: { pos: { x: 0, y: 0 }, base: { x: 0, y: 0 } },
        p2: { pos: { x: 9, y: 9 }, base: { x: 9, y: 9 } }
    },
    obstacles: [{ x: 4, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 4 }],
    turn: 'p1',
    winner: null
};

// Movement logic
app.post('/api/move', (req, res) => {
    const { player, target } = req.body;
    const pData = gameState.players[player];

    if (gameState.winner) return res.status(400).json({ error: "Game over!" });
    if (player !== gameState.turn) return res.status(400).json({ error: "Not your turn" });

    // Validate: 1 step distance and within 10x10 grid
    const dx = Math.abs(pData.pos.x - target.x);
    const dy = Math.abs(pData.pos.y - target.y);
    const isAdjacent = (dx + dy) === 1;
    const isObstacle = gameState.obstacles.some(o => o.x === target.x && o.y === target.y);

    if (isAdjacent && !isObstacle && target.x >= 0 && target.x < 10 && target.y >= 0 && target.y < 10) {
        pData.pos = target;
        
        // Check win condition
        const opponent = player === 'p1' ? 'p2' : 'p1';
        if (target.x === gameState.players[opponent].base.x && target.y === gameState.players[opponent].base.y) {
            gameState.winner = player;
        }
        
        gameState.turn = opponent;
        res.json(gameState);
    } else {
        res.status(400).json({ error: "Invalid move" });
    }
});

app.get('/api/state', (req, res) => res.json(gameState));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));