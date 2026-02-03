import { NextRequest, NextResponse } from 'next/server';

/**
 * Evolution API Webhook Handler
 *
 * This route receives incoming WhatsApp messages from Evolution API
 * and forwards them to the n8n workflow for processing.
 *
 * Note: In production, you may want to process messages directly here
 * or use this as a passthrough to n8n.
 */

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: EvolutionWebhookPayload = await request.json();

    // Validate payload
    if (!payload.event || !payload.data) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Only process incoming messages (not from self)
    if (payload.data.key.fromMe) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Extract message text
    const messageText =
      payload.data.message.conversation ||
      payload.data.message.extendedTextMessage?.text ||
      '';

    if (!messageText) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Extract phone number (remove @s.whatsapp.net suffix)
    const phone = payload.data.key.remoteJid.replace(/@s\.whatsapp\.net$/, '');

    // Log the incoming message
    console.log(`[WhatsApp] Incoming message from ${phone}: ${messageText.substring(0, 50)}...`);

    // Forward to n8n workflow if configured
    const n8nWebhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!n8nResponse.ok) {
          console.error('[WhatsApp] n8n webhook failed:', await n8nResponse.text());
        }
      } catch (n8nError) {
        console.error('[WhatsApp] Failed to forward to n8n:', n8nError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Evolution API webhook endpoint' });
}
