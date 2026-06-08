import { generateText } from 'ai';
import { vectorSearch } from '@/lib/rag';
import { prisma as db } from './prisma'


// Use AI Gateway model - defaults to gpt-4o-mini
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o-mini';

interface TechnicianMatch {
  name: string;
  rating: number;
  reason: string;
  userId?: string;
}

interface QueryResult {
  answer: string;
  category: string;
  confidence: number;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  suggested: TechnicianMatch[];
  ragContext: string[];
}

/**
 * Store chat message in history for conversation memory
 */
async function storeChatMessage(
  platform: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string
) {
  await prismaClient.chatHistory.create({
    data: {
      platform,
      userId,
      role,
      content,
    },
  });
}

/**
 * Get recent chat history for context
 */
async function getChatHistory(
  platform: string,
  userId: string,
  limit = 10
): Promise<string> {
  const history = await prismaClient.chatHistory.findMany({
    where: { platform, userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  if (history.length === 0) return '';

  return history
    .reverse()
    .map((m: any) => `${m.role}: ${m.content}`)
    .join('\n');
}

/**
 * Multi-agent orchestrator that processes user queries
 * Uses RAG for context, categorizes jobs, estimates budgets, and matches technicians
 */
export async function processUserQuery(
  userMessage: string,
  platform: string,
  userId: string
): Promise<QueryResult> {
  const model = getModel();

  // Store user message
  await storeChatMessage(platform, userId, 'user', userMessage);

  // 1. Retrieve relevant past jobs/documents (RAG)
  const similarDocs = await vectorSearch(userMessage, 3, 0.3);
  const ragContext = similarDocs.map((d: any) => d.content);
  const contextStr = ragContext.length > 0 ? ragContext.join('\n---\n') : 'No similar past jobs found.';

  // Get conversation history
  const chatHistory = await getChatHistory(platform, userId, 5);

  // 2. Categorize the job request
  let category = 'other';
  let confidence = 0;

  try {
    const { text: categoryText } = await generateText({
      model,
      prompt: `Analyze this maintenance/repair request and output ONLY valid JSON (no markdown, no explanation):
{"category":"maintenance|plumbing|electrical|ac|carpentry|painting|cleaning|appliance|other","confidence":0.0-1.0}

Request: "${userMessage}"

Categories:
- maintenance: General home/office maintenance, minor repairs
- plumbing: Water pipes, taps, drains, toilet, water heater
- electrical: Wiring, switches, outlets, lighting, electrical panels
- ac: Air conditioning repair, servicing, installation
- carpentry: Furniture repair, doors, windows, wooden structures
- painting: Wall painting, touch-ups, interior/exterior painting
- cleaning: Deep cleaning, move-in/out cleaning, regular cleaning
- appliance: Washing machine, refrigerator, microwave repair
- other: Anything else

Output JSON only:`,
      temperature: 0,
    });

    const parsed = JSON.parse(categoryText.trim());
    category = parsed.category || 'other';
    confidence = parsed.confidence || 0.5;
  } catch {
    category = 'other';
    confidence = 0.3;
  }

  // 3. Budget estimation in INR
  let budgetMin = 500;
  let budgetMax = 2000;

  try {
    const { text: budgetText } = await generateText({
      model,
      prompt: `Estimate a fair price range in Indian Rupees (INR) for this "${category}" job.
Output ONLY valid JSON (no markdown): {"min":number,"max":number}

Job description: "${userMessage}"

Consider typical Indian market rates. Output JSON only:`,
      temperature: 0.2,
    });

    const parsed = JSON.parse(budgetText.trim());
    budgetMin = parsed.min || 500;
    budgetMax = parsed.max || 2000;
  } catch {
    // Default budget based on category
    const categoryBudgets: Record<string, [number, number]> = {
      plumbing: [500, 3000],
      electrical: [500, 5000],
      ac: [1000, 8000],
      carpentry: [1000, 10000],
      painting: [2000, 15000],
      cleaning: [500, 3000],
      appliance: [500, 5000],
      maintenance: [500, 3000],
      other: [500, 2000],
    };
    [budgetMin, budgetMax] = categoryBudgets[category] || [500, 2000];
  }

  // 4. Find and rank available technicians
  const techProfiles = await prismaClient.technicianProfile.findMany({
    where: {
      skills: { has: category },
      isAvailable: true,
    },
    include: { user: true },
    take: 10,
  });

  let suggested: TechnicianMatch[] = [];

  if (techProfiles.length > 0) {
    try {
      const techList = techProfiles
        .map((t: any) => `- ${t.user.name}, rating ${t.user.avgRating || 0}, rate ₹${t.hourlyRate || 'N/A'}/hr`)
        .join('\n');

      const { text: matchText } = await generateText({
        model,
        prompt: `Rank these technicians for a "${category}" job and return top 3.
Output ONLY valid JSON array: [{"name":"...","rating":number,"reason":"short reason"}]

Job: "${userMessage}"

Available technicians:
${techList}

Output JSON array only:`,
        temperature: 0,
      });

      const parsed = JSON.parse(matchText.trim());
      suggested = (parsed as TechnicianMatch[]).slice(0, 3).map((t, i) => ({
        ...t,
        userId: techProfiles[i]?.userId,
      }));
    } catch {
      // Fallback: return top 3 by rating
      suggested = techProfiles.slice(0, 3).map((t: any) => ({
        name: t.user.name,
        rating: t.user.avgRating || 0,
        reason: 'Available and skilled',
        userId: t.userId,
      }));
    }
  }

  // 5. Generate a helpful, conversational response
  let answer = '';

  try {
    const techNames = suggested.map((t: any) => t.name).join(', ') || 'No technicians currently available';

    const { text } = await generateText({
      model,
      prompt: `You are Malaysia Co (Maintenance Services) AI assistant helping users find maintenance/repair services.

Based on analysis:
- Category: ${category} (confidence: ${(confidence * 100).toFixed(0)}%)
- Estimated budget: ₹${budgetMin} - ₹${budgetMax}
- Top technicians: ${techNames}
- Similar past jobs: ${contextStr}

${chatHistory ? `Recent conversation:\n${chatHistory}\n` : ''}

User's current message: "${userMessage}"

Write a helpful, friendly response (2-4 sentences). Include the budget estimate and mention available technicians if any. Be conversational and helpful.`,
      temperature: 0.7,
    });

    answer = text;
  } catch {
    answer = `I analyzed your request for ${category} services. The estimated budget is ₹${budgetMin} - ₹${budgetMax}. ${suggested.length > 0 ? `We have ${suggested.length} technician(s) available to help.` : 'No technicians are currently available, but you can post a job to get quotes.'}`;
  }

  // Store assistant response
  await storeChatMessage(platform, userId, 'assistant', answer);

  // 6. Save analysis for analytics
  await prismaClient.jobAnalysis.create({
    data: {
      query: userMessage,
      category,
      budgetMin,
      budgetMax,
      currency: 'INR',
      technicians: suggested,
      metadata: {
        platform,
        userId,
        confidence,
        ragContext: similarDocs.map((d: any) => ({
          content: d.content.slice(0, 100),
          similarity: d.similarity,
        })),
      },
    },
  });

  return {
    answer,
    category,
    confidence,
    budgetMin,
    budgetMax,
    currency: 'INR',
    suggested,
    ragContext,
  };
}

/**
 * Simple query for just getting a category and budget (used by web form)
 */
export async function analyzeJobDescription(description: string) {
  const result = await processUserQuery(description, 'web', 'anonymous');
  return {
    category: result.category,
    minBudget: result.budgetMin,
    maxBudget: result.budgetMax,
    skills: [result.category], // simplified
    suggestedTechnicians: result.suggested,
  };
}
