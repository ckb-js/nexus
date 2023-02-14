import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Welcome } from './containers/Welcome';

import { CreateMnemonic } from './containers/NewMnemonic';
import { RecoveryWallet } from './containers/RecoveryWallet';
import { ConfirmMnemonic } from './containers/ConfirmMnemonic';
import { SetPassword } from './containers/Password';
import { Success } from './containers/Success';
import { theme } from '../theme';
import { OutsideCreateFrame } from './containers/OutsideCreateFrame';
import { CreateProcessFrame } from './containers/CreateProcessFrame';
import { BeforeStart } from './containers/BeforeStart';
import { CreateAccount } from './containers/CreateAccount';
import { CreateFlowConfig } from './types';

const routeConfig: RouteObject[] = [
  {
    element: <OutsideCreateFrame />,
    children: [
      {
        path: '/beforeStart',
        element: <BeforeStart />,
      },
      {
        path: '/success',
        element: <Success />,
      },
      {
        path: '/',
        element: <Welcome />,
      },
    ],
  },
  {
    element: <CreateProcessFrame />,
    path: '/create',
    loader: () => {
      return {
        steps: [
          { path: 'account', title: 'Select Username', description: 'Select a username' },
          { path: 'password', title: 'Create Password', description: 'Choose a secure one' },
          { path: 'seed', title: 'Generate Wallet Seed', description: 'remember it!' },
          { path: 'confirm', title: 'Confirm Seed', description: 'Confirm your seed' },
        ],
        entry: '/',
        exit: '/success',
        disableBackOnExit: true,
        exitButtonText: 'Confirm',
      } as CreateFlowConfig;
    },
    children: [
      {
        path: 'account',
        element: <CreateAccount />,
      },
      {
        path: 'password',
        element: <SetPassword />,
      },
      {
        path: 'seed',
        element: <CreateMnemonic />,
      },
      {
        path: 'confirm',
        element: <ConfirmMnemonic />,
      },
    ],
  },
  {
    element: <CreateProcessFrame />,
    path: '/import',
    loader: () => {
      return {
        steps: [
          {
            path: 'seed',
            title: 'Confirm Seed',
            description: 'Confirm your wallet seed',
          },
          { path: 'password', title: 'Create Password', description: 'Create a secure password' },
          { path: 'account', title: 'Create Username', description: 'Create a username' },
        ],
        entry: '/',
        exit: '/success',
      } as CreateFlowConfig;
    },

    children: [
      {
        path: 'seed',
        element: <RecoveryWallet />,
      },
      {
        path: 'password',
        element: <SetPassword />,
      },
      {
        path: 'account',
        element: <CreateAccount />,
      },
    ],
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
        <ChakraProvider theme={theme}>
          <RouterProvider router={hashRouter} />
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

const root = createRoot(container);
root.render(<App />);
