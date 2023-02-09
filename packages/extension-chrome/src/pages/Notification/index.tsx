import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { Grant } from './containers/Grant';
import { RouteObject, RouterProvider, createHashRouter } from 'react-router-dom';
import { SignData } from './containers/SignData';
import { SignTransaction } from './containers/SignTransaction';

const container = window.document.querySelector('#root');
if (!container) throw new Error('Impossible');

const routes: RouteObject[] = [
  {
    path: '/grand',
    element: <Grant />,
  },
  {
    path: '/signData',
    element: <SignData />,
  },
  {
    path: '/signTransaction',
    element: <SignTransaction />,
  },
];

const router = createHashRouter(routes);

const App = () => {
  return (
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
};
const root = createRoot(container);
root.render(<App />);

export type NotificationPath = '/grand';
