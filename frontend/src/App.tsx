import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { StateScreen } from './screens/StateScreen';
import { NationalScreen } from './screens/NationalScreen';
import { DistrictScreen } from './screens/DistrictScreen';
import { TradeDetailScreen } from './screens/TradeDetailScreen';
import { RankingScreen } from './screens/RankingScreen';
import { WhatIfScreen } from './screens/WhatIfScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { MethodologyScreen } from './screens/MethodologyScreen';
import { VisualizationsScreen } from './screens/VisualizationsScreen';
import { KnowledgeGraphScreen } from './screens/KnowledgeGraphScreen';
import { ChatAssistant } from './components/ChatAssistant';
import { LiveSyncProvider } from './context/LiveSyncContext';
import { LiveSyncBar } from './components/LiveSyncBar';

export default function App() {
  return (
    <LiveSyncProvider>
      <div className="min-h-screen bg-white text-black flex font-sans antialiased">
        {/* Fixed Left Navigation Sidebar matching Ink Mono design */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-8 max-w-[1440px] overflow-y-auto">
          {/* Live Government Feed Sync Status Bar */}
          <LiveSyncBar />

          <Routes>
          <Route path="/" element={<Navigate to="/state" replace />} />
          <Route path="/state" element={<StateScreen />} />
          <Route path="/national" element={<NationalScreen />} />
          <Route path="/district" element={<DistrictScreen />} />
          <Route path="/trade" element={<TradeDetailScreen />} />
          <Route path="/ranking" element={<RankingScreen />} />
          <Route path="/whatif" element={<WhatIfScreen />} />
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/methodology" element={<MethodologyScreen />} />
          <Route path="/charts" element={<VisualizationsScreen />} />
          <Route path="/visualizations" element={<VisualizationsScreen />} />
          <Route path="/graph" element={<KnowledgeGraphScreen />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraphScreen />} />
          <Route path="*" element={<Navigate to="/state" replace />} />
        </Routes>


        {/* Grounded Assistant Drawer */}
        <ChatAssistant />
      </main>
    </div>
  </LiveSyncProvider>
);
}
