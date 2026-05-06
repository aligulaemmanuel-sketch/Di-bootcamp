const express = require('express');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the task routes
app.use('/tasks', taskRoutes);

// Global Error Handler (Optional fallback)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
