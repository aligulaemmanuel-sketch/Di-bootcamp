const express = require('express');

const app = express();
const PORT = 3000;
app.use(express.json());

let todos = [
    { id: 1, task: 'Learn Express', completed: false }
];

// GET all to-do items
app.get('/todos', (req, res) => {
    res.json(todos);
});

// POST a new to-do item
app.post('/todos', (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PUT (Update) a to-do item by ID
app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.task = req.body.task ?? todo.task;
        todo.completed = req.body.completed ?? todo.completed;
        res.json(todo);
    } else {
        res.status(404).send('To-do not found');
    }
});

// DELETE a to-do item by ID
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    todos = todos.filter(t => t.id !== id);
    res.send(`Todo with ID ${id} deleted.`);
});

app.listen(PORT, () => console.log(`Todo API running on port ${PORT}`));