import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import CampaignPage from './pages/CampaignPage';
import BroadcastPage from './pages/BroadcastPage';
import ManageContactsPage from './pages/ManageContactsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignPage />} />
              <Route path="/broadcast" element={<BroadcastPage />} />
              <Route path="/contacts" element={<ManageContactsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
