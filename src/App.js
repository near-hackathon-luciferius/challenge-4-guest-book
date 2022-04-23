import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useCallback } from 'react';
import NearWalletSelector from "@near-wallet-selector/core";
import { CodeResult } from "near-api-js/lib/providers/provider";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import PropTypes from 'prop-types';
import Big from 'big.js';
import Form from './components/Form';
import SignIn from './components/SignIn';
import Messages from './components/Messages';
import 'materialize-css/dist/css/materialize.css'
import { providers, utils } from "near-api-js";
import { Button } from 'react-materialize';
require('materialize-css');

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003");

const App = ({ nearConfig }) => {
  const [messages, setMessages] = useState([]);
  const [selector, setSelector] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  
  const syncAccountState = (
    currentAccountId,
    newAccounts
  ) => {
    if (!newAccounts.length) {
      localStorage.removeItem("accountId");
      setAccountId(null);
      setAccounts([]);

      return;
    }

    const validAccountId =
      currentAccountId &&
      newAccounts.some((x) => x.accountId === currentAccountId);
    const newAccountId = validAccountId
      ? currentAccountId
      : newAccounts[0].accountId;

    localStorage.setItem("accountId", newAccountId);
    setAccountId(newAccountId);
    setAccounts(newAccounts);
  };
  
  useEffect(() => {
    NearWalletSelector.init({
      network: nearConfig.networkId,
      contractId: nearConfig.contractName,
      wallets: [
        setupNearWallet(),
        setupSender()
      ],
    })
      .then((instance) => {
        return instance.getAccounts().then(async (newAccounts) => {
          syncAccountState(localStorage.getItem("accountId"), newAccounts);
          setSelector(instance);
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to initialise wallet selector");
      });
  }, []);
  
  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.on("accountsChanged", (e) => {
      syncAccountState(accountId, e.accounts);
    });

    return () => subscription.remove();
  }, [selector, accountId]);
  
  const getMessages = useCallback(() => {
    const provider = new providers.JsonRpcProvider({
      url: selector.network.nodeUrl,
    });

    return provider
      .query({
        request_type: "call_function",
        account_id: selector.getContractId(),
        method_name: "getMessages",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);
  
  useEffect(() => {
    if (!selector){
        return
    }
    getMessages().then(setMessages);
  }, [selector]);

  const onSubmit = (e) => {
    e.preventDefault();

    const { fieldset, message, donation } = e.target.elements;

    fieldset.disabled = true;
    
    selector
        .signAndSendTransaction({
          signerId: accountId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "addMessage",
                args: { text: message.value },
                gas: BOATLOAD_OF_GAS,
                deposit: utils.format.parseNearAmount(donation.value || "0"),
              },
            },
          ],
        })
        .catch((err) => {
          alert("Failed to add message");
          console.log("Failed to add message");
          fieldset.disabled = false;
          throw err;
        })
        .then(() => {
      getMessages().then(messages => {
        setMessages(messages);
        message.value = '';
        donation.value = SUGGESTED_DONATION;
        fieldset.disabled = false;
        message.focus();
      });
    });
  };
  
  const handleSignIn = () => {
    selector.show();
  };

  const handleSignOut = () => {
    selector.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };
  
  const handleSwitchProvider = () => {
    selector.show();
  };

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === accountId);
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

    const nextAccountId = accounts[nextIndex].accountId;

    setAccountId(nextAccountId);
    alert("Switched account to " + nextAccountId);
  };

  return (
    <main id="page-wrapper">
      <header>
        <h1>NEAR Guest Book</h1>
        { accountId && accounts.length
          ? <div className="row">
                <div className="col s2"><Button onClick={handleSignOut}>Log out</Button></div>
                <div className="col s4"><Button onClick={handleSwitchProvider}>Switch Provider</Button></div>
                {accounts.length > 1 && (
                  <div className="col s4"><Button onClick={handleSwitchAccount}>Switch Account</Button></div>
                )}
            </div>
          : <Button onClick={handleSignIn}>Log in</Button>
        }
      </header>
      { accountId && accounts.length
        ? <Form onSubmit={onSubmit} accountId={accountId} balance="10" />
        : <SignIn/>
      }
      { accountId && accounts.length && messages.length && <Messages messages={messages}/> }
    </main>
  );
};

App.propTypes = {
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired
};

export default App;
