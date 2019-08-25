export function addCardToDeck(deck, pk) {
    if (!deck[pk]) {
        deck[pk] = 0;
    }
    deck[pk] += 1;
    return deck;
}

export function removeCardFromDeck(deck, pk) {
    deck[pk] += -1;
    if (deck[pk] === 0) {
        delete deck[pk];
    }
    return deck;
}
