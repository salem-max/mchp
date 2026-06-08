# Implementation Plan: Multi-Agent System

## Overview

Replace the monolithic `processUserQuery` function in `lib/agents/messaging-orchestrator.ts` with five specialised agent classes coordinated by a `MultiAgentOrchestrator`. The implementation proceeds in layers: shared infrastructure first, then individual agents, then the orchestrator, then REST endpoints, and finally the backward-compatibility adapter. Property-based tests using fast-check are placed close to the code they validate.

## Tasks

- [ ] 1. Set up agent infrastructure — types, config, and Ollama integration
  - [ ] 1.1 Create shared TypeScript types and interfaces
    - Create `lib/agents/types.ts` defining `AgentContext`, `AgentResponse<T>`, `AgentOrchestrationResult`, `OrchestratorRequest`, `JobCategory`, `CategoryInput/Output`, `BudgetInput/Output`, `MatchingInput`, `TechnicianMatch`, `ChatInput/Output`, `DisputeInput/Output`, `DisputeResult`, and the legacy `QueryResult` interface
    - Export all types from a barrel file `lib/agents/index.ts`
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.5, 5.1, 6.1, 6.2, 7.1, 9.1_

  - [ ] 1.2 Implement `lib/agents/config.ts`
    - Implement `getAgentConfig()` reading `OPENAI_API_KEY`, `OLLAMA_ENABLED`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `AI_MODEL`, `LOG_LEVEL` from environment with defaults: `maxChatHistoryItems=5`, `ragMinSimilarity=0.3`, `ragMaxDocs=3`
    - Implement `resolveModel(config)` returning a `LanguageModel` instance (OpenAI or Ollama)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 1.3 Implement `lib/agents/ollama.ts` — Ollama integration
    - Implement `createOllamaModel(config?)` wrapping the `ollama` npm package as a Vercel AI SDK-compatible `LanguageModel`
    - Implement `checkOllamaHealth()` returning `{ status: 'healthy' | 'unavailable', models: string[] }`
    - Default `baseURL` to `http://localhost:11434`; read model name from `OLLAMA_MODEL` env var
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 1.4 Write unit tests for config and Ollama integration
    - Test `getAgentConfig()` defaults and env-var overrides
    - Test `resolveModel()` returns OpenAI model when `OLLAMA_ENABLED=false`
    - Test `resolveModel()` falls back to OpenAI when Ollama health check fails
    - _Requirements: 8.3, 8.4, 9.2, 9.3_

- [ ] 2. Implement CategoryAgent
  - [ ] 2.1 Create `lib/agents/agents/category-agent.ts`
    - Implement `CategoryAgent.process(input, ctx)` calling the AI model with `temperature: 0` and a structured JSON prompt
    - Parse and validate the response; assert `category` is one of the nine valid `JobCategory` values and `confidence` is in `[0.0, 1.0]`
    - On parse failure return `{ success: false, data: { category: 'other', confidence: 0.3, reasoning: 'parse failure' } }` without throwing
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property test for CategoryAgent — Property 3: Category Validity
    - **Property 3: Category Validity** — for any non-empty message string, `CategoryAgent.process()` always returns a `category` that is one of the nine valid `JobCategory` values
    - **Validates: Requirements 2.1**
    - Use fast-check `fc.string({ minLength: 1 })` as the arbitrary; inject a mock `AgentContext` with a stubbed model

  - [ ]* 2.3 Write unit tests for CategoryAgent
    - Happy path: valid AI JSON response → `success: true`, correct category and confidence
    - Parse failure: malformed JSON → `success: false`, `category: 'other'`, `confidence: 0.3`
    - Invalid category value in response → fallback to `'other'`
    - _Requirements: 2.2, 2.3_

