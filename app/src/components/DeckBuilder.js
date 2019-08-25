import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Modal from './Modal';
import {
    getActiveDeckNumber,
    getActiveDeck,
    getInactiveDeck,
} from '../reducers';
import * as actions from '../actions/deck/actions';

const IncrementButtonStyled = styled.button`
    border: none;
    background: none;
    font-size: 20px;
    font-family: monospace;
`;

const DeckNavColumn = styled.div`
    height: 100vh;
    overflow-y: scroll;
    background-color: #e4e4e4;
    margin-right: 20px;
    min-width: 140px;
`;

const PageContainer = styled.div`
    height: 100vh;
    overflow-y: scroll;
`;

const Card = ({
    pk,
    imageName,
    onClick,
    dir = 'thumbs',
    count = 0,
    deckTotal,
    increment,
    decrement,
}) => (
    <div className="p-2">
        <div>
            <img
                src={`/assets/${dir}/${imageName}.jpg`}
                alt={imageName}
                onClick={onClick}
            />
        </div>
        <div className="d-f jc-c">
            <IncrementButtonStyled
                className="c-red"
                onClick={() => decrement(pk)}
                disabled={count === 0}
            >
                -
            </IncrementButtonStyled>
            <div className="mx-1">{count}</div>
            <IncrementButtonStyled
                className="c-green"
                onClick={() => increment(pk)}
                disabled={count === 4 || deckTotal === 40}
            >
                +
            </IncrementButtonStyled>
        </div>
    </div>
);

const CardModal = ({ close, ...rest }) => (
    <Modal close={close}>
        <Card dir="cards" {...rest} />
    </Modal>
);

const countDeck = deck => Object.values(deck).reduce((a, b) => a + b, 0);

class DeckBuilder extends React.Component {
    state = {
        page: 1,
        cards: [],
        count: undefined,
        selectedCard: undefined,
        deck: {},
    };

    async componentDidMount() {
        await this.getFirstList();
    }

    get numPages() {
        const { count } = this.state;
        if (count) {
            return Math.ceil(count / 20);
        }
        return undefined;
    }

    get numCards() {
        return this.state.cards.length;
    }

    get hasNextCursor() {
        const { count } = this.state;
        return !!count && this.numCards < count;
    }

    get findSelectedCard() {
        return this.state.cards[this.state.selectedCard - 1];
    }

    get deckTotal() {
        return countDeck(this.props.getActiveDeck());
    }

    get decksReady() {
        return (
            this.deckTotal === 40 &&
            countDeck(this.props.getInactiveDeck()) === 40
        );
    }

    getFirstList = async () => {
        const res = await fetch('http://localhost:5000/api/cards/0/');
        const { data } = await res.json();
        const { edges, cursor, count } = data.cards;
        this.setState({ cards: edges, cursor, count });
    };

    changePage = async page => {
        if (page > this.state.page || page * 20 > this.numCards) {
            await this.getNextList(page);
        } else {
            this.setState({ page });
        }
    };

    viewCardInModal = selectedCard => {
        this.setState({ selectedCard });
    };

    getNextList = async page => {
        const { after } = this.state.cursor;
        const res = await fetch(`http://localhost:5000/api/cards/${after}/`);
        const { data } = await res.json();
        const { edges, cursor } = data.cards;
        this.setState({ page, cards: [...this.state.cards, ...edges], cursor });
    };

    findCard = pk => {
        return this.state.cards.find(c => c.pk === pk);
    };

    render() {
        if (!this.numCards) return null;
        const deck = this.props.getActiveDeck();

        const { cards, count, page } = this.state;
        const numPages = this.numPages;
        const deckTotal = this.deckTotal;

        let cardModal;
        if (this.state.selectedCard) {
            cardModal = this.findCard(this.state.selectedCard);
        }
        console.log(deck);

        return (
            <>
                {cardModal && (
                    <CardModal
                        {...cardModal}
                        close={() => this.viewCardInModal(undefined)}
                        count={deck[cardModal.pk] || 0}
                        deckTotal={deckTotal}
                        increment={this.props.addCardToDeck}
                        decrement={this.props.removeCardFromDeck}
                    />
                )}
                <div className="d-f">
                    <DeckNavColumn>
                        {Object.entries(deck).map(vals => {
                            const [pk, amt] = vals;
                            const pkInt = parseInt(pk);
                            const navCardData = cards.find(c => c.pk === pkInt);
                            return (
                                <Card
                                    key={`card-nav-${pk}`}
                                    onClick={() => this.viewCardInModal(pkInt)}
                                    count={amt || 0}
                                    deckTotal={deckTotal}
                                    increment={this.props.addCardToDeck}
                                    decrement={this.props.removeCardFromDeck}
                                    {...navCardData}
                                />
                            );
                        })}
                    </DeckNavColumn>

                    <PageContainer>
                        {/* DECK SELECT */}
                        <div className="d-f">
                            <div className="mr-1">Decks:</div>
                            <button
                                className="mr-1"
                                onClick={() => this.props.switchDeck(1)}
                            >
                                1
                            </button>
                            <button onClick={() => this.props.switchDeck(2)}>
                                2
                            </button>
                        </div>

                        {/* TITLE */}
                        <div className="d-f my-1">
                            <h3 className="my-0 mr-2">
                                Deck {this.props.getActiveDeckNumber()}:
                            </h3>
                            <div>({deckTotal} / 40)</div>
                            <div className="ml-1">
                                <button onClick={() => this.props.clearDeck()}>
                                    Clear
                                </button>
                            </div>
                            {this.decksReady && (
                                <button onClick={this.props.duel}>
                                    Start Game
                                </button>
                            )}
                        </div>

                        {/* CARDS */}
                        <div className="d-f fw-wrap jc-c">
                            {cards.slice(page * 20 - 20, page * 20).map(c => (
                                <Card
                                    key={`card-page-${c.pk}`}
                                    {...c}
                                    onClick={() => this.viewCardInModal(c.pk)}
                                    count={deck[c.pk] || 0}
                                    deckTotal={deckTotal}
                                    increment={this.props.addCardToDeck}
                                    decrement={this.props.removeCardFromDeck}
                                />
                            ))}
                        </div>

                        {/* PAGE BUTTONS */}
                        <div>
                            <div className="ta-c">Total: {count}</div>
                            <div className="d-f jc-c mt-1">
                                <button
                                    onClick={() => this.changePage(page - 1)}
                                    disabled={page === 1}
                                >
                                    Previous Page
                                </button>
                                <div className="ml-1 mr-1">
                                    Page {page} / {numPages}
                                </div>
                                <button
                                    onClick={() => this.changePage(page + 1)}
                                    disabled={page === numPages}
                                >
                                    Next Page
                                </button>
                            </div>
                        </div>
                    </PageContainer>
                </div>
            </>
        );
    }
}

export default connect(
    state => ({
        getActiveDeckNumber: () => getActiveDeckNumber(state),
        getActiveDeck: () => getActiveDeck(state),
        getInactiveDeck: () => getInactiveDeck(state),
    }),
    dispatch => ({
        switchDeck: activeDeckNumber =>
            dispatch(actions.setActiveDeckNumber(activeDeckNumber)),
        addCardToDeck: pk => dispatch(actions.addCardToDeck(pk)),
        removeCardFromDeck: pk => dispatch(actions.removeCardFromDeck(pk)),
        clearDeck: () => dispatch(actions.clearDeck()),
    }),
)(DeckBuilder);
