export const RESTART_GAME = 'RESTART_GAME';

// PHASE ACTIONS
export const CHANGE_PHASE = 'CHANGE_PHASE';
export const CHANGE_TURN = 'CHANGE_TURN';
export const CLEANUP_START_TURN = 'CLEANUP_START_TURN';
export const CLEANUP_MANA_PHASE = 'CLEANUP_MANA_PHASE';
export const CLEANUP_CASTING_PHASE = 'CLEANUP_CASTING_PHASE';
export const CLEANUP_BATTLE_PHASE = 'CLEANUP_BATTLE_PHASE';

/********************
 *  PLAYER ACTIONS  *
 ********************/

export const TURN_DRAW = 'TURN_DRAW';
export const DRAW = 'DRAW';

// HAND
export const SELECT_FOR_CASTING = 'SELECT_FOR_CASTING';
export const UNDO_SELECT_FOR_CASTING = 'UNDO_SELECT_FOR_CASTING';
export const CAST = 'CAST';

// MANA
export const ADD_TURN_MANA = 'ADD_TURN_MANA';
export const UNDO_ADD_TURN_MANA = 'UNDO_ADD_TURN_MANA';
export const TAP_MANA_FOR_CASTING = 'TAP_MANA_FOR_CASTING';
export const UNTAP_MANA_FOR_CASTING = 'UNTAP_MANA_FOR_CASTING';

// BATTLE
export const SELECT_FOR_ATTACKING = 'SELECT_FOR_ATTACKING';
export const DESELECT_FOR_ATTACKING = 'DESELECT_FOR_ATTACKING';
export const ATTACK_SHIELD = 'ATTACK_SHIELD';
export const ATTACK_CREATURE = 'ATTACK_CREATURE';