- [ ] 3. Implement BudgetAgent
  - [ ] 3.1 Create `lib/agents/agents/budget-agent.ts`
    - Implement `BudgetAgent.process(input, ctx)` calling the AI model with `temperature: 0.2`
    - Validate that `min > 0`, `max > 0`, and `min <= max`; on failure return category-specific default ranges from the fallback table with `success: true`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.2 Write property test for BudgetAgent — Property 4: Budget Ordering
    - **Property 4: Budget Ordering** — for any `JobCategory` and non-empty message, `BudgetAgent.process()` always returns `min > 0 ∧ max > 0 ∧ min ≤ max`
    - **Validates: Requirements 3.1**
    - Use `fc.constantFrom(...VALID_CATEGORIES)` and `fc.string({ minLength: 1 })` as arbitraries; inject a mock context

  - [ ]* 3.3 Write unit tests for BudgetAgent
    - Happy path: valid AI JSON → `success: true`, correct min/max/currency
    - AI failure → category-specific defaults returned, `success: true`
    - _Requirements: 3.2, 3.3_

- [ ] 4. Implement TechnicianMatchingAgent
  - [ ] 4.1 Create `lib/agents/agents/technician-matching-agent.ts`
    - Implement `TechnicianMatchingAgent.process(input, ctx)` querying `TechnicianProfile` where `skills has category` and `isAvailable = true`
    - When no DB results: return empty array without making an AI call
    - When results exist: call AI to rank and return top 3 `TechnicianMatch` objects; on AI parse failure fall back to top-3-by-`avgRating`
    - Each `TechnicianMatch` must include `userId`, `name`, `rating`, `hourlyRate`, `matchScore`, and `reason`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 4.2 Write unit tests for TechnicianMatchingAgent
    - No DB results → empty array, no AI call made
    - DB results + valid AI ranking → top 3 returned with all required fields
    - DB results + AI parse failure → top 3 by rating fallback
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Implement ChatAgent
  - [ ] 5.1 Create `lib/agents/agents/chat-agent.ts`
    - Implement `ChatAgent.process(input, ctx)` composing a system prompt that includes category, budget, technicians, RAG context, and chat history; call AI with `temperature: 0.7`
    - On AI failure return a static fallback string that includes category and budget range when available; ensure `message.length > 0` always
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property test for ChatAgent — Property 5: Answer Non-Empty
    - **Property 5: Answer Non-Empty** — for any valid `ChatInput`, `ChatAgent.process()` always returns a `ChatOutput` where `message.length > 0`
    - **Validates: Requirements 5.1**
    - Cover both the AI-success path and the AI-failure path (inject a model that throws)

  - [ ]* 5.3 Write unit tests for ChatAgent
    - Happy path: valid AI response → `success: true`, correct tone and non-empty nextSteps
    - AI failure → static fallback with category and budget in message
    - AI failure with no category/budget → generic non-empty fallback
    - _Requirements: 5.2, 5.3_

- [ ] 6. Implement DisputeResolutionAgent
  - [ ] 6.1 Create `lib/agents/agents/dispute-resolution-agent.ts`
    - Implement `DisputeResolutionAgent.process(input, ctx)` evaluating both sides impartially
    - On AI failure return `recommendation: 'escalate'` as the only permitted failure-case value
    - Validate `suggestedAmount >= 0 && suggestedAmount <= jobAmount`; never suggest more than the job amount
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 6.2 Write property test for DisputeResolutionAgent — Property 6: Dispute Amount Bounds
    - **Property 6: Dispute Amount Bounds** — for any `jobAmount > 0`, `suggestedAmount >= 0 && suggestedAmount <= jobAmount`
    - **Validates: Requirements 6.1**
    - Use `fc.integer({ min: 1 })` for `jobAmount`; inject both a working and a failing mock model

  - [ ]* 6.3 Write property test for DisputeResolutionAgent — Property 7: Dispute Recommendation Validity
    - **Property 7: Dispute Recommendation Validity** — for any valid dispute input, `recommendation ∈ { 'full_refund', 'partial_refund', 'no_refund', 'escalate' }`
    - **Validates: Requirements 6.2**

  - [ ]* 6.4 Write unit tests for DisputeResolutionAgent
    - Happy path: valid AI response → correct recommendation and suggestedAmount
    - AI failure → `recommendation: 'escalate'`, no other value permitted
    - `suggestedAmount` clamped to `[0, jobAmount]`
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7. Checkpoint — individual agents complete
  - Ensure all agent unit tests pass, ask the user if questions arise.

