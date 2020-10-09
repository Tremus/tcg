const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const getPageBody = require('./getPageBody');
const scrape = require('./scrape');
const parseCardPage = require('./parseCardPage');

// const db = require('../server/db');
// const Card = require('../server/models/Card');

// https://duelmasters.fandom.com/wiki/List_of_TCG_Set_Galleries

const WIKI_ARTICLE_BASE = 'https://duelmasters.fandom.com/wiki';
const WIKI_THUMBNAIL_BASE = 'https://static.wikia.nocookie.net/duelmasters/images';

const findLink = /<a href="\/wiki\/([a-zA-Z0-9,_\-%]+)"/;
const findThumbnails = /<img style="" src="https:\/\/static\.wikia\.nocookie\.net\/duelmasters\/images\/([a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9,_\-%]+\.jpg\/revision\/latest\/scale-to-width-down\/[0-9]+\?cb=[0-9]+)/;

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
const THUMBNAIL_DIR = path.join(ASSETS_DIR, 'thumbs');
const DISPLAY_IMG_DIR = path.join(ASSETS_DIR, 'cards');
const JSON_DATA_DIR = path.join(ASSETS_DIR, 'data');

const checkAndCreateDir = dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};
checkAndCreateDir(ASSETS_DIR);
checkAndCreateDir(THUMBNAIL_DIR);
checkAndCreateDir(DISPLAY_IMG_DIR);
checkAndCreateDir(JSON_DATA_DIR);

(async () => {
    const page = await getPageBody(`${WIKI_ARTICLE_BASE}/DM-01_Base_Set_Gallery_(TCG)`);
    const dom = new JSDOM(page);
    const data = dom.window.document.getElementById('gallery-1').outerHTML;

    const lines = data
        .split(/>\s{0,10}</)
        .join('>\n<')
        .split(/\n/);

    var pageNames = [];
    var thumbnails = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = findLink.exec(line);
        if (match) {
            pageNames.push(match[1]);
        }
        const thumb = findThumbnails.exec(line);
        if (thumb) {
            thumbnails.push(thumb[1]);
        }
    }

    for (let i = 0; i < pageNames.length; i++) {
        const srcThumbnailUrl = `${WIKI_THUMBNAIL_BASE}/${thumbnails[i]}`;
        const articleUrl = `${WIKI_ARTICLE_BASE}/${pageNames[i]}`;

        const thumbnailFilepath = path.join(THUMBNAIL_DIR, pageNames[i] + '.jpg');
        if (!fs.existsSync(thumbnailFilepath)) {
            // save thumb card image
            console.log('saving:', srcThumbnailUrl);
            await scrape(srcThumbnailUrl, thumbnailFilepath);
        }

        let c;
        const dataFilepath = path.join(JSON_DATA_DIR, pageNames[i] + '.json');
        if (!fs.existsSync(dataFilepath)) {
            // Save card JSON
            console.log('DL:', articleUrl);
            const cardArticleHTML = await getPageBody(articleUrl);
            c = parseCardPage(cardArticleHTML);

            c.articleUrl = articleUrl;
            c.srcThumbnailUrl = srcThumbnailUrl;
            c.imageName = pageNames[i];

            console.log('Saving:', dataFilepath);
            fs.writeFileSync(dataFilepath, JSON.stringify(c, null, 4));
        } else {
            c = JSON.parse(fs.readFileSync(dataFilepath, 'utf8'));
        }

        const displayImgFilepath = path.join(DISPLAY_IMG_DIR, pageNames[i] + '.jpg');
        if (!fs.existsSync(displayImgFilepath)) {
            // save lg card image
            console.log('saving:', c.srcDisplayUrl);
            await scrape(c.srcDisplayUrl, displayImgFilepath);
        }
    }
    process.exit();
})();
