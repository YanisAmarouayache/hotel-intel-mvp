import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapeBooking(url: string) {
  if (!url.includes('booking.com')) {
    throw new Error('URL must be a Booking.com hotel page');
  }
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
  });
  const $ = cheerio.load(html);

  // Hotel Name
  let name = $('h2[data-testid="title"]').first().text().trim();
  if (!name) name = $('h1.hp__hotel-name').first().text().trim();
  if (!name) name = $('title').text().split('–')[0].trim();
  console.log('Hotel name:', name);

  // User Rating
  let userRating = $('div[data-testid="review-score-component"] span.bui-review-score__badge').first().text().trim();
  if (!userRating) userRating = $('span.bui-review-score__badge').first().text().trim();
  if (!userRating) userRating = $('[data-testid="review-score-right-component"]').children().eq(1).text().trim();
  console.log('User rating:', userRating);

  // Review Count (structure recommandée)
  let reviewCount: number | null = null;
  const reviewScoreRight = $('[data-testid="review-score-right-component"]');
  if (reviewScoreRight.length) {
    const children1 = reviewScoreRight.children();
    const fourthChild = children1.eq(3);
    const children2 = fourthChild.children();
    const secondChild = children2.eq(1);
    const reviewText = secondChild.text().trim(); // ex: "2 227 expériences vécues"
    const match = reviewText.match(/([0-9\s]+)[^\d]/); // capture "2 227"
    if (match && match[1]) {
      reviewCount = parseInt(match[1].replace(/\s/g, ''), 10);
    }
  }
  // Fallback global : chercher "XXX reviews" dans la page
  if (!reviewCount) {
    const reviewText = $('body').text();
    const match = reviewText.match(/([0-9]{1,3}(?:,[0-9]{3})*) reviews?/i);
    if (match && match[1]) {
      reviewCount = parseInt(match[1].replace(/,/g, ''), 10);
    }
  }
  console.log('Review count:', reviewCount);

  // Address (chemin exact demandé, contenu direct de la div)
  let address = '';
  const addressWrapper = $('[data-testid="PropertyHeaderAddressDesktop-wrapper"]');
  if (addressWrapper.length) {
    const firstChild = addressWrapper.children().eq(0);
    const secondChild = firstChild.children().eq(1);
    const firstChild2 = secondChild.children().eq(0);
    const firstChild3 = firstChild2.children().eq(0);
    // Récupérer le contenu direct de la div (pas le texte de ses enfants)
    address = firstChild3.contents().filter(function() { return this.type === 'text'; }).text().trim();
  }
  // Fallbacks si rien trouvé
  if (!address) address = $('span[data-testid="address"]').first().text().trim();
  if (!address) address = $('.hp_address_subtitle').first().text().trim();
  if (!address) address = $('main div button[data-testid="address-link"] div').first().text().trim();
  console.log('Address:', address);

  // City (extraction combinée)
  let city = '';
  if (address) {
    // 1. Regex code postal + ville (France)
    let match = address.match(/([0-9]{5})\s*([A-Za-zÀ-ÿ\-\s]+)/);
    if (match) {
      city = match[2].trim();
    } else {
      // 2. Dernier segment après la dernière virgule
      const parts = address.split(',');
      if (parts.length > 1) {
        city = parts[parts.length - 1].trim();
      }
    }
  }
  console.log('City:', city);

  // Star Rating
  let starRating = $('div[data-testid="rating-stars"] > span').length;
  if (!starRating) {
    // fallback: aria-label
    const starLabel = $('[aria-label*="étoile"], [aria-label*="star"]').attr('aria-label');
    if (starLabel) {
      const match = starLabel.match(/([0-9])/);
      if (match) starRating = parseInt(match[1], 10);
    }
  }
  console.log('Star rating:', starRating);

  // Amenities
  const amenities: string[] = [];
  const propertySectionContent = $('[data-testid="property-section--content"]');
  if (propertySectionContent.length) {
    propertySectionContent.find('[data-testid="facility-icon"]').each((_, el) => {
      // Trouver la div qui suit ce span
      const nextDiv = $(el).next('div');
      if (nextDiv.length) {
        // Chercher les enfants de cette div
        nextDiv.children().each((_, childEl) => {
          const text = $(childEl).text().trim();
          if (text) amenities.push(text);
        });
      }
    });
  }
  // Fallback si rien trouvé
  if (amenities.length === 0) {
    $('div[data-testid="facility-group-container"] li.bui-list__description').each((_, el) => {
      const text = $(el).text().trim();
      if (text) amenities.push(text);
    });
  }
  if (amenities.length === 0) {
    $('[data-testid="facilities-list"] li, .hotel-facilities__list li, .bui-list__item').each((_, el) => {
      const text = $(el).text().trim();
      if (text) amenities.push(text);
    });
  }
  console.log('Amenities:', amenities);

  // Images
  const images: string[] = [];
  $('div[data-testid="property-gallery"] img[data-testid="image"]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && images.length < 5) images.push(src);
  });
  if (images.length === 0) {
    $('.hotel_image, img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && images.length < 5) images.push(src);
    });
  }
  console.log('Images:', images);

  // Atlas bbox (pour la carte)
  const atlasBbox = $('[data-atlas-bbox]').attr('data-atlas-bbox') || null;
  console.log('Atlas bbox:', atlasBbox);

  return {
    name,
    address,
    city,
    userRating,
    reviewCount,
    starRating,
    amenities,
    images,
    atlasBbox,
  };
}

// CLI usage
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: ts-node scrape-booking.ts <booking.com-hotel-url>');
    process.exit(1);
  }
  scrapeBooking(url)
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));
    })
    .catch((err) => {
      console.error('Scraping error:', err.message);
      process.exit(1);
    });
}

export default scrapeBooking; 