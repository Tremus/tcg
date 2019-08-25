import { createStore } from 'redux';
import rootReducer from './reducers';
import { LOCAL_STORAGE_KEY, REDUX_KEY } from './settings';

const loadState = () => {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
        return undefined;
    }
    return JSON.parse(serializedState);
};

export const saveState = state => {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
};

const getNewStore = () =>
    createStore(
        rootReducer,
        loadState(), // persisted state
    );

const getOrCreateStore = () => {
    if (!window[REDUX_KEY]) {
        window[REDUX_KEY] = getNewStore();
    }
    return window[REDUX_KEY];
};

export default getNewStore;
