import * as types from '../actions/game/types';
import * as transformers from '../actions/game/transformers';
import { shuffle } from '../utils/index';
import { getCardHand, getCardBattleZone, getCardMana } from '../utils/cards';
import { range } from 'lodash';

function createPlayer(num) {
    const shuffled = shuffle(range(0 + num, 40 + num));

    var deck = [],
        shieldZone = [],
        manaZone = [],
        hand = [],
        battleZone = [];

    for (let i = 0; i < shuffled.length; i++) {
        // if (i < 5) {
        //     manaZone.push(getCardMana(shuffled[i]));
        // } else
        if (i < 30) {
            deck.push(shuffled[i]);
        } else if (i < 35) {
            shieldZone.push(shuffled[i]);
        } else {
            hand.push(getCardHand(shuffled[i]));
        }
    }
    return {
        deck,
        shieldZone,
        manaZone,
        hand,
        hasTurnDraw: false,
        battleZone,
        graveyard: [], // TODO: add cards to graveyard
    };
}

// function createPlayer() {
//     return {
//         hasTurnDraw: false,
//         battleZone: [],
//         graveyard: [],
//         ...createDeck(),
//     };
// }

function getActivePlayerKey(state) {
    return `player${state.activePlayerNumber}`;
}

function getInactivePlayerKey(state) {
    const inactivePlayerNum = state.activePlayerNumber === 1 ? 2 : 1;
    return `player${inactivePlayerNum}`;
}

const getInitialState = () => ({
    phase: 3,
    activePlayerNumber: 1,
    player1: createPlayer(0),
    player2: createPlayer(40),
});

const INITIAL_STATE = getInitialState();

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.RESTART_GAME:
            return getInitialState();
        case types.TURN_DRAW: {
            const activePlayerKey = getActivePlayerKey(state);
            var player = transformers.draw(state[activePlayerKey]);
            return {
                ...state,
                [activePlayerKey]: { ...player, hasTurnDraw: true },
            };
        }
        case types.DRAW: {
            const activePlayerKey = getActivePlayerKey(state);
            return {
                ...state,
                [activePlayerKey]: transformers.draw(state[activePlayerKey]),
            };
        }
        case types.ADD_TURN_MANA:
        case types.UNDO_ADD_TURN_MANA:
        case types.SELECT_FOR_CASTING:
        case types.UNDO_SELECT_FOR_CASTING:
        case types.TAP_MANA_FOR_CASTING:
        case types.UNTAP_MANA_FOR_CASTING:
        case types.SELECT_FOR_ATTACKING:
        case types.DESELECT_FOR_ATTACKING:
        case types.CAST: {
            const { idx } = action.value;
            const activePlayerKey = getActivePlayerKey(state);
            const updatedPlayer = action.transformer(
                state[activePlayerKey],
                idx,
            );
            return { ...state, [activePlayerKey]: updatedPlayer };
        }
        case types.ATTACK_SHIELD:
        case types.ATTACK_CREATURE: {
            // target idx
            const { idx } = action.value;
            // idx of attacking creature can be found by looking at the
            // creature in the battle zone where selected === true
            const activePlayerKey = getActivePlayerKey(state);
            const inactivePlayerKey = getInactivePlayerKey(state);
            const [activePlayer, inactivePlayer] = action.transformer(
                state[activePlayerKey],
                state[inactivePlayerKey],
                idx,
            );
            return {
                ...state,
                [activePlayerKey]: activePlayer,
                [inactivePlayerKey]: inactivePlayer,
            };
        }
        case types.CLEANUP_START_TURN:
        case types.CLEANUP_MANA_PHASE:
        case types.CLEANUP_CASTING_PHASE:
        case types.CLEANUP_BATTLE_PHASE: {
            const activePlayerKey = getActivePlayerKey(state);
            return {
                ...state,
                [activePlayerKey]: action.transformer(state[activePlayerKey]),
            };
        }
        case types.CHANGE_TURN:
        case types.CHANGE_PHASE:
            return { ...state, ...action.value };
        default:
            return state;
    }
};

export const getPhase = state => state.phase;

export const getActivePlayerNumber = state => state.activePlayerNumber;
export const getActivePlayer = state => state[getActivePlayerKey(state)];
export const getActivePlayerAttacking = state => {
    const activePlayer = getActivePlayer(state);
    return activePlayer.battleZone.some(c => c.selected);
};

export const getInactivePlayerNumber = state =>
    state.activePlayerNumber === 1 ? 2 : 1;
export const getInactivePlayer = state => state[getInactivePlayerKey(state)];
