import React from 'react';
import { connect } from 'react-redux';

import {
    getLibrary,
    DisplayDeck,
    CardHand,
    DisplayMana,
    DisplayShield,
    DisplayCreature,
    CardButton,
} from './Card';
import Phases from './Phases';
import * as actions from '../actions/game/actions';
import * as gamePhases from '../utils/phases';

class ActivePlayer extends React.Component {
    get displayName() {
        return `Player ${this.props.no}`;
    }

    get isStartPhase() {
        return this.props.phase === gamePhases.START_PHASE;
    }

    get isDrawPhase() {
        return this.props.phase === gamePhases.DRAW_PHASE;
    }

    get isManaPhase() {
        return this.props.phase === gamePhases.MANA_PHASE;
    }

    get isCastingPhase() {
        return this.props.phase === gamePhases.CASTING_PHASE;
    }

    get isBattlePhase() {
        return this.props.phase === gamePhases.BATTLE_PHASE;
    }

    get hasTurnMana() {
        return this.props.manaZone.some(c => c.turnMana);
    }

    get isCasting() {
        return this.props.hand.some(c => c.selected);
    }

    get isAttacking() {
        return this.props.battleZone.some(c => c.selected);
    }

    get castingRequirementsMet() {
        const card = this.props.hand.find(c => c.selected);
        const { manaCost } = getLibrary()[card.idx];
        const totalSelectedMana = this.props.manaZone.filter(c => c.selected)
            .length;
        if (totalSelectedMana < manaCost) {
            return false;
        } else if (totalSelectedMana === manaCost) {
            return true;
        } else {
            throw new Error('Too much mana seleced for casting');
        }
    }

    changePhase = () => {
        // var { manaZone } = this.props;
        if (this.isStartPhase) {
            this.props.cleanupStartTurn();
        } else if (this.isDrawPhase && !this.props.hasTurnDraw) {
            alert('Must Draw');
            return;
        } else if (this.isManaPhase) {
            // Cleanup mana zone
            this.props.cleanupManaPhase();
        } else if (this.isCastingPhase) {
            if (this.isCasting) {
                this.props.cleanupCastingPhase();
            }
        } else if (this.isBattlePhase) {
            if (this.isAttacking) {
                this.props.cleanupBattlePhase();
            }
        }
        this.props.changePhase();
    };

    turnDraw = () => {
        if (!this.isDrawPhase)
            throw new Error('Cannot turn draw outside of draw phase!');
        if (this.props.hasTurnDraw)
            throw new Error(
                `${this.displayName} has already had their turn draw`,
            );
        this.props.turnDraw();
    };

    renderDeck = () => {
        const { hasTurnDraw, deck } = this.props;
        return (
            <DisplayDeck>
                <div>Deck: ({deck.length})</div>
                {this.isDrawPhase && !hasTurnDraw ? (
                    <CardButton onClick={this.turnDraw}>Draw</CardButton>
                ) : null}
            </DisplayDeck>
        );
    };

    // HAND
    renderHand = () => {
        const { hand } = this.props;
        return (
            <div>
                <div className="fs-12">
                    <i>Hand</i> ({hand.length})
                </div>
                <div className="c-white" style={{ display: 'flex' }}>
                    {hand.map(c => (
                        <CardHand
                            key={`ap-hand-${c.idx}`}
                            idx={c.idx}
                            view={this.props.viewCardInModal}
                        >
                            <this.getHandButton {...c} />
                        </CardHand>
                    ))}
                </div>
            </div>
        );
    };

    getHandButton = ({ idx, selected }) => {
        if (this.isManaPhase && !this.hasTurnMana) {
            return (
                <CardButton onClick={() => this.props.addTurnMana(idx)}>
                    Mana
                </CardButton>
            );
        } else if (this.isCastingPhase) {
            if (!this.isCasting) {
                return (
                    <CardButton
                        onClick={() => this.props.selectForCasting(idx)}
                    >
                        Select
                    </CardButton>
                );
            } else if (selected) {
                return (
                    <>
                        <CardButton
                            onClick={() => this.props.undoSelectForCasting(idx)}
                        >
                            Cancel
                        </CardButton>
                        {this.castingRequirementsMet && (
                            <CardButton onClick={() => this.props.cast(idx)}>
                                Cast
                            </CardButton>
                        )}
                    </>
                );
            }
        }

        return null;
    };

    // SHIELD
    renderShieldZone = () => {
        const { shieldZone } = this.props;
        return (
            <div>
                <div className="fs-12 ta-c">
                    <i>Shields</i> ({shieldZone.length})
                </div>
                <div className="c-white d-f jc-c">
                    {shieldZone.map(c => (
                        <DisplayShield key={`ap-szone-${c}`} />
                    ))}
                </div>
            </div>
        );
    };

