import * as types from './types';
import * as transformers from './transformers';

export const restartGame = () => ({
    type: types.RESTART_GAME,
});

// PHASE
export const changePhase = phase => ({
    type: types.CHANGE_PHASE,
    value: { phase },
});

export const changeTurn = (phase, activePlayerNumber) => ({
    type: types.CHANGE_TURN,
    value: { phase, activePlayerNumber },
});

export const turnDraw = () => ({ type: types.TURN_DRAW });

export const cleanupStartTurn = () => ({
    type: types.CLEANUP_START_TURN,
    transformer: transformers.cleanupStartTurn,
});

export const cleanupManaPhase = () => ({
    type: types.CLEANUP_MANA_PHASE,
    transformer: transformers.cleanupManaPhase,
});

export const cleanupCastingPhase = () => ({
    type: types.CLEANUP_CASTING_PHASE,
    transformer: transformers.cleanupCastingPhase,
});

export const cleanupBattlePhase = () => ({
    type: types.CLEANUP_BATTLE_PHASE,
    transformer: transformers.cleanupBattlePhase,
});

// HAND
export const selectForCasting = idx => ({
    type: types.SELECT_FOR_CASTING,
    value: { idx },
    transformer: transformers.selectForCasting,
});

export const undoSelectForCasting = idx => ({
    type: types.UNDO_SELECT_FOR_CASTING,
    value: { idx },
    transformer: transformers.undoSelectForCasting,
});

export const cast = idx => ({
    type: types.CAST,
    value: { idx },
    transformer: transformers.cast,
});

// MANA
export const addTurnMana = idx => ({
    type: types.ADD_TURN_MANA,
    value: { idx },
    transformer: transformers.addTurnMana,
});

export const undoAddTurnMana = idx => ({
    type: types.UNDO_ADD_TURN_MANA,
    value: { idx },
    transformer: transformers.undoAddTurnMana,
});

export const tapManaForCasting = idx => ({
    type: types.TAP_MANA_FOR_CASTING,
    value: { idx },
    transformer: transformers.tapManaForCasting,
});

export const untapManaForCasting = idx => ({
    type: types.UNTAP_MANA_FOR_CASTING,
    value: { idx },
    transformer: transformers.untapManaForCasting,
});

// BATTLE
export const selectForAttacking = idx => ({
    type: types.SELECT_FOR_ATTACKING,
    value: { idx },
    transformer: transformers.selectForAttacking,
});

export const deselectForAttacking = idx => ({
    type: types.DESELECT_FOR_ATTACKING,
    value: { idx },
    transformer: transformers.deselectForAttacking,
});

export const creatureBreakShield = shieldIdx => ({
    type: types.ATTACK_SHIELD,
    value: { idx: shieldIdx },
    transformer: transformers.creatureBreakShield,
});

export const creatureAttackCreature = creatureIdx => ({
    type: types.ATTACK_CREATURE,
    value: { idx: creatureIdx },
    transformer: transformers.creatureAttackCreature,
});
