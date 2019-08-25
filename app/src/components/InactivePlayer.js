import React from 'react';
import { connect } from 'react-redux';
import { DisplayShield, DisplayCreature, CardButton } from './Card';
import { getActivePlayerAttacking } from '../reducers/index';
import * as actions from '../actions/game/actions';
import * as gamePhases from '../utils/phases';

class InactivePlayer extends React.Component {
    get displayName() {
        return `Player ${this.props.no}`;
    }

    get isBattlePhase() {
        return this.props.phase === gamePhases.BATTLE_PHASE;
    }

    get hasShields() {
        return !!this.props.shieldZone.length;
    }

    defeated() {
        this.props.playerDefeated(this.props.no);
    }

    renderShieldZone = () => {
        const { shieldZone } = this.props;
        return (
            <div
                className="ml-2 p-1"
                style={{ backgroundColor: '#f9f9f9', borderRadius: 6 }}
            >
                <div className="fs-12">
                    <i>Shields</i> ({shieldZone.length})
                </div>
                <div className="c-white d-f">
                    {shieldZone.map(c => (
                        <DisplayShield key={`ip-szone-${c}`} idx={c}>
                            <this.getShieldButton idx={c} />
                        </DisplayShield>
                    ))}
                </div>
            </div>
        );
    };

    getShieldButton = ({ idx }) => {
        if (this.isBattlePhase) {
            const isBeingAttacked = this.props.getActivePlayerAttacking();
            if (isBeingAttacked) {
                return (
                    <CardButton
                        onClick={() => this.props.creatureBreakShield(idx)}
                    >
                        Break
                    </CardButton>
                );
            }
        }
        return null;
    };

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
                            key={`ip-bzone-${c.idx}`}
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

    getCreatureButton = ({ idx, tapped }) => {
        if (this.isBattlePhase) {
            const isBeingAttacked = this.props.getActivePlayerAttacking();
            if (isBeingAttacked && tapped) {
                return (
                    <CardButton
                        onClick={() => this.props.creatureAttackCreature(idx)}
                    >
                        Attack
                    </CardButton>
                );
            }
        }
        return null;
    };

    render() {
        const { deck, hand } = this.props;
        if (!this.hasShields) {
            this.defeated();
        }

        return (
            <div>
                <div className="d-f">
                    <div>
                        <div>{this.displayName}</div>
                        <div>Deck ({deck.length})</div>
                        <div>Hand ({hand.length})</div>
                    </div>

                    <this.renderShieldZone />
                </div>
                <this.renderBattleZone />
            </div>
        );
    }
}

export default connect(
    state => ({
        getActivePlayerAttacking: () => getActivePlayerAttacking(state),
    }),
    dispatch => ({
        creatureBreakShield: shieldIdx =>
            dispatch(actions.creatureBreakShield(shieldIdx)),
        creatureAttackCreature: creatureIdx =>
            dispatch(actions.creatureAttackCreature(creatureIdx)),
    }),
)(InactivePlayer);
