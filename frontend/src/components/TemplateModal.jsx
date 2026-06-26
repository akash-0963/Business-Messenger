import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TemplateModal = ({ template, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing',
    content: '',
    header: '',
    footer: '',
    buttons: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewVariables, setPreviewVariables] = useState({ 1: 'Sample Text', 2: 'Code 123' });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        category: template.category || 'marketing',
        content: template.content || '',
        header: template.header || '',
        footer: template.footer || '',
        buttons: template.buttons || []
      });
    }
  }, [template]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreviewVariableChange = (key, value) => {
    setPreviewVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleAddButton = () => {
    setFormData(prev => ({
      ...prev,
      buttons: [...prev.buttons, { buttonType: 'URL', title: '', url: '', phone: '', text: '' }]
    }));
  };

  const handleRemoveButton = (index) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  const handleButtonChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((btn, i) =>
        i === index ? { ...btn, [field]: value } : btn
      )
    }));
  };

  const getPreviewText = () => {
    let text = formData.content;
    Object.keys(previewVariables).forEach(key => {
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), previewVariables[key]);
    });
    return text;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Template content is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        content: formData.content,
        header: formData.header || null,
        footer: formData.footer || null,
        buttons: formData.buttons.filter(btn => btn.title)
      };

      if (template) {
        await axios.put(`${API_URL}/api/templates/${template.id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/templates`, payload);
      }

      onSaved();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const validButtons = formData.buttons.filter(btn => btn.title);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">{template ? 'Edit Template' : 'Create Template'}</h2>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Form */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Welcome Message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={template && template.status !== 'draft' && template.status !== 'rejected'}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="marketing">Marketing</option>
                <option value="utility">Utility</option>
                <option value="authentication">Authentication</option>
              </select>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="e.g., Hello {'{1}'}, welcome to our service! Use code {'{2}'} to verify."
                rows="4"
                maxLength="1024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Use {'{1}'}, {'{2}'}, etc. for variables</span>
                <span>{formData.content.length}/1024</span>
              </div>
            </div>

            {/* Header (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header (Optional)</label>
              <input
                type="text"
                name="header"
                value={formData.header}
                onChange={handleInputChange}
                placeholder="e.g., Important Notice"
                maxLength="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.header.length}/60 characters</p>
            </div>

            {/* Footer (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer (Optional)</label>
              <input
                type="text"
                name="footer"
                value={formData.footer}
                onChange={handleInputChange}
                placeholder="e.g., Best regards, Team"
                maxLength="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.footer.length}/60 characters</p>
            </div>

            {/* Buttons Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Buttons (Optional)</label>
                <button
                  onClick={handleAddButton}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Button
                </button>
              </div>

              {formData.buttons.map((button, index) => (
                <div key={index} className="mb-3 p-3 border border-gray-200 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <select
                      value={button.buttonType}
                      onChange={(e) => handleButtonChange(index, 'buttonType', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="URL">URL Button</option>
                      <option value="PHONE">Phone Button</option>
                      <option value="QUICK_REPLY">Quick Reply</option>
                    </select>
                    <button
                      onClick={() => handleRemoveButton(index)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Button Title"
                    value={button.title}
                    onChange={(e) => handleButtonChange(index, 'title', e.target.value)}
                    maxLength="20"
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                  />

                  {button.buttonType === 'URL' && (
                    <input
                      type="url"
                      placeholder="URL (e.g., https://example.com)"
                      value={button.url}
                      onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  )}

                  {button.buttonType === 'PHONE' && (
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={button.phone}
                      onChange={(e) => handleButtonChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  )}

                  {button.buttonType === 'QUICK_REPLY' && (
                    <input
                      type="text"
                      placeholder="Reply Text"
                      value={button.text}
                      onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - WhatsApp Preview */}
          <div className="w-80 bg-gray-100 border-l border-gray-300 overflow-y-auto p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Preview</h3>

            {/* Preview Variables */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
              <p className="text-xs font-medium text-gray-600 uppercase">Test Variables</p>
              {formData.content.match(/\{\{\d+\}\}/g)?.map((match) => {
                const key = match.replace(/[{}]/g, '');
                return (
                  <input
                    key={key}
                    type="text"
                    placeholder={`Variable {'{' + key + '}'}`}
                    value={previewVariables[key] || ''}
                    onChange={(e) => handlePreviewVariableChange(key, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                );
              })}
            </div>

            {/* Message Preview */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              {/* Header */}
              {formData.header && (
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600">{formData.header}</p>
                </div>
              )}

              {/* Message Body */}
              <div className="px-4 py-3">
                <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                  {getPreviewText()}
                </p>
              </div>

              {/* Footer */}
              {formData.footer && (
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">{formData.footer}</p>
                </div>
              )}

              {/* Buttons */}
              {validButtons.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 space-y-2">
                  {validButtons.map((btn, idx) => (
                    <div key={idx} className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded text-xs font-medium text-blue-600 hover:bg-blue-100">
                        {btn.title}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
