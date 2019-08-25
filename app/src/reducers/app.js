import * as types from '../actions/app/types';

export const APP_MODES = Object.freeze({
    DECK_BUILDER: 'DECK_BUILDER',
    DUEL: 'DUEL',
});

const initialState = {
    mode: APP_MODES.DECK_BUILDER,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.BUILD_DECK_MODE:
            return { ...state, mode: APP_MODES.DECK_BUILDER };
        case types.DUEL_MODE:
            return { ...state, mode: APP_MODES.DUEL };
        default:
            return state;
    }
};

export const getAppMode = state => state.mode;
