import Game from '../src/game';
import { Card, Phase, Civilization } from '../src/types';
import AquaHulcus from '../src/cards/AquaHulcus';
import BurningMane from '../src/cards/BurningMane';
import { TESTING_BREAKPOINT } from '../src/utils';

test('Correct environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
});

/** METHODS */

test('Game.drawCard()', () => {
    const game = new Game();
    game.state.player1.deck = [new AquaHulcus(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];
    game.drawCard('player1');
    // card moves to hand
    expect(game.state.player1.deck.length).toBe(1);
    expect(game.state.player1.hand.length).toBe(1);
    // lose game
    expect(() => game.drawCard('player1')).toThrow('player1 defeated!');
});

test('Game.popCard()', () => {
    const game = new Game();
    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    const card = game.popCard(game.state.player1.hand, 0);
    expect(game.state.player1.hand.length).toBe(0);
    expect(card).toBeTruthy();
});

test('Game._parseIdsList', () => {
    const game = new Game();

    // bad input
    expect(() => game._parseIdsList('bad input')).toThrow(TESTING_BREAKPOINT);
    expect(() => game._parseIdsList('1,2,E,4,5,')).toThrow(TESTING_BREAKPOINT);

    // good input
    const numsArr = game._parseIdsList(',3,2,45');
    expect(numsArr.length).toBe(3);
    expect(numsArr[0]).toBe(3);
    expect(numsArr[1]).toBe(2);
    expect(numsArr[2]).toBe(45);
});

test('Game.addManaFromHand()', () => {
    const game = new Game();
    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    game.addManaFromHand('player1', 0);
    expect(game.state.player1.hand.length).toBe(0);
    expect(game.state.player1.manaZone.length).toBe(1);
});

test('Game.addCreatureFromHandToBattleZone()', () => {
    const game = new Game();
    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    game.addCreatureFromHandToBattleZone('player1', 0);
    expect(game.state.player1.hand.length).toBe(0);
    expect(game.state.player1.battleZone.length).toBe(1);
});

test('Game.tapMana()', () => {
    const game = new Game();
    game.state.player1.manaZone = [new AquaHulcus(game.getGame, 'player1')];
    const civ = game.tapMana('player1', 0);
    expect(civ).toBe(Civilization.water);
    expect(game.state.player1.manaZone[0].isTapped).toBe(true);
});
test('Game.untapMana()', () => {
    const game = new Game();
    game.state.player1.manaZone = [new AquaHulcus(game.getGame, 'player1')];
    game.untapMana('player1', 0);
    expect(game.state.player1.manaZone[0].isTapped).toBe(false);
});
test('Game.tapCreature()', () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.tapCreature('player1', 0);
    expect(game.state.player1.battleZone[0].isTapped).toBe(true);
});
test('Game.untapCreature()', () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.untapCreature('player1', 0);
    expect(game.state.player1.battleZone[0].isTapped).toBe(false);
});

test('Game.castUsingMana - test cancel casting (N)', async () => {
    const game = new Game();
    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];

    const mock1 = jest.fn();
    mock1.mockResolvedValue('N');
    game._getUserInput = mock1;

    const mock2 = jest.fn();
    game._parseIdsList = mock2;

    await game.castUsingMana(0);

    expect(mock2).not.toBeCalled();
});

