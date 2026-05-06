const express = require('express');
const postRoutes = require('./server/routes/postRoutes');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Main Routes
app.use('/posts', postRoutes);

// Error Handling for Invalid Routes
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

// Global Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "A server error occurred" });
});

app.listen(PORT, () => {
    console.log(`🚀 Blog API is running on http://localhost:${PORT}`);
});