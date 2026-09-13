from agents import (
    build_reader_agent,
    build_search_agent,
    writer_chain,
    critic_chain,
)


def run_research_pipeline(topic: str) -> dict:
    state = {}

    # ==========================================
    # STEP 1 - SEARCH AGENT
    # ==========================================

    print("\n" + "=" * 50)
    print("STEP 1 - Search agent is working...")
    print("=" * 50)

    search_agent = build_search_agent()

    search_result = search_agent.invoke({
        "messages": [
            (
                "user",
                f"Find recent, reliable and detailed information about: {topic}"
            )
        ]
    })

    state["search_results"] = search_result["messages"][-1].content

    print("\nSearch Result:")
    print(state["search_results"])

    # ==========================================
    # STEP 2 - READER AGENT
    # ==========================================

    print("\n" + "=" * 50)
    print("STEP 2 - Reader agent is scraping top resources...")
    print("=" * 50)

    reader_agent = build_reader_agent()

    reader_result = reader_agent.invoke({
        "messages": [
            (
                "user",
                f"""
You are a research reader.

Topic:
{topic}

Below are the web search results:

{state["search_results"]}

Your task:

1. Identify the most relevant and reliable URL.
2. Use the scrape_url tool on that URL.
3. Return the useful factual information obtained from the webpage.
4. Do not invent URLs.
5. If the first URL cannot be scraped, try another URL from the search results.
"""
            )
        ]
    })

    state["scraped_content"] = reader_result["messages"][-1].content

    print("\nScraped Content:")
    print(state["scraped_content"])

    # ==========================================
    # STEP 3 - WRITER
    # ==========================================

    print("\n" + "=" * 50)
    print("STEP 3 - Writer is drafting the report...")
    print("=" * 50)

    research_combined = (
        f"SEARCH RESULTS:\n"
        f"{state['search_results']}\n\n"
        f"DETAILED SCRAPED CONTENT:\n"
        f"{state['scraped_content']}"
    )

    state["report"] = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })

    print("\nFinal Report:")
    print(state["report"])

    # ==========================================
    # STEP 4 - CRITIC
    # ==========================================

    print("\n" + "=" * 50)
    print("STEP 4 - Critic is reviewing the report...")
    print("=" * 50)

    state["feedback"] = critic_chain.invoke({
        "report": state["report"]
    })

    print("\nCritic Report:")
    print(state["feedback"])

    return state


# ==========================================
# RUN DIRECTLY
# ==========================================

if __name__ == "__main__":
    topic = input("\nEnter a research topic: ")

    run_research_pipeline(topic)