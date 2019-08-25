import { combineReducers } from 'redux';
import appState, * as appReducers from './app';
import deckState, * as deckReducers from './deck';
import gameState, * as gameReducers from './game';

export default combineReducers({
    app: appState,
    deck: deckState,
    game: gameState,
});

// APP
export const getAppMode = state => appReducers.getAppMode(state.app);

// DECK
export const getActiveDeckNumber = state =>
    deckReducers.getActiveDeckNumber(state.deck);
export const getActiveDeck = state => deckReducers.getActiveDeck(state.deck);
export const getInactiveDeck = state =>
    deckReducers.getInactiveDeck(state.deck);
export const getDeck1 = state => deckReducers.getDeck1(state.deck);
export const getDeck2 = state => deckReducers.getDeck2(state.deck);

// GAME
export const getPhase = state => gameReducers.getPhase(state.game);

export const getActivePlayerNumber = state =>
    gameReducers.getActivePlayerNumber(state.game);
export const getActivePlayer = state =>
    gameReducers.getActivePlayer(state.game);
export const getActivePlayerAttacking = state =>
    gameReducers.getActivePlayerAttacking(state.game);

export const getInactivePlayerNumber = state =>
    gameReducers.getInactivePlayerNumber(state.game);
export const getInactivePlayer = state =>
    gameReducers.getInactivePlayer(state.game);
