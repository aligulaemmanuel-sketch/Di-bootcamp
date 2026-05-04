const express = require('express');
const router = express.Router();

let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' }
];

// GET all books
router.get('/', (req, res) => {
    res.json(books);
});

// POST a new book
router.post('/', (req, res) => {
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        author: req.body.author
    };
    books.push(newBook);
    res.status(201).json(newBook);
});

// PUT (Update) a book by ID
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
        books[index] = { id, ...req.body };
        res.json(books[index]);
    } else {
        res.status(404).send('Book not found');
    }
});

// DELETE a book by ID
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    books = books.filter(b => b.id !== id);
    res.status(204).send();
});

module.exports = router;
const express = require('express');
const app = express();
const bookRouter = require('./routes/books');

app.use(express.json());
app.use('/books', bookRouter);

app.listen(3000, () => {
    console.log('Book API is live at http://localhost:3000/books');
});