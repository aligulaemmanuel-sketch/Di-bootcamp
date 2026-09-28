const express = require('express');

const app = express();
const PORT = 3000;
app.use(express.json());

let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' }
];

// GET all books
app.get('/books', (req, res) => {
    res.json(books);
});

// POST a new book
app.post('/books', (req, res) => {
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        author: req.body.author
    };
    books.push(newBook);
    res.status(201).json(newBook);
});

// PUT (Update) a book by ID
app.put('/books/:id', (req, res) => {
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
app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    books = books.filter(b => b.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Book API is live at http://localhost:${PORT}/books`);
});