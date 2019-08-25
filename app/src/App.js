import React from 'react';
import { connect } from 'react-redux';

import Game from './components/Game';
import DeckBuilder from './components/DeckBuilder';
import { LOCAL_STORAGE_KEY, LIBRARY_KEY } from './settings';

import { getAppMode } from './reducers';
import { APP_MODES } from './reducers/app';
import * as actions from './actions/app/actions';

class App extends React.Component {
    state = { ready: false };

    componentDidMount() {
        this.setState({ ready: true });
    }

    resetSession = () => {
        this.setState({ ready: false });
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        delete window[LIBRARY_KEY];
        window.location.reload();
    };

    show = () => {
        const mode = this.props.getAppMode();
        switch (mode) {
            case APP_MODES.DECK_BUILDER:
                return <DeckBuilder duel={this.props.switchDuelMode} />;
            case APP_MODES.DUEL:
                return <Game buildDeck={this.props.switchBuildDeckMode} />;
            default:
                return null;
        }
    };

    render() {
        if (!this.state.ready) return null;
        return (
            <main>
                <div className="p-abs" style={{ right: 0 }}>
                    <button onClick={() => this.resetSession()}>Reset</button>
                </div>
                <this.show />
            </main>
        );
    }
}

export default connect(
    state => ({
        getAppMode: () => getAppMode(state),
    }),
    dispatch => ({
        switchBuildDeckMode: () => dispatch(actions.switchBuildDeckMode()),
        switchDuelMode: () => dispatch(actions.switchDuelMode()),
    }),
)(App);
