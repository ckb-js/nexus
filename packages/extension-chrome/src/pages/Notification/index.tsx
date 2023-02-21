import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { Grant } from './containers/Grant';
import { RouteObject, RouterProvider, createHashRouter } from 'react-router-dom';
import { SignData } from './containers/SignData';
import { SignTransaction } from './containers/SignTransaction';
import { theme } from '../theme';
import { NotificationFrame } from './containers/NotificationFrame';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const container = window.document.querySelector('#root');
if (!container) throw new Error('Impossible');

const routes: RouteObject[] = [
  {
    element: <NotificationFrame />,
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
