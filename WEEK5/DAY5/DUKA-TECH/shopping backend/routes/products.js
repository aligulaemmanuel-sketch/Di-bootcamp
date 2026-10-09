const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = db('products').select('*').orderBy('id');

    if (category) {
      query = query.where({ category });
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch products.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await db('products').where({ id: Number(req.params.id) }).first();

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch product.' });
  }
});

module.exports = router;
