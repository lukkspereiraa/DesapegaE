import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import "@emdgroup-liquid/liquid/dist/css/liquid.css";
import { defineCustomElements } from "@emdgroup-liquid/liquid/dist/loader";

defineCustomElements();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
