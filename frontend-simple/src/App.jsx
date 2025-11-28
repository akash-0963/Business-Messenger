import React, { useState } from 'react';
import { validatePhones, sendBroadcast } from './api';

const MAX_RECIPIENTS = 250;

function App() {
  // State
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [pastedText, setPastedText] = useState('');
  const [message, setMessage] = useState('');
  const [validatedNumbers, setValidatedNumbers] = useState(new Set());
  const [invalidNumbers, setInvalidNumbers] = useState(new Set());
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [defaultCountryCode, setDefaultCountryCode] = useState('');
  
  // UI State
  const [isValidating, setIsValidating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [validationWarning, setValidationWarning] = useState('');
  const [sendProgress, setSendProgress] = useState(null);
  const [sendResult, setSendResult] = useState(null);

  // Normalize phone number
  const normalizePhone = (phone) => {
    const trimmed = phone.trim();
    const hasPlus = trimmed.startsWith('+');
    const digitsOnly = trimmed.replace(/\D/g, '');
    return hasPlus ? `+${digitsOnly}` : digitsOnly;
  };

  // Parse phones from text (paste box)
  const parsePhones = (text) => {
    return text
      .split(/[\n,]/)
      .map(line => line.trim())
      .filter(line => line)
      .map(normalizePhone)
      .filter(phone => phone && phone.length >= 7);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const phones = parsePhones(content);
      const unique = [...new Set([...phoneNumbers, ...phones])];
      setPhoneNumbers(unique);
      
      // Auto-select all new numbers
      const newSelected = new Set(selectedNumbers);
      phones.forEach(p => newSelected.add(p));
      setSelectedNumbers(newSelected);
    };
    reader.readAsText(file);
  };

  // Handle paste text
  const handleAddFromPaste = () => {
    if (!pastedText.trim()) return;
    
    const phones = parsePhones(pastedText);
    const unique = [...new Set([...phoneNumbers, ...phones])];
    setPhoneNumbers(unique);
    
    // Auto-select all new numbers
    const newSelected = new Set(selectedNumbers);
    phones.forEach(p => newSelected.add(p));
    setSelectedNumbers(newSelected);
    
    setPastedText('');
  };

  // Add country code to all numbers missing it
  const handleAddCountryCode = () => {
    if (!defaultCountryCode) {
      alert('Please enter a country code (e.g., 1, 91, 44)');
      return;
    }

    const updated = phoneNumbers.map(phone => {
      if (phone.startsWith('+')) return phone;
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length >= 11) return phone; // Probably has country code
      return `+${defaultCountryCode}${digitsOnly}`;
    });

    setPhoneNumbers(updated);
    
    // Update selected numbers too
    const newSelected = new Set();
    updated.forEach(phone => {
      const oldPhone = phoneNumbers.find(p => p.replace(/\D/g, '') === phone.replace(/\D/g, ''));
      if (oldPhone && selectedNumbers.has(oldPhone)) {
        newSelected.add(phone);
      }
    });
    setSelectedNumbers(newSelected);
  };

  // Edit a phone number inline
  const handleEditPhone = (index, newValue) => {
    const updated = [...phoneNumbers];
    const oldValue = updated[index];
    const normalized = normalizePhone(newValue);
    updated[index] = normalized;
    setPhoneNumbers(updated);
    
    // Update selection
    if (selectedNumbers.has(oldValue)) {
      const newSelected = new Set(selectedNumbers);
      newSelected.delete(oldValue);
      newSelected.add(normalized);
      setSelectedNumbers(newSelected);
    }
  };

  // Remove a phone number
  const handleRemovePhone = (index) => {
    const removed = phoneNumbers[index];
    const updated = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(updated);
    
    // Remove from selected
    const newSelected = new Set(selectedNumbers);
    newSelected.delete(removed);
    setSelectedNumbers(newSelected);
    
    // Remove from validated/invalid
    validatedNumbers.delete(removed);
    invalidNumbers.delete(removed);
  };

  // Toggle number selection
  const toggleSelection = (phone) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedNumbers(newSelected);
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    setSelectedNumbers(new Set(phoneNumbers));
  };

  const handleDeselectAll = () => {
    setSelectedNumbers(new Set());
  };

  // Validate contacts
  const handleValidate = async () => {
    if (phoneNumbers.length === 0) {
      alert('Please add phone numbers first');
      return;
    }

    // Check for numbers without country codes
    const missingCode = phoneNumbers.filter(p => {
      const digits = p.replace(/\D/g, '');
      return !p.startsWith('+') && digits.length <= 10;
    });

    if (missingCode.length > 0) {
      const confirm = window.confirm(
        `Warning: ${missingCode.length} number(s) may be missing country code.\n\n` +
        `Numbers without '+' and 10 or fewer digits might not be in international format.\n\n` +
        `Continue validation anyway?`
      );
      if (!confirm) return;
    }

    setIsValidating(true);
    setValidationWarning('');
    setSendResult(null);

    try {
      const result = await validatePhones(phoneNumbers);
      
      setValidatedNumbers(new Set(result.valid));
      setInvalidNumbers(new Set(result.invalid));
      
      if (result.missingCountryCode && result.missingCountryCode.length > 0) {
        setValidationWarning(
          `Note: ${result.missingCountryCode.length} number(s) may be missing country code and couldn't be validated.`
        );
      }

      // Auto-select only valid numbers
      setSelectedNumbers(new Set(result.valid));
      
      alert(`Validation complete!\n\nValid: ${result.validCount}\nInvalid: ${result.invalidCount}`);
    } catch (error) {
      alert(`Validation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Send broadcast
  const handleSend = async () => {
    const recipients = Array.from(selectedNumbers);
    
    if (recipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    if (recipients.length > MAX_RECIPIENTS) {
      alert(`Maximum ${MAX_RECIPIENTS} recipients allowed. You have ${recipients.length} selected.\n\nPlease deselect some numbers or split into multiple sends.`);
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    // Check if all selected numbers are validated
    const unvalidated = recipients.filter(p => !validatedNumbers.has(p));
    if (unvalidated.length > 0) {
      const confirm = window.confirm(
        `Warning: ${unvalidated.length} selected number(s) have not been validated.\n\n` +
        `It's recommended to validate numbers before sending.\n\n` +
        `Continue anyway?`
      );
      if (!confirm) return;
    }

    const confirmSend = window.confirm(
      `Send broadcast to ${recipients.length} recipient(s)?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmSend) return;

    setIsSending(true);
    setSendProgress({ current: 0, total: recipients.length });
    setSendResult(null);

    try {
      const result = await sendBroadcast(recipients, message);
      
      setSendResult(result);
      alert(
        `Broadcast complete!\n\n` +
        `Sent: ${result.results.sent}\n` +
        `Failed: ${result.results.failed}`
      );
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Send failed: ${errorMsg}`);
      setSendResult({ success: false, error: errorMsg });
    } finally {
      setIsSending(false);
      setSendProgress(null);
    }
  };

  const selectedCount = selectedNumbers.size;
  const isOverLimit = selectedCount > MAX_RECIPIENTS;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-whatsapp-dark to-whatsapp-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">📱 WhatsApp Broadcast Portal</h1>
          <p className="text-sm text-whatsapp-light mt-1">No Database • Max {MAX_RECIPIENTS} Recipients</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📁 Upload Contacts</h2>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-whatsapp-primary file:text-white hover:file:bg-whatsapp-dark"
              />
              <p className="text-sm text-gray-500 mt-2">Upload CSV or TXT file with phone numbers</p>
            </div>

            {/* Paste Box */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Paste Phone Numbers</h2>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste phone numbers here (one per line or comma-separated)&#10;Example:&#10;+1234567890&#10;+919876543210&#10;+441234567890"
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent resize-none"
              />
              <button
                onClick={handleAddFromPaste}
                disabled={!pastedText.trim()}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Numbers
              </button>
            </div>

            {/* Country Code Helper */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">🌍 Add Country Code (Optional)</h2>
              <p className="text-sm text-gray-600 mb-3">
                If you have numbers without country codes, enter a default code:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={defaultCountryCode}
                  onChange={(e) => setDefaultCountryCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 1, 91, 44"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary w-32"
                />
                <button
                  onClick={handleAddCountryCode}
                  disabled={!defaultCountryCode || phoneNumbers.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Apply to All
                </button>
              </div>
            </div>

            {/* Message Composer */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">✉️ Compose Message</h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message here...&#10;&#10;Note: For messages outside 24-hour window, you'll need an approved template."
                rows="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent resize-none"
              />
              <div className="mt-2 text-sm text-gray-500">
                {message.length} characters
              </div>
              {message.length > 1000 && (
                <div className="mt-2 text-sm text-orange-600">
                  ⚠️ Long messages may be split into multiple parts
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Contact List & Actions */}
          <div className="space-y-6">
            
            {/* Counter & Warning */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Numbers:</span>
                  <span className="font-semibold">{phoneNumbers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected:</span>
                  <span className={`font-semibold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Validated:</span>
                  <span className="font-semibold text-blue-600">{validatedNumbers.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invalid:</span>
                  <span className="font-semibold text-red-600">{invalidNumbers.size}</span>
                </div>
              </div>
              
              {isOverLimit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">
                    ⚠️ LIMIT EXCEEDED
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Maximum {MAX_RECIPIENTS} recipients allowed. You have {selectedCount} selected.
                    Deselect {selectedCount - MAX_RECIPIENTS} number(s) to continue.
                  </p>
                </div>
              )}
              
              {validationWarning && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-xs text-yellow-800">{validationWarning}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">🎬 Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || phoneNumbers.length === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isValidating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validating...
                    </>
                  ) : (
                    '✓ Validate Contacts'
                  )}
                </button>

                <button
                  onClick={handleSend}
                  disabled={isSending || selectedCount === 0 || isOverLimit || !message.trim()}
                  className="w-full px-4 py-3 bg-whatsapp-primary text-white rounded-lg hover:bg-whatsapp-dark disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    '📤 Send Broadcast'
                  )}
                </button>

                <div className="pt-3 border-t space-y-2">
                  <button
                    onClick={handleSelectAll}
                    disabled={phoneNumbers.length === 0}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    disabled={selectedCount === 0}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Send Result */}
            {sendResult && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Result</h2>
                {sendResult.success ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">{sendResult.results.total}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Sent:</span>
                      <span className="font-semibold">{sendResult.results.sent}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Failed:</span>
                      <span className="font-semibold">{sendResult.results.failed}</span>
                    </div>
                    
                    {sendResult.details && sendResult.details.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <div className="mt-2 max-h-60 overflow-y-auto text-xs space-y-1">
                          {sendResult.details.map((detail, i) => (
                            <div key={i} className={detail.success ? 'text-green-600' : 'text-red-600'}>
                              {detail.success ? '✓' : '✗'} {detail.to}
                              {detail.error && `: ${detail.error}`}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Error: {sendResult.error}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Contact List */}
        {phoneNumbers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Contact List ({phoneNumbers.length} numbers)
            </h2>
            
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectedCount === phoneNumbers.length && phoneNumbers.length > 0}
                        onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                        className="rounded"
                      />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {phoneNumbers.map((phone, index) => {
                    const isSelected = selectedNumbers.has(phone);
                    const isValid = validatedNumbers.has(phone);
                    const isInvalid = invalidNumbers.has(phone);
                    
                    return (
                      <tr key={index} className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(phone)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => handleEditPhone(index, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {isValid && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Valid
                            </span>
                          )}
                          {isInvalid && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✗ Invalid
                            </span>
                          )}
                          {!isValid && !isInvalid && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Not validated
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleRemovePhone(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          <p>WhatsApp Broadcast Portal • No Database • Stateless Architecture</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
