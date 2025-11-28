import React from 'react';

/**
 * MessageComposer Component
 * Allows users to compose broadcast messages with template support
 */
const MessageComposer = ({ message, onChange, onSend, disabled = false, validContactsCount = 0 }) => {
  const handleSend = () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    if (validContactsCount === 0) {
      alert('No valid contacts to send to. Please validate contacts first.');
      return;
    }
    onSend();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">✉️ Compose Message</h2>
      
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message Content
        </label>
        <textarea
          id="message"
          rows="6"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent resize-none"
          placeholder="Type your message here...&#10;&#10;You can use placeholders:&#10;{{name}} - Recipient's name&#10;{{phone}} - Recipient's phone&#10;{{email}} - Recipient's email&#10;{{city}} - Recipient's city"
          value={message}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span>{message.length} characters</span>
          <span>Recipients: {validContactsCount}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Use placeholders like <code className="bg-blue-100 px-1 rounded">{'{{name}}'}</code> to personalize messages.
          The system will automatically replace them with contact data if available.
        </p>
      </div>

      <button
        onClick={handleSend}
        disabled={disabled || !message.trim() || validContactsCount === 0}
        className="w-full bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <span>Send Broadcast</span>
      </button>
    </div>
  );
};

export default MessageComposer;
