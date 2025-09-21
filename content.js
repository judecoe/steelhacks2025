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
      position: absolute !// Add function to test API key
window.testAPIKey = function() {
  console.log("[PokePrice] Testing API key validity...");
  chrome.runtime.sendMessage({ testAPIKey: true }, (response) => {
    console.log("[PokePrice] API key test result:", response);
  });
};

// Debug function to test title extraction
window.testTitleExtraction = function(title) {
  console.log("===== TESTING TITLE EXTRACTION =====");
  const result = extractPokemonCardName(title, true); // Enable verbose mode
  console.log("Input:", title);
  console.log("Output:", result);
  console.log("=====================================");
  return result;
};

// Debug function to test a search
window.testPokeSearch = function(searchTerm) {
  console.log("===== TESTING SEARCH =====");
  chrome.runtime.sendMessage({ title: searchTerm, year: null }, (response) => {
    console.log("Search term:", searchTerm);
    console.log("Response:", response);
    if (response) {
      if (response.price) {
        console.log("SUCCESS: Found price: $" + response.price);
        if (response.source) {
          console.log("Source: " + response.source);
        }
      } else {
        console.log("FAILURE: No price found");
        if (response.error) {
          console.log("Error: " + response.error);
        }
      }
    }
    console.log("==========================");
  });
};

