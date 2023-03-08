import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { Grant } from './containers/Grant';
import { RouteObject, RouterProvider, createHashRouter } from 'react-router-dom';
import { SignData } from './containers/SignData/SignData';
import { SignTransaction } from './containers/SignTransaction';
import { theme } from '../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationFrame } from '../Components/NotificationFrame';
import { ViewData } from './containers/SignData/ViewData';

const container = window.document.querySelector('#root');
if (!container) throw new Error('Impossible');

const meta = [
  {
    path: '/grant',
  },
  {
    path: '/sign-data',
    title: 'Sign Message',
  },
  {
    path: '/sign-transaction',
    title: 'Sign Transaction',
  },
  {
    path: '/sign-transaction/view-data',
    title: 'Sign Transaction',
    allowBack: true,
  },
];

const routes: RouteObject[] = [
  {
    element: <NotificationFrame meta={meta} />,
    children: [
      {
        path: '/grant',
        element: <Grant />,
      },
      {
        path: '/sign-data',
        element: <SignData />,
      },
      {
        path: '/sign-transaction',
        element: <SignTransaction />,
      },

      {
        path: '/sign-transaction/view-data',
        element: <ViewData />,
      },
    ],
  },
];

const queryClient = new QueryClient();
const router = createHashRouter(routes);

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  );
};
const root = createRoot(container);
root.render(<App />);

export type NotificationPath = '/grand';
