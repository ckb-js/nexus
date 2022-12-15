import React from 'react';
import Logo from './logo.svg';
import './Popup.css';

export const Popup: React.FC = () => {
  return (
    <div className="container">
      <img src={Logo} alt="logo" />
      <h1>Hello Nexus</h1>
    </div>
  );
};

export default Popup;
