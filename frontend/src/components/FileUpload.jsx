import React, { useState } from 'react';

/**
 * FileUpload Component
 * Handles CSV/TXT file uploads and phone number extraction
 */
const FileUpload = ({ onPhonesExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  /**
   * Parse file content and extract phone numbers
   */
  const parseFile = (content) => {
    // Split by newlines and commas, remove empty lines
    const lines = content.split(/[\n,]/).map(line => line.trim()).filter(line => line);
    
    // Extract phone numbers (simple extraction)
    const phones = lines.map(line => {
      // Try to extract digits from the line
      const match = line.match(/[\d\s\-\+\(\)]+/);
      return match ? match[0].trim() : line;
    }).filter(phone => phone);

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📁 Upload Contacts</h2>
      
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
  );
};

export default FileUpload;