test('Game.castUsingMana - test bad input (![0-9,]+)', () => {
    const game = new Game();
    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];

    const mock1 = jest.fn();
    mock1.mockResolvedValue('');
    game._getUserInput = mock1;
    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);

    const mock2 = jest.fn();
    mock2.mockResolvedValue('bad input');
    game._getUserInput = mock2;
    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);

    const mock3 = jest.fn();
    mock3.mockResolvedValue('1,2,E,4');
    game._getUserInput = mock3;
    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.castUsingMana - test bad mana selection', () => {
    const game = new Game();
    const card = new AquaHulcus(game.getGame, 'player1');
    game.state.player1.hand = [card];
    game.state.player1.manaZone = [];

    // bad idx
    const mock1 = jest.fn();
    mock1.mockResolvedValue('4');
    game._getUserInput = mock1;
    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);

    // !== manaCost
    const mock2 = jest.fn();
    mock2.mockResolvedValue('0,1');
    game._getUserInput = mock2;
    game.state.player1.manaZone = [card, card];
    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);

    // 1,2,2,3,3
    const mock3 = jest.fn();
    mock3.mockResolvedValue('0,1,1,2,2');
    game._getUserInput = mock3;
    game.state.player1.manaZone = [card, card, card];
    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);

    // missing civilization
    const mock4 = jest.fn();
    mock4.mockResolvedValue('0,1,2');
    game._getUserInput = mock4;

    const bm = new BurningMane(game.getGame, 'player2');
    game.state.player1.manaZone = [bm, bm, bm];

    // not enough mana
    const mock5 = jest.fn();
    mock5.mockResolvedValue('0,1,2');
    game._getUserInput = mock5;
    game.state.player1.manaZone = [card, card, card];
    game.tapMana('player1', 0);
    game.tapMana('player1', 1);
    game.tapMana('player1', 2);

    expect(() => game.castUsingMana(0)).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.castUsingMana - test ends on good input ([0-9,]+)', async () => {
    const game = new Game();
    game.state.player1.hand = [new BurningMane(game.getGame, 'player1')];
    game.state.player1.manaZone = [new BurningMane(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];

    const mock1 = jest.fn();
    mock1.mockResolvedValue('1,0');
    game._getUserInput = mock1;

    const mock2 = jest.fn();
    game.tapMana = mock2;

    const mock3 = jest.fn();
    game.addCreatureFromHandToBattleZone = mock3;

    await game.castUsingMana(0);
    expect(mock2).toHaveBeenNthCalledWith(1, 'player1', 1);
    expect(mock2).toHaveBeenNthCalledWith(2, 'player1', 0);
    expect(mock3).toHaveBeenCalled();

    const mock4 = jest.fn();
    mock4.mockResolvedValue('2,1,0');
    game._getUserInput = mock4;

    const card = new AquaHulcus(game.getGame, 'player1');
    const mock5 = jest.fn();
    card.onCast = mock5;
    game.state.player1.hand = [card];
    game.state.player1.manaZone = [
        new AquaHulcus(game.getGame, 'player1'),
        new AquaHulcus(game.getGame, 'player1'),
        new AquaHulcus(game.getGame, 'player1'),
    ];

    await game.castUsingMana(0);
    expect(mock5).toHaveBeenCalled();
});

test('Game.findAttackTarget - test cancel attacking (N)', async () => {
    const game = new Game();

    const mock1 = jest.fn();
    mock1.mockResolvedValue('N');
    game._getUserInput = mock1;

    const result = await game.findAttackTarget(0);
    expect(result).toBe(-1);
});

