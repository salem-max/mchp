import { NextRequest, NextResponse } from 'next/server';
import { processUserQuery } from '@/lib/agents/messaging-orchestrator';

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const API_VERSION = 'v18.0';

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'location' | 'contacts';
  text?: { body: string };
}

interface WhatsAppWebhookBody {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      value?: {
        messaging_product: string;
        metadata?: { phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
}

async function sendMessage(to: string, text: string) {
  if (!TOKEN || !PHONE_ID) {
    console.error('[Malaysia Co (Maintenance Services)] WhatsApp credentials not configured');
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });
  } catch (error) {
    console.error('[Malaysia Co (Maintenance Services)] WhatsApp send error:', error);
  }
}

async function markAsRead(messageId: string) {
  if (!TOKEN || !PHONE_ID) return;

  try {
    await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (error) {
    console.error('[Malaysia Co (Maintenance Services)] WhatsApp mark read error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: WhatsAppWebhookBody = await req.json();

    // Verify this is a WhatsApp webhook
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' });
    }

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Only process text messages
    if (!message || message.type !== 'text' || !message.text?.body) {
      return NextResponse.json({ status: 'ok' });
    }

    const { from, text, id: messageId } = message;
    const userText = text.body;

    // Mark message as read
    await markAsRead(messageId);

    // Handle help keyword
    if (userText.toLowerCase() === 'help' || userText.toLowerCase() === 'hi' || userText.toLowerCase() === 'hello') {
      await sendMessage(
        from,
        `*Welcome to Malaysia Co (Maintenance Services)!* 🔧

I'm your AI assistant for home and office maintenance.

Just describe your issue and I'll:
✅ Analyze your request
✅ Estimate a fair budget
✅ Find available technicians

*Services we cover:*
• Plumbing
• Electrical
• AC Repair
• Carpentry
• Painting
• Cleaning
• Appliance Repair

How can I help you today?`
      );
      return NextResponse.json({ status: 'ok' });
    }

    // Process through multi-agent system
    const result = await processUserQuery(userText, 'whatsapp', from);

    // Format response for WhatsApp
    let response = result.answer;

    response += `\n\n📋 *Analysis:*`;
    response += `\n• Category: ${result.category}`;
    response += `\n• Budget: ₹${result.budgetMin} - ₹${result.budgetMax}`;

    if (result.suggested.length > 0) {
      response += `\n\n👷 *Available Technicians:*`;
      result.suggested.forEach((tech, i) => {
        response += `\n${i + 1}. ${tech.name} (★${tech.rating.toFixed(1)})`;
      });
      response += `\n\nReply with a technician number to book, or describe another issue.`;
    } else {
      response += `\n\nNo technicians currently available. Visit our website to post a job and get quotes.`;
    }

    await sendMessage(from, response);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Malaysia Co (Maintenance Services)] WhatsApp webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

// WhatsApp webhook verification (required for setup)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Verify the webhook
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Malaysia Co (Maintenance Services)] WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}
