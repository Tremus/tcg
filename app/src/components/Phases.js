import React from 'react';
import Modal from './Modal';

const phaseTitles = ['Start', 'Draw', 'Mana', 'Cast', 'Attack', 'End'];

const phaseInfo = [
    <ul>
        <li>
            Don't do anything during this step of your turn if you don't have
            any tapped creatures in the battle zone or tapped cards in your mana
            zone. Tapped cards are cards that you turned sideways on a previous
            turn to show you used them for something. You won't usually have any
            tapped cards until you have already played a couple turns of the
            game. If you have any tapped cards, untap them now to show that you
            get to use those cards again this turn. After this, effects that
            happen at the start of the turn trigger.
        </li>
    </ul>,
    <ul>
        <li>
            Only the person who plays first skips drawing a card on his first
            turn. Drawing a card means taking it from the top of your deck and
            putting it into your hand. As soon as you draw the last card of your
            deck, you lose.
        </li>
    </ul>,
    <ul>
        <li>
            You can put only 1 card (of any type) into your mana zone from your
            hand each turn, unless a spell or effect allows you to put more. You
            don't have to put a card into your mana zone each turn if you don't
            want to. There's no limit to the number of cards you can have in
            your mana zone.
        </li>
        <li>
            Put the card into your mana zone upside down so you can read its
            mana number. Cards in your mana zone can give you mana to use. Mana
            is used to summon creatures, cast spells, generate cross gear, and
            put castles into your shield zone. Cards in your mana zone can't do
            anything but give you mana. Ignore all the text on them except for
            their mana value (and any Mana Reburst abilities).
        </li>
    </ul>,
    <ul>
        <li>
            You can play as many creatures, spells, cross gears, and castles as
            your mana zone can afford during this step. You can play any card in
            any order.
        </li>
    </ul>,
    <ul>
        <li>
            You can attack with your creatures in the battle zone. You can't
            attack with creatures you just put into the battle zone this turn
            because they have summoning sickness. As many of your creatures as
            you want can attack each turn. Choose one, have it attack, choose
            another one, have that one attack, and so on.
        </li>
        <li>
            You can't summon creatures, cast spells, generate or cross cross
            gear, or fortify shields with castles after one of your creatures
            attacks.
        </li>
    </ul>,
    <ul>
        <li>
            Tell your opponent that you are finished with your turn. Now it's
            your opponent's turn! Continue taking turns until one of you wins
            the game.
        </li>
    </ul>,
];

export default class extends React.Component {
    state = { modal: false };

    handleClick = () => {
        this.setState({ modal: !this.state.modal });
    };

    render() {
        const { phase } = this.props;
        return (
            <>
                <h3 style={{ cursor: 'help' }} onClick={this.handleClick}>
                    {phase}. {phaseTitles[phase - 1]}
                </h3>
                {this.state.modal ? (
                    <Modal close={this.handleClick}>
                        <div style={{ maxWidth: 400 }}>
                            {phaseInfo[phase - 1]}
                        </div>
                    </Modal>
                ) : null}
            </>
        );
    }
}
