/**
 * Register Discord slash commands for Malaysia Co (Maintenance Services) bot
 * Run this once after setting up your Discord application:
 *   npx ts-node scripts/register-discord-commands.ts
 */

const DISCORD_APP_ID = process.env.DISCORD_APP_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function registerCommands() {
  if (!DISCORD_APP_ID || !DISCORD_BOT_TOKEN) {
    console.error('Missing DISCORD_APP_ID or DISCORD_BOT_TOKEN environment variables');
    process.exit(1);
  }

  const commands = [
    {
      name: 'fixswift',
      description: 'Analyze a maintenance/repair job and get estimates',
      options: [
        {
          name: 'job',
          description: 'Describe your maintenance issue (e.g., "leaking tap in kitchen")',
          type: 3, // STRING type
          required: true,
        },
      ],
    },
    {
      name: 'fixswift-help',
      description: 'Get help using Malaysia Co (Maintenance Services) bot',
    },
  ];

  const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to register commands:', error);
      process.exit(1);
    }

    const data = await response.json();
    console.log('Successfully registered commands:', data);
  } catch (error) {
    console.error('Error registering commands:', error);
    process.exit(1);
  }
}

registerCommands();
