import React, { useState } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ContactList from '../components/ContactList';
import ActionButtons from '../components/ActionButtons';
import MessageComposer from '../components/MessageComposer';
import StatusLog from '../components/StatusLog';
import { validatePhones, sendBroadcast } from '../api/api';

const MAX_RECIPIENTS = 250;

/**
 * BroadcastPage - Main application page
 * Orchestrates the entire broadcast workflow with 250 recipient limit
 */
const BroadcastPage = () => {
  // State management
  const [contacts, setContacts] = useState([]);
  const [validContacts, setValidContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  /**
   * Add log entry
   */
  const addLog = (message, details = '', status = 'info') => {
    setLogs(prev => [...prev, {
      message,
      details,
      status,
      timestamp: new Date().toISOString()
    }]);
  };

  /**
   * Normalize phone number with country code support
   */
  const normalizePhone = (phone) => {
    if (!phone) return '';

    // Remove all whitespace, dashes, parentheses
    let cleaned = phone.replace(/[\s\-\(\)\.\[\]]/g, '');

    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = `+${cleaned}`;
    }

    return cleaned;
  };

  /**
   * Handle phone extraction from uploaded file or manual input
   */
  const handlePhonesExtracted = (phones) => {
    // Normalize and remove duplicates
    const normalized = phones.map(normalizePhone);
    const unique = [...new Set(normalized)];
    
    // Check 250 limit
    if (unique.length > MAX_RECIPIENTS) {
      addLog(
        'Recipient limit exceeded!',
        `You can only add up to ${MAX_RECIPIENTS} contacts. Current: ${unique.length}`,
        'error'
      );
      alert(`Maximum ${MAX_RECIPIENTS} recipients allowed. You have ${unique.length} numbers.`);
      return;
    }

    setContacts(unique);
    setValidContacts(unique); // Auto-mark all as valid (skip validation)
    
    addLog(
      'Contacts added successfully',
      `${unique.length} unique contacts added`,
      'success'
    );
  };

  /**
   * Handle contact validation
   */
  const handleValidate = async () => {
    if (contacts.length === 0) {
      alert('Please upload contacts first');
      return;
    }

    setIsValidating(true);
    addLog('Validating contacts...', `Checking ${contacts.length} numbers`, 'loading');

    try {
      const result = await validatePhones(contacts);
      
      if (result.success) {
        setValidContacts(result.validNumbers);
        addLog(
          'Validation complete',
          `${result.valid} valid, ${result.invalid} invalid out of ${result.total} contacts`,
          'success'
        );
      } else {
        addLog('Validation failed', result.message, 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      addLog('Validation failed', error.message, 'error');
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handle broadcast send
   */
  const handleSend = async () => {
    if (contacts.length === 0) {
      alert('Please add contacts first');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    // Use contacts directly (skip validation check)
    const numbersToSend = validContacts.length > 0 ? validContacts : contacts;

    const confirmSend = window.confirm(
      `Are you sure you want to send this message to ${numbersToSend.length} contacts?`
    );

    if (!confirmSend) return;

    setIsSending(true);
    addLog(
      'Sending broadcast...',
      `Sending to ${numbersToSend.length} recipients`,
      'loading'
    );

    try {
      const result = await sendBroadcast(numbersToSend, message);
      
      if (result.success) {
        addLog(
          'Broadcast completed',
          `${result.results.sent} sent successfully, ${result.results.failed} failed`,
          result.results.failed === 0 ? 'success' : 'info'
        );

        // Show detailed results if there were failures
        if (result.results.failed > 0) {
          const failures = result.details.filter(d => !d.success);
          failures.forEach(failure => {
            addLog(
              `Failed to send to ${failure.to}`,
              failure.error,
              'error'
            );
          });
        }
      } else {
        addLog('Broadcast failed', result.message, 'error');
      }
    } catch (error) {
      console.error('Send error:', error);
      addLog('Broadcast failed', error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Clear all data
   */
  const handleClear = () => {
    const confirmClear = window.confirm('Are you sure you want to clear all data?');
    if (confirmClear) {
      setContacts([]);
      setValidContacts([]);
      setMessage('');
      addLog('All data cleared', '', 'info');
    }
  };

  /**
   * Remove individual contact
   */
  const handleRemoveContact = (phoneToRemove) => {
    setContacts(prev => prev.filter(phone => phone !== phoneToRemove));
    setValidContacts(prev => prev.filter(phone => phone !== phoneToRemove));
    addLog('Contact removed', phoneToRemove, 'info');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Send Campaign</h1>
        <p className="text-gray-600 mt-1">Create and send bulk WhatsApp messages to your contacts</p>
      </div>
      
      {/* 250 Recipient Limit Warning */}
      {contacts.length > MAX_RECIPIENTS && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-bold">⚠️ Recipient Limit Exceeded!</p>
            <p>Maximum {MAX_RECIPIENTS} recipients allowed. You have {contacts.length} contacts. Please remove {contacts.length - MAX_RECIPIENTS} contacts before sending.</p>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload 
              onPhonesExtracted={handlePhonesExtracted}
            />
            
            <ContactList 
              contacts={contacts} 
              validContacts={validContacts}
              onRemoveContact={handleRemoveContact}
            />
            
            <MessageComposer
              message={message}
              onChange={setMessage}
              onSend={handleSend}
              disabled={isSending}
              validContactsCount={validContacts.length}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ActionButtons
              onValidate={handleValidate}
              onClear={handleClear}
              validateDisabled={contacts.length === 0}
              clearDisabled={contacts.length === 0 && logs.length === 0}
              isValidating={isValidating}
            />
            
            <StatusLog logs={logs} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>WA Messenger v1.0.0</p>
          <p className="mt-1">Built with React, Tailwind CSS, Node.js, Express & PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
};

export default BroadcastPage;
