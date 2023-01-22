import React from 'react';
import { createRoot } from 'react-dom/client';
import { Enable } from './containers/Enable';
import { createHashRouter, RouteObject } from 'react-router-dom';
import './index.css';

const container = window.document.querySelector('#root');
if (!container) throw new Error('Impossible');

const routes: RouteObject[] = [
  {
    path: '/enable',
    element: <Enable />,
  },
];

const root = createRoot(container);
root.render(<Enable />);
