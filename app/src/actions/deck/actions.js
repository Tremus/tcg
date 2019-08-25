import * as types from './types';
import * as transformers from './transformers';

export const setActiveDeckNumber = activeDeckNumber => ({
    type: types.SET_ACTIVE_DECK_NUMBER,
    value: { activeDeckNumber },
});

export const addCardToDeck = pk => ({
    type: types.ADD_CARD_TO_DECK,
    value: { pk },
    transformer: transformers.addCardToDeck,
});

export const removeCardFromDeck = pk => ({
    type: types.REMOVE_CARD_FROM_DECK,
    value: { pk },
    transformer: transformers.removeCardFromDeck,
});

export const clearDeck = () => ({ type: types.CLEAR_ACTIVE_DECK });
