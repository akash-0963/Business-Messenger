import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContactListTable from '../components/ContactListTable';
import AddContactModal from '../components/AddContactModal';
import BulkUploadModal from '../components/BulkUploadModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ManageContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchContacts();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [search, selectedTag, pagination.page]);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tags`);
      setTags(response.data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/contacts`, {
        params: {
          search,
          tag: selectedTag,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      setContacts(response.data.contacts || []);
      setPagination(response.data.pagination || { page: 1, limit: 25, total: 0, pages: 0 });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (newContact) => {
    try {
      const response = await axios.post(`${API_URL}/api/contacts`, newContact);
      console.log('Contact created:', response.data.contact);
      setShowAddModal(false);
      fetchTags();
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleBulkUpload = async (uploadData) => {
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('bulkTag', uploadData.bulkTag);

      const response = await axios.post(`${API_URL}/api/contacts/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowUploadModal(false);
      fetchTags();
      fetchContacts();
      return response.data;
    } catch (error) {
      console.error('Error uploading contacts:', error);
      throw error;
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Delete this contact?')) {
      try {
        await axios.delete(`${API_URL}/api/contacts/${id}`);
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedContacts.size) return;
    if (window.confirm(`Delete ${selectedContacts.size} selected contacts?`)) {
      try {
        await axios.delete(`${API_URL}/api/contacts`, {
          data: { ids: Array.from(selectedContacts) },
        });
        setSelectedContacts(new Set());
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contacts:', error);
      }
    }
  };

  const handleAddTagToSelected = async (tagId) => {
    if (!selectedContacts.size) return;
    try {
      await axios.patch(`${API_URL}/api/contacts/bulk-tags`, {
        contactIds: Array.from(selectedContacts),
        tagId,
      });
      setSelectedContacts(new Set());
      fetchContacts();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleSelectContact = (contactId) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Contacts</h1>
            <div className="space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                + Add Contact
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                📤 Bulk Upload
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tags</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.name}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Contacts</p>
            <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Selected</p>
            <p className="text-3xl font-bold text-blue-600">{selectedContacts.size}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Available Tags</p>
            <p className="text-3xl font-bold text-purple-600">{tags.length}</p>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedContacts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900">{selectedContacts.size} contact(s) selected</span>
            <div className="space-x-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddTagToSelected(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 text-sm border border-blue-300 rounded bg-white hover:bg-blue-50"
              >
                <option value="">+ Add Tag to Selected</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                🗑️ Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Contact List Table */}
        <ContactListTable
          contacts={contacts}
          selectedContacts={selectedContacts}
          tags={tags}
          loading={loading}
          onSelectContact={handleSelectContact}
          onSelectAll={handleSelectAll}
          onDeleteContact={handleDeleteContact}
          onRefresh={fetchContacts}
        />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination({ ...pagination, page })}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddContactModal
          tags={tags}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddContact}
          onTagCreated={fetchTags}
        />
      )}
      {showUploadModal && (
        <BulkUploadModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleBulkUpload}
          onTagCreated={fetchTags}
        />
      )}
    </div>
  );
}
