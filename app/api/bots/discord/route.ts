import { NextRequest, NextResponse } from 'next/server';
import { processUserQuery } from '@/lib/agents/messaging-orchestrator';

// Discord interaction types
const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
} as const;

const INTERACTION_RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
} as const;

interface DiscordInteraction {
  type: number;
  data?: {
    name: string;
    options?: Array<{ name: string; value: string }>;
  };
  member?: {
    user?: { id: string; username: string };
  };
  user?: { id: string; username: string };
}

export async function POST(req: NextRequest) {
  try {
    const body: DiscordInteraction = await req.json();

    // Handle Discord ping (verification)
    if (body.type === INTERACTION_TYPE.PING) {
      return NextResponse.json({ type: INTERACTION_RESPONSE_TYPE.PONG });
    }

    // Handle slash commands
    if (body.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
      const commandName = body.data?.name;

      // /fixswift command
      if (commandName === 'fixswift') {
        const jobDescription = body.data?.options?.find((o) => o.name === 'job')?.value;

        if (!jobDescription) {
          return NextResponse.json({
            type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Please provide a job description. Example: `/fixswift job:leaking tap in kitchen`',
            },
          });
        }

        const userId = body.member?.user?.id || body.user?.id || 'unknown';

        // Process through multi-agent system
        const result = await processUserQuery(jobDescription, 'discord', userId);

        // Format response for Discord
        let content = `**Malaysia Co (Maintenance Services) Analysis**\n\n${result.answer}`;

        content += `\n\n📋 **Details:**`;
        content += `\n• Category: ${result.category}`;
        content += `\n• Budget: ₹${result.budgetMin} - ₹${result.budgetMax}`;

        if (result.suggested.length > 0) {
          content += `\n\n👷 **Available Technicians:**`;
          result.suggested.forEach((tech, i) => {
            content += `\n${i + 1}. ${tech.name} (★${tech.rating.toFixed(1)}) - ${tech.reason}`;
          });
        }

        return NextResponse.json({
          type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content },
        });
      }

      // /help command
      if (commandName === 'fixswift-help') {
        return NextResponse.json({
          type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `**Malaysia Co (Maintenance Services) Help**\n\nI can help you with maintenance and repair services:\n• Plumbing issues\n• Electrical repairs\n• AC servicing\n• Carpentry\n• Painting\n• Cleaning services\n• Appliance repairs\n\n**Usage:**\n\`/fixswift job:describe your problem here\`\n\nExample: \`/fixswift job:AC not cooling, making loud noise\``,
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Unknown interaction type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Malaysia Co (Maintenance Services)] Discord webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'Discord webhook active' });
}
