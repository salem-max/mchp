import { createClient } from '@/lib/supabase/server'
import { streamText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { messages, jobId } = await req.json()

  // Fetch job context
  let jobContext = ''
  if (jobId) {
    const { data: job } = await supabase
      .from('jobs')
      .select('title, description, category, status, budget_min, budget_max, address')
      .eq('id', jobId)
      .single()

    if (job) {
      jobContext = `Current job context:
- Title: ${job.title}
- Category: ${job.category}
- Status: ${job.status}
- Budget: RM ${job.budget_min ?? 0} - ${job.budget_max ?? 0}
- Location: ${job.address ?? 'Not specified'}
- Description: ${job.description}`
    }
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are Malaysia Co (Maintenance Services)'s AI assistant helping with home service jobs. You help customers and technicians communicate effectively, understand job requirements, and resolve issues.

${jobContext}

Be concise, helpful, and professional. When suggesting actions that affect the job (like cancelling or marking complete), always ask for confirmation first using the request_confirmation tool.`,
    messages,
    tools: {
      get_job_status: tool({
        description: 'Get the current status and details of the job',
        inputSchema: z.object({}),
        execute: async () => {
          if (!jobId) return { error: 'No job context' }
          const { data } = await supabase
            .from('jobs')
            .select('title, status, technician:profiles!jobs_technician_id_fkey(full_name), budget_max, scheduled_date')
            .eq('id', jobId)
            .single()
          return data ?? { error: 'Job not found' }
        },
      }),

      suggest_budget: tool({
        description: 'Suggest a fair budget range for a described home service task',
        inputSchema: z.object({
          task_description: z.string().describe('Description of the work needed'),
        }),
        execute: async ({ task_description }) => {
          const internalUrl = new URL('/api/ai/suggest-budget', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
          const res = await fetch(internalUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: task_description }),
          })
          const data = await res.json()
          return data.data ?? { error: 'Could not suggest budget' }
        },
      }),

      request_confirmation: tool({
        description: 'Request human confirmation before performing a sensitive action like cancelling a job or marking it complete',
        inputSchema: z.object({
          action: z.string().describe('The action to confirm, e.g. "cancel job" or "mark job as complete"'),
          reason: z.string().describe('Why this action is being requested'),
        }),
        // No execute — requires human approval (human-in-the-loop)
      }),

      send_message_to_job: tool({
        description: 'Send a message in the job conversation thread',
        inputSchema: z.object({
          content: z.string().describe('The message to send'),
        }),
        execute: async ({ content }) => {
          if (!jobId || !user) return { error: 'Not authenticated or no job' }
          const { error } = await supabase.from('messages').insert({
            job_id: jobId,
            sender_id: user.id,
            content,
          })
          return error ? { error: error.message } : { success: true }
        },
      }),
    },
  })

  return result.toTextStreamResponse()
}
