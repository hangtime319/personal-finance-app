import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { TransactionsProvider } from './contexts/TransactionsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TransactionsProvider>
        <App />
      </TransactionsProvider>
    </AuthProvider>
  </React.StrictMode>
);
