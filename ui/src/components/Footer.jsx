import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      Powered by{' '}
      <a href="https://workers.cloudflare.com" target="_blank" rel="noopener noreferrer">
        Cloudflare Workers
      </a>
      &nbsp;·&nbsp;
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </footer>
  );
}
