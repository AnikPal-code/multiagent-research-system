# 🔎 ResearchFlow AI

A multi-agent AI research assistant. Four agents work through a topic in sequence — **search → read → write → critique** — with live progress streamed to a web and mobile UI built from a single codebase.

**🌐 Live demo:** [multiagent-research-system-t2yo-beta.vercel.app](https://multiagent-research-system-t2yo-beta.vercel.app)
**⚙️ Live API:** [multiagent-research-system-8jcf.onrender.com/health](https://multiagent-research-system-8jcf.onrender.com/health)

> Note: the backend is on a free hosting tier and sleeps after 15 minutes of inactivity — the first request may take 30–60 seconds to wake it up.


---

## How it works

```
 ┌───────────────────────┐   HTTP + live streaming   ┌────────────────────────┐
 │  Frontend (Expo)       │ ─────────────────────────▶│  Backend (FastAPI)     │
 │  Website + iOS + Android│◀──────────────────────── │  Runs the 4 AI agents  │
 └───────────────────────┘                            └────────────────────────┘
        deployed on Vercel                                  deployed on Render
```

1. **Search agent** — searches the web for sources on the given topic
2. **Reader agent** — picks the most promising result and scrapes it for depth
3. **Writer chain** — synthesizes everything into a structured report
4. **Critic chain** — reviews the report and scores it honestly

Progress streams live via **Server-Sent Events**, so the UI lights up each stage as it completes instead of showing a blank spinner.

---

## Tech stack

- **AI orchestration:** LangChain (`create_agent`) + Mistral (`mistral-small-latest`)
- **Backend:** FastAPI, Server-Sent Events
- **Frontend:** Expo (React Native + React Native Web) — one codebase, three platforms
- **Scraping:** `requests` + `BeautifulSoup`
- **Hosting:** Render (backend) + Vercel (frontend)


---

## Project structure

```
multiagent-research-system/
  agents.py            # LangChain agents + chains
  main.py              # FastAPI app, SSE streaming endpoint
  pipeline.py           # original CLI version of the pipeline
  tools.py              # web_search + scrape_url tools
  requirements.txt
  mobile/                # Expo app (web + iOS + Android)
    App.tsx
    app.config.js
    src/
      api.ts             # SSE client
      screens/HomeScreen.tsx
      components/
```

---

## Running it locally

**Backend:**
```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd mobile
npm install
cp .env.example .env      # set EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
npm run web                # or: npm start, then scan with Expo Go
```

---

## Known limitations

- `web_search` is currently a stub — swap in a real search API (e.g. Tavily) for live results.
- No auth/rate-limiting — don't expose this publicly without adding some.
- Free-tier backend hosting means cold starts after inactivity.

See [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) for the full architecture explanation, design decisions, and a debugging story from building this.
