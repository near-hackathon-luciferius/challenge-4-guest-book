import React from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import { Button, TextInput } from 'react-materialize';

export default function Form({ onSubmit, currentUser }) {
  return (
    <form onSubmit={onSubmit}>
      <fieldset id="fieldset">
        <p>Sign the guest book, { currentUser.accountId }!</p>
        <div className="highlight">
          <TextInput
            autoComplete="off"
            autoFocus
            id="message"
            label="Add your message here."
            required
          />
        </div>
        <div className="row">
          <div className="col s4">
            <TextInput
                autoComplete="off"
                id="donation"
                defaultValue={'0'}
                max={Big(currentUser.balance).div(10 ** 24)}
                min="0"
                step="0.01"
                type="number"
                label="Add a donation here."
                required
            >
            </TextInput>
          </div>
          <div className="col s8"><p title="NEAR Tokens">Ⓝ</p></div>
        </div>
        <Button type="submit" small
                tooltip="Add your message to the guest book.">
          Sign
        </Button>
      </fieldset>
    </form>
  );
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  })
};
