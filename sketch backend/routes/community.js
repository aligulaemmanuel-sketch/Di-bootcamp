const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const categories = new Set(['Idea', 'Question', 'Showcase']);

const publicUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  photo: user.photo,
});

const requireUser = (req, res, next) => {
  if (!jwtSecret) return res.status(503).json({ error: 'Set JWT_SECRET in sketch backend/.env before enabling accounts.' });
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
};

router.post('/signup', async (req, res) => {
  if (!jwtSecret) return res.status(503).json({ error: 'Set JWT_SECRET in sketch backend/.env before enabling accounts.' });
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const photo = typeof req.body.photo === 'string' ? req.body.photo : null;

  if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Name must be 2 to 80 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Password must be 8 to 128 characters.' });
  if (photo && (!photo.startsWith('data:image/') || photo.length > 400000)) return res.status(400).json({ error: 'Choose a smaller profile image.' });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db('community_users').insert({ name, email, password_hash: passwordHash, photo }).returning(['id', 'name', 'email', 'photo']);
    const profile = publicUser(user);
    const token = jwt.sign({ id: profile.id }, jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ user: profile, token });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account with this email already exists.' });
    console.error(error);
    res.status(500).json({ error: 'Could not create your account.' });
  }
});

router.post('/login', async (req, res) => {
  if (!jwtSecret) return res.status(503).json({ error: 'Set JWT_SECRET in sketch backend/.env before enabling accounts.' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  try {
    const user = await db('community_users').where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    const profile = publicUser(user);
    const token = jwt.sign({ id: profile.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ user: profile, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const rows = await db('community_posts as p')
      .join('community_users as u', 'u.id', 'p.user_id')
      .select('p.id', 'p.user_id', 'p.category', 'p.body', 'p.created_at', 'u.name as author', 'u.photo as author_photo')
      .orderBy('p.created_at', 'desc');
    const ids = rows.map((post) => post.id);
    const comments = ids.length ? await db('community_comments as c')
      .join('community_users as u', 'u.id', 'c.user_id')
      .whereIn('c.post_id', ids)
      .select('c.id', 'c.post_id', 'c.body', 'u.name as author', 'u.photo as author_photo')
      .orderBy('c.created_at', 'asc') : [];
    const likes = ids.length ? await db('community_likes').whereIn('post_id', ids).select('post_id', 'user_id') : [];

    res.json(rows.map((post) => ({
      id: String(post.id),
      authorId: String(post.user_id),
      author: post.author,
      authorPhoto: post.author_photo,
      category: post.category,
      body: post.body,
      createdAt: post.created_at,
      likes: likes.filter((like) => String(like.post_id) === String(post.id)).map((like) => String(like.user_id)),
      comments: comments.filter((comment) => String(comment.post_id) === String(post.id)).map((comment) => ({
        id: String(comment.id),
        author: comment.author,
        authorPhoto: comment.author_photo,
        body: comment.body,
      })),
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load community posts.' });
  }
});

router.post('/posts', requireUser, async (req, res) => {
  const body = String(req.body.body || '').trim();
  const category = String(req.body.category || 'Idea');
  if (!body || body.length > 1200) return res.status(400).json({ error: 'Post must be 1 to 1200 characters.' });
  if (!categories.has(category)) return res.status(400).json({ error: 'Choose Idea, Question, or Showcase.' });
  try {
    const [post] = await db('community_posts').insert({ user_id: req.user.id, body, category }).returning('id');
    res.status(201).json({ id: String(post.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not publish your post.' });
  }
});

router.post('/posts/:id/likes', requireUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const existing = await db('community_likes').where({ post_id: postId, user_id: req.user.id }).first();
    if (existing) await db('community_likes').where({ id: existing.id }).del();
    else await db('community_likes').insert({ post_id: postId, user_id: req.user.id });
    const likes = await db('community_likes').where({ post_id: postId }).pluck('user_id');
    res.json({ likes: likes.map(String) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update this like.' });
  }
});

router.post('/posts/:id/comments', requireUser, async (req, res) => {
  const body = String(req.body.body || '').trim();
  if (!body || body.length > 500) return res.status(400).json({ error: 'Reply must be 1 to 500 characters.' });
  try {
    const [comment] = await db('community_comments').insert({ post_id: req.params.id, user_id: req.user.id, body }).returning('id');
    const user = await db('community_users').where({ id: req.user.id }).first('name', 'photo');
    res.status(201).json({ comment: { id: String(comment.id), author: user.name, authorPhoto: user.photo, body } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not add your reply.' });
  }
});

module.exports = router;