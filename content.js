function injectPokePriceStyles() {
  if (document.getElementById("pokeprice-style")) return;
  const style = document.createElement("style");
  style.id = "pokeprice-style";
  style.textContent = `
    .pokeprice-tag {
      position: absolute !important;
      right: 10px;
      bottom: 10px;
      padding: 3px 8px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 4px;
      z-index: 10;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      pointer-events: none;
      width: fit-content;
    }
    .pokeprice-cost-box {
      position: absolute !important;
      right: 10px;
      bottom: 35px;
      background: rgba(255,255,255,0.95);
      border: 1px solid #ddd;
      padding: 6px 8px;
      font-size: 11px;
      border-radius: 4px;
      z-index: 10;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      pointer-events: none;
      width: fit-content;
    }
    .pokeprice-cost-line {
      display: flex;
      justify-content: space-between;
      margin: 1px 0;
    }
    .pokeprice-cost-total {
      margin-top: 2px;
      padding-top: 2px;
      font-weight: bold;
      justify-content: center;
    }
    .su-card-container.pokeprice-rel {
      position: relative !important;
    }
    .pokeprice-item-page-container {
      position: fixed !important;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    .pokeprice-item-page-container .pokeprice-tag {
      position: relative !important;
      right: auto;
      bottom: auto;
      margin-bottom: 5px;
    }
    .pokeprice-item-page-container .pokeprice-cost-box {
      position: relative !important;
      right: auto;
      bottom: auto;
    }
  `;
  document.head.appendChild(style);
}

function extractCostDetails(listing) {
  const costs = {
    price: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  };

  console.log(
    "[PokePrice] Listing HTML structure:",
    listing.innerHTML.substring(0, 500)
  );
  console.log("[PokePrice] Listing classes:", listing.className);

  const priceSelectors = [
    "span.su-styled-text.primary.bold.large-1.s-card__price",
    ".s-item__price",
    ".notranslate",
    "span[class*='price']",
    "span[class*='su-styled-text'][class*='primary']",
    ".s-item__detail--primary",
  ];

  let priceElement = null;
  for (const selector of priceSelectors) {
    priceElement = listing.querySelector(selector);
    console.log(`[PokePrice] Price selector "${selector}":`, !!priceElement);
    if (priceElement) {
      console.log(
        `[PokePrice] Found price element with text:`,
        priceElement.textContent.trim()
      );
      break;
    }
  }

  if (priceElement) {
    const priceText = priceElement.textContent.trim();
    console.log("[PokePrice] Price element text:", priceText);
    const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
    const priceMatches = priceText.match(/\$([0-9,]+\.?[0-9]*)/g);
    if (priceMatches) {
      const prices = priceMatches.map(p => parseFloat(p.replace(/[^0-9.]/g, "")));
      costs.price = Math.min(...prices);
    }
  } else {
    console.log("[PokePrice] No price element found with any selector");
  }

  const shippingSelectors = [
    ".s-card__attribute-row span.su-styled-text.secondary.large",
    "su-styled-text positive bold large",
    "span.su-styled-text.secondary.large",
    ".s-item__shipping",
    ".s-item__detail--secondary",
    "span[class*='secondary']",
    "[class*='delivery']",
    "[class*='shipping']",
    "span", // Check all spans as last resort
  ];

  let shippingElement = null;
  let foundShippingText = "";

  for (const selector of shippingSelectors) {
    const elements = listing.querySelectorAll(selector);
    console.log(
      `[PokePrice] Shipping selector "${selector}": found ${elements.length} elements`
    );

    for (const element of elements) {
      const text = element.textContent.trim();
      console.log(`[PokePrice] Checking element text: "${text}"`);

      if (
        text.toLowerCase().includes("delivery") ||
        text.toLowerCase().includes("shipping") ||
        text.match(/\+?\$[0-9,]+\.?[0-9]*/) ||
        text.toLowerCase().includes("free delivery")
      ) {
        console.log(`[PokePrice] Found potential shipping text: "${text}"`);
        shippingElement = element;
        foundShippingText = text;
        break;
      }
    }

    if (shippingElement) break;
  }

  if (shippingElement) {
    console.log("[PokePrice] Final shipping element text:", foundShippingText);
    if (foundShippingText.toLowerCase().startsWith("free delivery")) {
      costs.shipping = 0;
      console.log("[PokePrice] Free delivery detected");
    } else {
      const shippingMatch = foundShippingText.match(/\$([0-9,]+\.?[0-9]*)/);
      if (shippingMatch) {
        costs.shipping = parseFloat(shippingMatch[1].replace(/,/g, ""));
        console.log("[PokePrice] Extracted shipping:", costs.shipping);
      }
    }

  } else {
    console.log("[PokePrice] No shipping element found with any selector");
  }

  const taxRate = 0.07;
  costs.tax = (costs.price + costs.shipping) * taxRate;

  costs.total = costs.price + costs.shipping + costs.tax;

  return costs;
}

