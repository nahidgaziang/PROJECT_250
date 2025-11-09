import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css' 
import * as pdfjsLib from 'pdfjs-dist';

// Import our components
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; // Our AuthProvider
import LoginPage from './components/LoginPage.jsx'; // We will create this
import SignUpPage from './components/SignUpPage.jsx'; // We will create this

// This points to the file in your /public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap with AuthProvider */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)