// Add function to test scraping from page
window.testSingleAPI = function() {
  console.log("[PokePrice] Testing single product API...");
  chrome.runtime.sendMessage({ testSingleAPI: true }, (response) => {
    console.log("[PokePrice] Single API test result:", response);
  });
};nt;
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

  // Reduced logging for HTML structure to prevent spam
  // console.log("[PokePrice] Listing HTML structure:", listing.innerHTML.substring(0, 500));
  // console.log("[PokePrice] Listing classes:", listing.className);

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
    // Reduced logging to prevent spam
    // console.log(`[PokePrice] Price selector "${selector}":`, !!priceElement);
    if (priceElement) {
      // console.log(
      //   `[PokePrice] Found price element:`,
      //   priceElement.textContent.trim()
      // );
      break;
    }
  }

  if (priceElement) {
    const priceText = priceElement.textContent.trim();
    // console.log("[PokePrice] Price element text:", priceText);
    const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
    const priceMatches = priceText.match(/\$([0-9,]+\.?[0-9]*)/g);
    if (priceMatches) {
      const prices = priceMatches.map(p => parseFloat(p.replace(/[^0-9.]/g, "")));
      costs.price = Math.min(...prices);
    }
  } else {
    console.log("[PokePrice] No price element found");
  }

  const shippingSelectors = [
    ".s-card__attribute-row span.su-styled-text.secondary.large",
    "span.su-styled-text.positive.bold.large",
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
    // Reduced shipping selector logging to prevent spam
    // console.log(`[PokePrice] Shipping selector "${selector}": found ${elements.length} elements`);

    for (const element of elements) {
      const text = element.textContent.trim();
      // console.log(`[PokePrice] Checking element text: "${text}"`);

      if (
        text.toLowerCase().includes("delivery") ||
        text.toLowerCase().includes("shipping") ||
        text.match(/\+?\$[0-9,]+\.?[0-9]*/) ||
        text.toLowerCase().includes("free delivery")
      ) {
        // console.log(`[PokePrice] Found shipping text: "${text}"`);
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
        // console.log("[PokePrice] Extracted shipping:", costs.shipping);
      }
    }

  } else {
    // console.log("[PokePrice] No shipping element found");
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

function extractPokemonCardName(title, verbose = false) {
  if (verbose) {
    console.log("[PokePrice] ===== TITLE EXTRACTION DEBUG =====");
    console.log("[PokePrice] Original title:", title);
  }

  // First, remove obvious eBay noise and condition text
  let cleaned = title
    .replace(/Shop on eBay/gi, "")
    .replace(/Brand New/gi, "")
    .replace(/New \(Other\)/gi, "")
    .replace(/Used/gi, "")
    .replace(/\d+\.\d+ out of \d+ stars\./gi, "")
    .replace(/\(\d+\)/gi, "") // Remove rating counts like (2)
    .replace(/\d+ product ratings/gi, "")
    .replace(/^\d{4}\s+Pokemon\s+/i, "") // Remove "2024 Pokemon " from start
    .trim();

  if (verbose) {
    console.log("[PokePrice] After eBay noise removal:", cleaned);
  }

  // Check for Japanese cards first
  const isJapanese = /\b(japanese|japan|jpn|jp)\b/i.test(cleaned);
  if (verbose) {
    console.log("[PokePrice] Japanese card detected:", isJapanese);
  }

  // Remove problematic terms but preserve important information
  cleaned = cleaned
    .replace(
      /\b(psa|bgs|cgc|sgc|graded|grade|gem|mt|mint|nm|lp|mp|hp|played|damaged|excellent|near|holo|holographic|foil|rare|ultra|secret|alternate|art|promo|collection|anniversary)\b/gi,
      " "
    )
    .replace(
      /\b(tcg|card|trading|collectible|vintage|shadowless|unlimited|1st|first|edition|symbol|rarity|no)\b/gi,
      " "
    )
    .replace(/\b(10|9|8|7|6|5|4|3|2|1)\b(?!\d|\/|[0-9])/g, " ") // Remove standalone grades but preserve card numbers and multi-digit numbers
    .replace(/[()[\]{}]/g, " ") // Remove brackets
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();

  if (verbose) {
    console.log("[PokePrice] After cleaning:", cleaned);
  }

  // Extract card number first (most specific pattern) - do this before heavy cleaning
  let cardNumber = "";
  // Look for card numbers in original title first to avoid losing them during cleaning
  const originalCardPatterns = [
    /\b(\d+\/\d+)\b/, // 123/456 format
    /#([A-Z]{1,3}\d+)/i, // #SM189, #BW123 format
    /#(\d+)/, // #123 format
    /\b([A-Z]{1,3}\d+)\b/i, // SM189, BW123, XY12 format (promo cards)
    /\b(0\d{2,3})\b/, // 074, 0123 format (leading zero)
    /\bex\s+(\d{3})\b/i, // "ex 074" format
    /\b(\d{3})\s+full\s+art/i, // "074 Full Art" format
  ];

  for (const pattern of originalCardPatterns) {
    const match = title.match(pattern);
    if (match) {
      cardNumber = match[1];
      break;
    }
  }

  if (verbose) {
    console.log("[PokePrice] Extracted card number:", cardNumber);
  }

  // Remove years from the start to avoid them being part of Pokemon name
  cleaned = cleaned.replace(/^\d{4}\s+/, "").trim();

  // Look for known Pokemon names first (common ones)
  const pokemonNames = [
    "charizard",
    "pikachu",
    "blastoise",
    "venusaur",
    "mewtwo",
    "mew",
    "lugia",
    "ho-oh",
    "rayquaza",
    "groudon",
    "kyogre",
    "dialga",
    "palkia",
    "giratina",
    "arceus",
    "reshiram",
    "zekrom",
    "kyurem",
    "xerneas",
    "yveltal",
    "zygarde",
    "solgaleo",
    "lunala",
    "necrozma",
    "zacian",
    "zamazenta",
    "eternatus",
    "zoroark",
    "hoothoot",
    "growlithe",
    "perrin",
    "eevee",
    "gyarados",
    "alakazam",
    "machamp",
    "gengar",
    "dragonite",
    "typhlosion",
    "ampharos",
    "espeon",
    "umbreon",
    "leafeon",
    "glaceon",
    "sylveon",
    "garchomp",
    "lucario",
    "darkrai",
    "shaymin",
    "victini",
  ];

  let pokemonName = "";
  let setInfo = "";

  // Check for known Pokemon names
  for (const pokemon of pokemonNames) {
    const regex = new RegExp(`\\b${pokemon}\\b`, "i");
    if (regex.test(cleaned)) {
      pokemonName =
        pokemon.charAt(0).toUpperCase() + pokemon.slice(1).toLowerCase();
      // Look for variants (V, VMAX, VSTAR, GX, EX, etc.) - improved pattern
      const variantMatch = cleaned.match(
        new RegExp(
          `${pokemon}\\s+(vstar|vmax|v|gx|ex|tag\\s+team|break)\\b`,
          "i"
        )
      );
      if (variantMatch) {
        pokemonName += " " + variantMatch[1].toUpperCase();
      }
      break;
    }
  }

  // If no known Pokemon found, extract from remaining words
  if (!pokemonName) {
    const words = cleaned
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .filter(
        (word) =>
          !word
            .toLowerCase()
            .match(
              /^(pokemon|game|set|base|lost|origin|brilliant|stars|evolving|skies|crown|zenith|silver|tempest)$/
            )
      );

    // Take first word as Pokemon name, second as variant if it looks like one
    if (words.length > 0) {
      pokemonName = words[0];
      if (words.length > 1 && words[1].match(/^(vstar|vmax|v|gx|ex)$/i)) {
        pokemonName += " " + words[1].toUpperCase();
      }
    }
  }

  // Look for set information - expanded patterns including set codes
  const setMatch = cleaned.match(
    /\b(base\s+set|neo\s+genesis|lost\s+origin|brilliant\s+stars|evolving\s+skies|fusion\s+strike|chilling\s+reign|battle\s+styles|shining\s+fates|champions\s+path|darkness\s+ablaze|rebel\s+clash|sword\s+shield|astral\s+radiance|paldea\s+evolved|obsidian\s+flames|silver\s+tempest|paradox\s+rift|crown\s+zenith|evolutions|shining\s+legends|sv8a|twm|swsh|sv|paldean\s+fates|151|masterball|reverse|journey\s+together)\b/gi
  );
  if (setMatch) {
    setInfo = setMatch[0];
  } else {
    // Also check original title for set names that might have been removed
    const originalSetMatch = title.match(
      /\b(base\s+set|neo\s+genesis|lost\s+origin|brilliant\s+stars|evolving\s+skies|fusion\s+strike|chilling\s+reign|battle\s+styles|shining\s+fates|champions\s+path|darkness\s+ablaze|rebel\s+clash|sword\s+shield|astral\s+radiance|paldea\s+evolved|obsidian\s+flames|silver\s+tempest|paradox\s+rift|crown\s+zenith|evolutions|shining\s+legends|sv8a|twm|swsh|sv|paldean\s+fates|151|masterball|reverse|journey\s+together)\b/gi
    );
    if (originalSetMatch) {
      setInfo = originalSetMatch[0];
    }
  }

  // Build the final search term
  let result = "";

  if (isJapanese) {
    result += "Japanese ";
  }

  if (pokemonName) {
    result += pokemonName;
  }

  if (setInfo) {
    result += " " + setInfo;
  }

  if (cardNumber) {
    result += " #" + cardNumber;
  }

  // Fallback if we couldn't extract anything meaningful
  if (!result.trim() || result.trim().length < 3) {
    const fallbackWords = title
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter(
        (word) =>
          !word
            .toLowerCase()
            .match(
              /^(psa|gem|mint|graded|card|tcg|pokemon|trading|holo|rare|\d{4})$/
            )
      )
      .slice(0, 2);
    result = fallbackWords.join(" ");

    if (isJapanese && !result.toLowerCase().includes("japanese")) {
      result = "Japanese " + result;
    }
  }

  result = result.replace(/\s+/g, " ").trim();

  if (verbose) {
    console.log("[PokePrice] Extracted Pokemon name:", result);
    console.log(
      "[PokePrice] Components - Name:",
      pokemonName,
      "Set:",
      setInfo,
      "Number:",
      cardNumber,
      "Japanese:",
      isJapanese
    );
  }
  return result;
}

function processListing(listing, idx) {
  if (listing.dataset.pokepriceProcessed) return;
  listing.dataset.pokepriceProcessed = "true";

  // Try multiple selectors to find the actual listing title
  let title = "";
  const titleSelectors = [
    ".s-item__title", // Main eBay listing title
    ".su-card-container__header a", // Link text only
    ".su-card-container__header", // Header element
    "[data-testid='item-title']", // Alternative title selector
    "h3 a", // Generic heading link
    "a[href*='/itm/']", // eBay item link
  ];

  for (const selector of titleSelectors) {
    const titleElement = listing.querySelector(selector);
    if (titleElement) {
      title = titleElement.textContent.trim();
      // Filter out obvious non-title content
      if (
        title &&
        !title.includes("Shop on eBay") &&
        !title.includes("Brand New") &&
        title.length > 10
      ) {
        break;
      }
    }
  }

  // If no good title found, skip this listing
  if (!title || title.includes("Shop on eBay")) {
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

  // Use the improved extraction function
  let cleaned = extractPokemonCardName(title);

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Only add PSA 10 if it's not already there
  if (!/psa\s*10/i.test(cleaned)) {
    cleaned += " PSA 10";
  }

  // Reduced logging since we have summary view
  // console.log("[PokePrice] ===== FINAL SEARCH TERM =====");
  // console.log("[PokePrice] Will search for:", cleaned);
  // console.log("[PokePrice] ================================");

  // --- Fetch again with cleaned title for extra accuracy ---
  chrome.runtime.sendMessage({ title: cleaned, year }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("[PokePrice] Runtime error:", chrome.runtime.lastError);
      return;
    }
    // console.log("[PokePrice] API response:", response);

    if (response && response.price) {
      createPriceTag(listing, response.price, false);
      // console.log("[PokePrice] Updated price tag with:", response.price);

      // Log the source if available
      if (response.source) {
        // console.log(`[PokePrice] Price source: ${response.source}`);
      }
    } else {
      console.log("[PokePrice] No price found for:", cleaned);

      // Log error details if available
      if (response && response.error) {
        console.warn("[PokePrice] Error details:", response.error);

        // Update the tag to show error state for debugging
        const priceTag = listing.querySelector(".pokeprice-tag");
        if (priceTag) {
          priceTag.innerText = "PC: Error";
          priceTag.style.background = "rgba(255,100,100,0.92)";
          priceTag.title = response.error; // Show error on hover
        }
      }
    }
  });
}

