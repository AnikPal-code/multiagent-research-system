"""
FastAPI wrapper around the existing multi-agent research pipeline
(agents.py: build_search_agent, build_reader_agent, writer_chain, critic_chain).

Drop this file into the SAME folder as your existing agents.py and tools.py
(next to pipeline.py). It reuses those exactly as they are — nothing about
your agent logic changes, this just exposes it over HTTP with live progress
events so a web/mobile UI can watch each stage complete in real time.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

Then point the Expo app's API_BASE_URL at this server, e.g.
    http://127.0.0.1:8000          (web / simulator)
    http://<your-lan-ip>:8000      (physical phone on same wifi)
"""

import asyncio
import json
from typing import AsyncGenerator

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

app = FastAPI(title="Research Pipeline API")

# Wide open for local dev across web + native. Tighten this before deploying
# anywhere public (restrict allow_origins to your actual site/app origins).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def sse(event: str, data: dict) -> str:
    """Format one Server-Sent-Event frame."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def extract_text(content) -> str:
    """
    LangChain message .content is sometimes a plain string, sometimes a list
    of content blocks like [{"type": "text", "text": "..."}] (common with
    tool-calling models). Normalize either shape into plain text so the UI
    always receives a string.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                parts.append(block.get("text") or block.get("content") or "")
            else:
                parts.append(str(block))
        return "\n".join(p for p in parts if p)
    return str(content)


async def run_pipeline(topic: str) -> AsyncGenerator[str, None]:
    state: dict = {}
    try:
        # Step 1 - search agent
        yield sse("step_start", {"step": "search", "label": "Searching the web"})
        search_agent = build_search_agent()
        search_result = await asyncio.to_thread(
            search_agent.invoke,
            {"messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]},
        )
        state["search_results"] = extract_text(search_result["messages"][-1].content)
        yield sse("step_done", {"step": "search", "output": state["search_results"]})

        # Step 2 - reader agent
        yield sse("step_start", {"step": "read", "label": "Reading the top source"})
        reader_agent = build_reader_agent()
        reader_result = await asyncio.to_thread(
            reader_agent.invoke,
            {
                "messages": [(
                    "user",
                    f"Based on the following search results about '{topic}', "
                    f"pick the most relevant URL and scrape it for deeper content.\n\n"
                    f"Search Results:\n{state['search_results'][:800]}",
                )]
            },
        )
        state["scraped_content"] = extract_text(reader_result["messages"][-1].content)
        yield sse("step_done", {"step": "read", "output": state["scraped_content"]})

        # Step 3 - writer chain
        yield sse("step_start", {"step": "write", "label": "Drafting the report"})
        research_combined = (
            f"SEARCH RESULTS:\n{state['search_results']}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
        )
        state["report"] = await asyncio.to_thread(
            writer_chain.invoke, {"topic": topic, "research": research_combined}
        )
        yield sse("step_done", {"step": "write", "output": state["report"]})

        # Step 4 - critic chain
        yield sse("step_start", {"step": "critique", "label": "Critiquing the report"})
        state["feedback"] = await asyncio.to_thread(critic_chain.invoke, {"report": state["report"]})
        yield sse("step_done", {"step": "critique", "output": state["feedback"]})

        yield sse("complete", {"report": state["report"], "feedback": state["feedback"]})

    except Exception as exc:  # surfaces to the UI instead of dying silently
        yield sse("error", {"message": str(exc)})


@app.get("/research/stream")
async def research_stream(topic: str = Query(..., min_length=1)):
    return StreamingResponse(
        run_pipeline(topic),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disable proxy buffering if behind nginx
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}