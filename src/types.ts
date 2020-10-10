// type Civilization = 'Light' | 'Water' | 'Darkness' | 'Fire' | 'Nature';

export enum Civilization {
    light = 'Light',
    water = 'Water',
    darkness = 'Darkness',
    fire = 'Fire',
    nature = 'Nature',
}

export enum Phase {
    start,
    draw,
    mana,
    play,
    attack,
    end,
}

export type PlayerId = 'player1' | 'player2';
type CardType = 'Creature' | 'Spell';

export type GameState = {
    turnCount: number;
    player1: Player;
    player2: Player;
    activePlayer: PlayerId;
    phase: Phase;
};

export type GetGame = () => GameAttributes;

export type GameAttributes = {
    getGame: GetGame;
    state: GameState;
    setup: Function;

    drawCard: (targetPlayer: PlayerId) => void;
};

export type Card = {
    getGame: GetGame;
    owner: PlayerId;

    manaCost: number;
    name: string;
    description: string;
    civilization: Civilization;
    type: CardType;
    no: string;

    isTapped?: boolean;

    // Abilities
    onCast?: Function;
    onAttack?: Function;
    onAttacked?: Function;
    onTapForAbility?: Function;
    onDestroy?: Function;
    onShieldTrigger?: Function;

    onEnterAttackPhase?: Function;
    onLeaveAttackPhase?: Function;
    onLeaveBattleZone?: Function;
    onLeaveManaZone?: Function;
    onCreatureDesroyed?: Function;
    onCreatureAttacked?: Function;
    onEndPhase?: Function;
    onStartPhase?: Function;

    canAttack?: boolean;
    canAttackPlayers?: boolean;
    canAttackCreatures?: boolean;
    canAttackUntappedCreatures?: boolean;

    isBlocker?: boolean;
    isBlockable?: boolean;
};

export interface Creature extends Card {
    race: string;
    power: number;
    type: 'Creature';
}

export type Player = {
    // [bottom of deck -> top of deck]
    deck: Array<Card>;
    // [bottom of graveyard -> top of graveyard]
    graveyard: Array<Card>;
    hand: Array<Card>;

    shieldZone: Array<Card>;
    battleZone: Array<Card>;
    manaZone: Array<Card>;

    turnDrawCount: number;
    turnManaCount: number;
};