function processAllListings() {
  const listings = document.querySelectorAll(".su-card-container");
  
  if (listings.length === 0) {
    return;
  }

  console.log("[PokePrice] ===== PROCESSING LISTINGS SUMMARY =====");
  console.log(`[PokePrice] Found ${listings.length} listings on page`);

  // Show summary for 10 listings, starting from index 2 (skip first 2 non-listings)
  const startIndex = 2;
  const maxSummary = Math.min(10, listings.length - startIndex);
  console.log(
    `[PokePrice] Showing title extraction for listings ${startIndex + 1}-${
      startIndex + maxSummary
    } (skipping first 2 non-listings):`
  );

  for (let i = startIndex; i < startIndex + maxSummary; i++) {
    const listing = listings[i];

    // Try multiple selectors to find the actual listing title
    let originalTitle = "";
    const titleSelectors = [
      ".s-item__title", // Main eBay listing title
      ".su-card-container__header a", // Link text only
      ".su-card-container__header", // Header element
      "[data-testid='item-title']", // Alternative title selector
      "h3 a", // Generic heading link
      "a[href*='/itm/']", // eBay item link
    ];

    for (const selector of titleSelectors) {
      const titleElement = listing.querySelector(selector);
      if (titleElement) {
        originalTitle = titleElement.textContent.trim();
        // Filter out obvious non-title content
        if (
          originalTitle &&
          !originalTitle.includes("Shop on eBay") &&
          !originalTitle.includes("Brand New") &&
          originalTitle.length > 10
        ) {
          break;
        }
      }
    }

    // If still no good title, skip this listing
    if (
      !originalTitle ||
      originalTitle === "No title found" ||
      originalTitle.includes("Shop on eBay")
    ) {
      continue;
    }

    const cleanedTitle = extractPokemonCardName(originalTitle);

    // Add PSA 10 to the cleaned title for API call
    let apiSearchTerm = cleanedTitle.replace(/\s+/g, " ").trim();
    if (!/psa\s*10/i.test(apiSearchTerm)) {
      apiSearchTerm += " PSA 10";
    }

    console.log(`[PokePrice] Listing ${i + 1}:`);
    console.log(`  Original: "${originalTitle}"`);
    console.log(`  Cleaned:  "${cleanedTitle}"`);
    console.log(`  API Call: "${apiSearchTerm}"`);

    // Make the API call and log the result for summary
    chrome.runtime.sendMessage(
      { title: apiSearchTerm, year: null },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(
            `  API Result: ERROR - ${chrome.runtime.lastError.message}`
          );
        } else if (response && response.price) {
          console.log(
            `  API Result: SUCCESS - $${response.price} (${
              response.source || "unknown"
            })`
          );
        } else {
          console.log(`  API Result: NO PRICE FOUND`);
          if (response && response.error) {
            console.log(`  API Error: ${response.error}`);
          }
        }
      }
    );

    console.log("  ---");
  }
  console.log("[PokePrice] =======================================");

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

  if (!mainContent) return;

  mainContent.appendChild(itemContainer);

  // --- TITLE ---
  const titleElement =
    document.querySelector("#x-title-label-lbl") ||
    document.querySelector("h1[id*='title']") ||
    document.querySelector("h1");

  if (!titleElement) return;
  const title = titleElement.textContent.trim();

  // --- COSTS (ebay-side) ---
  const costs = extractItemPageCosts();

  console.log("ITEM PAGE COST: ", costs.total);

  if (costs) {
    createCostBreakdownBox(itemContainer, costs, false);
  } else {
    createCostBreakdownBox(itemContainer, null, true); // fallback placeholder
  }

  // --- PC COST FETCH (raw) ---
  chrome.runtime.sendMessage({ title, year: null, originalTitle: null }, (response) => {
    if (chrome.runtime.lastError) return;

    const pcCostNum = response?.price ? parseFloat(response.price) : NaN;
    const ebayTotal = Number(costs?.total) || 0;

    if (!isNaN(pcCostNum)) {
      const color = getColorGradient(ebayTotal, pcCostNum);

      let priceTag = itemContainer.querySelector(".pokeprice-tag");
      if (!priceTag) {
        createPriceTag(itemContainer, null, true);
        priceTag = itemContainer.querySelector(".pokeprice-tag");
      }

      priceTag.style.background = color;
      priceTag.style.color = "white";
      createPriceTag(itemContainer, pcCostNum, false);
    }
  });

  // --- CLEANED TITLE + SECOND API CALL ---
  const yearMatch = title.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : null;

  console.log("[PokePrice] Item page original title:", title);

  let cleaned = extractPokemonCardName(title);
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (!/psa\s*10/i.test(cleaned)) {
    cleaned += " PSA 10";
  }

  chrome.runtime.sendMessage({ title: cleaned, year }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("[PokePrice] Runtime error:", chrome.runtime.lastError);
      return;
    }

    if (response && response.price) {
      createPriceTag(itemContainer, response.price, false);
    } else {
      console.log("[PokePrice] No price found for:", cleaned);
      if (response?.error) {
        console.warn("[PokePrice] Error details:", response.error);
        const priceTag = itemContainer.querySelector(".pokeprice-tag");
        if (priceTag) {
          priceTag.innerText = "PC: Error";
          priceTag.style.background = "rgba(255,100,100,0.92)";
          priceTag.title = response.error;
        }
      }
    }
  });
}

  




