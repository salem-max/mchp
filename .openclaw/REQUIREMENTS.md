# Requirements Document

## Introduction

This document defines the requirements for the Multi-Agent System Enhancement of Malaysia Co (Maintenance Services)'s AI layer. The current implementation uses a single monolithic function (`processUserQuery`) that sequentially executes categorisation, budget estimation, technician matching, and response generation. This feature replaces it with five specialised agent classes coordinated by a central `MultiAgentOrchestrator`, enabling parallel execution, local Ollama model support, and clean REST endpoints — while preserving full backward compatibility with all existing bot integrations and the web chat.

## Glossary

- **Orchestrator**: The `MultiAgentOrchestrator` class in `lib/agents/orchestrator.ts` that coordinates all agents, manages parallelism, and returns a unified result.
- **CategoryAgent**: The agent responsible for classifying a free-text maintenance request into one of nine canonical job categories.
- **BudgetAgent**: The agent responsible for estimating a fair INR price range for a job given its category and description.
- **TechnicianMatchingAgent**: The agent responsible for querying the database for available technicians and ranking the top matches.
- **ChatAgent**: The agent responsible for generating a friendly, contextual conversational response summarising the analysis.
- **DisputeResolutionAgent**: The agent responsible for analysing a customer complaint and technician response and recommending a fair resolution.
- **AgentContext**: The shared context object injected into every agent, containing the resolved language model, platform, userId, requestId, and logger.
- **AgentConfig**: The centralised configuration object for model selection, Ollama settings, and feature flags.
- **JobCategory**: One of nine canonical values: `plumbing`, `electrical`, `ac`, `carpentry`, `painting`, `cleaning`, `appliance`, `maintenance`, `other`.
- **QueryResult**: The legacy interface returned by `processUserQuery()` containing `answer`, `category`, `confidence`, `budgetMin`, `budgetMax`, `currency`, `suggested`, and `ragContext`.
- **RAG**: Retrieval-Augmented Generation — the vector similarity search over stored documents used to provide context to agents.
- **Ollama**: A local model inference server used as a fallback when OpenAI is unavailable or when local inference is preferred.
- **JobAnalysis**: The Prisma model that stores a record of every orchestration call for analytics.
- **ChatHistory**: The Prisma model that stores per-platform, per-user conversation history for context.

---

## Requirements

### Requirement 1: Multi-Agent Orchestration

**User Story:** As a developer, I want a `MultiAgentOrchestrator` that coordinates all agents and returns a unified result, so that the AI layer is modular, resilient, and easy to extend.

#### Acceptance Criteria

1. WHEN `orchestrate()` is called with a non-empty `message` and a valid `platform`, THE Orchestrator SHALL resolve to an `AgentOrchestrationResult` and SHALL NOT reject the promise under any agent failure condition.
2. THE Orchestrator SHALL invoke exactly four agents per request — CategoryAgent, BudgetAgent, TechnicianMatchingAgent, and ChatAgent — and the result SHALL satisfy `summary.successfulAgents + summary.failedAgents === summary.totalAgents === 4`.
3. WHEN any individual agent throws an unhandled exception, THE Orchestrator SHALL catch the exception, mark that agent as failed, and continue executing the remaining agents without propagating the exception.
4. WHEN `orchestrate()` completes successfully, THE Orchestrator SHALL persist one `JobAnalysis` record to the database containing the query, category, budget, technician matches, and request metadata.
5. WHEN `orchestrate()` completes successfully, THE Orchestrator SHALL persist one `ChatHistory` record with `role: 'user'` and one with `role: 'assistant'` to the database for the given platform and userId.
6. WHEN the database is unavailable during RAG retrieval or history lookup, THE Orchestrator SHALL proceed with empty RAG context and empty chat history and SHALL NOT fail the request.
7. WHEN the database is unavailable during `JobAnalysis` or `ChatHistory` persistence, THE Orchestrator SHALL log a warning and continue, returning a result to the caller.
8. IF the request body sent to `POST /api/agents/process` is missing the `message` field, THEN THE Orchestrator API SHALL return HTTP 400 with a structured error body containing validation details.

---

### Requirement 2: Category Classification

**User Story:** As a user, I want my maintenance request to be automatically classified into the correct service category, so that the system can find the right technicians and estimate an accurate budget.

#### Acceptance Criteria

1. WHEN `CategoryAgent.process()` is called with any non-empty message, THE CategoryAgent SHALL return a `category` value that is one of the nine valid `JobCategory` values: `plumbing`, `electrical`, `ac`, `carpentry`, `painting`, `cleaning`, `appliance`, `maintenance`, or `other`.
2. WHEN the AI model returns a valid JSON response, THE CategoryAgent SHALL return `success: true` with the parsed `category` and a `confidence` value in the range `[0.0, 1.0]`.
3. IF the AI model returns unparseable JSON or an invalid category value, THEN THE CategoryAgent SHALL return `success: false` with `category: 'other'` and `confidence: 0.3` without throwing.
4. THE CategoryAgent SHALL call the AI model with `temperature: 0` to produce deterministic structured output.

