// entry point of the react app, first file that runs when the app starts, bridge between html and react app (app.tsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// TODO is this ok?
window.localStorage.setItem('apiBaseUrl', 'http://localhost:5001/api');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