function extractItemPageCosts() {
  const costs = {
    price: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  };

  // Look for price on item page
  const priceSelectors = "span.ux-textspans";

/*   let priceElement = null;
  for (const selector of priceSelectors) {
    priceElement = document.querySelector(selector);
    // Reduced logging to prevent spam
    // console.log(`[PokePrice] Price selector "${selector}":`, !!priceElement);
    if (priceElement) {
      const priceText = priceElement.textContent.trim();
      console.log("PRICETEXT: ", priceText);
      console.log("parsefloat: ", parseFloat(priceText));
      if(parseFloat(priceText) != NaN){
        break;
      }
    }
  } */
  const elements = document.querySelectorAll(priceSelectors);
  let i = 0;
  
  while(i < elements.length){
    priceElement = elements[i];
    console.log("PRICEELEMENT: ", priceElement);
    priceText = priceElement.textContent.trim();
    priceMatch = priceText.match(/\d+\.\d{2}/);
    if(priceMatch != null){
      console.log("parsefloat: ", priceMatch[0]);
    }
    console.log('PRICEMATCH: ', priceMatch);
    if(priceMatch != null && !isNaN(parseFloat(priceMatch[0].replace(/,/g, ""))) && (priceElement.textContent.trim()).includes("US")){
      break;
    }
    i++;
  }

  if (priceElement) {
    const priceText = priceElement.textContent.trim();
    console.log("[PokePrice] Price element text:", priceText);
    const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
    const priceMatches = priceText.match(/\$([0-9,]+\.?[0-9]*)/g);
    if (priceMatches) {
      const prices = priceMatches.map(p => parseFloat(p.replace(/[^0-9.]/g, "")));
      costs.price = Math.max(...prices);
    }
  } else {
    console.log("[PokePrice] No price element found");
  }

  // Look for shipping on item page
  const shippingSelectors = [
    "span.ux-textspans.ux-textspans--POSITIVE.ux-textspans--BOLD",
    "[class*='shipping']",
    "[class*='delivery']",
    "[id*='shipping']",
    "[id*='delivery']",
  ];

  let shippingElement = null;
  let foundShippingText = "";

  for (const selector of shippingSelectors) {
    const elements = document.querySelectorAll(selector);
    // Reduced shipping selector logging to prevent spam
    // console.log(`[PokePrice] Shipping selector "${selector}": found ${elements.length} elements`);

    for (const element of elements) {
      const text = element.textContent.trim();
      // console.log(`[PokePrice] Checking element text: "${text}"`);

      if (
        text.toLowerCase().includes("delivery") ||
        text.match(/\+?\$[0-9,]+\.?[0-9]*/)
      ) {
        // console.log(`[PokePrice] Found shipping text: "${text}"`);
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
        // console.log("[PokePrice] Extracted shipping:", costs.shipping);
      }
    }

  } else {
    // console.log("[PokePrice] No shipping element found");
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

// Add global test function for debugging
window.testPokePrice = function (searchTerm = "Charizard PSA 10") {
  console.log("[PokePrice] Testing API with:", searchTerm);
  chrome.runtime.sendMessage({ testAPI: true }, (response) => {
    console.log("[PokePrice] Test result:", response);
  });
};

// Add function to test basic connectivity
window.testConnectivity = function () {
  console.log("[PokePrice] Testing basic connectivity...");
  chrome.runtime.sendMessage({ testConnectivity: true }, (response) => {
    console.log("[PokePrice] Connectivity test result:", response);
  });
};

// Add function to test raw API
window.testRawAPI = function () {
  console.log("[PokePrice] Testing raw API call...");
  chrome.runtime.sendMessage({ testRawAPI: true }, (response) => {
    console.log("[PokePrice] Raw API test result:", response);
  });
};

// Add function to test API key
window.testAPIKey = function () {
  console.log("[PokePrice] Testing API key validity...");
  chrome.runtime.sendMessage({ testAPIKey: true }, (response) => {
    console.log("[PokePrice] API key test result:", response);
  });
};

// Add function to test specific searches
window.searchPokePrice = function (searchTerm) {
  console.log("[PokePrice] Testing search for:", searchTerm);
  chrome.runtime.sendMessage({ title: searchTerm }, (response) => {
    console.log("[PokePrice] Search result:", response);
    if (response) {
      if (response.price) {
        console.log("[PokePrice] SUCCESS: Found price: $" + response.price);
        if (response.source) {
          console.log("[PokePrice] Source: " + response.source);
        }
      } else {
        console.log("[PokePrice] FAILURE: No price found");
        if (response.error) {
          console.log("[PokePrice] Error: " + response.error);
        }
      }
    }
  });
};

// Add function to test web scraping fallback
window.testScraping = function () {
  console.log("[PokePrice] Testing web scraping fallback...");
  chrome.runtime.sendMessage({ testScraping: true }, (response) => {
    console.log("[PokePrice] Scraping test result:", response);
  });
};

console.log(
  "[PokePrice] Test functions available: testConnectivity(), testRawAPI(), testPokePrice(), testAPIKey(), testSingleAPI(), searchPokePrice('card name'), testScraping(), testTitleExtraction('title'), testPokeSearch('search term')"
);
