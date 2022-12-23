import { Client } from 'chomex';
import React from 'react';
import Logo from './logo.svg';
import './Popup.css';

export const Popup: React.FC = () => {
  return (
    <div className="container">
      <img src={Logo} alt="logo" />
      <h1>Hello Nexus</h1>
      <br />
      <button
        onClick={() => {
          const client = new Client(chrome.runtime);
          client.message('/users/create', { user: { name: 'jack', age: 30 } }).then((response) => {
            console.log('create user response:', response);
          });
        }}
      >
        create user
      </button>
    </div>
  );
};

export default Popup;
