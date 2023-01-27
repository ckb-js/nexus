import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom';
import { WhitelistSites } from './containers/WhitelistSites';
import { NetworkConfig } from './containers/Network/NetworkConfig';

import { Home } from './containers/Home';
import siteService from '../../services/site';
import networkService from '../../services/network';
import { AddNetwork } from './containers/Network/AddNetwork';

const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'whitelistSites',
    element: <WhitelistSites />,
    loader: () => {
      return siteService.getWhitelistSites();
    },
  },
  {
    path: 'network',
    element: <NetworkConfig />,
    loader: () => {
      return networkService.getNetwork();
    },
  },
  {
    path: 'network/add',
    element: <AddNetwork />,
  },
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
