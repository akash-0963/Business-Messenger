import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TagSelector({ tags, selectedIds, onSelectionChange, onTagCreated }) {
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  const handleTagToggle = (tagId) => {
    const newSelected = selectedIds.includes(tagId)
      ? selectedIds.filter(id => id !== tagId)
      : [...selectedIds, tagId];
    onSelectionChange(newSelected);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setCreatingTag(true);
    try {
      await axios.post(`${API_URL}/api/tags`, { name: newTagName.trim() });
      setNewTagName('');
      setShowNewTag(false);
      onTagCreated?.();
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreatingTag(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIds.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag ? (
            <div key={tagId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagToggle(tagId)}
                className="ml-1 hover:text-blue-900 font-bold"
              >
                ×
              </button>
            </div>
          ) : null;
        })}
      </div>

      {/* Tag List */}
      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
        {tags.length > 0 ? (
          <div className="space-y-2">
            {tags.map(tag => (
              <label key={tag.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-700">{tag.name}</span>
                <span className="text-xs text-gray-500">({tag.contactCount || 0})</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 italic">No tags yet. Create one below.</p>
        )}
      </div>

      {/* Create New Tag */}
      {showNewTag ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={creatingTag}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creatingTag ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewTag(false);
              setNewTagName('');
            }}
            className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewTag(true)}
          className="w-full mt-2 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          + Create New Tag
        </button>
      )}
    </div>
  );
}
