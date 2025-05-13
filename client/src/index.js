import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter
import './index.css'; // Global CSS
import ErrorBoundary from './ErrorBoundary';  // import the ErrorBoundary

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>   {/* Wrap App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
