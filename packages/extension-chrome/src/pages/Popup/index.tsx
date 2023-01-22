import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom';

import { Home } from './containers/Home';
// import { Sites } from './containers/Sites';

const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  // {
  //   path: 'whitelist',
  //   element: <Sites />,
  // },
  // {
  //   path: 'network',
  //   element: <NetworkConfig />,
  // },
];

const container = window.document.querySelector('#root');
if (!container)
  throw new Error(
    'This seems a internal bug caused by missing #root element on HTML, Please report it to https://github.com/ckb-js/nexus/issues',
  );

const hashRouter = createHashRouter(routeConfig);

const App: FC = () => {
  return (
    <React.StrictMode>
      <ChakraProvider>
        <RouterProvider router={hashRouter} />
      </ChakraProvider>
    </React.StrictMode>
  );
};

const root = createRoot(container);
root.render(<App />);
