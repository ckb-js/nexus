import React, { FC } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, RouteObject, redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Welcome } from './containers/Welcome';

import { CreateMnemonic } from './containers/NewMnemonic';
import { CollectMnemonic } from './containers/CollectMnemonic';
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
    element: <CollectMnemonic />,
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
          <RouterProvider router={hashRouter} />
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

const root = createRoot(container);
root.render(<App />);
