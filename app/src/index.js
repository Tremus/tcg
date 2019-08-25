import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { throttle } from 'lodash';
import App from './App';
import getOrCreateStore, { saveState } from './store';
import './index.css';
// import * as serviceWorker from './serviceWorker';

const store = getOrCreateStore();

store.subscribe(
    throttle(() => {
        saveState(store.getState());
        console.log('persisting state...');
    }, 1000),
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
