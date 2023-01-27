import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { Enable } from './containers/Enable';
import { RouteObject, RouterProvider, createHashRouter } from 'react-router-dom';
import './index.css';

const container = window.document.querySelector('#root');
if (!container) throw new Error('Impossible');

const routes: RouteObject[] = [
  {
    path: '/enable',
    element: <Enable />,
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
