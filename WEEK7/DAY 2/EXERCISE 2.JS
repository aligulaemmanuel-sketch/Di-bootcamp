const express = require('express');
const bookRoutes = require('./server/routes/bookRoutes');
require('dotenv').config();

const app = express();
const PORT = 5000; // Requirement for Exercise 2

// Middleware
app.use(express.json());

// Routes with /api/books prefix
app.use('/api/books', bookRoutes);

// Error Handling
app.use((req, res) => {
    res.status(404).json({ message: "Book route not found" });
});

app.listen(PORT, () => {
    console.log(`📚 Book CRUD API is running on http://localhost:${PORT}`);
});