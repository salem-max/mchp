import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeJobDescription } from '@/lib/agents/messaging-orchestrator';

const schema = z.object({
  description: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description } = schema.parse(body);

    // Use the multi-agent orchestrator for analysis
    const result = await analyzeJobDescription(description);

    return NextResponse.json({
      success: true,
      data: {
        category: result.category,
        minBudget: result.minBudget,
        maxBudget: result.maxBudget,
        skills: result.skills,
        suggestedTechnicians: result.suggestedTechnicians,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[Malaysia Co (Maintenance Services)] AI suggest-budget error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500 }
    );
  }
}
