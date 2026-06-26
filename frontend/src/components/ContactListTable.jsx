import React, { useState } from 'react';
import EditContactModal from './EditContactModal';

export default function ContactListTable({
  contacts,
  selectedContacts,
  tags,
  loading,
  onSelectContact,
  onSelectAll,
  onDeleteContact,
  onRefresh,
}) {
  const [editingContact, setEditingContact] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading contacts...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 text-lg">No contacts found. Add your first contact or upload a CSV file.</p>
      </div>
    );
  }

  console.log('ContactListTable received contacts:', contacts);

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedContacts.size === contacts.length && contacts.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => onSelectContact(contact.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.name || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {contact.tags && contact.tags.length > 0 ? (
                      contact.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs italic">No tags</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          tags={tags}
          onClose={() => setEditingContact(null)}
          onSubmit={() => {
            setEditingContact(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