function createCostBreakdownBox(listing, costs, isPlaceholder = false) {
  let costBox = listing.querySelector(".pokeprice-cost-box");
  if (!costBox) {
    costBox = document.createElement("div");
    costBox.className = "pokeprice-cost-box";
    listing.appendChild(costBox);
  }

  if (isPlaceholder) {
    costBox.innerHTML = `
      <div class="pokeprice-cost-total">
        <span>Total:</span>
        <span>$---.--</span>
      </div>
    `;
  } else {
    costBox.innerHTML = `
      <div class="pokeprice-cost-total">
        <span>Total:</span>
        <span>$${costs.total.toFixed(2)}</span>
      </div>
    `;
  }
}

function createPriceTag(listing, price, isPlaceholder = false) {
  let priceTag = listing.querySelector(".pokeprice-tag");
  if (!priceTag) {
    priceTag = document.createElement("div");
    priceTag.className = "pokeprice-tag";
    listing.appendChild(priceTag);
  }

  if (isPlaceholder) {
    priceTag.innerText = "PC: $---.--";
  } else {
    priceTag.innerText = `PC: $${price}`;
  }
}

function processListing(listing, idx) {
  if (listing.dataset.pokepriceProcessed) return;
  listing.dataset.pokepriceProcessed = "true";

  const headerLink = listing.querySelector(".su-card-container__header");
  let title = headerLink ? headerLink.textContent : null;
  if (!title) {
    return;
  }

  // ensure relative positioning for overlay elements
  if (getComputedStyle(listing).position === "static") {
    listing.classList.add("pokeprice-rel");
  }

  // create placeholders so elements always exist
  createPriceTag(listing, null, true);
  createCostBreakdownBox(listing, null, true);

  // extract eBay cost immediately
  const costs = extractCostDetails(listing);
  createCostBreakdownBox(listing, costs, false);

  // --- Fetch raw PC cost from background.js ---
  chrome.runtime.sendMessage(
    { title, year: null, originalTitle: null },
    (response) => {
      if (chrome.runtime.lastError) {
        return;
      }

      const pcCostNum = response && response.price ? parseFloat(response.price) : NaN;
      const ebayTotal = Number(costs.total) || 0;

      if (pcCostNum && !isNaN(pcCostNum)) {
        const color = getColorGradient(ebayTotal, pcCostNum);

        let priceTag = listing.querySelector(".pokeprice-tag");
        if (!priceTag) {
          createPriceTag(listing, null, true);
          priceTag = listing.querySelector(".pokeprice-tag");
        }

        priceTag.style.background = color;
        priceTag.style.color = "white"; // keep text readable
        createPriceTag(listing, pcCostNum, false);
      }
    }
  );

  // --- Clean up title for second query (normalized) ---
  const yearMatch = title.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : null;

  let cleaned = null;
  let match = title.match(/([A-Za-z\-\s]+)#([A-Za-z0-9]+)/);
  if (match) {
    cleaned = match[1].trim() + " #" + match[2].toUpperCase();
  } else {
    match = title.match(/([A-Za-z\-\s]+)([0-9]+\/[0-9A-Za-z]+)/);
    if (match) {
      cleaned = match[1].trim() + " #" + match[2].toUpperCase();
    } else {
      match = title.match(/([A-Za-z\-\s]+)([0-9]{1,4})\b/);
      if (match) {
        cleaned = match[1].trim() + " #" + match[2];
      }
    }
  }
  if (!cleaned) {
    cleaned = title.split(" ")[0];
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (!/psa\s*10/i.test(cleaned)) {
    cleaned += " PSA 10";
  }

  // --- Fetch again with cleaned title for extra accuracy ---
  chrome.runtime.sendMessage({ title: cleaned, year }, (response) => {
    if (chrome.runtime.lastError) {
      return;
    }
    if (response && response.price) {
      createPriceTag(listing, response.price, false);
    }
  });
}

function processAllListings() {
  const listings = document.querySelectorAll(".su-card-container");
  
  if (listings.length === 0) {
    return;
  }

  listings.forEach((listing, idx) => {
    processListing(listing, idx);
  });
}

function processItemPage() {
  const itemContainer = document.createElement("div");
  itemContainer.className = "pokeprice-item-page-container";
  itemContainer.style.position = "relative";

  const mainContent =
    document.querySelector("#mainContent") ||
    document.querySelector(".notranslate") ||
    document.body;

  if (mainContent) {
    mainContent.appendChild(itemContainer);

    const titleElement =
      document.querySelector("#x-title-label-lbl") ||
      document.querySelector("h1[id*='title']") ||
      document.querySelector("h1");

    if (titleElement) {
      const title = titleElement.textContent.trim();

      createPriceTag(itemContainer, null, true);
      createCostBreakdownBox(itemContainer, null, true);

      const costs = extractItemPageCosts();
      createCostBreakdownBox(itemContainer, costs, false);

      const yearMatch = title.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : null;

      let cleaned = null;
      let match = title.match(/([A-Za-z\-\s]+)#([A-Za-z0-9]+)/);
      if (match) {
        cleaned = match[1].trim() + " #" + match[2].toUpperCase();
      } else {
        match = title.match(/([A-Za-z\-\s]+)([0-9]+\/[0-9A-Za-z]+)/);
        if (match) {
          cleaned = match[1].trim() + " #" + match[2].toUpperCase();
        } else {
          match = title.match(/([A-Za-z\-\s]+)([0-9]{1,4})\b/);
          if (match) {
            cleaned = match[1].trim() + " #" + match[2];
          }
        }
      }
      if (!cleaned) {
        cleaned = title.split(" ")[0];
      }
      cleaned = cleaned.replace(/\s+/g, " ").trim();

      if (!/psa\s*10/i.test(cleaned)) {
        cleaned += " PSA 10";
      }

      chrome.runtime.sendMessage({ title: cleaned, year }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
        if (response && response.price) {
          createPriceTag(itemContainer, response.price, false);
        }
      });
    }
  }
}

function extractItemPageCosts() {
  const costs = {
    price: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  };

  // Look for price on item page
  const priceSelectors = [
    ".price-current",
    ".display-price",
    ".notranslate",
    "[id*='price']",
    ".price",
    "span[class*='price']",
  ];

  for (const selector of priceSelectors) {
    const priceElement = document.querySelector(selector);
    if (priceElement) {
      const priceText = priceElement.textContent.trim();
      const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
      if (priceMatch) {
        costs.price = parseFloat(priceMatch[1].replace(/,/g, ""));
        break;
      }
    }
  }

  // Look for shipping on item page
  const shippingSelectors = [
    "[class*='shipping']",
    "[class*='delivery']",
    "[id*='shipping']",
    "[id*='delivery']",
  ];

  for (const selector of shippingSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent.trim();
      if (text.toLowerCase().includes("free")) {
        costs.shipping = 0;
        break;
      } else {
        const shippingMatch = text.match(/\+?\$([0-9,]+\.?[0-9]*)/);
        if (shippingMatch) {
          costs.shipping = parseFloat(shippingMatch[1].replace(/,/g, ""));
          break;
        }
      }
    }
    if (costs.shipping > 0) break;
  }

  // Calculate tax and total
  const taxRate = 0.07;
  costs.tax = (costs.price + costs.shipping) * taxRate;
  costs.total = costs.price + costs.shipping + costs.tax;

  return costs;
}

// Inject styles and run
injectPokePriceStyles();

// Observe for dynamically added listings
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        node.nodeType === 1 &&
        node.matches &&
        node.matches(".su-card-container")
      ) {
        processListing(node);
      } else if (node.nodeType === 1 && node.querySelectorAll) {
        node
          .querySelectorAll(".su-card-container")
          .forEach((el) => processListing(el));
      }
    });
  });
});

