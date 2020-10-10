import readline from 'readline';
import { Player } from './types';

export const TESTING_BREAKPOINT = 'TESTING_BREAKPOINT';

export const getNumberBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getEmptyPlayer = (): Player => {
    const player: Player = {
        deck: [],
        graveyard: [],
        hand: [],
        shieldZone: [],
        battleZone: [],
        manaZone: [],
        turnDrawCount: 1,
        turnManaCount: 1,
    };
    return player;
};

export const getUserInput = question =>
    new Promise<string>(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(`${question}:\n`, answer => {
            resolve(answer.trim());
            rl.close();
        });

        rl.on('close', () => {});
    });
