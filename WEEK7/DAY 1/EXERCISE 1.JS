const express = require('express');
const router = express.Router();

// Homepage route
router.get('/', (req, res) => {
    res.send('Welcome to the Homepage!');
});

// About Us route
router.get('/about', (req, res) => {
    res.send('About Us: We are learning Express.js!');
});

module.exports = router;
const express = require('express');
const app = express();
const mainRouter = require('./routes/index');

app.use('/', mainRouter);const express = require('express');
const app = express();
const bookRouter = require('./routes/books');

app.use(express.json());
app.use('/books', bookRouter);

app.listen(3000, () => {
    console.log('Book API is live at http://localhost:3000/books');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
