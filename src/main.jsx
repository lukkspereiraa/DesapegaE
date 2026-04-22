import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Importe o CSS global da Liquid
import "@emdgroup-liquid/liquid/dist/css/liquid.css";

// 2. Importe o registrador de componentes
import { defineCustomElements } from "@emdgroup-liquid/liquid/dist/loader";

// 3. Execute a função para registrar os componentes no navegador
defineCustomElements();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)