const mongoose = require('mongoose');
const MONGO_ADDRESS = 'mongodb://127.0.0.1/dm';

mongoose.connect(MONGO_ADDRESS, { useNewUrlParser: true });
const db = mongoose.connection;

db.once('open', () => console.log('MongoDB listening at', MONGO_ADDRESS));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
