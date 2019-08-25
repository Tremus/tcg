const express = require('express');
const router = express.Router();

const Card = require('./models/Card');
const queries = require('./queries');

router.get('/cards/:after/', async (req, res) => {
    const after = parseInt(req.params.after);
    if (after % 20 !== 0) {
        res.status(406).json({ error: 'Cursor must be 0 or divisible by 20.' });
    }

    const data = await queries.cardPages(after);

    return res.json(data);
});

router.post('/cards/', async (req, res) => {
    const { pks } = req.body;
    const cards = await Card.find({ pk: { $in: pks } });

    res.json({ data: { cards } });
});

module.exports = router;
