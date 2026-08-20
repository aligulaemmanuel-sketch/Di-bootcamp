const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publishedYear: 1925 },
    { id: 2, title: '1984', author: 'George Orwell', publishedYear: 1949 }
];

// Read All
app.get('/api/books', (req, res) => {
    res.status(200).json(books);
});

// Read One
app.get('/api/books/:bookId', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.bookId));
    if (!book) {
        return res.status(404).send('Book not found');
    }
    res.status(200).json(book);
});

// Create
app.post('/api/books', (req, res) => {
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        author: req.body.author,
        publishedYear: req.body.publishedYear
    };
    books.push(newBook);
    res.status(201).json(newBook);
});

app.listen(PORT, () => {
    console.log(`Book API server is running on port ${PORT}`);
});