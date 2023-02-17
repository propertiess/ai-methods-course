import React from 'react';
import ReactDOM from 'react-dom/client';

import { MantineProvider } from '@mantine/core';

import { App } from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{ colorScheme: 'dark' }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
);
