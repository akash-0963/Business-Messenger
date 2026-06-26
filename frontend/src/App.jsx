import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BroadcastPage from './pages/BroadcastPage';
import ManageContactsPage from './pages/ManageContactsPage';

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Navigation */}
        <nav className="bg-gray-800 text-white py-4 px-6 shadow">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">📱 WhatsApp Broadcast</h1>
            <div className="space-x-4">
              <Link
                to="/"
                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 inline-block"
              >
                Send Campaign
              </Link>
              <Link
                to="/contacts"
                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 inline-block"
              >
                Manage Contacts
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<BroadcastPage />} />
          <Route path="/contacts" element={<ManageContactsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
