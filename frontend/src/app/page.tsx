'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Ticker from '@/components/Ticker';
import Chatbot from '@/components/Chatbot';
import HomeView from '@/components/views/HomeView';
import AuditLogsView from '@/components/views/AuditLogsView';
import PlaceholderView from '@/components/views/PlaceholderView';

export type ViewType = 'home' | 'my_account' | 'portfolio' | 'audit_logs' | 'find_stocks';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const getPageTitle = () => {
    switch (currentView) {
      case 'home':
        return 'Home Dashboard';
      case 'my_account':
        return 'My Account Settings';
      case 'portfolio':
        return 'Portfolio Management';
      case 'audit_logs':
        return 'Audit & Compliance Logs';
      case 'find_stocks':
        return 'Stock Finder & Analyzer';
      default:
        return 'Dashboard';
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'audit_logs':
        return <AuditLogsView />;
      case 'my_account':
        return <PlaceholderView title="My Account" />;
      case 'portfolio':
        return <PlaceholderView title="Portfolio" />;
      case 'find_stocks':
        return <PlaceholderView title="Find Specific Stocks" />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="grid grid-cols-[200px_1fr_320px] grid-rows-[100vh] w-screen h-screen">
      {/* Left Column: Navigation */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Center Column: Workspace */}
      <main className="flex flex-col h-full overflow-hidden bg-black/50 relative">
        <Header title={getPageTitle()} />
        <Ticker />
        <div className="flex-grow overflow-y-auto p-6 scroll-smooth">
          {renderView()}
        </div>
      </main>

      {/* Right Column: AI Chatbot */}
      <Chatbot />
    </div>
  );
}