---

### Requirement 3: Budget Estimation

**User Story:** As a user, I want a fair price range estimate for my job in Indian Rupees, so that I know what to expect before hiring a technician.

#### Acceptance Criteria

1. WHEN `BudgetAgent.process()` is called with any category and message, THE BudgetAgent SHALL return a `BudgetOutput` where `min > 0`, `max > 0`, and `min <= max`.
2. WHEN the AI model returns a valid budget JSON response, THE BudgetAgent SHALL return `success: true` with the parsed `min`, `max`, and `currency: 'INR'`.
3. IF the AI model fails or returns an invalid budget response, THEN THE BudgetAgent SHALL return category-specific default budget ranges as defined in the fallback table, with `success: false`.
4. THE BudgetAgent SHALL call the AI model with `temperature: 0.2` to allow slight variation in estimates.

---

### Requirement 4: Technician Matching

**User Story:** As a user, I want to see the best available technicians for my job, so that I can quickly hire someone qualified and nearby.

#### Acceptance Criteria

1. WHEN `TechnicianMatchingAgent.process()` is called with a category, THE TechnicianMatchingAgent SHALL query the database for `TechnicianProfile` records where `skills` contains the category and `isAvailable` is `true`.
2. WHEN no technicians are found in the database, THE TechnicianMatchingAgent SHALL return an empty array without making an AI model call.
3. WHEN technicians are found in the database, THE TechnicianMatchingAgent SHALL return at most 3 `TechnicianMatch` objects ranked by AI-assigned `matchScore`.
4. IF the AI ranking call fails, THEN THE TechnicianMatchingAgent SHALL fall back to returning the top 3 technicians ordered by `avgRating` descending.
5. THE TechnicianMatchingAgent SHALL include `userId`, `name`, `rating`, `hourlyRate`, `matchScore`, and `reason` in each returned `TechnicianMatch` object.

---

### Requirement 5: Conversational Response Generation

**User Story:** As a user, I want a friendly, contextual response that summarises the analysis of my request, so that I understand the category, budget, and available technicians in plain language.

#### Acceptance Criteria

1. WHEN `ChatAgent.process()` is called with any valid input, THE ChatAgent SHALL return a `ChatOutput` where `message.length > 0`.
2. WHEN the AI model returns a valid response, THE ChatAgent SHALL return `success: true` with the generated `message`, a `tone` value of `'friendly'`, `'professional'`, or `'urgent'`, and a non-empty `nextSteps` array.
3. IF the AI model call fails, THEN THE ChatAgent SHALL return a static fallback string that includes the category and budget range, ensuring the response is never empty.
4. THE ChatAgent SHALL call the AI model with `temperature: 0.7` to produce natural language variation.
5. THE ChatAgent SHALL incorporate the RAG context, chat history, category, budget, and technician list into its system prompt.

---

### Requirement 6: Dispute Resolution

**User Story:** As an administrator, I want the system to analyse disputes between customers and technicians and recommend a fair resolution, so that disputes are handled consistently and impartially.

#### Acceptance Criteria

1. WHEN `resolveDispute()` is called with a `jobAmount > 0`, THE DisputeResolutionAgent SHALL return a `suggestedAmount` satisfying `0 <= suggestedAmount <= jobAmount`.
2. WHEN `resolveDispute()` is called with any valid dispute input, THE DisputeResolutionAgent SHALL return a `recommendation` that is one of `'full_refund'`, `'partial_refund'`, `'no_refund'`, or `'escalate'`.
3. IF the AI model call fails during dispute resolution, THEN THE DisputeResolutionAgent SHALL return `recommendation: 'escalate'` as the safest default outcome.
4. WHEN `POST /api/agents/dispute` is called with a valid request body, THE Orchestrator API SHALL return HTTP 200 with `{ success: true, data: DisputeResult }`.
5. IF the request body sent to `POST /api/agents/dispute` is missing required fields, THEN THE Orchestrator API SHALL return HTTP 400 with a structured error body containing validation details.

---

### Requirement 7: Backward Compatibility

**User Story:** As a developer maintaining the existing bot integrations, I want the refactored system to be fully backward compatible, so that no changes are required in the Discord, Telegram, WhatsApp, or web chat routes.

#### Acceptance Criteria

