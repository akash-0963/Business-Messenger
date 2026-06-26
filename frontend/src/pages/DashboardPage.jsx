import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContacts: 0,
    totalMessages: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, contactsRes] = await Promise.all([
        axios.get(`${API_URL}/api/campaigns`),
        axios.get(`${API_URL}/api/contacts?limit=1`),
      ]);

      const campaigns = campaignsRes.data || [];

      // Handle contacts response - it returns { success, contacts, pagination }
      let totalContacts = 0;
      if (contactsRes.data?.pagination?.total) {
        totalContacts = contactsRes.data.pagination.total;
      } else if (Array.isArray(contactsRes.data)) {
        totalContacts = contactsRes.data.length;
      }

      // Calculate stats
      const totalMessages = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
      const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'scheduled').length;

      setStats({
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalContacts,
        totalMessages,
      });

      // Get recent campaigns (last 5)
      setRecentCampaigns(campaigns.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to WA Messenger - Your WhatsApp marketing platform</p>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Campaigns */}
            <Link to="/campaigns" className="transform hover:scale-105 transition-transform">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCampaigns}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </Link>

            {/* Active Campaigns */}
            <Link to="/campaigns" className="transform hover:scale-105 transition-transform">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Campaigns</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeCampaigns}</p>
                  </div>
                  <div className="text-4xl">🚀</div>
                </div>
              </div>
            </Link>

            {/* Total Contacts */}
            <Link to="/contacts" className="transform hover:scale-105 transition-transform">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Contacts</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalContacts}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
            </Link>

            {/* Total Messages */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Messages Sent</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalMessages.toLocaleString()}</p>
                </div>
                <div className="text-4xl">💬</div>
              </div>
            </div>
          </div>

          {/* Recent Campaigns & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Campaigns */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Campaigns</h2>
              {recentCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No campaigns yet</p>
                  <Link
                    to="/campaigns"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Your First Campaign
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCampaigns.map(campaign => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-600">
                          {campaign.recipientCount} recipients • {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/campaigns"
                  className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium transition-colors"
                >
                  📊 Manage Campaigns
                </Link>
                <Link
                  to="/contacts"
                  className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium transition-colors"
                >
                  👥 Manage Contacts
                </Link>
                <Link
                  to="/broadcast"
                  className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-medium transition-colors"
                >
                  📤 Send Campaign
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Create and organize your contacts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Tag contacts for targeting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Design campaigns by tag</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Schedule or send immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>WA Messenger v1.0.0</p>
          <p className="mt-1">Your powerful WhatsApp marketing automation platform</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
