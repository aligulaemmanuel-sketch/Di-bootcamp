const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'tasks.json');

async function readTasks() {
  const content = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(content || '[]');
}

async function writeTasks(tasks) {
  await fs.writeFile(dataPath, JSON.stringify(tasks, null, 2), 'utf8');
}

router.get('/', async (req, res) => {
  const tasks = await readTasks();
  res.json(tasks);
});

router.get('/:id', async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find((t) => t.id === parseInt(req.params.id, 10));

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

router.post('/', async (req, res) => {
  const tasks = await readTasks();
  const { title, completed = false } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string' });
  }

  const newTask = {
    id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
    title,
    completed,
  };

  tasks.push(newTask);
  await writeTasks(tasks);
  res.status(201).json(newTask);
});

router.put('/:id', async (req, res) => {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((t) => t.id === parseInt(req.params.id, 10));

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, completed } = req.body;
  if (title !== undefined) {
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be a string' });
    }
    tasks[taskIndex].title = title;
  }

  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }

  await writeTasks(tasks);
  res.json(tasks[taskIndex]);
});

router.delete('/:id', async (req, res) => {
  const tasks = await readTasks();
  const taskId = parseInt(req.params.id, 10);
  const filtered = tasks.filter((t) => t.id !== taskId);

  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await writeTasks(filtered);
  res.status(204).end();
});

module.exports = router;
