const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const api = require('./api');
const routes = require('./routes');

const PORT = 5000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', api);
app.use(routes);

app.set('view engine', 'pug');
app.set('views', './server/views');
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Express listening at http://localhost:${PORT}`);
});
