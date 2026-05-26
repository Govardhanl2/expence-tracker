import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Upload, Lightbulb } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/',         label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/expenses', label: 'Expenses',  icon: Receipt },
  { path: '/upload',   label: 'Upload',    icon: Upload },
  { path: '/insights', label: 'Insights',  icon: Lightbulb },
];

const Sidebar = () => (
  <nav className="sidebar">
    <div className="sidebar-nav">
      {navItems.map(({ path, label, icon: Icon, exact }) => (
        <NavLink
          key={path}
          to={path}
          end={exact}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <div className="nav-icon-wrap">
            <Icon size={20} className="nav-icon" />
          </div>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default Sidebar;
