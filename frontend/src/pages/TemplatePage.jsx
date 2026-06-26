import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateModal from '../components/TemplateModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TemplatePage = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, statusFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/templates`);
      setTemplates(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowModal(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await axios.delete(`${API_URL}/api/templates/${templateId}`);
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (err) {
      console.error('Error deleting template:', err);
      alert(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleSubmitTemplate = async (templateId) => {
    if (!window.confirm('Submit this template for Meta approval?')) return;

    try {
      await axios.post(`${API_URL}/api/templates/${templateId}/submit`);
      fetchTemplates();
      alert('Template submitted for approval');
    } catch (err) {
      console.error('Error submitting template:', err);
      alert(err.response?.data?.message || 'Failed to submit template');
    }
  };

  const handleTemplateSaved = () => {
    fetchTemplates();
    setShowModal(false);
  };

  const stats = {
    total: templates.length,
    draft: templates.filter(t => t.status === 'draft').length,
    pending: templates.filter(t => t.status === 'pending').length,
    approved: templates.filter(t => t.status === 'approved').length,
    rejected: templates.filter(t => t.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Template
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400">
            <p className="text-gray-600 text-sm">Total Templates</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
            <p className="text-gray-600 text-sm">Draft</p>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search templates by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {(searchTerm || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="text-blue-600 text-sm hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTemplates}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No templates found</p>
            <button
              onClick={handleCreateTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="cursor-pointer">
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-600 truncate">{template.content.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(template.status)}`}>
                          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </span>
                        {template.status === 'rejected' && template.rejectionReason && (
                          <span title={template.rejectionReason} className="text-red-600 cursor-help">ℹ️</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        {template.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                              title="Edit template"
                            >
                              <span>✏️</span>
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => handleSubmitTemplate(template.id)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition-colors"
                              title="Submit for approval"
                            >
                              <span>✓</span>
                              <span className="text-sm">Submit</span>
                            </button>
                          </>
                        )}
                        {template.status === 'rejected' && (
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                            title="Edit & resubmit"
                          >
                            <span>✏️</span>
                            <span className="text-sm">Resubmit</span>
                          </button>
                        )}
                        {template.status === 'draft' && (
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                            title="Delete template"
                          >
                            <span>🗑️</span>
                            <span className="text-sm">Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showModal && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setShowModal(false)}
          onSaved={handleTemplateSaved}
        />
      )}
    </div>
  );
};

export default TemplatePage;
