import React from 'react';

/**
 * ContactList Component
 * Displays list of phone numbers with validation status
 */
const ContactList = ({ contacts, validContacts = [] }) => {
  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Contact List</h2>
        <div className="text-center text-gray-500 py-8">
          <p>No contacts uploaded yet</p>
          <p className="text-sm mt-2">Upload a CSV or TXT file to get started</p>
        </div>
      </div>
    );
  }

  const isValid = (phone) => validContacts.includes(phone);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Contact List</h2>
      
      <div className="mb-4 flex items-center justify-between text-sm">
        <div>
          <span className="font-medium">Total: {contacts.length}</span>
          {validContacts.length > 0 && (
            <>
              <span className="ml-4 text-green-600">✓ Valid: {validContacts.length}</span>
              <span className="ml-4 text-red-600">✗ Invalid: {contacts.length - validContacts.length}</span>
            </>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((phone, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{phone}</td>
                  <td className="px-4 py-3 text-sm">
                    {validContacts.length > 0 ? (
                      isValid(phone) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Invalid
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not validated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactList;
