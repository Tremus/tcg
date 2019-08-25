// https://duelmasters.fandom.com/wiki/List_of_TCG_Set_Galleries
// https://regex101.com/
// https://duelmasters.fandom.com/wiki/Hanusa,_Radiance_Elemental

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const getPageBody = require('./getPageBody');
const scrape = require('./scrape');
const parseCardPage = require('./parseCardPage');

const db = require('../server/db');
const Card = require('../server/models/Card');

const WIKI_ARTICLE_BASE = 'https://duelmasters.fandom.com/wiki';
const WIKI_THUMBNAIL_BASE =
    'https://vignette.wikia.nocookie.net/duelmasters/images';

const findLink = /<a href="\/wiki\/([a-zA-Z0-9,_\-%]+)"/;
const findThumbnails = /-src="https:\/\/vignette\.wikia\.nocookie\.net\/duelmasters\/images\/([a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9,_\-%]+\.jpg\/revision\/latest\/scale-to-width-down\/[0-9]+\?cb=[0-9]+)/;

const ASSETS_DIR = '\\..\\public\\assets';
const THUMBNAIL_DIR = `${ASSETS_DIR}\\thumbs`;
const DISPLAY_IMG_DIR = `${ASSETS_DIR}\\cards`;

const checkAndCreateDir = dir => {
    const fullDirname = path.join(__dirname, dir);
    if (!fs.existsSync(fullDirname)) {
        fs.mkdirSync(fullDirname);
    }
};
checkAndCreateDir(ASSETS_DIR);
checkAndCreateDir(THUMBNAIL_DIR);
checkAndCreateDir(DISPLAY_IMG_DIR);

const getThumbnailFilepath = name =>
    path.join(__dirname, `${THUMBNAIL_DIR}\\${name}.jpg`);

const getDisplayImgFilepath = name =>
    path.join(__dirname, `${DISPLAY_IMG_DIR}\\${name}.jpg`);

(async () => {
    const page = await getPageBody(
        `${WIKI_ARTICLE_BASE}/DM-01_Base_Set_Gallery_(TCG)`,
    );
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

        const thumbnailFilepath = getThumbnailFilepath(pageNames[i]);
        if (!fs.existsSync(thumbnailFilepath)) {
            // save thumb card image
            console.log('saving:', srcThumbnailUrl);
            await scrape(srcThumbnailUrl, thumbnailFilepath);
        }

        var c = await Card.findOne({ articleUrl });
        if (!c) {
            const cardArticleHTML = await getPageBody(articleUrl);
            var parsedData = parseCardPage(cardArticleHTML);
            parsedData.articleUrl = articleUrl;
            parsedData.srcThumbnailUrl = srcThumbnailUrl;
            parsedData.imageName = pageNames[i];
            parsedData.pk = i + 1;
            c = await Card.create(parsedData);
            console.log(`Saved: ${c.pk} - ${c.name}`);
        } else {
            console.log(`Already saved: ${c.pk} - ${c.name}`);
        }

        const displayImgFilepath = getDisplayImgFilepath(pageNames[i]);
        if (!fs.existsSync(displayImgFilepath)) {
            // save lg card image
            console.log('saving:', c.srcDisplayUrl);
            await scrape(c.srcDisplayUrl, displayImgFilepath);
        }
    }
    process.exit();
})();
