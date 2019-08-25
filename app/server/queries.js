const Card = require('./models/Card');

const cardPages = async after => {
    const cards = await Card.find({ pk: { $gt: after } })
        .sort('pk')
        .limit(20);
    var data = {
        cards: {
            edges: cards,
            cursor: {
                after: after + 20,
            },
            count: await Card.count(),
        },
    };
    // if (after === 0) {
    //     const count = await Card.count();
    //     data.cards.count = count;
    // }
    return { data };
};

module.exports = { cardPages };
