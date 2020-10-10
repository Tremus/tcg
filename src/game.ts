import { Civilization, Phase, PlayerId, Card, Player, GameState, GameAttributes } from './types';
import { getNumberBetween, getEmptyPlayer, getUserInput, TESTING_BREAKPOINT } from './utils';
import Library from './library';

const { NODE_ENV } = process.env;

/** SETUP */
// Shuffle 2 decks
// Add 5 cards to shields
// Add 5 cards to hand
// Decide who plays first

/** TURN */
// 1. Start
// 1.1 Player untaps creates & mana
// 1.2 Trigger start turn effects

// 2. Draw
// 2.1 If player is playing first they skip their first draw step
// 2.2 (DRAW STEP) Player MUST draw cards equal to their 'turnDrawCount' (if final card is drawn, lose game)

// 3. Mana
// 3.1 Player may add cards to their mana zone from their hand equal to their 'turnManaCount'
// 3.2 Trigger callback event for adding mana

// 4. Play cards
// 4.1 Player may play any number of cards from their hand
// 4.1.1 Tap mana equal to card cost. At least 1 mana must match the Ciivilization of the card being played
// 4.1.1 Trigger onCast() function on card

// 5. Attack with creatures
// 5.1 Player selects any number of eligible creatures to attack (eg. canAttack = true)
// 5.2 Player selects eligible target (creature / shield(s))
// 5.2.1 Trigger onAttack() effect of attacker
// 5.2.2 Trigger onOtherCreatureAttack() effect of other creatures
// if creature
// 5.2.3 Trigger onTargetedByCreature() effect of attacked creture
// elif shield
// 5.2.3 Trigger onShieldTrigger() effect of shield

// 6. End Turn
// 6.1 Trigger onEndTurn() effect

export default class Game implements GameAttributes {
    _getUserInput = getUserInput;

    getGame = () => this;
    state: GameState;

    constructor() {
        this.state = {
            turnCount: 1,
            player1: getEmptyPlayer(),
            player2: getEmptyPlayer(),
            activePlayer: 'player1',
            phase: Phase.start,
        };
    }

    // GET / SET
    getCurrentPlayer(): Player {
        return this.state[this.state.activePlayer];
    }
    getOpposingPlayer(): Player {
        if (this.state.activePlayer === 'player1') return this.state.player2;
        return this.state.player1;
    }
    getCurrentPlayerId(): PlayerId {
        return this.state.activePlayer;
    }
    getOpposingPlayerId(): PlayerId {
        if (this.getCurrentPlayerId() === 'player1') return 'player2';
        return 'player1';
    }
    getCurrentPhase(): Phase {
        return this.state.phase;
    }
    setCurrentPhase(nextPhase: Phase) {
        this.state.phase = nextPhase;
    }
    setCurrentPlayer(playerId: PlayerId) {
        this.state.activePlayer = playerId;
    }

    // PHASES
    // TODO: write and test
    setup() {
        // restarts the game
        // TODO:
        // Build 2 dedcks
        // Shuffle 2 decks
        // Add 5 cards to shields
        // Add 5 cards to hand
        // Determine first player
        this.state.turnCount = 1;
        this.setCurrentPlayer(this._determineFirstPlayer());
    }

    private _determineFirstPlayer(): PlayerId {
        const isPlayer1 = getNumberBetween(0, 1);
        if (isPlayer1) return 'player1';
        return 'player2';
    }

    private _toggleActivePlayer() {
        if (this.state.activePlayer === 'player1') {
            this.state.activePlayer = 'player2';
        } else {
            this.state.activePlayer = 'player1';
        }
    }

    async run() {
        // runs continuously
        while (true) {
            if (this.state.phase === Phase.start) {
                await this.runStartPhase();
            } else if (this.state.phase === Phase.draw) {
                this.runDrawPhase();
            } else if (this.state.phase === Phase.mana) {
                await this.runManaPhase();
            } else if (this.state.phase === Phase.play) {
                await this.runPlayPhase();
            } else if (this.state.phase === Phase.attack) {
                await this.runAttackPhase();
            } else if (this.state.phase === Phase.end) {
                this.runEndPhase();
            }
        }
    }

