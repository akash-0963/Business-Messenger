import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TagSelector from './TagSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CampaignModal = ({ campaign, tags, onClose, onSaved }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedTags: [],
    dateFrom: '',
    dateTo: '',
    message: '',
    sendImmediate: true,
    scheduledDate: '',
    scheduledTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [recipientPreview, setRecipientPreview] = useState(0);
  const [allTags, setAllTags] = useState(tags);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        selectedTags: campaign.tags?.map(t => t.id) || [],
        dateFrom: campaign.dateFrom || '',
        dateTo: campaign.dateTo || '',
        message: campaign.message || '',
        sendImmediate: campaign.sendImmediate !== false,
        scheduledDate: campaign.scheduledDate || '',
        scheduledTime: campaign.scheduledTime || '',
      });
    }
    setAllTags(tags);
  }, [campaign, tags]);

  useEffect(() => {
    calculateRecipientPreview();
  }, [formData.selectedTags, formData.dateFrom, formData.dateTo]);

  const calculateRecipientPreview = async () => {
    if (formData.selectedTags.length === 0 && !formData.dateFrom && !formData.dateTo) {
      setRecipientPreview(0);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/campaigns/preview-recipients`,
        {
          tagIds: formData.selectedTags,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
        }
      );
      setRecipientPreview(response.data.count || 0);
    } catch (err) {
      console.error('Error calculating recipients:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagSelection = (selectedTagIds) => {
    setFormData(prev => ({ ...prev, selectedTags: selectedTagIds }));
  };

  const handleTagCreated = () => {
    // Refresh tags from server
    axios.get(`${API_URL}/api/tags`).then(res => {
      const tagsData = Array.isArray(res.data) ? res.data : (res.data?.tags || []);
      setAllTags(tagsData);
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        alert('Please enter a campaign name');
        return;
      }
    }
    if (step === 2) {
      if (formData.selectedTags.length === 0 && !formData.dateFrom && !formData.dateTo) {
        alert('Please select at least one tag or date range');
        return;
      }
    }
    if (step === 3) {
      if (!formData.message.trim()) {
        alert('Please enter a message');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.sendImmediate && !formData.scheduledDate && !formData.scheduledTime) {
      alert('Please set a scheduled time');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        tags: formData.selectedTags,
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
        message: formData.message,
        sendImmediate: formData.sendImmediate,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        status: formData.sendImmediate ? 'sent' : 'scheduled',
      };

      if (campaign) {
        await axios.put(`${API_URL}/api/campaigns/${campaign.id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/campaigns`, payload);
      }

      onSaved();
    } catch (err) {
      console.error('Error saving campaign:', err);
      alert(err.response?.data?.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const progressSteps = ['Basics', 'Recipients', 'Message', 'Schedule'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">{campaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
          <p className="text-blue-100 text-sm mt-1">Step {step} of {progressSteps.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between mb-2">
            {progressSteps.map((label, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 mx-1 rounded ${
                  idx < step ? 'bg-blue-600' : idx === step - 1 ? 'bg-blue-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {progressSteps.map((label, idx) => (
              <span key={idx} className={idx <= step - 1 ? 'text-blue-600 font-medium' : ''}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Campaign Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Sale 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description for your campaign"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Recipients */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Tags</label>
                <TagSelector
                  tags={allTags}
                  selectedIds={formData.selectedTags}
                  onSelectionChange={handleTagSelection}
                  onTagCreated={handleTagCreated}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Contact Creation Date (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">From</label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={formData.dateFrom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">To</label>
                    <input
                      type="date"
                      name="dateTo"
                      value={formData.dateTo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Recipient Preview:</strong>
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{recipientPreview} contacts</p>
                <p className="text-xs text-gray-600 mt-2">will receive this campaign</p>
              </div>
            </div>
          )}

          {/* Step 3: Compose Message */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type your WhatsApp message here..."
                  rows="6"
                  maxLength="1024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Characters: {formData.message.length}/1024</span>
                  <span>{Math.ceil(formData.message.length / 160)} SMS equivalent</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{formData.message}</p>
              </div>
            </div>
          )}

          {/* Step 4: Schedule & Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Send Timing</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={formData.sendImmediate}
                      onChange={() => setFormData(prev => ({ ...prev, sendImmediate: true }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Send Immediately</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={!formData.sendImmediate}
                      onChange={() => setFormData(prev => ({ ...prev, sendImmediate: false }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Schedule for Later</span>
                  </label>
                </div>
              </div>

              {!formData.sendImmediate && (
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Campaign Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Campaign Summary:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• <strong>Name:</strong> {formData.name}</li>
                  <li>• <strong>Recipients:</strong> {recipientPreview} contacts</li>
                  <li>• <strong>Message length:</strong> {formData.message.length} characters</li>
                  {!formData.sendImmediate && (
                    <li>• <strong>Scheduled:</strong> {formData.scheduledDate} at {formData.scheduledTime}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;
