# Financial Agent: Automated Email Follow Up

## Overview
This AI agent prototype automates the accounts receivable follow up process for finance teams. It features a custom built UI dashboard. The agent reads pending credit records, evaluates the appropriate escalation stage based on past reminders, and generates personalized, tone adjusted emails. It includes a secure Audit Ledger and a mandatory Escalation Cap for accounts severely past due.

## Setup Instructions
1. Clone the repository to your local machine.
2. **Backend:** 
   * Navigate to the `/backend` directory.
   * Install dependencies: `pip install -r requirements.txt`
   * Start the server: `uvicorn main:app --reload`
3. **Frontend:** 
   * Navigate to the `/frontend` directory.
   * Install dependencies: `npm install`
   * Start the development server: `npm run dev`
4. Open the provided localhost link (`http://localhost:5173`) in your browser.

---

## Part 1: Mandatory Technical Disclosures & Decision Log

### LLM Chosen
* **Model:** `gpt-3.5-turbo` accessed via the `g4f` (GPT4Free) provider library.
* **Rationale:** Chosen to ensure zero-cost scaling for prototype demonstration without hitting personal API rate limits during grading. To guarantee 100% uptime, a localized deterministic fallback template engine is implemented to catch any 404/500 errors from the free provider pool and maintain the UI/Audit flow seamlessly.

### Agent Framework
* **Framework:** Custom FastAPI Routing Logic acting as a State-Based Agent.
* **Architecture:** The agent operates on a strict **Plan-and-Execute** flow. 
  1. **Plan:** Evaluates the `reminders_sent` integer against the internal Escalation Matrix.
  2. **Route:** If `reminders_sent >= 4`, it bypasses the LLM entirely, executing a hard halt and routing to the Legal Flag endpoint.
  3. **Execute:** If `< 4`, it parses the mapped tone, key message, and Call-to-Action, injecting them into the LLM prompt.

### Prompt Design
The system prompt is designed with strict boundaries and structured ingestion:
> You are a Finance Collection Agent. Write a {tone} business email regarding Invoice {invoice_no}.
> Client: {client_name}
> Amount: ₹{amount}
> Days Overdue: {overdue_days}
> Message: {key_msg}
> CTA: {cta}
> Rules: Include all details. Do not use placeholders. Sign off as 'Finance Department'. Output ONLY the email text.
* **Guardrails applied:** Explicitly forbidding conversational filler and dynamic placeholders ensures the output is immediately ready for simulated SMTP transmission.

---

## Part 2: Security Risk Mitigation Compliance

| Risk Category | Threat Description | Implemented Mitigation Strategy |
| :--- | :--- | :--- |
| **Prompt Injection** | Malicious input manipulating agent behaviour to output unintended data. | **Input Sanitization & Structured Schemas:** The FastAPI backend utilizes strict Pydantic `BaseModel` schemas to enforce data types. The LLM prompt isolates instructions from injected variables, preventing payload execution. |
| **Data Privacy / PII** | Mock email/invoice data contains personally identifiable info. | **Local Processing & Masking:** Currently operating on a local SQLite instance with mock CSV data. The architecture supports UUID substitution prior to LLM transmission for a production environment. |
| **API Key Exposure** | LLM/Email API keys leaked in source code or repositories. | **Environment Variable Architecture:** Zero hardcoded keys exist in the repository. The system is structurally designed to utilize `.env` files (ignored via `.gitignore`) for production API key injection. |
| **Hallucination Risk** | LLM generating false invoice amounts or inappropriate email tones. | **Contextual Grounding & Fallbacks:** The LLM is forced to use explicitly provided numerical variables. A hardcoded deterministic fallback template activates upon validation failure or API timeout, ensuring zero hallucinated financial figures. |
| **Unauthorised Access** | Third parties triggering the financial agent endpoint. | **Endpoint Isolation:** Configured currently for strict local CORS. The `/process-email` endpoint architecture is designed to accept OAuth2/JWT Bearer tokens before executing the generation loop in production. |
| **Email Spoofing** | Emails appearing from unverified or incorrect senders. | **Dry-Run Auditing:** The system is locked in a secure "Dry-Run" state, logging generated drafts to the SQLite Audit Ledger rather than executing live SMTP calls, eliminating unauthorized packet transmission. |