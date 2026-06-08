import { NextRequest, NextResponse } from 'next/server';
import { processUserQuery } from '@/lib/agents/messaging-orchestrator';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name: string };
  chat: { id: number; type: string };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) {
    console.error('[Malaysia Co (Maintenance Services)] TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

async function sendTypingAction(chatId: number) {
  if (!BOT_TOKEN) return;

  await fetch(`${API_URL}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      action: 'typing',
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: TelegramUpdate = await req.json();
    const msg = body.message;

    if (!msg?.text) {
      return NextResponse.json({ ok: true });
    }

    const { id: chatId } = msg.chat;
    const userId = String(msg.from?.id || chatId);
    const userText = msg.text;

    // Handle /start command
    if (userText === '/start') {
      await sendMessage(
        chatId,
        `*Welcome to Malaysia Co (Maintenance Services)!* 🔧\n\nI'm your AI assistant for home and office maintenance services.\n\nJust describe your issue (e.g., "leaking tap in kitchen" or "AC not cooling") and I'll:\n- Analyze your request\n- Estimate a fair budget\n- Find available technicians\n\nHow can I help you today?`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (userText === '/help') {
      await sendMessage(
        chatId,
        `*Malaysia Co (Maintenance Services) Help*\n\nI can help you with:\n• Plumbing issues\n• Electrical repairs\n• AC servicing\n• Carpentry\n• Painting\n• Cleaning services\n• Appliance repairs\n• General maintenance\n\nJust describe your problem in detail and I'll assist you!`
      );
      return NextResponse.json({ ok: true });
    }

    // Show typing indicator
    await sendTypingAction(chatId);

    // Process the query through multi-agent system
    const result = await processUserQuery(userText, 'telegram', userId);

    // Format response for Telegram
    let response = result.answer;

    if (result.suggested.length > 0) {
      response += `\n\n*Available Technicians:*`;
      result.suggested.forEach((tech, i) => {
        response += `\n${i + 1}. ${tech.name} (★${tech.rating.toFixed(1)})`;
      });
    }

    response += `\n\n_Category: ${result.category} | Budget: ₹${result.budgetMin}-₹${result.budgetMax}_`;

    await sendMessage(chatId, response);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Malaysia Co (Maintenance Services)] Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// Webhook verification (optional, for setup)
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' });
}
