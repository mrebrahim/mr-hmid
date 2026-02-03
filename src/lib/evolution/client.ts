/**
 * Evolution API Client
 * For sending WhatsApp messages via Evolution API
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || '010';

interface SendTextResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation: string;
  };
  messageTimestamp: string;
  status: string;
}

interface EvolutionError {
  status: number;
  error: string;
  message: string;
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(
  phone: string,
  text: string
): Promise<{ success: boolean; data?: SendTextResponse; error?: string }> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    console.warn('[Evolution API] Not configured - EVOLUTION_API_URL or EVOLUTION_API_KEY missing');
    return { success: false, error: 'Evolution API not configured' };
  }

  // Format phone number - remove any non-digit characters and add Egypt country code
  let formattedPhone = phone.replace(/\D/g, '').replace('@s.whatsapp.net', '');

  // Add Egypt country code (20) if number starts with 0
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '20' + formattedPhone.substring(1);
  }
  // Add 20 if number doesn't have country code (10 digits)
  else if (formattedPhone.length === 10) {
    formattedPhone = '20' + formattedPhone;
  }

  // Add WhatsApp suffix
  formattedPhone = formattedPhone + '@s.whatsapp.net';

  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: text,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json() as EvolutionError;
      console.error('[Evolution API] Error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send message' };
    }

    const data = await response.json() as SendTextResponse;
    console.log('[Evolution API] Message sent successfully:', data.key?.id);
    return { success: true, data };
  } catch (error) {
    console.error('[Evolution API] Request failed:', error);
    return { success: false, error: 'Request failed' };
  }
}

/**
 * Check if a phone number is registered on WhatsApp
 */
export async function checkWhatsAppNumber(
  phone: string
): Promise<{ exists: boolean; jid?: string }> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return { exists: false };
  }

  const formattedPhone = phone.replace(/\D/g, '');

  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/chat/whatsappNumbers/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          numbers: [formattedPhone],
        }),
      }
    );

    if (!response.ok) {
      return { exists: false };
    }

    const data = await response.json();
    const result = data[0];
    return {
      exists: result?.exists || false,
      jid: result?.jid,
    };
  } catch (error) {
    console.error('[Evolution API] Check number failed:', error);
    return { exists: false };
  }
}

/**
 * Get connection status of the WhatsApp instance
 */
export async function getConnectionStatus(): Promise<{
  connected: boolean;
  state?: string;
}> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return { connected: false };
  }

  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
      {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return { connected: false };
    }

    const data = await response.json();
    return {
      connected: data.instance?.state === 'open',
      state: data.instance?.state,
    };
  } catch (error) {
    console.error('[Evolution API] Connection check failed:', error);
    return { connected: false };
  }
}
