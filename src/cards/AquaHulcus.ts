import { Card, Creature, Civilization, GetGame, PlayerId } from '../types';

class AquaHulcus implements Card, Creature {
    getGame: GetGame;
    owner: PlayerId;

    manaCost = 3;
    name = 'Aqua Hulcus';
    description = '';
    civilization = Civilization.water;
    race = 'Liquid People';
    power = 2000;
    type: 'Creature';
    no = '23/110';

    constructor(getGame: GetGame, owner: PlayerId) {
        this.getGame = getGame;
        this.owner = owner;
        this.type = 'Creature';
    }

    onCast() {
        this.getGame().drawCard(this.owner);
    }
}

export default AquaHulcus;
