import axios from 'axios';

/**
 * WhatsApp API Service - Handles all Meta WhatsApp Cloud API interactions
 * NO DATABASE - All operations are stateless
 */
class WhatsAppService {
  constructor() {
    // Read credentials from environment variables
    // IMPORTANT: Get these from Meta Developer Console (https://developers.facebook.com/apps)
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.token = process.env.WHATSAPP_TOKEN;
    this.apiVersion = process.env.GRAPH_API_VERSION || 'v17.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;

    if (!this.phoneNumberId || !this.token) {
      console.warn('⚠️  WhatsApp credentials not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TOKEN in .env file');
    }
  }

  /**
   * Validate phone numbers using WhatsApp Contacts API
   * Checks which numbers are registered on WhatsApp
   * 
   * @param {string[]} phones - Array of phone numbers to validate (max 50 per call)
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
      // Response format: { contacts: [{ input: "+1234567890", status: "valid", wa_id: "1234567890" }] }
      const validNumbers = response.data.contacts
        .filter((contact) => contact.status === 'valid')
        .map((contact) => contact.input);

      return validNumbers;
    } catch (error) {
      console.error('WhatsApp validation error:', error.response?.data || error.message);
      
      // Handle rate limiting
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before retrying.');
      }
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Invalid WhatsApp access token. Check your WHATSAPP_TOKEN in .env');
      }
      
      throw new Error(error.response?.data?.error?.message || 'Failed to validate phone numbers');
    }
  }

  /**
   * Send a WhatsApp text message to a recipient
   * 
   * @param {string} to - Recipient phone number (with country code)
   * @param {string} message - Message text
   * @returns {Promise<Object>} - Result object { success, messageId?, to, error? }
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
      const errorData = error.response?.data?.error;
      
      // Check for pair rate limiting (130429 error code)
      // This happens when you exceed per-recipient rate limits
      if (errorData?.code === 130429) {
        return {
          success: false,
          to: to,
          error: 'Pair rate limit exceeded for this recipient',
          errorCode: 130429,
        };
      }
      
      // Check for general rate limiting (429 HTTP status)
      if (error.response?.status === 429) {
        return {
          success: false,
          to: to,
          error: 'Rate limit exceeded. Slow down sending.',
          errorCode: 429,
        };
      }
      
      // Check for 24-hour window restriction
      if (errorData?.code === 131047 || errorData?.message?.includes('24 hour')) {
        return {
          success: false,
          to: to,
          error: 'Message outside 24-hour window. Use approved template instead.',
          errorCode: 131047,
        };
      }

      console.error(`Failed to send message to ${to}:`, errorData || error.message);
      
      return {
        success: false,
        to: to,
        error: errorData?.message || error.message || 'Failed to send message',
        errorCode: errorData?.code,
      };
    }
  }

  /**
   * Send a template message (for users outside 24-hour window)
   * NOTE: Template must be pre-approved by Meta
   * 
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Template name registered with Meta
   * @param {string} languageCode - Language code (e.g., 'en_US')
   * @param {Array} components - Template components/parameters
   * @returns {Promise<Object>} - Result object
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
      const errorData = error.response?.data?.error;
      
      return {
        success: false,
        to: to,
        error: errorData?.message || error.message || 'Failed to send template',
        errorCode: errorData?.code,
      };
    }
  }
}

export default WhatsAppService;
