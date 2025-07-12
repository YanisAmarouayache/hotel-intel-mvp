// src/lib/scrapeApi.ts

export async function scrapePricesForHotel(hotelId: number) {
  const api = import.meta.env.VITE_API_URL || '';
  const endpoint = api
    ? `${api}/scraper/hotel/scrape-and-store?hotelId=${hotelId}`
    : `/scraper/hotel/scrape-and-store?hotelId=${hotelId}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}
