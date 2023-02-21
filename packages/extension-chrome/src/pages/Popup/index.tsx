import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouteObject, RouterProvider } from 'react-router-dom';
import { WhitelistSites } from './containers/WhitelistSites';
import { NetworkConfig } from './containers/Network/NetworkConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Home } from './containers/Home';
import { AddNetwork } from './containers/Network/AddNetwork';
import { theme } from '../theme';
import { PopupFrame } from './containers/PopupFrame';
import { useStartInitIfNotInitialized } from '../hooks/useStartInitIfNotInitialized';

const routeConfig: RouteObject[] = [
  {
    element: <PopupFrame />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/whitelist-sites',
        element: <WhitelistSites />,
      },
      {
        path: '/network/add',
        element: <AddNetwork />,
      },
      {
        path: '/network',
        element: <NetworkConfig />,
      },
    ],
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
  const initialized = useStartInitIfNotInitialized();
  if (!initialized) return null;

  return (
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={hashRouter} />
        </QueryClientProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
};

const root = createRoot(container);
root.render(<App />);
