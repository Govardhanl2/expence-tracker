import React from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import './Topbar.css';

const pageTitles = {
  '/':         { title: 'Dashboard',     subtitle: 'Financial overview' },
  '/expenses': { title: 'Expenses',      subtitle: 'Manage your transactions' },
  '/upload':   { title: 'Upload Invoice',subtitle: 'AI-powered extraction' },
  '/insights': { title: 'AI Insights',   subtitle: 'Smart spending analysis' },
};

const Topbar = () => {
  const location = useLocation();
  const page  = pageTitles[location.pathname] || { title: 'Expense Tracker', subtitle: '' };
  const today = format(new Date(), 'MMM d, yyyy');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-brand-dot" />
        <h1 className="topbar-title">{page.title}</h1>
        <span className="topbar-subtitle">{page.subtitle}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{today}</span>
      </div>
    </header>
  );
};

export default Topbar;
