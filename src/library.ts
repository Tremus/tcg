import { Card } from './types';
import AquaHulcus from './cards/AquaHulcus';

class Library {
    static library = {
        ['23/110']: AquaHulcus,
    };

    static getCard(id: string): Card {
        return new Library.library[id]();
    }
}

export default Library;
