from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from ddgs import DDGS


@tool
def web_search(query: str) -> str:
    """Search the web for recent and reliable information."""

    try:
        results = DDGS().text(
            query,
            max_results=5
        )

        if not results:
            return "No search results found."

        output = []

        for i, result in enumerate(results, start=1):
            title = result.get("title", "")
            url = result.get("href", "")
            snippet = result.get("body", "")

            output.append(
                f"{i}. {title}\n"
                f"URL: {url}\n"
                f"Description: {snippet}\n"
            )

        return "\n".join(output)

    except Exception as e:
        return f"Web search failed: {e}"


@tool
def scrape_url(url: str) -> str:
    """Scrape the contents of a webpage."""

    try:
        response = requests.get(
            url,
            timeout=20,
            headers={
                "User-Agent": "Mozilla/5.0 (research-bot)"
            },
        )

        response.raise_for_status()

    except requests.exceptions.RequestException as e:
        return (
            f"Could not scrape {url}: {e}. "
            "Try a different URL from the search results."
        )

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove unnecessary elements
    for element in soup([
        "script",
        "style",
        "nav",
        "footer",
        "header"
    ]):
        element.decompose()

    text = soup.get_text(
        separator="\n",
        strip=True
    )

    return text[:10000]