var request = require('request');

const getPageBody = url =>
    new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });

module.exports = getPageBody;
