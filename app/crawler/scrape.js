const fs = require('fs');
var request = require('request');

const scrape = async (url, filepath) =>
    new Promise((resolve, reject) =>
        request(url)
            .on('error', reject)
            .pipe(fs.createWriteStream(filepath))
            .on('close', resolve),
    );

module.exports = scrape;
