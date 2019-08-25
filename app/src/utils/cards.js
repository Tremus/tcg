export function getCardHand(idx) {
    return { idx, selected: false };
}

export function getCardMana(idx) {
    return {
        idx,
        tapped: false,
        turnMana: false, // Used for undoing turn mana
        selected: false,
    };
}

export function getCardBattleZone(idx) {
    return {
        idx,
        tapped: false,
        selected: false,
        summoningSickness: true,
    };
}