1. WHEN `processUserQuery(message, platform, userId)` is called, THE Legacy_Adapter SHALL return a `QueryResult` object containing `answer`, `category`, `confidence`, `budgetMin`, `budgetMax`, `currency`, `suggested`, and `ragContext` with the same types as the original implementation.
2. THE Legacy_Adapter SHALL internally delegate all processing to `MultiAgentOrchestrator.orchestrate()` and SHALL NOT duplicate any agent logic.
3. WHEN `analyzeJobDescription(description)` is called, THE Legacy_Adapter SHALL return an object containing `category`, `minBudget`, `maxBudget`, `skills`, and `suggestedTechnicians` with the same shape as the original implementation.
4. THE Legacy_Adapter SHALL be the only file that changes in `lib/agents/messaging-orchestrator.ts`; all existing import paths in bot routes SHALL remain valid.

---

### Requirement 8: Ollama Local Model Support

**User Story:** As a system operator, I want the system to use a local Ollama model when available, so that I can reduce OpenAI API costs and latency for high-volume bot traffic.

#### Acceptance Criteria

1. WHEN `GET /api/agents/ollama/health` is called, THE Ollama_Integration SHALL return `{ status: 'healthy' | 'unavailable', models: string[] }` with HTTP 200.
2. WHEN `OLLAMA_ENABLED` is set to `true` and Ollama is reachable, THE AgentConfig SHALL resolve the language model to the configured Ollama model for all agents.
3. WHEN `OLLAMA_ENABLED` is set to `true` but Ollama is unreachable, THE AgentConfig SHALL fall back to the OpenAI model without throwing an error.
4. WHEN `OLLAMA_ENABLED` is not set or is `false`, THE AgentConfig SHALL use the OpenAI model regardless of Ollama availability.
5. THE Ollama_Integration SHALL default `baseURL` to `http://localhost:11434` and SHALL read the model name from the `OLLAMA_MODEL` environment variable.

---

### Requirement 9: Agent Configuration

**User Story:** As a developer, I want all agent configuration centralised in a single `AgentConfig` object, so that model selection, feature flags, and tuning parameters are easy to manage and override.

#### Acceptance Criteria

1. THE AgentConfig SHALL expose `defaultModel`, `ollamaEnabled`, `ollamaBaseURL`, `ollamaModel`, `logLevel`, `maxChatHistoryItems`, `ragMinSimilarity`, and `ragMaxDocs` as typed fields.
2. THE AgentConfig SHALL default `maxChatHistoryItems` to `5`, `ragMinSimilarity` to `0.3`, and `ragMaxDocs` to `3`.
3. WHEN `getAgentConfig()` is called, THE AgentConfig SHALL read values from environment variables and return a fully populated `AgentConfig` object with defaults applied for any missing values.
4. WHEN `resolveModel(config)` is called, THE AgentConfig SHALL return a valid `LanguageModel` instance suitable for use in any agent's `AgentContext`.

---

### Requirement 10: REST API Endpoints

**User Story:** As a client application, I want clean REST endpoints for agent processing and dispute resolution, so that I can integrate the multi-agent system without coupling to internal implementation details.

#### Acceptance Criteria

1. THE Orchestrator_API SHALL expose `POST /api/agents/process` accepting `{ message: string, platform: string, userId?: string, jobId?: string, metadata?: object }` and returning `{ success: true, responses: AgentResponse[], summary: object, answer: string, category: string, budgetMin: number, budgetMax: number, currency: string, suggested: TechnicianMatch[] }`.
2. THE Orchestrator_API SHALL expose `POST /api/agents/dispute` accepting `{ customerComplaint: string, technicianResponse: string, jobCategory: JobCategory, jobAmount: number, jobId?: string }` and returning `{ success: true, data: DisputeResult }`.
3. THE Orchestrator_API SHALL expose `GET /api/agents/ollama/health` returning `{ status: 'healthy' | 'unavailable', models: string[] }`.
4. WHEN a request to any agent endpoint is made without a valid Supabase session, THE Orchestrator_API SHALL return HTTP 401.
5. WHEN `POST /api/agents/process` or `POST /api/agents/dispute` receives a request body that fails Zod schema validation, THE Orchestrator_API SHALL return HTTP 400 with a structured error body.

---

### Requirement 11: Parallel Execution

**User Story:** As a system operator, I want BudgetAgent and TechnicianMatchingAgent to run concurrently after CategoryAgent completes, so that total response latency is minimised.

#### Acceptance Criteria

1. WHEN CategoryAgent has returned a result, THE Orchestrator SHALL execute BudgetAgent and TechnicianMatchingAgent concurrently using `Promise.all`.
2. WHEN BudgetAgent and TechnicianMatchingAgent are executed in parallel, THE Orchestrator SHALL produce results equivalent to sequential execution for any given category and message.
3. WHEN one of the parallel agents fails, THE Orchestrator SHALL still collect the result of the other parallel agent and continue to the ChatAgent phase.
4. THE Orchestrator SHALL execute ChatAgent only after both BudgetAgent and TechnicianMatchingAgent have settled (resolved or rejected).
