import * as types from '../actions/deck/types';

const getDeckKey = no => `deck${no}`;

const initialState = {
    activeDeckNumber: 1,
    deck1: {},
    deck2: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_CARD_TO_DECK:
        case types.REMOVE_CARD_FROM_DECK: {
            const { pk } = action.value;
            const deckKey = getDeckKey(state.activeDeckNumber);
            return {
                ...state,
                [deckKey]: action.transformer(state[deckKey], pk),
            };
        }
        case types.CLEAR_ACTIVE_DECK: {
            const deckKey = getDeckKey(state.activeDeckNumber);
            return { ...state, [deckKey]: {} };
        }
        case types.SET_ACTIVE_DECK_NUMBER:
            return { ...state, ...action.value };
        default:
            return state;
    }
};

export const getActiveDeckNumber = state => state.activeDeckNumber;
export const getActiveDeck = state =>
    state[getDeckKey(getActiveDeckNumber(state))];
export const getInactiveDeckNumber = state => {
    if (state.activeDeckNumber === 1) {
        return 2;
    }
    return 1;
};
export const getInactiveDeck = state =>
    state[getDeckKey(getInactiveDeckNumber(state))];

export const getDeck1 = state => state.deck1;
export const getDeck2 = state => state.deck2;
