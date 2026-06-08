# 🤖 Multi-Agent System - Quick Reference

## What Was Set Up

### ✅ Specialized AI Agents
- **Category Agent** → Classifies maintenance requests
- **Budget Agent** → Estimates fair prices  
- **Technician Matching Agent** → Finds best technicians
- **Dispute Resolution Agent** → Resolves conflicts fairly
- **Chat Agent** → Generates friendly responses
- **Ollama Integration** → Local model support (optional)

### ✅ Multi-Agent Orchestrator
- Coordinates all agents
- Handles request routing
- Manages agent failures gracefully
- Returns comprehensive responses

### ✅ API Endpoints
```
POST /api/agents/process         → Process request through all agents
POST /api/agents/dispute         → Get dispute resolution recommendation
GET  /api/agents/ollama/health   → Check Ollama service status
```

### ✅ Ollama Support
- Launch script: `./scripts/launch-ollama.sh`
- Supports kimi-k2.5:cloud model
- Local processing for privacy
- Streaming responses

### ✅ NPM Scripts
```bash
npm run dev              # Start app (without Ollama)
npm run launch:ollama    # Start with Ollama support
npm run launch:agents    # Start with agents enabled
```

## Getting Started

### Option 1: Simple Start (No Local Model)
```bash
npm run dev
```
Uses OpenAI API for all agents.

### Option 2: With Local Model (Ollama)
```bash
npm run launch:ollama
```
Launches Ollama, pulls kimi-k2.5:cloud, then starts the app.

### Option 3: Manual Launch
```bash
# Terminal 1: Start Ollama
./scripts/launch-ollama.sh

# Or manually:
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Terminal 2: Start app
npm run dev
```

## Configuration

### Environment Variables
```
# .env.local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=kimi-k2.5:cloud
NEXT_PUBLIC_OLLAMA_ENABLED=true
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
```

## Testing

### Test Multi-Agent Processing
```bash
curl -X POST http://localhost:3000/api/agents/process \
  -H "Content-Type: application/json" \
  -d '{"message":"My sink is leaking","platform":"web"}'
```

### Test Dispute Resolution
```bash
curl -X POST http://localhost:3000/api/agents/dispute \
  -H "Content-Type: application/json" \
  -d '{
    "customerComplaint":"Work not completed",
    "technicianResponse":"Customer cancelled mid-job",
    "jobCategory":"plumbing",
    "jobAmount":200
  }'
```

### Check Ollama Health
```bash
curl http://localhost:3000/api/agents/ollama/health
```

## File Structure

```
lib/agents/
├── agents/
│   ├── category-agent.ts           # Job classification
│   ├── budget-agent.ts             # Price estimation
│   ├── technician-matching-agent.ts # Technician ranking
│   ├── dispute-resolution-agent.ts # Conflict resolution
│   └── chat-agent.ts               # Response generation
├── orchestrator.ts                 # Multi-agent coordinator
├── ollama-integration.ts           # Ollama support
├── config.ts                       # Configuration
└── messaging-orchestrator.ts       # Legacy messenger

app/api/agents/
├── process/route.ts                # Main agent endpoint
├── dispute/route.ts                # Dispute endpoint
└── ollama/health/route.ts          # Health check

scripts/
└── launch-ollama.sh                # Ollama launcher
```

## Features

✨ **Parallel Agent Execution** - Multiple agents run simultaneously
✨ **Intelligent Routing** - Requests routed to appropriate agents
✨ **Error Handling** - Graceful degradation if agents fail
✨ **Logging** - Comprehensive request/response logging
✨ **Type Safety** - Full TypeScript support
✨ **Local Processing** - Optional Ollama for privacy
✨ **Extensible** - Easy to add new agents

## Key Commands

```bash
# View agent logs
tail -f ~/.ollama/logs/  # Ollama logs

# List available models
ollama list

# Pull new model
ollama pull <model-name>

# Check Ollama version
ollama --version

# Kill Ollama process
pkill -f "ollama serve"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Ensure auth token in cookies, check JWT_SECRET |
| Port already in use | `lsof -i :3000` or `lsof -i :11434` to find process |
| Ollama not responding | Run `ollama serve` in separate terminal |
| Model not found | `ollama pull kimi-k2.5:cloud` |
| Slow responses | Try smaller model or check network |

## Example Response

```json
{
  "success": true,
  "responses": [
    {
      "agent": "CategoryAgent",
      "success": true,
      "data": {
        "category": "plumbing",
        "confidence": 0.95
      }
    },
    {
      "agent": "BudgetAgent",
      "success": true,
      "data": {
        "min": 150,
        "max": 300,
        "currency": "USD"
      }
    }
  ],
  "summary": {
    "totalAgents": 5,
    "successfulAgents": 5,
    "failedAgents": 0
  }
}
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Choose launch method (with/without Ollama)
3. ✅ Test endpoints with curl or Postman
4. ✅ Integrate with frontend UI
5. ✅ Monitor logging and performance

## Documentation

- Full setup guide: `MULTI_AGENT_SETUP.md`
- Agent capabilities: `lib/agents/config.ts`
- API details: `app/api/agents/*/route.ts`

---

**Status**: ✅ Multi-agent system ready for deployment
**Last Updated**: April 14, 2026