    async runStartPhase() {
        // 1. Start
        const currentPlayerId = this.getCurrentPlayerId();

        while (true) {
            const numManaZone = this.state[currentPlayerId].manaZone.length;
            const numBattleZone = this.state[currentPlayerId].battleZone.length;
            const totalUntapped = numManaZone + numBattleZone;

            // 1.1 Player untaps creates & mana
            // TODO: Display manaZone followed by battleZone. eg.
            // - manaZone:
            // [0] AquaHulcus
            // [1] AquaHulcus
            // - battleZone:
            // [2] AquaHulcus
            // [3] AquaHulcus
            const input = await this._getUserInput(
                'Enter a list of cards to untap seperated by a comma ([0-9+]: Target card, [Y]: Untap all, [N]: End phase)',
            );
            if (!input) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            if (input.toLowerCase() === 'n') {
                break;
            }
            if (input.toLowerCase() === 'y') {
                for (let i = 0; i < numManaZone; i++) {
                    this.untapMana(currentPlayerId, i);
                }
                for (let i = 0; i < numBattleZone; i++) {
                    this.untapCreature(currentPlayerId, i);
                }
                break;
            }
            const ids = this._parseIdsList(input);
            if (!ids.length) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            for (let i = 0; i < ids.length; i++) {
                const idx = ids[i];
                if (idx < numManaZone) {
                    this.untapMana(currentPlayerId, i);
                } else if (idx < totalUntapped) {
                    this.untapCreature(currentPlayerId, idx - numManaZone);
                }
            }
        }
        // 1.2 Trigger start turn effects

        this.setCurrentPhase(Phase.draw);
    }

    runDrawPhase() {
        // 2. Draw
        // 2.1 If player is playing first they skip their first draw step
        if (this.state.turnCount > 1) {
            // 2.2 (DRAW STEP) Player MUST draw cards equal to their 'turnDrawCount' (if final card is drawn, lose game)
            for (let i = 0; i < this.getCurrentPlayer().turnDrawCount; i++) {
                this.drawCard(this.getCurrentPlayerId());
            }
        }

        this.setCurrentPhase(Phase.mana);
    }

