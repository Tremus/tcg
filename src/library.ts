import { Card, GetGame, PlayerId } from './types';
import AquaHulcus from './cards/AquaHulcus';
import BurningMane from './cards/BurningMane';

class Library {
    static library = {
        ['23/110']: AquaHulcus,
        ['91/110']: BurningMane,
    };

    static getCard(id: string, getGame: GetGame, owner: PlayerId): Card {
        return new Library.library[id](getGame, owner);
    }
}

export default Library;