    // MANA
    renderManaZone = () => {
        const { manaZone } = this.props;
        const availableMana = manaZone.filter(c => !c.tapped).length;
        return (
            <div>
                <div className="fs-12 ta-c">
                    <i>Mana</i> ({availableMana} / {manaZone.length})
                </div>
                <div className="c-white d-f jc-c">
                    {manaZone.map(c => (
                        <DisplayMana
                            key={`ap-mzone-${c.idx}`}
                            view={this.props.viewCardInModal}
                            {...c}
                        >
                            <this.getManaButton {...c} />
                        </DisplayMana>
                    ))}
                </div>
            </div>
        );
    };

    getManaButton = ({ idx, tapped, selected, turnMana }) => {
        if (this.isManaPhase) {
            if (turnMana) {
                return (
                    <CardButton onClick={() => this.props.undoAddTurnMana(idx)}>
                        Undo
                    </CardButton>
                );
            }
        } else if (this.isCastingPhase) {
            if (this.isCasting) {
                if (!tapped && !selected && !this.castingRequirementsMet) {
                    return (
                        <CardButton
                            onClick={() => this.props.tapManaForCasting(idx)}
                        >
                            Tap
                        </CardButton>
                    );
                } else if (tapped && selected) {
                    return (
                        <CardButton
                            onClick={() => this.props.untapManaForCasting(idx)}
                        >
                            Untap
                        </CardButton>
                    );
                }
            }
        }
        return null;
    };

    // BATTLE
    renderBattleZone = () => {
        const { battleZone } = this.props;
        return (
            <div>
                <div className="fs-12 ta-c">
                    <i>Battle Zone</i> ({battleZone.length})
                </div>
                <div className="c-white d-f jc-c">
                    {battleZone.map(c => (
                        <DisplayCreature
                            key={`ap-bzone-${c.idx}`}
                            view={this.props.viewCardInModal}
                            {...c}
                        >
                            <this.getCreatureButton {...c} />
                        </DisplayCreature>
                    ))}
                </div>
            </div>
        );
    };

    getCreatureButton = ({ idx, tapped, selected, summoningSickness }) => {
        if (this.isBattlePhase && !summoningSickness && !tapped) {
            if (!this.isAttacking) {
                return (
                    <CardButton
                        onClick={() => this.props.selectForAttacking(idx)}
                    >
                        Attack
                    </CardButton>
                );
            }
            if (selected) {
                return (
                    <CardButton
                        onClick={() => this.props.deselectForAttacking(idx)}
                    >
                        Undo
                    </CardButton>
                );
            }
        }
        return null;
    };

    render() {
        return (
            <div>
                <div className="d-f jc-sb">
                    <div className="fs-12">
                        Active Player: {this.displayName}
                    </div>
                    <this.renderBattleZone />

                    <div>
                        <CardButton onClick={this.changePhase}>
                            Next Phase
                        </CardButton>
                        <Phases phase={this.props.phase} />
                    </div>
                </div>
                <div>
                    <this.renderShieldZone />
                    <this.renderManaZone />
                </div>
                <div className="p-rel">
                    <this.renderHand />
                    <div className="p-abs" style={{ right: 0, bottom: 0 }}>
                        <this.renderDeck />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    null,
    dispatch => ({
        // PHASES
        turnDraw: () => dispatch(actions.turnDraw()),
        cleanupStartTurn: () => dispatch(actions.cleanupStartTurn()),
        cleanupManaPhase: () => dispatch(actions.cleanupManaPhase()),
        cleanupCastingPhase: () => dispatch(actions.cleanupCastingPhase()),
        cleanupBattlePhase: () => dispatch(actions.cleanupBattlePhase()),
        // MANA
        addTurnMana: idx => dispatch(actions.addTurnMana(idx)),
        undoAddTurnMana: idx => dispatch(actions.undoAddTurnMana(idx)),
        // CASTING
        selectForCasting: idx => dispatch(actions.selectForCasting(idx)),
        undoSelectForCasting: idx =>
            dispatch(actions.undoSelectForCasting(idx)),
        tapManaForCasting: idx => dispatch(actions.tapManaForCasting(idx)),
        untapManaForCasting: idx => dispatch(actions.untapManaForCasting(idx)),
        cast: idx => dispatch(actions.cast(idx)),
        // BATTLE
        selectForAttacking: idx => dispatch(actions.selectForAttacking(idx)),
        deselectForAttacking: idx =>
            dispatch(actions.deselectForAttacking(idx)),
    }),
)(ActivePlayer);
