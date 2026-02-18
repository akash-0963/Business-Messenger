import React, { useState } from 'react';

/**
 * FileUpload Component
 * Handles CSV/TXT file uploads and phone number extraction
 * Supports global phone numbers
 */
const FileUpload = ({ onPhonesExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [manualInput, setManualInput] = useState('');

  /**
   * Extract phone number from text - handles global formats
   */
  const extractPhoneFromText = (text) => {
    if (!text) return null;
    
    // Remove all non-digit characters except +
    const cleaned = text.replace(/[^\d\+]/g, '');
    
    // Phone number patterns
    const patterns = [
      /\+?\d{10,15}/,  // General international format
    ];
    
    for (let pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const number = match[0];
        const digitsOnly = number.replace(/\D/g, '');
        if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
          return number;
        }
      }
    }
    
    return null;
  };

  /**
   * Parse file content and extract phone numbers
   */
  const parseFile = (content) => {
    const lines = content.split(/[\n\r]+/).map(line => line.trim()).filter(line => line);
    
    const phones = [];
    
    lines.forEach(line => {
      if (line.includes(',')) {
        const fields = line.split(',').map(f => f.trim());
        fields.forEach(field => {
          const extracted = extractPhoneFromText(field);
          if (extracted) phones.push(extracted);
        });
      } else {
        const extracted = extractPhoneFromText(line);
        if (extracted) phones.push(extracted);
      }
    });

    return phones;
  };

  /**
   * Handle file upload
   */
  const handleFile = (file) => {
    if (!file) return;

    // Check file type
    const validTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
    const isValidType = validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.txt');

    if (!isValidType) {
      alert('Please upload a CSV or TXT file');
      return;
    }

    setFileName(file.name);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const phones = parseFile(content);
      onPhonesExtracted(phones);
    };
    reader.readAsText(file);
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  /**
   * Handle file input change
   */
  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  /**
   * Handle manual phone number input
   */
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      alert('Please enter phone numbers');
      return;
    }

    // Parse manual input (split by newlines, commas, spaces, semicolons)
    const phones = manualInput
      .split(/[\n,;\s]+/)
      .map(phone => phone.trim())
      .filter(phone => phone && extractPhoneFromText(phone));

    if (phones.length === 0) {
      alert('No valid phone numbers found');
      return;
    }

    onPhonesExtracted(phones);
    setManualInput('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📁 Add Contacts</h2>
      
      {/* Manual Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ✍️ Manual Input (Enter phone numbers)
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent resize-none"
          rows="4"
          placeholder="Enter phone numbers (one per line or comma-separated)&#10;Example:&#10;9876543210&#10;+919876543210, 9123456789"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
        />
        <button
          onClick={handleManualSubmit}
          className="mt-2 px-6 py-2 bg-whatsapp-primary text-white rounded-lg hover:bg-whatsapp-dark transition-colors font-medium"
        >
          Add Numbers
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>
      
      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📂 Upload File
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-whatsapp-primary bg-whatsapp-light bg-opacity-20'
              : 'border-gray-300 hover:border-whatsapp-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Drop your CSV/TXT file here, or{' '}
              <span className="text-whatsapp-primary hover:text-whatsapp-dark">browse</span>
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".csv,.txt"
              onChange={handleChange}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">CSV or TXT files only</p>
        </div>
        {fileName && (
          <div className="mt-4 text-sm text-whatsapp-dark font-medium">
            ✓ {fileName}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default FileUpload;
