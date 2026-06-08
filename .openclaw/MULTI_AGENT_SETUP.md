# Multi-Agent System Setup & Documentation

## Overview

Malaysia Co (Maintenance Services) now includes a sophisticated **multi-agent system** that handles complex maintenance service workflows using specialized AI agents working in concert.

## Agents

### 1. **Category Agent**
- **Purpose**: Classifies job requests into maintenance categories
- **Categories**: Plumbing, Electrical, AC, Carpentry, Painting, General Maintenance, Appliance Repair, Other
- **Output**: Category, confidence score, reasoning

### 2. **Budget Agent**
- **Purpose**: Estimates fair market prices for jobs
- **Input**: Category, job description
- **Output**: Min/max budget range (USD, MYR, IDR), reasoning

### 3. **Technician Matching Agent**
- **Purpose**: Finds and ranks best technicians for jobs
- **Input**: Category
- **Output**: Top 5 technician matches with ratings and scores

### 4. **Dispute Resolution Agent**
- **Purpose**: Recommends fair resolutions for service disputes
- **Input**: Customer complaint, technician response, job details
- **Output**: Recommendation (refund/partial/no-refund/escalate), reason, suggested amount

### 5. **Chat Agent**
- **Purpose**: Generates friendly, contextual responses
- **Input**: User message, job context (category, budget, technicians)
- **Output**: Conversational response, tone, next steps

### 6. **Ollama Local Processing Agent** (Optional)
- **Purpose**: Uses local Ollama models for privacy-respecting inference
- **Model**: Kimi-K2.5 or other compatible models
- **Benefits**: Low latency, no external API calls, custom models support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:
```
# Ollama Configuration (Optional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=kimi-k2.5:cloud
NEXT_PUBLIC_OLLAMA_ENABLED=true

# OpenAI (Primary AI)
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...

# Other settings from .env.example
```

### 3. Launch Ollama & App (Option A - With Ollama)

```bash
./scripts/launch-ollama.sh
```

This script:
- ✓ Starts Ollama service
- ✓ Pulls the specified model
- ✓ Waits for service to be ready
- ✓ Launches the Next.js app

### 4. Or Start Manually (Option B - Without Ollama)

```bash
npm run dev
```

## API Endpoints

### Process Request Through Multi-Agent System

**POST** `/api/agents/process`

```bash
curl -X POST http://localhost:3000/api/agents/process \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to fix my kitchen sink, its been leaking for a week",
    "platform": "web"
  }'
```

**Response:**
```json
{
  "success": true,
  "responses": [
    {
      "agent": "CategoryAgent",
      "success": true,
      "data": {
        "category": "plumbing",
        "confidence": 0.95,
        "reasoning": "Clear indication of plumbing issue"
      }
    },
    {
      "agent": "BudgetAgent",
      "success": true,
      "data": {
        "min": 150,
        "max": 300,
        "currency": "USD",
        "reasoning": "Standard leak repair in kitchen"
      }
    },
    {
      "agent": "TechnicianMatchingAgent",
      "success": true,
      "data": [
        {
          "id": "tech-123",
          "name": "John Plumber",
          "rating": 4.8,
          "completedJobs": 245,
          "matchScore": 98
        }
      ]
    },
    {
      "agent": "ChatAgent",
      "success": true,
      "data": {
        "message": "Great! I found the perfect technician for your kitchen sink leak...",
        "tone": "friendly",
        "nextSteps": ["View technician", "Book appointment", "Get instant quote"]
      }
    }
  ],
  "summary": {
    "totalAgents": 4,
    "successfulAgents": 4,
    "failedAgents": 0
  }
}
```

### Resolve Disputes

**POST** `/api/agents/dispute`

```bash
curl -X POST http://localhost:3000/api/agents/dispute \
  -H "Content-Type: application/json" \
  -d '{
    "customerComplaint": "The technician did not fix the problem completely...",
    "technicianResponse": "The customer asked for a basic check only...",
    "jobCategory": "plumbing",
    "jobAmount": 200
  }'
```

