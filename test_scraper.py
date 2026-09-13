
from tools import scrape_url


url = "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/"

result = scrape_url.invoke(url)

print("\nSCRAPED CONTENT:")
print(result)
