import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignModal from '../components/CampaignModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchCampaigns();
    fetchTags();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter, selectedTags]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/campaigns`);
      setCampaigns(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tags`);
      // Handle both array format and { success, tags } format
      const tagsData = Array.isArray(response.data) ? response.data : (response.data?.tags || []);
      setTags(tagsData);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setTags([]);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(c =>
        selectedTags.some(tagId =>
          c.tags?.some(cTag => cTag.id === tagId)
        )
      );
    }

    setFilteredCampaigns(filtered);
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await axios.delete(`${API_URL}/api/campaigns/${campaignId}`);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign');
    }
  };

  const handleDuplicateCampaign = async (campaign) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/campaigns/${campaign.id}/duplicate`
      );
      setCampaigns([...campaigns, response.data]);
    } catch (err) {
      console.error('Error duplicating campaign:', err);
      alert('Failed to duplicate campaign');
    }
  };

  const handleSendNow = async (campaignId) => {
    if (!window.confirm('Send this campaign now?')) return;

    try {
      await axios.post(`${API_URL}/api/campaigns/${campaignId}/send`);
      fetchCampaigns();
    } catch (err) {
      console.error('Error sending campaign:', err);
      alert('Failed to send campaign');
    }
  };

  const handleCampaignSaved = () => {
    fetchCampaigns();
    setShowModal(false);
  };

  const stats = {
    total: campaigns.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    sent: campaigns.filter(c => c.status === 'sent').length,
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Campaign
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400">
            <p className="text-gray-600 text-sm">Total Campaigns</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Draft</p>
            <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Scheduled</p>
            <p className="text-2xl font-bold text-orange-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Sent</p>
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search campaigns by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>

          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() =>
                  setSelectedTags(
                    selectedTags.includes(tag.id)
                      ? selectedTags.filter(id => id !== tag.id)
                      : [...selectedTags, tag.id]
                  )
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || selectedTags.length > 0) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSelectedTags([]);
            }}
            className="text-blue-600 text-sm hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No campaigns found</p>
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="cursor-pointer hover:text-blue-600">
                        <p className="font-medium text-gray-900">{campaign.name || '(Unnamed)'}</p>
                        <p className="text-sm text-gray-600 truncate">{campaign.description || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {campaign.tags?.slice(0, 2).map(tag => (
                          <span key={tag.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag.name}
                          </span>
                        ))}
                        {campaign.tags?.length > 2 && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            +{campaign.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{campaign.recipientCount || 0}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {campaign.stats ? (
                        <div className="space-y-1">
                          <p>✓ {campaign.stats.sent || 0} sent</p>
                          {campaign.stats.failed > 0 && (
                            <p className="text-red-600">✗ {campaign.stats.failed} failed</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEditCampaign(campaign)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleSendNow(campaign.id)}
                              className="text-green-600 hover:underline text-sm"
                            >
                              Send
                            </button>
                          </>
                        )}
                        {campaign.status !== 'draft' && (
                          <button
                            onClick={() => handleDuplicateCampaign(campaign)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Duplicate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showModal && (
        <CampaignModal
          campaign={selectedCampaign}
          tags={tags}
          onClose={() => setShowModal(false)}
          onSaved={handleCampaignSaved}
        />
      )}
    </div>
  );
};

export default CampaignPage;
