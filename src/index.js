import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getConfig from './config.js';

// Initializing contract
async function initContract() {
  // get network configuration values from config.js
  // based on the network ID we pass to getConfig()
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

  return { nearConfig };
}

window.nearInitPromise = initContract().then(
  ({ contract, currentUser, nearConfig, walletConnection }) => {
    ReactDOM.render(
      <App nearConfig={nearConfig}
      />,
      document.getElementById('root')
    );
  }
);
