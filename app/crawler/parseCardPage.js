const { JSDOM } = require('jsdom');

const parseCardPage = htmlBody => {
    const table = '<table' + htmlBody.split(/<table\sclass="wikitable"/)[1].split(/<\/table/)[0] + '</table>';

    const dom = new JSDOM(`<!DOCTYPE html>${table}`);
    const rows = dom.window.document.getElementsByTagName('tr');
    var cardDetails = {};

    for (let i = 0; i < rows.length; i++) {
        const e = rows.item(i);

        if (i === 0) {
            const name = e.children[0].firstChild.textContent;
            // const name = /(.+)<br>/.exec(e.children[0].innerHTML)[1];
            if (!name) {
                throw new Error('Failed finding name');
            }
            cardDetails.name = name.trim();
        } else if (i === 1) {
            const srcDisplayUrl = e.children[0].children[0].children[0].children[0].children[0].children[0].src;
            if (!srcDisplayUrl) {
                throw new Error('Failed finding srcDisplayUrl');
            }
            cardDetails.srcDisplayUrl = srcDisplayUrl;
        } else if (!cardDetails.civilization && e.innerHTML.match(/title="Civilization">/)) {
            const civilization = /(Light|Water|Darkness|Fire|Nature)/.exec(e.children[1].children[0].innerHTML)[1];
            if (!civilization) {
                throw new Error('Failed finding civilization');
            }
            cardDetails.civilization = civilization;
        } else if (!cardDetails.type && e.innerHTML.match(/title="Card\sType">/)) {
            // (creature / spell)
            const type = e.children[1].children[0].children[0].innerHTML;
            if (!type) {
                throw new Error('Failed finding type');
            }
            cardDetails.type = type;
        } else if (!cardDetails.manaCost && e.innerHTML.match(/title="Mana\sCost">/)) {
            const manaCost = e.children[1].children[0].innerHTML;
            if (!manaCost) {
                throw new Error('Failed finding manaCost');
            }
            cardDetails.manaCost = Number.parseInt(manaCost);
        } else if (!cardDetails.race && cardDetails.type === 'Creature' && e.innerHTML.match(/title="Race">/)) {
            const race = e.children[1].children[0].children[0].innerHTML;
            if (!race) {
                throw new Error('Failed finding Race');
            }
            cardDetails.race = race;
        } else if (!cardDetails.abilities && e.innerHTML.match(/title="Text">English\sText/)) {
            var abilities = [];
            const lines = e.children[1].innerHTML.split(/<p>|<\/p>/).filter(t => !!t);
            for (let i2 = 0; i2 < lines.length; i2++) {
                a = lines[i2]
                    .split(/<.+?>/g)
                    .filter(t => !!t)
                    .join('');

                if (a.slice(0, 1) === ' ') {
                    a = a.slice(1);
                }
                if (a.slice(a.length - 1) === '\n') {
                    a = a.slice(0, a.length - 1);
                }
                if (a) abilities.push(a);
            }

            cardDetails.abilities = abilities;
        } else if (!cardDetails.power && cardDetails.type === 'Creature' && e.innerHTML.match(/title="Power">/)) {
            const power = e.children[1].children[0].innerHTML;
            if (!power) {
                throw new Error('Failed finding Power');
            }
            cardDetails.power = Number.parseInt(power);
        } else if (!cardDetails.flavorText && e.innerHTML.match(/title="Flavor\sText">/)) {
            var flavorText = e.children[1].innerHTML
                .split(/<.+?>/g)
                .filter(t => !!t)
                .join('');

            if (flavorText.slice(0, 1) === ' ') {
                flavorText = flavorText.slice(1);
            }

            if (flavorText.slice(flavorText.length - 1) === '\n') {
                flavorText = flavorText.slice(0, flavorText.length - 1);
            }
            if (!flavorText) {
                throw new Error('Failed finding Flavor Text');
            }
            cardDetails.flavorText = flavorText;
        } else if (!cardDetails.manaNumber && e.innerHTML.match(/title="Mana\sNumber">/)) {
            const manaNumber = /([0-9]+)/.exec(e.children[1].innerHTML)[1];
            if (!manaNumber) {
                throw new Error('Failed finding Mana Number');
            }
            cardDetails.manaNumber = Number.parseInt(manaNumber);
        } else if (!cardDetails.illustrator && e.innerHTML.match(/title="Artist">/)) {
            const illustrator = e.children[1].children[0].innerHTML;
            if (!illustrator) {
                throw new Error('Failed finding Illustrator');
            }
            cardDetails.illustrator = illustrator;
        } else if (!cardDetails.set && e.innerHTML.match(/\s\([S0-9\/]+\s/)) {
            const setsrarity = e.children[0].children[0].children[0].innerHTML.split('<br>');
            const no = /^\s\(([S0-9\/]+)\s/.exec(setsrarity[1])[1];
            if (!no) {
                throw new Error('Failed finding Card No');
            }
            const set = /title="([a-zA-Z0-9\s\-]+)">/.exec(setsrarity[0])[1];
            if (!setsrarity) {
                throw new Error('Failed finding Set');
            }
            const rarity = /title="([a-zA-Z0-9\s\-]+)">/.exec(setsrarity[1])[1];
            if (!rarity) {
                throw new Error('Failed finding Rarity');
            }
            cardDetails.set = set;
            cardDetails.rarity = rarity;
            cardDetails.no = no;
        }
    }

    return cardDetails;
};

module.exports = parseCardPage;
