const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Path to the JSON file
const FILE_PATH = path.join(__dirname, '../data/tasks.json');

// Helper function to read tasks
const readTasks = async () => {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is corrupted, return empty array
        return [];
    }
};

// Helper function to write tasks
const writeTasks = async (tasks) => {
    await fs.writeFile(FILE_PATH, JSON.stringify(tasks, null, 2));
};

// 1. GET /tasks - Retrieve all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error reading tasks data' });
    }
});

// 2. GET /tasks/:id - Retrieve a specific task
router.get('/:id', async (req, res) => {
    try {
        const tasks = await readTasks();
        const task = tasks.find(t => t.id === req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving task' });
    }
});

// 3. POST /tasks - Create a new task
router.post('/', async (req, res) => {
    try {
        const { title, description } = req.body;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required' });
        }

        const tasks = await readTasks();
        
        const newTask = {
            id: Date.now().toString(), // Simple unique ID generation
            title,
            description: description || '',
            completed: false,
            createdAt: new Date()
        };

        tasks.push(newTask);
        await writeTasks(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Error saving task' });
    }
});

// 4. PUT /tasks/:id - Update a task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        
        // Basic validation: ensure at least one field is being updated
        if (title === '' || description === '') {
             return res.status(400).json({ message: 'Fields cannot be empty strings' });
        }

        const tasks = await readTasks();
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update fields if they are provided in the request body
        const updatedTask = {
            ...tasks[taskIndex],
            title: title !== undefined ? title : tasks[taskIndex].title,
            description: description !== undefined ? description : tasks[taskIndex].description,
            completed: completed !== undefined ? completed : tasks[taskIndex].completed
        };

        tasks[taskIndex] = updatedTask;
        await writeTasks(tasks);

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// 5. DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const tasks = await readTasks();
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Remove the task from the array
        tasks.splice(taskIndex, 1);
        await writeTasks(tasks);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

module.exports = router;