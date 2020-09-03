import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ReactGA from 'react-ga';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactGA.initialize('UA-176748714-1', {
  debug: process.env.NODE_ENV === 'development',
});

ReactGA.pageview(window.location.pathname);

const Root: FunctionComponent = () => (
  <App />
);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
