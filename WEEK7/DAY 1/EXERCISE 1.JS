const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Welcome to the Homepage!');
});

app.get('/about', (req, res) => {
    res.send('About Us: We are learning Express.js!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