test('Game.findAttackTarget - test bad input (![0-9,]+)', () => {
    const game = new Game();

    const mock1 = jest.fn();
    mock1.mockResolvedValue('');
    game._getUserInput = mock1;
    expect(() => game.findAttackTarget(0)).rejects.toBe(TESTING_BREAKPOINT);

    const mock2 = jest.fn();
    mock2.mockResolvedValue('bad input');
    game._getUserInput = mock2;
    expect(() => game.findAttackTarget(0)).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.findAttackTarget - test bad target [0-9]+', () => {
    const game = new Game();
    const card1 = new AquaHulcus(game.getGame, 'player1');
    game.state.player1.battleZone = [card1];
    game.state.player2.shieldZone = [card1, card1];
    game.state.player2.battleZone = [card1];

    // bad idx
    const mock1 = jest.fn();
    mock1.mockResolvedValue('3');
    game._getUserInput = mock1;
    expect(() => game.findAttackTarget(0)).rejects.toBe(TESTING_BREAKPOINT);

    // canBeAttackedBy = false
    const card2 = new AquaHulcus(game.getGame, 'player1');
    const mock2 = jest.fn();
    mock2.mockResolvedValue(false);
    (card2 as Card).canBeAttackedBy = mock2;
    game.state.player2.battleZone = [card2];

    expect(() => game.findAttackTarget(0)).rejects.toBe(TESTING_BREAKPOINT);
    expect(mock2).toBeCalled;

    // attackedCreature.isTapped = false | undefined
    const mock3 = jest.fn();
    mock3.mockResolvedValue('2');
    game._getUserInput = mock3;
    expect(() => game.findAttackTarget(0)).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.findAttackTarget - test ends on good input ([0-9,]+)', async () => {
    const game = new Game();

    const card1 = new AquaHulcus(game.getGame, 'player1');
    game.state.player1.battleZone = [card1];
    game.state.player2.shieldZone = [card1, card1];
    game.state.player2.battleZone = [card1];

    game.tapCreature('player2', 0);

    // good idx
    const mock1 = jest.fn();
    mock1.mockResolvedValue('2');
    game._getUserInput = mock1;
    const result1 = await game.findAttackTarget(0);
    expect(result1).toBe(2);

    // canBeAttackedBy = true
    const card2 = new AquaHulcus(game.getGame, 'player1');
    const mock2 = jest.fn();
    mock2.mockResolvedValue(true);
    (card2 as Card).canBeAttackedBy = mock2;
    game.state.player2.battleZone = [card2];
    game.tapCreature('player2', 0);

    const result2 = await game.findAttackTarget(0);
    expect(result2).toBe(2);

    // canAttackUntappedCreatures = true
    game.untapCreature('player2', 0);
    game.state.player1.battleZone[0].canAttackUntappedCreatures = true;

    const result3 = await game.findAttackTarget(0);
    expect(result3).toBe(2);
});

/** PHASES */
// - Start
test('Game.runStartPhase - test end phase (N)', async () => {
    const game = new Game();
    const mock = jest.fn();
    mock.mockResolvedValue('N');
    game._getUserInput = mock;
    await game.runStartPhase();

    expect(game.getCurrentPhase()).toBe(Phase.draw);
});