    async runManaPhase() {
        // 3. Mana
        let manaAdded = 0;

        while (true) {
            // 3.1 Player may add cards to their mana zone from their hand equal to their 'turnManaCount'
            const input = await this._getUserInput(
                'Select a card to add to your mana zone ([0-9+]: Target card, [N]: End phase)',
            );
            if (!input) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            if (input.toLowerCase() === 'n') {
                break;
            }
            const idx = parseInt(input);
            if (isNaN(idx) || idx >= this.getCurrentPlayer().hand.length) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }

            this.addManaFromHand(this.getCurrentPlayerId(), idx);
            manaAdded++;

            if (manaAdded >= this.getCurrentPlayer().turnManaCount) {
                break;
            }
            // TODO:
            // 3.2 Trigger callback event for adding mana
        }
        this.setCurrentPhase(Phase.play);
    }

    async runPlayPhase() {
        // 4. Play cards
        // 4.1 Player may play any number of cards from their hand
        while (true) {
            const input = await this._getUserInput(
                'Select a creature or spell to play ([0-9+]: Target card, [N]: End phase)',
            );
            if (!input) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            if (input.toLowerCase() === 'n') {
                break;
            }
            const idx = parseInt(input);
            if (isNaN(idx) || idx >= this.getCurrentPlayer().hand.length) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            // NOTE: cont.. in castUsingMana
            await this.castUsingMana(idx);
        }
        this.setCurrentPhase(Phase.attack);
    }

    async runAttackPhase() {
        // 5. Attack with creatures
        // 5.1 Player selects any number of eligible creatures to attack (eg. canAttack = true)
        while (true) {
            // 3.1 Player may add cards to their mana zone from their hand equal to their 'turnManaCount'
            const input = await this._getUserInput(
                'Select a creature to attack with ([0-9+]: Target card, [N]: End phase)',
            );
            if (!input) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            if (input.toLowerCase() === 'n') {
                break;
            }
            const idx = parseInt(input);
            if (isNaN(idx) || idx >= this.getCurrentPlayer().battleZone.length) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }

            const card = this.getCurrentPlayer().battleZone[idx];
            if (!card || card.isTapped || card.cantAttack) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }

            // 5.2 Player selects eligible target (creature / shield(s))
            // Notes conitnued in funtion
            await this.findAttackTarget(idx);
        }

        this.setCurrentPhase(Phase.end);
    }

    runEndPhase() {
        // 6. End Turn
        // 6.1 Trigger onEndTurn() effect
        this._toggleActivePlayer();
        this.setCurrentPhase(Phase.start);
        this.state.turnCount++;
    }

    // METHODS
    private loseGame(targetPlayer: PlayerId) {
        throw `${targetPlayer} defeated!`;
    }
    drawCard(targetPlayer: PlayerId) {
        if (!this.state[targetPlayer].deck.length) this.loseGame(targetPlayer);
        const card = this.state[targetPlayer].deck.pop();
        this.state[targetPlayer].hand.push(Library.getCard(card.no, this.getGame, targetPlayer));
        if (!this.state[targetPlayer].deck.length) this.loseGame(targetPlayer);
    }
    popCard(arr: Array<Card>, idx: number): Card {
        const cards = arr.splice(idx, 1);
        return cards[0];
    }
    _parseIdsList(str: string): Array<number> {
        if (!str.match(/^[0-9,]+$/)) {
            if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
            return [];
        }
        const pieces = str.split(',');
        const nums: Array<number> = [];
        for (let i = 0; i < pieces.length; i++) {
            if (!pieces[i]) continue;
            nums.push(parseInt(pieces[i]));
        }
        return nums;
    }
    addManaFromHand(targetPlayer: PlayerId, idx: number) {
        const card = this.popCard(this.state[targetPlayer].hand, idx);
        this.state[targetPlayer].manaZone.push(Library.getCard(card.no, this.getGame, targetPlayer));
    }
    addCreatureFromHandToBattleZone(targetPlayer: PlayerId, idx: number) {
        const card = this.popCard(this.state[targetPlayer].hand, idx);
        this.state[targetPlayer].battleZone.push(Library.getCard(card.no, this.getGame, targetPlayer));
    }
    tapMana(targetPlayer: PlayerId, idx: number): Civilization {
        this.state[targetPlayer].manaZone[idx].isTapped = true;
        return this.state[targetPlayer].manaZone[idx].civilization;
    }
    untapMana(targetPlayer: PlayerId, idx: number) {
        this.state[targetPlayer].manaZone[idx].isTapped = false;
    }
    tapCreature(targetPlayer: PlayerId, idx: number) {
        this.state[targetPlayer].battleZone[idx].isTapped = true;
    }
    untapCreature(targetPlayer: PlayerId, idx: number) {
        this.state[targetPlayer].battleZone[idx].isTapped = false;
    }
    async castUsingMana(idx: number) {
        const targetPlayer = this.getCurrentPlayerId();
        const card = this.getCurrentPlayer().hand[idx];
        const targetCivilization = card.civilization;
        const manaCost = card.manaCost;

        while (true) {
            // 4.1.1 Tap mana equal to card cost. At least 1 mana must match the Ciivilization of the card being played
            const input = await this._getUserInput(
                'Select mana to use for casting ([0-9+]: Target card, [N]: Cancel casting)',
            );
            if (!input) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            if (input.toLowerCase() === 'n') {
                break;
            }
            // Test ids are valid
            const ids = this._parseIdsList(input);
            if (ids.length !== manaCost || new Set(ids).size !== ids.length) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }
            let hasCivilization = false;
            let isBadId = false;
            for (const i of ids) {
                const mana = this.getCurrentPlayer().manaZone[i];
                if (!mana || mana.isTapped) {
                    if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                    isBadId = true;
                    break;
                }
                if (mana.civilization === targetCivilization) {
                    hasCivilization = true;
                }
            }
            if (!hasCivilization || isBadId) {
                if (NODE_ENV === 'test') throw TESTING_BREAKPOINT;
                continue;
            }

            // Tap mana
            for (const i of ids) {
                this.tapMana(targetPlayer, i);
            }

            // if creature add to battleZone
            if (card.type === 'Creature') {
                this.addCreatureFromHandToBattleZone(targetPlayer, idx);
            }

            // 4.1.1 Trigger onCast() function on card
            if ('onCast' in card) {
                card.onCast();
            }
            break;
        }
    }
    // TODO: write and test
    async findAttackTarget(attackingCreatureId: number) {
        // 5.2.1 Trigger onAttack() effect of attacker
        // 5.2.2 Trigger onOtherCreatureAttack() effect of other creatures
        // if creature
        // 5.2.3 Trigger onTargetedByCreature() effect of attacked creture
        // elif shield
        // 5.2.3 Trigger onShieldTrigger() effect of shield
    }
}
