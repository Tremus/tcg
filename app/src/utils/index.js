import { LIBRARY_KEY, REDUX_KEY } from '../settings';

export const shuffle = arr => {
    let counter = arr.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

export const unique = arr =>
    arr.filter((val, idx, self) => self.indexOf(val) === idx);

export const getReduxStore = () => window[REDUX_KEY];
export const getLibrary = () => window[LIBRARY_KEY];
export const getCardLibrary = idx => window[LIBRARY_KEY][idx];