// Initialize the extension
function init() {
  injectPokePriceStyles();

  // Check if we're on an item page or search results page
  const isItemPage = window.location.href.includes("/itm/");
  const isSearchPage = window.location.href.includes("/sch/");

  if (isItemPage) {
    // Handle individual item page
    setTimeout(() => {
      processItemPage();
    }, 2000);
  } else if (isSearchPage) {
    // Handle search results page
    setTimeout(() => {
      processAllListings();
    }, 2000);

    // Start observing for new listings on search pages
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function getColorGradient(ebayTotal, pcCost) {
  // safety
  if (!pcCost || isNaN(pcCost) || pcCost <= 0 || isNaN(ebayTotal)) {
    return 'hsl(0, 0%, 80%)'; // neutral gray as fallback
  }

  const ratio = ebayTotal / pcCost;

  // dark green (<= 0.5)
  if (ratio <= 0.5) {
    return `hsl(120, 85%, 25%)`; // dark green
  }

  // dark red (>= 1.5)
  if (ratio >= 1.5) {
    return `hsl(0, 85%, 25%)`; // dark red
  }

  // normalize [0.5, 1.5] -> t in [0,1]
  const t = (ratio - 0.5) / (1.5 - 0.5); // same as ratio - 0.5

  // hue: 120 -> 0 (green -> red)
  const hue = 120 * (1 - t);

  // saturation: keep high so colors are vivid
  const sat = 85;

  // lightness: triangular shape that peaks in the middle
  // L ranges from 25% (dark ends) up to 55% (bright middle)
  const lightness = 25 + 30 * (1 - Math.abs(2 * t - 1)); 
  // explanation: at t=0 or t=1 => L=25; at t=0.5 => L=55

  return `hsl(${hue.toFixed(1)}, ${sat}%, ${lightness.toFixed(1)}%)`;
}

// Start initialization
init();