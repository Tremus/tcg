import Game from '../src/game';
import { Phase, Civilization } from '../src/types';
import AquaHulcus from '../src/cards/AquaHulcus';
import { TESTING_BREAKPOINT } from '../src/utils';

test('Correct environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
});

test('Runs out of cards and loses', () => {
    const game = new Game();
    expect(() => game.drawCard('player1')).toThrow('player1 defeated!');
});

// Methods

test('Game.drawCard()', () => {
    const game = new Game();
    game.state.player1.deck = [new AquaHulcus(game.getGame, 'player1'), new AquaHulcus(game.getGame, 'player1')];
    game.drawCard('player1');
    expect(game.state.player1.deck.length).toBe(1);
    expect(game.state.player1.hand.length).toBe(1);
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

// Phases
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

// TODO: runPlayPhase
// TODO: runAttackPhase

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
