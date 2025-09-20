chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.testPing) {
    sendResponse({ pong: true });
    return;
  }

  const { title, year, originalTitle } = request;

  if (!title) {
    sendResponse({ price: null });
    return;
  }

  (async () => {
    try {
      const price = await fetchPriceFromPriceCharting(title);
      sendResponse({ price });
    } catch (error) {
      sendResponse({ price: null });
    }
  })();

  return true;
});

async function fetchPriceFromPriceCharting(title) {
  const query = encodeURIComponent(title);
  const url = `https://www.pricecharting.com/search-products?type=prices&ignore-preferences=true&q=${query}&go=Go`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    if (!html || html.length < 100) {
      return null;
    }

    const pricePatterns = [
      /<td class="value">\$([0-9,]+\.?[0-9]*)/i,
      /<span class="price">\$([0-9,]+\.?[0-9]*)/i,
      /\$([0-9,]+\.?[0-9]*)<\/td>/i,
      /price[^>]*>\$([0-9,]+\.?[0-9]*)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const price = match[1].replace(/,/g, "");
        return price;
      }
    }

    return null;
  } catch (error) {
    throw error;
  }
}
