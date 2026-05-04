const express = require('express');
const router = express.Router();

let todos = [
    { id: 1, task: 'Learn Express', completed: false }
];

// GET all to-do items
router.get('/', (req, res) => {
    res.json(todos);
});

// POST a new to-do item
router.post('/', (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PUT (Update) a to-do item by ID
router.put('/:id', (req, res) => {
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
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    todos = todos.filter(t => t.id !== id);
    res.send(`Todo with ID ${id} deleted.`);
});

module.exports = router;
const express = require('express');
const app = express();
const todoRouter = require('./routes/todos');

app.use(express.json()); // Essential for POST/PUT requests
app.use('/todos', todoRouter);

app.listen(3000, () => console.log('Todo API running on port 3000'));