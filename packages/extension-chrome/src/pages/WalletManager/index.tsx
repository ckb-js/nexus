import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Welcome } from './containers/Welcome';

import { CreateMnemonic } from './containers/NewMnemonic';
import { SharedStateProvider } from './store';
import { RecoveryWallet } from './containers/RecoveryWallet';
import { ConfirmMnemonic } from './containers/ConfirmMnemonic';
import { SetPassword } from './containers/Password';
import { Success } from './containers/Success';

const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/create',
    element: <CreateMnemonic />,
  },
  {
    path: '/import',
    element: <RecoveryWallet />,
  },
  {
    path: '/confirm',
    element: <ConfirmMnemonic />,
  },
  {
    path: '/password',
    element: <SetPassword />,
  },
  {
    path: '/success',
    element: <Success />,
  },
];

const queryClient = new QueryClient();

const container = window.document.querySelector('#root');
if (!container)
  throw new Error(
    'This seems a internal bug caused by missing #root element on HTML, Please report it to https://github.com/ckb-js/nexus/issues',
  );

const hashRouter = createHashRouter(routeConfig);

const App: FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <SharedStateProvider>
            <RouterProvider router={hashRouter} />
          </SharedStateProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

const root = createRoot(container);
root.render(<App />);