- [ ] 8. Implement MultiAgentOrchestrator
  - [ ] 8.1 Create `lib/agents/orchestrator.ts` — core orchestration logic
    - Implement `MultiAgentOrchestrator.orchestrate(request)` following the three-phase algorithm: Phase 0 (RAG + history), Phase 1 (CategoryAgent serial), Phase 2 (BudgetAgent + TechnicianMatchingAgent parallel via `Promise.all`), Phase 3 (ChatAgent serial)
    - Wrap each agent call so individual failures are caught and marked `success: false` without propagating to other agents
    - Persist `JobAnalysis` and `ChatHistory` records after orchestration; log and continue if DB writes fail
    - Return `AgentOrchestrationResult` with `summary.totalAgents === 4` and all backward-compat convenience fields (`answer`, `category`, `confidence`, `budgetMin`, `budgetMax`, `currency`, `suggested`, `ragContext`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 11.1, 11.2, 11.3, 11.4_

  - [ ] 8.2 Implement `resolveDispute(input)` on `MultiAgentOrchestrator`
    - Optionally fetch job details from DB when `jobId` is provided
    - Delegate to `DisputeResolutionAgent.process()`; return `DisputeResult`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 8.3 Write property test for orchestrator — Property 1: Orchestrator Totality
    - **Property 1: Orchestrator Totality** — for any non-empty message string and valid platform, `orchestrate()` always resolves and never rejects
    - **Validates: Requirements 1.1**
    - Use `fc.string({ minLength: 1 })` and `fc.constantFrom('web', 'discord', 'telegram', 'whatsapp')`; inject mock agents that may throw

  - [ ]* 8.4 Write property test for orchestrator — Property 2: Agent Count Invariant
    - **Property 2: Agent Count Invariant** — for all results `r`, `r.summary.successfulAgents + r.summary.failedAgents === r.summary.totalAgents === 4`
    - **Validates: Requirements 1.2**

  - [ ]* 8.5 Write property test for orchestrator — Property 8: Agent Isolation
    - **Property 8: Agent Isolation** — injecting a failing agent does not cause other agents to fail or the orchestrator to throw
    - **Validates: Requirements 1.3**
    - Parameterise which agent(s) throw using `fc.subarray(['category', 'budget', 'matching', 'chat'])`

  - [ ]* 8.6 Write unit tests for MultiAgentOrchestrator
    - All agents succeed → `summary.failedAgents === 0`, all fields populated
    - One agent fails → orchestrator still returns result, `failedAgents === 1`
    - DB unavailable during RAG/history → proceeds with empty context, no throw
    - DB unavailable during persistence → logs warning, still returns result
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 9. Checkpoint — orchestrator complete
  - Ensure all orchestrator tests pass, ask the user if questions arise.

- [ ] 10. Create REST API endpoints
  - [ ] 10.1 Create `app/api/agents/process/route.ts`
    - Implement `POST /api/agents/process` with Zod validation for `{ message, platform, userId?, jobId?, metadata? }`
    - Require valid Supabase session; return 401 if unauthenticated
    - Delegate to `MultiAgentOrchestrator.orchestrate()`; return 200 `{ success: true, responses, summary, answer, category, budgetMin, budgetMax, currency, suggested }`
    - Return 400 with structured Zod error details on validation failure
    - Set `export const maxDuration = 30`
    - _Requirements: 1.8, 10.1, 10.4, 10.5_

  - [ ] 10.2 Create `app/api/agents/dispute/route.ts`
    - Implement `POST /api/agents/dispute` with Zod validation for `{ customerComplaint, technicianResponse, jobCategory, jobAmount, jobId? }`
    - Require valid Supabase session; return 401 if unauthenticated
    - Delegate to `MultiAgentOrchestrator.resolveDispute()`; return 200 `{ success: true, data: DisputeResult }`
    - Return 400 with structured Zod error details on validation failure
    - _Requirements: 6.4, 6.5, 10.2, 10.4, 10.5_

  - [ ] 10.3 Create `app/api/agents/ollama/health/route.ts`
    - Implement `GET /api/agents/ollama/health` calling `checkOllamaHealth()` and returning 200 `{ status, models }`
    - No authentication required for health check
    - _Requirements: 8.1, 10.3_

  - [ ]* 10.4 Write integration tests for REST endpoints
    - `POST /api/agents/process` missing `message` → 400 with validation details
    - `POST /api/agents/dispute` missing required fields → 400 with validation details
    - Unauthenticated request to process/dispute → 401
    - `GET /api/agents/ollama/health` → 200 with status and models array
    - _Requirements: 1.8, 6.5, 10.4, 10.5_

- [ ] 11. Update backward-compatibility adapter
  - [ ] 11.1 Rewrite `lib/agents/messaging-orchestrator.ts` as a thin adapter
    - Replace the monolithic `processUserQuery` implementation with a delegation call to `MultiAgentOrchestrator.orchestrate()`
    - Map `AgentOrchestrationResult` fields to the existing `QueryResult` shape: `{ answer, category, confidence, budgetMin, budgetMax, currency, suggested, ragContext }`
    - Rewrite `analyzeJobDescription(description)` to call `processUserQuery` and map to `{ category, minBudget, maxBudget, skills, suggestedTechnicians }`
    - Do not change any import paths; all existing bot routes must continue to work without modification
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 11.2 Write property test for legacy adapter — Property 9: Legacy Adapter Compatibility
    - **Property 9: Legacy Adapter Compatibility** — for any `(message, platform, userId)`, `processUserQuery()` returns a value satisfying the `QueryResult` interface with correct field types
    - **Validates: Requirements 7.1**
    - Assert presence and types of all eight fields: `answer` (string), `category` (string), `confidence` (number), `budgetMin` (number), `budgetMax` (number), `currency` (string), `suggested` (array), `ragContext` (array)

  - [ ]* 11.3 Write integration tests for backward-compatibility adapter
    - `processUserQuery()` returns same `QueryResult` shape as original implementation
    - `analyzeJobDescription()` returns `{ category, minBudget, maxBudget, skills, suggestedTechnicians }`
    - No agent logic is duplicated in the adapter file
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at agent, orchestrator, and integration levels
- Property tests use fast-check (already available via `@fast-check/vitest` or direct `fast-check` import)
- Unit tests should inject mock `AgentContext` objects with stubbed `model` functions to avoid real AI calls
- The `lib/agents/agents/` subdirectory must be created; all five agent files live there
- `lib/agents/index.ts` barrel export keeps import paths clean across the codebase
- The existing `lib/agents/messaging-orchestrator.ts` is the only file in `lib/agents/` that changes from the caller's perspective — all bot routes remain untouched

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1", "3.1", "4.1", "5.1", "6.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.2", "3.3", "4.2", "5.2", "5.3", "6.2", "6.3", "6.4"] },
    { "id": 4, "tasks": ["8.1", "8.2"] },
    { "id": 5, "tasks": ["8.3", "8.4", "8.5", "8.6"] },
    { "id": 6, "tasks": ["10.1", "10.2", "10.3", "11.1"] },
    { "id": 7, "tasks": ["10.4", "11.2", "11.3"] }
  ]
}
```
