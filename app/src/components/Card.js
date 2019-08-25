import React from 'react';
import styled from 'styled-components';

import { LIBRARY_KEY } from '../settings';
import { getCardLibrary } from '../utils';

const Shield = styled.div`
    background: #bee3f5;
    height: 70px;
    width: 58px;
    padding: 8px;
    border-radius: 4px;
`;

export const Deck = styled.div`
    background: #2453ff;
    height: 100px;
    width: 80px;
    padding: 8px;
    border-radius: 4px;
    color: white;
`;

export const CardButton = styled.button`
    border-radius: 6px;
    font-weight: 600;
    padding: 8px;
    background-color: #f1f1f1;
    font-size: 11px;
`;

const CardWrap = styled.div`
    margin: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;

    ${CardButton} {
        margin-top: 8px;

        &:first-child {
            margin-top: 0;
        }
    }
`;
const ManaCardWrap = styled.div`
    position: relative;
    transform: rotate(180deg);
    opacity: 0.6;
    &.tapped {
        transform: rotate(270deg);
        margin-left: 10px;
        margin-right: 10px;
    }
`;

const BattleCardWrap = styled.div`
    &.tapped {
        transform: rotate(90deg);
        margin-left: 10px;
        margin-right: 10px;

        ${CardButton} {
            transform: rotate(-90deg);
        }
    }
    &.summoningSickness img {
        box-shadow: 0px 0px 9px 3px rgba(255, 192, 97, 1);
        color: rgba(255, 192, 97, 1);
        opacity: 0.6;
    }
`;

const CardButtonColumn = styled.div`
    position: absolute;
    width: 100%;
    text-align: center;
`;

export const DisplayDeck = props => (
    <CardWrap>
        <Deck {...props} />
    </CardWrap>
);

export const CardHand = ({ idx, view, children }) => (
    <CardWrap>
        <img
            src={`/assets/thumbs/${getCardLibrary(idx).imageName}.jpg`}
            alt={getCardLibrary(idx).imageName}
            onClick={e => view(e, idx)}
        />
        <CardButtonColumn>{children}</CardButtonColumn>
    </CardWrap>
);

export const DisplayMana = ({ idx, view, tapped, children }) => {
    const { imageName } = getCardLibrary(idx);
    return (
        <CardWrap>
            <ManaCardWrap className={tapped ? 'tapped' : ''}>
                <img
                    src={`/assets/thumbs/${imageName}.jpg`}
                    alt={imageName}
                    onClick={e => view(e, idx)}
                />
            </ManaCardWrap>
            <CardButtonColumn>{children}</CardButtonColumn>
        </CardWrap>
    );
};

export const DisplayShield = props => (
    <CardWrap>
        <Shield {...props} />
    </CardWrap>
);

export const DisplayCreature = ({
    idx,
    view,
    tapped,
    summoningSickness,
    children,
}) => {
    let className = '';
    if (tapped) {
        className += ' tapped';
    }
    if (summoningSickness) {
        className += ' summoningSickness';
    }
    return (
        <CardWrap>
            <BattleCardWrap className={className}>
                <img
                    src={`/assets/thumbs/${getCardLibrary(idx).imageName}.jpg`}
                    alt={getCardLibrary(idx).imageName}
                    onClick={e => view(e, idx)}
                />
            </BattleCardWrap>
            <CardButtonColumn>{children}</CardButtonColumn>
        </CardWrap>
    );
};

export const getLibrary = () => window[LIBRARY_KEY];
