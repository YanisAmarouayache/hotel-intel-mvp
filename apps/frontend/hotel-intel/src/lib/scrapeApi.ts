// src/lib/scrapeApi.ts

export async function scrapePricesForHotel(url: string) {
  const api = import.meta.env.VITE_API_URL || '';
  const endpoint = api ? `${api}/scraper/hotel/scrape-and-store` : '/scraper/hotel/scrape-and-store';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}
