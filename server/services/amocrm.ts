import axios from 'axios';
import { formatClientName } from '../lib/name-formatter';

interface AmoCRMContact {
  id: number;
  name: string;
  custom_fields_values?: Array<{
    field_id: number;
    values: Array<{ value: string }>;
  }>;
}

interface AmoCRMLead {
  id: number;
  name: string;
  custom_fields_values?: Array<{
    field_id: number;
    values: Array<{ value: string }>;
  }>;
  _embedded?: {
    contacts?: AmoCRMContact[];
  };
}

export class AmoCRMService {
  private domain: string;
  private accessToken: string;
  private clientIdFieldId: number;
  private cardTypeFieldId: number;
  private isConfigured: boolean;

  constructor() {
    this.domain = process.env.AMO_DOMAIN || '';
    this.accessToken = process.env.AMO_ACCESS_TOKEN || '';
    this.clientIdFieldId = parseInt(process.env.CUSTOM_FIELD_ID_CLIENT_ID || '1169601');
    this.cardTypeFieldId = parseInt(process.env.CUSTOM_FIELD_ID_CARD_TYPE || '1181149');

    // Проверяем, настроен ли AmoCRM
    this.isConfigured = !!(this.domain && this.accessToken);
    
    if (!this.isConfigured) {
      console.warn('AmoCRM configuration is missing. AmoCRM integration will be disabled.');
      console.warn('Please set AMO_DOMAIN and AMO_ACCESS_TOKEN environment variables to enable AmoCRM integration.');
    } else {
      console.log('AmoCRM configured:', {
        domain: this.domain,
        clientIdFieldId: this.clientIdFieldId,
        cardTypeFieldId: this.cardTypeFieldId
      });
    }
  }

  private checkConfiguration() {
    if (!this.isConfigured) {
      throw new Error('AmoCRM is not configured. Please set AMO_DOMAIN and AMO_ACCESS_TOKEN environment variables.');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getLeadDetails(leadId: number): Promise<AmoCRMLead> {
    this.checkConfiguration();
    
    try {
      console.log(`Fetching lead details for ID: ${leadId}`);
      const response = await axios.get(
        `https://${this.domain}/api/v4/leads/${leadId}?with=contacts`,
        { headers: this.getHeaders() }
      );
      console.log('Lead details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching lead details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Failed to fetch lead details from AmoCRM');
    }
  }

  async getContactDetails(contactId: number): Promise<AmoCRMContact> {
    this.checkConfiguration();
    
    try {
      console.log(`Fetching contact details for ID: ${contactId}`);
      const response = await axios.get(
        `https://${this.domain}/api/v4/contacts/${contactId}`,
        { headers: this.getHeaders() }
      );
      console.log('Contact details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Failed to fetch contact details from AmoCRM');
    }
  }

  extractCustomFieldValue(customFields: Array<{ field_id: number; values: Array<{ value: string }> }> | undefined, fieldId: number): string | null {
    if (!customFields) {
      console.log(`No custom fields found`);
      return null;
    }
    
    console.log(`Looking for field ID ${fieldId} in custom fields:`, customFields);
    const field = customFields.find(f => f.field_id === fieldId);
    const value = field?.values?.[0]?.value || null;
    console.log(`Field ${fieldId} value:`, value);
    return value;
  }

  async processLead(leadId: number) {
    this.checkConfiguration();
    
    console.log(`Processing lead ${leadId}`);
    const lead = await this.getLeadDetails(leadId);
    
    // Extract card type from lead
    const cardType = this.extractCustomFieldValue(lead.custom_fields_values, this.cardTypeFieldId);
    if (!cardType) {
      console.error('Available custom fields in lead:', lead.custom_fields_values);
      throw new Error(`Card type not found in lead. Looking for field ID: ${this.cardTypeFieldId}`);
    }

    // Get contact details
    const contact = lead._embedded?.contacts?.[0];
    if (!contact) {
      console.error('Lead data:', lead);
      throw new Error('No contact found for lead');
    }

    const fullContact = await this.getContactDetails(contact.id);
    
    // Extract client ID from contact
    const clientId = this.extractCustomFieldValue(fullContact.custom_fields_values, this.clientIdFieldId);
    if (!clientId) {
      console.error('Available custom fields in contact:', fullContact.custom_fields_values);
      throw new Error(`Client ID not found in contact. Looking for field ID: ${this.clientIdFieldId}`);
    }

    // Форматируем имя клиента для корректного отображения
    const formattedClientName = formatClientName(fullContact.name);

    const result = {
      clientId,
      clientName: formattedClientName,
      cardType,
    };

    console.log('Processed lead result:', result);
    return result;
  }

  isAmoCRMConfigured(): boolean {
    return this.isConfigured;
  }
}