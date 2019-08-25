import React from 'react';
import { connect } from 'react-redux';
import ActivePlayer from './ActivePlayer';
import InactivePlayer from './InactivePlayer';
import Modal from './Modal';

import { getCardLibrary } from '../utils/index';
import {
    changePhase,
    changeTurn,
    turnDraw,
    restartGame,
} from '../actions/game/actions';
import {
    getPhase,
    getActivePlayerNumber,
    getActivePlayer,
    getInactivePlayerNumber,
    getInactivePlayer,
    getDeck1,
    getDeck2,
} from '../reducers/index';

import { LOCAL_STORAGE_KEY, LIBRARY_KEY } from '../settings';
import { unique } from '../utils';

const keys = obj => Object.keys(obj);

class Game extends React.Component {
    state = {
        gameReady: false,
        selectedCard: undefined,
    };

    restartGame = () => {
        this.setState({ gameReady: false });
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        delete window[LIBRARY_KEY];
        window.location.reload();
    };

    async componentDidMount() {
        if (!window[LIBRARY_KEY]) {
            await this.initLibrary();
        }
        this.setState({ gameReady: true });
    }

    initLibrary = async () => {
        const deck1 = this.props.getDeck1();
        const deck2 = this.props.getDeck2();

        const pks = unique(keys(deck1).concat(keys(deck2)));

        const res = await fetch('http://localhost:5000/api/cards/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pks }),
        });
        const { data } = await res.json();
        let cards = {};

        for (let i = 0; i < data.cards.length; i++) {
            const card = data.cards[i];
            const { pk } = card;
            cards[pk] = card;
        }

        var library = [];

        for (const key in deck1) {
            const k = parseInt(key);
            for (let i = 0; i < deck1[k]; i++) {
                library.push(cards[k]);
            }
        }
        for (const key in deck2) {
            const k = parseInt(key);
            for (let i = 0; i < deck2[k]; i++) {
                library.push(cards[k]);
            }
        }

        window[LIBRARY_KEY] = library;
    };

    reinitLibrary = async () => {
        this.setState({ gameReady: false });
        await this.initLibrary();
        this.setState({ gameReady: true });
    };

    changePhase = () => {
        var phase = this.props.getPhase();

        if (phase < 6) {
            this.props.changePhase(phase + 1);
        } else {
            // End turn
            // Change Player
            const nextPhase = 1;
            const nextPlayer = this.props.getInactivePlayerNumber();
            this.props.changeTurn(nextPhase, nextPlayer);
        }
    };

    playerDefeated = playerNumber => {
        alert(`Player ${playerNumber} was defeated!`);
    };

    viewCardInModal = (e, idx) => {
        console.log(e.target);

        if (e.target.nodeName === 'IMG') {
            this.setState({ selectedCard: idx });
        }
    };

    closeViewCardInModal = () => {
        this.setState({ selectedCard: undefined });
    };

    render() {
        const { gameReady, selectedCard } = this.state;
        if (!gameReady || !window[LIBRARY_KEY]) return null;

        const phase = this.props.getPhase();
        const activePlayerNumber = this.props.getActivePlayerNumber();
        const inactivePlayerNumber = this.props.getInactivePlayerNumber();
        const activePlayerData = this.props.getActivePlayer();
        const inactivePlayerData = this.props.getInactivePlayer();
        console.log(selectedCard);

        return (
            <>
                {selectedCard && (
                    <Modal close={this.closeViewCardInModal}>
                        <img
                            src={`/assets/cards/${
                                getCardLibrary(selectedCard).imageName
                            }.jpg`}
                            alt={getCardLibrary(selectedCard).imageName}
                        />
                    </Modal>
                )}
                <div className="m-2">
                    <div className="p-2 d-f jc-sb">
                        <InactivePlayer
                            no={inactivePlayerNumber}
                            phase={phase}
                            playerDefeated={this.playerDefeated}
                            viewCardInModal={this.viewCardInModal}
                            {...inactivePlayerData}
                        />
                        <div>
                            <button
                                className="d-b mt-1"
                                onClick={this.reinitLibrary}
                            >
                                Reload Library
                            </button>
                            <button onClick={this.props.restartGame}>
                                Restart Game
                            </button>
                        </div>
                    </div>
                    <div className="p-2" style={{ backgroundColor: '#f7f7f9' }}>
                        <ActivePlayer
                            no={activePlayerNumber}
                            phase={phase}
                            changePhase={this.changePhase}
                            viewCardInModal={this.viewCardInModal}
                            {...activePlayerData}
                        />
                    </div>
                </div>
            </>
        );
    }
}

export default connect(
    state => ({
        getPhase: () => getPhase(state),
        getActivePlayerNumber: () => getActivePlayerNumber(state),
        getActivePlayer: () => getActivePlayer(state),
        getInactivePlayerNumber: () => getInactivePlayerNumber(state),
        getInactivePlayer: () => getInactivePlayer(state),
        getDeck1: () => getDeck1(state),
        getDeck2: () => getDeck2(state),
    }),
    dispatch => ({
        changePhase: phase => dispatch(changePhase(phase)),
        changeTurn: (phase, activePlayerNumber) =>
            dispatch(changeTurn(phase, activePlayerNumber)),
        turnDraw: () => dispatch(turnDraw()),
        restartGame: () => dispatch(restartGame()),
    }),
)(Game);
