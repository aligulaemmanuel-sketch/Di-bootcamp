const express = require('express');

const router = express.Router();
let posts = [];
let nextId = 1;

router.get('/', (req, res) => {
    res.json(posts);
});

router.post('/', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = { id: nextId++, title, content };
    posts.push(post);
    res.status(201).json(post);
});

router.put('/:id', (req, res) => {
    const post = posts.find(item => item.id === Number(req.params.id));
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    Object.assign(post, req.body);
    res.json(post);
});

router.delete('/:id', (req, res) => {
    const index = posts.findIndex(item => item.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ message: 'Post not found' });
    }

    posts.splice(index, 1);
    res.status(204).send();
});

module.exports = router;
