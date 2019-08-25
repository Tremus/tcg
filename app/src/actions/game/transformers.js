/* Transformers are functions that are dispatched to
 * reducers and are used to manipulate the state here.
 */

import { getCardHand, getCardMana, getCardBattleZone } from '../../utils/cards';
import { getLibrary } from '../../components/Card';

export function draw(player) {
    let { hand, deck } = player;
    const idx = deck.pop();
    hand.push(getCardHand(idx));
    return { ...player, hand, deck };
}

export function cleanupStartTurn(player) {
    const manaZone = player.manaZone.map(c => ({ ...c, tapped: false }));
    const battleZone = player.battleZone.map(c => ({
        ...c,
        summoningSickness: false,
        tapped: false,
    }));
    return { ...player, manaZone, battleZone, hasTurnDraw: false };
}

export function cleanupManaPhase(player) {
    const manaZone = player.manaZone.map(c => ({ ...c, turnMana: false }));
    return { ...player, manaZone };
}

export function cleanupCastingPhase(player) {
    const hand = player.hand.map(c =>
        c.selected ? { ...c, selected: false } : c,
    );
    const manaZone = player.manaZone.map(c => {
        if (c.selected) {
            c.selected = false;
            c.tapped = false;
        }
        return c;
    });
    return { ...player, hand, manaZone };
}

export function cleanupBattlePhase(player) {
    const battleZone = player.battleZone.map(c =>
        c.selected ? { ...c, selected: false } : c,
    );
    return { ...player, battleZone };
}

// HAND
export function selectForCasting(player, idx) {
    const hand = player.hand.map(c => {
        if (c.idx === idx) {
            c.selected = true;
        }
        return c;
    });
    return { ...player, hand };
}

export function undoSelectForCasting(player, idx) {
    const hand = player.hand.map(c =>
        c.idx === idx ? { ...c, selected: false } : c,
    );
    const manaZone = player.manaZone.map(c =>
        c.selected && c.tapped ? { ...c, selected: false, tapped: false } : c,
    );
    return { ...player, hand, manaZone };
}

export function cast(player, idx) {
    var { hand, battleZone } = player;
    hand = hand.filter(c => c.idx !== idx);
    battleZone.push(getCardBattleZone(idx));
    const manaZone = player.manaZone.map(c =>
        c.selected ? { ...c, selected: false } : c,
    );
    return { ...player, hand, manaZone, battleZone };
}

// MANA
export function addTurnMana(player, idx) {
    let { hand, manaZone } = player;
    hand = hand.filter(c => c.idx !== idx);
    let newMana = getCardMana(idx);
    newMana.turnMana = true;
    manaZone.push(newMana);
    return { ...player, hand, manaZone };
}

export function undoAddTurnMana(player, idx) {
    let { hand, manaZone } = player;
    hand.push(getCardHand(idx));
    manaZone = manaZone.filter(c => c.idx !== idx);
    // manaZone = manaZone.filter(c => !c.turnMana);
    return { ...player, hand, manaZone };
}

export function tapManaForCasting(player, idx) {
    const manaZone = player.manaZone.map(c =>
        c.idx === idx ? { ...c, tapped: true, selected: true } : c,
    );
    return { ...player, manaZone };
}

export function untapManaForCasting(player, idx) {
    const manaZone = player.manaZone.map(c =>
        c.idx === idx ? { ...c, tapped: false, selected: false } : c,
    );
    return { ...player, manaZone };
}

// BATTLE
export function selectForAttacking(player, idx) {
    const battleZone = player.battleZone.map(c =>
        c.idx === idx ? { ...c, selected: true } : c,
    );
    return { ...player, battleZone };
}

export function deselectForAttacking(player, idx) {
    const battleZone = player.battleZone.map(c =>
        c.idx === idx ? { ...c, selected: false } : c,
    );
    return { ...player, battleZone };
}

export function creatureBreakShield(activePlayer, inactivePlayer, shieldIdx) {
    const activePlayerBattleZone = activePlayer.battleZone.map(c =>
        c.selected ? { ...c, tapped: true, selected: false } : c,
    );
    const newActivePlayer = {
        ...activePlayer,
        battleZone: activePlayerBattleZone,
    };

    const inactivePlayerShieldZone = inactivePlayer.shieldZone.filter(
        c => c !== shieldIdx,
    );
    const newCardHand = getCardHand(shieldIdx);
    const inactivePlayerHand = [...inactivePlayer.hand, newCardHand];
    const newInactivePlayer = {
        ...inactivePlayer,
        hand: inactivePlayerHand,
        shieldZone: inactivePlayerShieldZone,
    };
    return [newActivePlayer, newInactivePlayer];
}

export function creatureAttackCreature(
    activePlayer,
    inactivePlayer,
    creatureIdx,
) {
    const attackingCreature = activePlayer.battleZone.find(c => c.selected);
    const lib = getLibrary();
    const attPWR = lib[attackingCreature.idx].power;
    const defPWR = lib[creatureIdx].power;

    if (attPWR > defPWR) {
        // destroy inactive players creature
        throw new Error('// TODO: destroy inactive players creature');
    } else if (defPWR > attPWR) {
        // destroy attacking creature
        throw new Error('// TODO: destroy attacking creature');
    } else {
        // power is equal
        // destroy both creatures
        // move attacking creature to graveyard
        const newActivePlayer = {
            ...activePlayer,
            graveyard: [...activePlayer.graveyard, attackingCreature.idx],
            battleZone: activePlayer.battleZone.filter(c => !c.selected),
        };
        // move attacked creature to graveyard
        const newInactivePlayer = {
            ...inactivePlayer,
            graveyard: [...inactivePlayer.graveyard, creatureIdx],
            battleZone: inactivePlayer.battleZone.filter(
                c => creatureIdx !== c.idx,
            ),
        };
        return [newActivePlayer, newInactivePlayer];
    }
}
