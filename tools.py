from langchain.tools import tool
import requests
from bs4 import BeautifulSoup

@tool
def web_search(query: str) -> str:
    """Search the web for information."""
    # Your search implementation here
    return "Search results..."

@tool
def scrape_url(url: str) -> str:
    """Scrape the contents of a webpage."""
    try:
        response = requests.get(
            url,
            timeout=20,
            headers={"User-Agent": "Mozilla/5.0 (research-bot)"},
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return f"Could not scrape {url}: {e}. Try a different URL from the search results instead."

    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text(separator="\n")[:5000]