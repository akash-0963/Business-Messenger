import axios from 'axios';

/**
 * WhatsApp API Service
 * Handles all WhatsApp Cloud API interactions
 */
class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.token = process.env.WHATSAPP_TOKEN;
    this.apiVersion = process.env.GRAPH_API_VERSION || 'v17.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  /**
   * Validate phone numbers using WhatsApp Contacts API
   * @param {string[]} phones - Array of phone numbers to validate
   * @returns {Promise<string[]>} - Array of valid WhatsApp phone numbers
   */
  async validatePhoneNumbers(phones) {
    try {
      const response = await axios.post(
        `${this.baseURL}/contacts`,
        {
          blocking: 'wait',
          contacts: phones,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract valid WhatsApp IDs from response
      const validNumbers = response.data.contacts
        .filter((contact) => contact.status === 'valid')
        .map((contact) => contact.input);

      return validNumbers;
    } catch (error) {
      console.error('WhatsApp validation error:', error.response?.data || error.message);
      throw new Error('Failed to validate phone numbers with WhatsApp API');
    }
  }

  /**
   * Send a WhatsApp message to a recipient
   * @param {string} to - Recipient phone number (with country code)
   * @param {string} message - Message text
   * @returns {Promise<Object>} - API response
   */
  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        to: to,
      };
    } catch (error) {
      console.error(`Failed to send message to ${to}:`, error.response?.data || error.message);
      
      return {
        success: false,
        to: to,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send a template message (for users outside 24-hour window)
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Template name registered with Meta
   * @param {string} languageCode - Language code (e.g., 'en_US')
   * @param {Array} components - Template components/parameters
   * @returns {Promise<Object>} - API response
   */
  async sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        to: to,
      };
    } catch (error) {
      console.error(`Failed to send template to ${to}:`, error.response?.data || error.message);
      
      return {
        success: false,
        to: to,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}

export default WhatsAppService;
