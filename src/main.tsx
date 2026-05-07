import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { queryClient, trpc, trpcClient } from './lib/trpc'

import "@emdgroup-liquid/liquid/dist/css/liquid.css";
import { defineCustomElements } from "@emdgroup-liquid/liquid/dist/loader";

defineCustomElements();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <App />
      </trpc.Provider>
    </QueryClientProvider>
  </React.StrictMode>,
)
