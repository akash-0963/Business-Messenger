import React, { useState, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BulkUploadModal({ onClose, onSubmit, onTagCreated }) {
  const [file, setFile] = useState(null);
  const [bulkTag, setBulkTag] = useState('');
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await onSubmit({ file, bulkTag });
      setResults(response.results);
      onTagCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload contacts');
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Upload Results</h2>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-600">Success</p>
                <p className="text-3xl font-bold text-green-700">{results.success}</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-600">Skipped</p>
                <p className="text-3xl font-bold text-yellow-700">{results.skipped}</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-3xl font-bold text-red-700">{results.failed}</p>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4 max-h-48 overflow-y-auto">
                <p className="font-medium text-red-900 mb-2">Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.reason} ({err.phone})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Bulk Upload Contacts</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CSV File *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50"
            >
              <p className="text-gray-600">{file ? file.name : 'Click to select or drag CSV file'}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Format: phone (required), name (optional), tags (optional, comma-separated)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Tag (Optional)</label>
            <input
              type="text"
              value={bulkTag}
              onChange={(e) => setBulkTag(e.target.value)}
              placeholder="e.g., June-Broadcast (applies to all imported contacts)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {preview.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview (First 5 Rows)</label>
              <div className="overflow-x-auto bg-gray-50 rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Phone</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Name</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-4 py-2 text-gray-700">{row.phone || '-'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.name || '-'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.tags || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Contacts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
