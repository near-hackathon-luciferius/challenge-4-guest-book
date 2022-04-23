import React from 'react';
import PropTypes from 'prop-types';

export default function Messages({ messages }) {
  return (
    <>
      <h2>Messages</h2>
      {messages.sort((a,b) => b.timestamp-a.timestamp).map((message, i) =>
        // TODO: format as cards, add timestamp
        <div className="row" key={i}>
            <div className={message.premium ? 'card horizontal blue white-text' : 'card horizontal'}>
                <div className="card-stacked">
                    <div className="card-title">{message.sender}</div>
                    <div className="card-content">
                      <p>{message.text}</p>
                    </div>
                    <div className={message.premium ? 'card-action border-white' : 'card-action'}>
                      {new Date(message.timestamp/1000000).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

Messages.propTypes = {
  messages: PropTypes.array
};