### Ollama Health Check

**GET** `/api/agents/ollama/health`

```bash
curl http://localhost:3000/api/agents/ollama/health
```

**Response:**
```json
{
  "status": "healthy",
  "ollama": "running",
  "models": ["kimi-k2.5:cloud", "llama2"],
  "baseURL": "http://localhost:11434"
}
```

## Architecture

```
          User Request
               |
               v
    ┌─────────────────────┐
    │  API Route Handler  │
    └──────────┬──────────┘
               |
               v
    ┌─────────────────────────────────┐
    │ MultiAgentOrchestrator          │
    │ (Routes & Coordinates Agents)   │
    └─┬──────┬──────┬──────┬───────┬──┘
      |      |      |      |       |
      v      v      v      v       v
   ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐
   │CA│  │BA│  │MA│  │DA│  │ChA│
   └──┘  └──┘  └──┘  └──┘  └──┘
    |      |      |      |       |
    └──────┴──────┴──────┴───────┘
             |
             v
    ┌─────────────────┐
    │  AI Models      │
    │ (OpenAI/Ollama) │
    └─────────────────┘

CA  = Category Agent
BA  = Budget Agent
MA  = Matching Agent
DA  = Dispute Resolution Agent
ChA = Chat Agent
```

## Features

✅ **Specialized Agents**: Each agent focuses on one task (separation of concerns)
✅ **Parallel Execution**: Multiple agents can run simultaneously
✅ **Caching**: Responses can be cached to reduce API calls
✅ **Local Processing**: Optional Ollama support for privacy
✅ **Fallback Handling**: Graceful degradation if agents fail
✅ **Comprehensive Logging**: Track agent behavior for debugging
✅ **Type-Safe**: Full TypeScript support
✅ **RESTful API**: Easy integration with frontend
✅ **Extensible**: Add new agents easily

## Adding New Agents

1. Create agent file in `/lib/agents/agents/`:
```typescript
export class MyAgent {
  async process(input: any, context: AgentContext) {
    // Your logic here
    return { agent: 'MyAgent', success: true, data: result };
  }
}
```

2. Add to orchestrator:
```typescript
private myAgent: MyAgent;

constructor() {
  this.myAgent = new MyAgent();
  // ...
}
```

3. Create matching API endpoint:
```typescript
// /app/api/agents/my-endpoint/route.ts
```

## Performance Tips

- **Use Caching**: Cache frequently accessed technician lists or budgets
- **Parallel Execution**: Agents run in parallel when possible
- **Model Selection**: Choose faster models (gpt-3.5-turbo) for simple tasks
- **Ollama Local**: Use Ollama for high-volume, latency-sensitive operations
- **Batch Requests**: Process multiple requests together

## Troubleshooting

### Ollama Won't Start
```bash
# Check if Ollama is installed
which ollama

# Start Ollama manually
ollama serve

# Pull model manually  
ollama pull kimi-k2.5:cloud
```

### APIs Return 401 Unauthorized
- Ensure auth token is in cookies
- Check that user is logged in
- Verify JWT_SECRET environment variable

### Model Not Found
```bash
# List available models
ollama list

# Pull specific model
ollama pull <model-name>
```

### High Latency
- Use local Ollama for faster responses
- Switch to smaller models
- Enable caching for repeated queries

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama service URL |
| `OLLAMA_MODEL` | `openclaw:latest` | Model to use with Ollama |
| `NEXT_PUBLIC_OLLAMA_ENABLED` | `false` | Enable Ollama integration |
| `OPENAI_API_KEY` | Required | OpenAI API key |
| `LOG_LEVEL` | `info` | Logging level |

## Resources

- [Ollama Documentation](https://ollama.ai)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Pino Logger](https://getpino.io)

## Support

For issues or questions about the multi-agent system, open a GitHub issue or contact the development team.
