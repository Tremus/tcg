const express = require('express');
const router = express.Router();

const Card = require('./models/Card');
const queries = require('./queries');

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page || 0);
    const after = page * 20;
    const { data } = await queries.cardPages(after);

    res.render('index', { cards: data.cards, page });
});

router.get('/card/:pk/', async (req, res) => {
    const pk = parseInt(req.params.pk);
    const card = await Card.findOne({ pk });

    res.render('card', { card });
});

module.exports = router;