test('Game.runStartPhase - test untap all (Y)', async () => {
    const game = new Game();
    game.state.player1.manaZone = [new AquaHulcus(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    const mock = jest.fn();
    mock.mockResolvedValue('Y');
    game._getUserInput = mock;
    await game.runStartPhase();

    expect(game.state.player1.manaZone[0].isTapped).toBe(false);
    expect(game.state.player1.manaZone[1].isTapped).toBe(false);
    expect(game.state.player1.battleZone[0].isTapped).toBe(false);
});

test('Game.runStartPhase - test bad input (![0-9,]+)', () => {
    const game = new Game();

    const mock1 = jest.fn();
    mock1.mockResolvedValue('');
    game._getUserInput = mock1;
    expect(() => game.runStartPhase()).rejects.toBe(TESTING_BREAKPOINT);

    const mock2 = jest.fn();
    mock2.mockResolvedValue('bad input');
    game._getUserInput = mock2;
    expect(() => game.runStartPhase()).rejects.toBe(TESTING_BREAKPOINT);

    const mock3 = jest.fn();
    mock3.mockResolvedValue('1,2,E,4');
    game._getUserInput = mock3;
    expect(() => game.runStartPhase()).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.runStartPhase - test loops through good input ([0-9,]+)', async () => {
    const game = new Game();
    game.state.player1.manaZone = [new AquaHulcus(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    const mock = jest.fn();
    mock.mockResolvedValueOnce('2,1').mockResolvedValueOnce('n');
    game._getUserInput = mock;

    game.tapMana('player1', 1);
    game.tapCreature('player1', 0);
    await game.runStartPhase();

    expect(game.state.player1.manaZone[0].isTapped).toBe(undefined);
    expect(game.state.player1.manaZone[1].isTapped).toBe(false);
    expect(game.state.player1.battleZone[0].isTapped).toBe(false);
});

// - Draw
test('Game.runDrawPhase', () => {
    const game = new Game();

    const mock = jest.fn();
    game.drawCard = mock;

    // skips on turn 1
    game.state.turnCount = 1;
    game.runDrawPhase();

    expect(mock).not.toHaveBeenCalled();

    // calls Game.drawCard() equal to turnDrawCount
    game.state.turnCount = 3;
    game.state.player1.turnDrawCount = 2;
    game.runDrawPhase();

    expect(mock).toHaveBeenCalledTimes(2);
});

// - Mana
test('Game.runManaPhase - test end phase (N)', async () => {
    const game = new Game();
    const mock = jest.fn();
    mock.mockResolvedValue('N');
    game._getUserInput = mock;
    await game.runManaPhase();

    expect(game.getCurrentPhase()).toBe(Phase.play);
});

test('Game.runManaPhase - test bad input (![0-9])', () => {
    const game = new Game();
    const mock1 = jest.fn();
    mock1.mockResolvedValue('');
    game._getUserInput = mock1;

    expect(() => game.runManaPhase()).rejects.toBe(TESTING_BREAKPOINT);

    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    const mock2 = jest.fn();
    mock2.mockResolvedValue('1');
    game._getUserInput = mock2;

    expect(() => game.runManaPhase()).rejects.toBe(TESTING_BREAKPOINT);

    const mock3 = jest.fn();
    mock3.mockResolvedValue('also bad input');
    game._getUserInput = mock3;

    expect(() => game.runManaPhase()).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.runManaPhase - test good input ([0-9])', async () => {
    const game = new Game();
    const mock = jest.fn();
    mock.mockResolvedValue('0');
    game._getUserInput = mock;

    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    await game.runManaPhase();

    expect(game.state.player1.hand.length).toBe(0);
    expect(game.state.player1.manaZone.length).toBe(1);
});

test('Game.runManaPhase - test loops (turnManaCount > 1)', async () => {
    const game = new Game();
    const mock = jest.fn();
    mock.mockResolvedValue('0');
    game._getUserInput = mock;

    game.state.player1.turnManaCount = 2;
    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];
    await game.runManaPhase();

    expect(game.state.player1.hand.length).toBe(0);
    expect(game.state.player1.manaZone.length).toBe(2);
});

// - Play
test('Game.runPlayPhase - test end phase (N)', async () => {
    const game = new Game();
    const mock = jest.fn();
    mock.mockResolvedValue('N');
    game._getUserInput = mock;
    await game.runPlayPhase();

    expect(game.getCurrentPhase()).toBe(Phase.attack);
});

test('Game.runPlayPhase - test bad input (![0-9])', () => {
    const game = new Game();
    const mock1 = jest.fn();
    mock1.mockResolvedValue('');
    game._getUserInput = mock1;

    expect(() => game.runPlayPhase()).rejects.toBe(TESTING_BREAKPOINT);

    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    const mock2 = jest.fn();
    mock2.mockResolvedValue('1');
    game._getUserInput = mock2;

    expect(() => game.runPlayPhase()).rejects.toBe(TESTING_BREAKPOINT);

    const mock3 = jest.fn();
    mock3.mockResolvedValue('also bad input');
    game._getUserInput = mock3;

    expect(() => game.runPlayPhase()).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.runPlayPhase - test loops good input ([0-9])', async () => {
    const game = new Game();
    const mock1 = jest.fn();
    mock1.mockResolvedValueOnce('0').mockResolvedValueOnce('n');
    game._getUserInput = mock1;

    const mock2 = jest.fn();
    game.castUsingMana = mock2;

    game.state.player1.hand = [new AquaHulcus(game.getGame, 'player1')];
    await game.runPlayPhase();

    expect(mock1).toBeCalledTimes(2);
    expect(mock2).toBeCalledWith(0);
});

// - Attack
test('Game.runAttackPhase - test end phase (N)', async () => {
    const game = new Game();
    const mock = jest.fn();
    mock.mockResolvedValue('N');
    game._getUserInput = mock;
    await game.runAttackPhase();

    expect(game.getCurrentPhase()).toBe(Phase.end);
});

test('Game.runAttackPhase - test bad input (![0-9])', () => {
    const game = new Game();

    // no input
    const mock1 = jest.fn();
    mock1.mockResolvedValue('');
    game._getUserInput = mock1;

    expect(() => game.runAttackPhase()).rejects.toBe(TESTING_BREAKPOINT);

    // invalid number
    const mock2 = jest.fn();
    mock2.mockResolvedValue('also bad input');
    game._getUserInput = mock2;

    expect(() => game.runAttackPhase()).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.runAttackPhase - test bad target', () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    // missing target
    const mock1 = jest.fn();
    mock1.mockResolvedValue('1');
    game._getUserInput = mock1;

    expect(() => game.runAttackPhase()).rejects.toBe(TESTING_BREAKPOINT);

    // input good, but target is tapped
    const mock2 = jest.fn();
    mock2.mockResolvedValue('0');
    game._getUserInput = mock2;
    game.tapCreature('player1', 0);

    expect(() => game.runAttackPhase()).rejects.toBe(TESTING_BREAKPOINT);

    // target cannot attack
    const card = new AquaHulcus(game.getGame, 'player1');
    (card as Card).cannotAttack = true;
    game.state.player1.battleZone = [card];

    expect(() => game.runAttackPhase()).rejects.toBe(TESTING_BREAKPOINT);
});

test('Game.runAttackPhase - test loops on good input ([0-9])', async () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn();

    await game.runAttackPhase();

    expect(game._getUserInput).toBeCalled;
    expect(game.findAttackTarget).toBeCalledWith(0);
});

test('Game.runAttackPhase - test attacking taps attacking creature', async () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.state.player2.shieldZone = [new AquaHulcus(game.getGame, 'player1')];

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(0);
    game.tapCreature = jest.fn().mockImplementation(() => {
        throw 1;
    });

    expect(() => game.runAttackPhase()).rejects.toBe(1);
});

test('Game.runAttackPhase - attacks player directly', () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(0);

    expect(() => game.runAttackPhase()).rejects.toBe(`player2 defeated!`);
});

