import { Card, Creature, Civilization, GetGame, PlayerId } from '../types';

class BurningMane implements Card, Creature {
    getGame: GetGame;
    owner: PlayerId;

    manaCost = 2;
    name = 'Burning Mane';
    description = '';
    civilization = Civilization.nature;
    race = 'Beast Folk';
    power = 2000;
    type: 'Creature';
    no = '91/110';

    constructor(getGame: GetGame, owner: PlayerId) {
        this.getGame = getGame;
        this.owner = owner;
        this.type = 'Creature';
    }
}

export default BurningMane;
