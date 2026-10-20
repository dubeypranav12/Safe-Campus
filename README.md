# SafeCampus: React prototype

Working front-end prototype of **SafeCampus: Agentic AI for Campus Emergency Coordination**
(JAI 2026, team *The Ultimate Descenders*, Ajay Kumar Garg Engineering College).

It follows the pitch deck: report an incident, let agents assess it, have a human approve the
assignment, track acknowledgement, resolve, and get a generated report. The UI and incident state run
in the browser; assessment is enriched by the deployed ML service.

> **Honest scope:** the Assessment Agent calls the deployed SafeCampus ML API (TF-IDF + Logistic
> Regression) and falls back to local rules when it is unavailable. The remaining agents are
> browser-side stand-ins. Notifications are simulated, and incident data is stored in the browser's
> `localStorage`. All names, places and protocols are samples.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the build
```

Requires Node 18+.

## ML backend integration

The frontend calls `POST /api/ml/assess`. Vite proxies that path during development and Vercel
rewrites it in production to:

`https://safecampus-ml-work-1.onrender.com/api/ml/assess`

No production environment variable is required because the browser uses the same-origin proxy. To
call a different backend directly, set `VITE_API_BASE_URL`; that backend must allow CORS from the
frontend origin.

Do not commit `.env.local` or secrets. Vite variables are included in browser code, so this setting
must contain only the public backend URL, never an API key or database password.

## Deploying to Vercel

This repository includes `vercel.json` for Vite and React Router. Import the GitHub repository into
Vercel; the default Vite build command (`npm run build`) and output directory (`dist`) are detected
automatically.

## Pages (React Router)

| Route | Page | What it shows |
|---|---|---|
| `/` | Home | Problem, six-step workflow, features, theme relevance, live counts |
| `/report` | Report an incident | Text, voice (browser speech API or simulated), photo, panic button, location capture and map picker |
| `/dashboard` | Dashboard | Live list or board, filters, ack-overdue timers, duplicate flags |
| `/incident/:id` | Incident detail | Status stepper, agent pipeline, questions, guidance, human review, approve / acknowledge / resolve, timeline, report |
| `/map` | Campus map | Active incidents as pins on a schematic campus |
| `/how-it-works` | User journey | The five-step journey and the six-step workflow |
| `/architecture` | Architecture | Orchestrator + five agents, LLM vs deterministic logic, proposed stack |
| `/prototype` | Demo status | Seven demo steps tagged Implemented / Simulated / Planned, **Run the demo scenario**, reset |
| `/impact` | Impact | Benefits, live-computed metrics, safeguards |
| `/about` | Team | Members, contact, MVP vs future scope |

## Try this

1. Open **Prototype** and click **Run the demo scenario** (it switches you to the Responder role).
2. On the incident page, watch the agents finish, then **Approve**, **Acknowledge**, add a note, **Mark resolved**.
3. Download the generated report.
4. Switch the role bar to **Student** to see role-based access (status only).
5. Submit a vague report like "help", or press the panic button, to see escalation to a human reviewer.

## Deck ideas and where they live in the code

| Deck idea | Code |
|---|---|
| Urgent alerts never wait for AI checks | `submitReport` in `src/context/IncidentContext.jsx` logs the alert before any agent step |
| Uncertain cases escalate to humans | `assessmentAgent` confidence < 0.6 sets `needsReview`; `humanReview` action |
| LLM interprets, deterministic code decides | Agents in `src/lib/agents.js`; state machine, roles, routing, timers in `src/lib/constants.js` and `src/lib/format.js` |
| Role-based access | `PERMISSIONS` in `src/lib/constants.js` |
| Guidance from approved protocols | `PROTOCOLS` store in `src/lib/agents.js` |
| One shared incident record | `IncidentContext` (single reducer, persisted to `localStorage`) |

## Structure

```
src/
  main.jsx, App.jsx, index.css
  context/IncidentContext.jsx   shared incident record, orchestrator, actions
  lib/                          constants, agents, seed data, formatting, duplicate check
  data/content.js               text content taken from the deck
  components/                   Navbar, RoleBar, Footer, CampusMap, Timeline, Badges, Logo
  pages/                        one file per route
public/logo.svg
```

## Swapping in the real thing later

- Replace the functions in `src/lib/agents.js` with calls to a backend API (LLM with structured tool calling).
- Replace `localStorage` in `IncidentContext.jsx` with an API + real-time subscription (e.g. Supabase).
- The routes, pages and components can stay as they are.