test('Game.runAttackPhase - creature gets blocked', async () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(0);
    game.getBlockingCreature = jest.fn().mockResolvedValue(3);
    game.battleCreatures = jest.fn();

    await game.runAttackPhase();
    expect(game.battleCreatures).toBeCalledWith(0, 3);
});

test('Game.runAttackPhase - creature doesnt get blocked', () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(0);
    game.loseGame = jest.fn().mockImplementation(() => {
        throw 80085;
    });

    expect(() => game.runAttackPhase()).rejects.toBe(80085);
});

test('Game.runAttackPhase - creature attacks a shield', async () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.state.player2.shieldZone = [new AquaHulcus(game.getGame, 'player1')];

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(0);
    game.attackShield = jest.fn();

    await game.runAttackPhase();

    expect(game.attackShield).toBeCalledWith(0, 0);
});

test('Game.runAttackPhase - creature attacks a creature (with no shields)', async () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.state.player2.battleZone = [new AquaHulcus(game.getGame, 'player1')];

    game.tapCreature('player2', 0);

    // no shields
    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(1);
    game.battleCreatures = jest.fn();

    await game.runAttackPhase();
    expect(game.battleCreatures).toBeCalledWith(0, 0);
});

test('Game.runAttackPhase - creature attacks a creature (with shields)', async () => {
    const game = new Game();
    game.state.player1.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.state.player2.battleZone = [new AquaHulcus(game.getGame, 'player1')];
    game.state.player2.shieldZone = [new AquaHulcus(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];

    game.tapCreature('player2', 0);

    game._getUserInput = jest.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('N');
    game.findAttackTarget = jest.fn().mockResolvedValue(2);
    game.battleCreatures = jest.fn();

    await game.runAttackPhase();
    expect(game.battleCreatures).toBeCalledWith(0, 0);
});

// - End
test('Game.runEndPhase()', () => {
    const game = new Game();
    const currentplayer = game.getCurrentPlayerId();
    const opposingplayer = game.getOpposingPlayerId();
    expect(currentplayer).not.toBe(opposingplayer);

    const currentTurn = game.state.turnCount;

    game.runEndPhase();

    expect(game.getCurrentPhase()).toBe(Phase.start);
    expect(game.getCurrentPlayerId()).toBe(opposingplayer);
    expect(game.state.turnCount).toBe(currentTurn + 1);
});
