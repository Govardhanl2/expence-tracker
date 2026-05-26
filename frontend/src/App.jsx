import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Dashboard from './components/Dashboard/Dashboard';
import Expenses from './components/Expenses/Expenses';
import Upload from './components/Expenses/Upload';
import Insights from './components/Insights/Insights';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Topbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#111111',
            border: '1.5px solid #e8e8e8',
            fontSize: '13.5px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderRadius: '10px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
