const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const emojis = [
    { emoji: '😀', name: 'Smile' },
    { emoji: '🐶', name: 'Dog' },
    { emoji: '🌮', name: 'Taco' },
    { emoji: '🚀', name: 'Rocket' },
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '🐘', name: 'Elephant' }
];

let gameState = {
    score: 0,
    currentEmoji: null,
    leaderboard: []
};

// Helper: Get random items from array
const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

// Route: Get a new question
app.get('/api/new-question', (req, res) => {
    const correct = emojis[Math.floor(Math.random() * emojis.length)];
    const distractors = getRandom(emojis.filter(e => e.name !== correct.name), 3);
    
    // Shuffle the options
    const options = [correct.name, ...distractors.map(d => d.name)].sort(() => 0.5 - Math.random());
    
    gameState.currentEmoji = correct; // Store correctly on server to verify later
    res.json({ emoji: correct.emoji, options });
});

// Route: Submit a guess
app.post('/api/guess', (req, res) => {
    const { guess } = req.body;
    const isCorrect = guess === gameState.currentEmoji.name;

    if (isCorrect) {
        gameState.score += 10;
    }

    res.json({
        correct: isCorrect,
        correctName: gameState.currentEmoji.name,
        currentScore: gameState.score
    });
});

// Route: Leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(gameState.leaderboard);
});

module.exports = app;

if (require.main === module) {
    app.listen(3000, () => console.log('Game running on http://localhost:3000'));
}