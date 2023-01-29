import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom';
import { WhitelistSites } from './containers/WhitelistSites';
import { NetworkConfig } from './containers/Network/NetworkConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Home } from './containers/Home';
import { AddNetwork } from './containers/Network/AddNetwork';

const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'whitelistSites',
    element: <WhitelistSites />,
  },
  {
    path: 'network',
    element: <NetworkConfig />,
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
const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <React.StrictMode>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={hashRouter} />
        </QueryClientProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
};

const root = createRoot(container);
root.render(<App />);
