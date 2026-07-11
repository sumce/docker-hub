import React from 'react';
import './Navbar.css';

export default function Navbar({ online }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">📦</span>
        <span className="navbar-title">Docker Registry Proxy</span>
        <span className="navbar-badge">Cloudflare Worker</span>
      </div>
      <div className="navbar-status">
        <span className={`status-dot ${online ? 'online' : 'offline'}`} />
        {online ? 'All systems operational' : 'Connecting…'}
      </div>
    </nav>
  );
}
