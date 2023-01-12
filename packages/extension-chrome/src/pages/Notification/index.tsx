import React from 'react';
import { createRoot } from 'react-dom/client';
import { Notification } from './Notification';
import './index.css';

const container = window.document.querySelector('#root');
if (!container) throw new Error('Impossible');

const root = createRoot(container);
root.render(<Notification />);
