import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
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
          {/* Top Header */}
          <header className="bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">WA Messenger</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your campaigns and contacts efficiently</p>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<BroadcastPage />} />
              <Route path="/contacts" element={<ManageContactsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
