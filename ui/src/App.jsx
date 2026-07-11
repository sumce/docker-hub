import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuickStart from './components/QuickStart';
import RegistryGrid from './components/RegistryGrid';
import Features from './components/Features';
import Footer from './components/Footer';

import './app.css';

export default function App() {
  const [health, setHealth] = useState(null);
  const host = window.location.host;

  useEffect(() => {
    fetch('/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {}); // 健康检查失败不阻塞渲染
  }, []);

  return (
    <div className="app">
      <Navbar online={health?.status === 'ok'} />
      <main>
        <Hero host={host} />
        <QuickStart host={host} />
        <RegistryGrid host={host} registries={health?.registries} />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
