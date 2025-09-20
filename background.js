// Import configuration
try {
  importScripts("config.js");
} catch (e) {
  console.error("[PokePrice] Failed to load config.js:", e);
  // Fallback configuration (for debugging only)
  self.CONFIG = {
    PRICECHARTING_API_KEY: "2a86825b2862d29ded350032342e5658a15d7044",
  };
}

// Verify config is loaded
console.log("[PokePrice] Service worker started");
console.log("[PokePrice] Config loaded:", !!CONFIG);
console.log("[PokePrice] API key present:", !!CONFIG?.PRICECHARTING_API_KEY);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.testPing) {
    sendResponse({ pong: true });
    return;
  }

  if (request.testAPI) {
    console.log("[PokePrice] Testing API call...");
    (async () => {
      try {
        // First test with a simple, known product ID
        console.log("[PokePrice] Testing with simple query...");
        const price = await fetchPriceFromPriceChartingAPI("charizard");
        console.log("[PokePrice] Test API result:", price);
        sendResponse({ testPrice: price, success: true });
      } catch (error) {
        console.error("[PokePrice] Test API Error:", error);
        sendResponse({ testPrice: null, success: false, error: error.message });
      }
    })();
    return true;
  }

  if (request.testAPIKey) {
    console.log("[PokePrice] Testing API key validity...");
    (async () => {
      try {
        // Test with a very simple query to check if API key works
        const testUrl = `https://www.pricecharting.com/api/products?t=${CONFIG.PRICECHARTING_API_KEY}&q=mario`;
        console.log(
          "[PokePrice] Testing API key with URL (masked):",
          testUrl.replace(CONFIG.PRICECHARTING_API_KEY, "***KEY***")
        );

        const response = await fetch(testUrl, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
          },
        });

        console.log(
          "[PokePrice] API key test response status:",
          response.status
        );
        console.log(
          "[PokePrice] API key test response headers:",
          Object.fromEntries(response.headers.entries())
        );

        const responseText = await response.text();
        console.log(
          "[PokePrice] API key test response body:",
          responseText.substring(0, 500)
        );

        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            console.log("[PokePrice] API key test successful:", data);
            sendResponse({ success: true, status: data.status, data: data });
          } catch (parseError) {
            console.error(
              "[PokePrice] API key test - JSON parse error:",
              parseError
            );
            sendResponse({
              success: false,
              error: "Invalid JSON response",
              body: responseText,
            });
          }
        } else {
          console.error(
            "[PokePrice] API key test failed:",
            response.status,
            responseText
          );
          sendResponse({
            success: false,
            status: response.status,
            error: responseText,
          });
        }
      } catch (error) {
        console.error("[PokePrice] API key test error:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (request.testConnectivity) {
    console.log("[PokePrice] Testing basic connectivity to PriceCharting...");
    (async () => {
      try {
        // Test basic connectivity without API key
        const testUrl = "https://www.pricecharting.com/";
        console.log("[PokePrice] Testing basic connectivity to:", testUrl);

        const response = await fetch(testUrl, {
          method: "HEAD", // Just check if we can reach the site
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        console.log("[PokePrice] Connectivity test status:", response.status);
        sendResponse({
          success: response.ok,
          status: response.status,
          message: response.ok
            ? "Can reach PriceCharting"
            : "Cannot reach PriceCharting",
        });
      } catch (error) {
        console.error("[PokePrice] Connectivity test error:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (request.testRawAPI) {
    console.log("[PokePrice] Testing raw API call...");
    (async () => {
      try {
        // Test with minimal setup - just like the documentation example
        const apiKey = CONFIG.PRICECHARTING_API_KEY;
        console.log(
          "[PokePrice] Using API key (masked):",
          apiKey.substring(0, 4) + "..." + apiKey.substring(36)
        );

        // Try the exact format from the documentation
        const testUrl = `https://www.pricecharting.com/api/product?t=${apiKey}&id=6910`;
        console.log(
          "[PokePrice] Raw API test URL:",
          testUrl.replace(apiKey, "***KEY***")
        );

        // Simplified fetch with minimal headers
        const response = await fetch(testUrl);

        console.log("[PokePrice] Raw API response status:", response.status);
        console.log("[PokePrice] Raw API response headers:", [
          ...response.headers.entries(),
        ]);

        const text = await response.text();
        console.log("[PokePrice] Raw API response text:", text);

        if (response.ok) {
          try {
            const data = JSON.parse(text);
            sendResponse({ success: true, data: data });
          } catch (e) {
            sendResponse({ success: false, error: "Parse error", text: text });
          }
        } else {
          sendResponse({
            success: false,
            status: response.status,
            error: text,
          });
        }
      } catch (error) {
        console.error("[PokePrice] Raw API test error:", error);
        sendResponse({
          success: false,
          error: error.message,
          stack: error.stack,
        });
      }
    })();
    return true;
  }

  if (request.testSingleAPI) {
    console.log("[PokePrice] Testing single product API...");
    (async () => {
      try {
        // Test the single product API with a known ID (EarthBound as per documentation)
        const testUrl = `https://www.pricecharting.com/api/product?t=${CONFIG.PRICECHARTING_API_KEY}&id=6910`;
        console.log(
          "[PokePrice] Testing single API with URL (masked):",
          testUrl.replace(CONFIG.PRICECHARTING_API_KEY, "***KEY***")
        );

        const response = await fetch(testUrl, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
          },
        });

        console.log(
          "[PokePrice] Single API test response status:",
          response.status
        );

        const responseText = await response.text();
        console.log("[PokePrice] Single API test response body:", responseText);

        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            console.log("[PokePrice] Single API test successful:", data);
            sendResponse({ success: true, data: data });
          } catch (parseError) {
            console.error(
              "[PokePrice] Single API test - JSON parse error:",
              parseError
            );
            sendResponse({
              success: false,
              error: "Invalid JSON response",
              body: responseText,
            });
          }
        } else {
          sendResponse({
            success: false,
            status: response.status,
            error: responseText,
          });
        }
      } catch (error) {
        console.error("[PokePrice] Single API test error:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (request.testScraping) {
    console.log("[PokePrice] Testing web scraping fallback...");
    (async () => {
      try {
        const price = await fetchPriceFromScrapingFallback("Charizard PSA 10");
        console.log("[PokePrice] Scraping test result:", price);
        sendResponse({ testPrice: price, success: true });
      } catch (error) {
        console.error("[PokePrice] Scraping test error:", error);
        sendResponse({ testPrice: null, success: false, error: error.message });
      }
    })();
    return true;
  }

  const { title, year, originalTitle } = request;

  if (!title) {
    sendResponse({ price: null, error: "No title provided" });
    return;
  }

  console.log("[PokePrice] Processing request for:", title);

  (async () => {
    try {
      // Try API first, fall back to scraping if it fails
      let price = null;
      let errorMessage = null;

      try {
        price = await fetchPriceFromPriceChartingAPI(title);
        if (price) {
          console.log("[PokePrice] Successfully got price from API:", price);
        } else {
          console.log("[PokePrice] API returned no results for:", title);
        }
      } catch (apiError) {
        console.warn(
          "[PokePrice] API failed, trying scraping fallback:",
          apiError.message
        );
        errorMessage = `API Error: ${apiError.message}`;

        try {
          price = await fetchPriceFromScrapingFallback(title);
          if (price) {
            console.log(
              "[PokePrice] Successfully got price from scraping:",
              price
            );
            errorMessage = null; // Clear error if scraping succeeded
          } else {
            console.log("[PokePrice] Scraping returned no results for:", title);
          }
        } catch (scrapingError) {
          console.error(
            "[PokePrice] Scraping also failed:",
            scrapingError.message
          );
          errorMessage = `Both API and scraping failed. API: ${apiError.message}, Scraping: ${scrapingError.message}`;
        }
      }

      sendResponse({
        price,
        error: errorMessage,
        source: price ? (errorMessage ? "scraping" : "api") : null,
      });
    } catch (error) {
      console.error("[PokePrice] Unexpected error:", error);
      sendResponse({
        price: null,
        error: `Unexpected error: ${error.message}`,
      });
    }
  })();

  return true;
});

async function fetchPriceFromPriceChartingAPI(title, retryCount = 0) {
  const maxRetries = 2;

  // Validate API key
  if (!CONFIG?.PRICECHARTING_API_KEY) {
    throw new Error("API key not found in config");
  }

  if (CONFIG.PRICECHARTING_API_KEY.length !== 40) {
    console.warn(
      "[PokePrice] API key length seems incorrect. Expected 40 characters, got:",
      CONFIG.PRICECHARTING_API_KEY.length
    );
  }

  const query = encodeURIComponent(title);

  // Use the correct PriceCharting API endpoint
  let url = `https://www.pricecharting.com/api/products?t=${CONFIG.PRICECHARTING_API_KEY}&q=${query}`;

  console.log(
    "[PokePrice] API Request URL (key masked):",
    url.replace(CONFIG.PRICECHARTING_API_KEY, "***KEY***")
  );
  console.log("[PokePrice] Searching for:", title);

  // Special debugging for Charizard cards
  if (title.toLowerCase().includes("charizard")) {
    console.log("[PokePrice] *** CHARIZARD DEBUGGING ENABLED ***");
    console.log(
      "[PokePrice] This is a Charizard search - expect $113.75 for Paldean Fates PSA 10"
    );
  }

  if (retryCount > 0) {
    console.log("[PokePrice] Retry attempt:", retryCount);
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log("[PokePrice] Response status:", response.status);

    if (!response.ok) {
      // Get the response body for error details
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error("[PokePrice] Error response body:", errorBody);

        // Check for specific timeout errors
        if (
          errorBody.includes("DeadlineExceeded") ||
          errorBody.includes("context deadline exceeded")
        ) {
          console.warn("[PokePrice] API timeout detected");

          // Retry on timeout if we haven't exceeded max retries
          if (retryCount < maxRetries) {
            console.log("[PokePrice] Retrying after timeout...");
            await new Promise((resolve) =>
              setTimeout(resolve, 2000 * (retryCount + 1))
            ); // Progressive delay
            return await fetchPriceFromPriceChartingAPI(title, retryCount + 1);
          }
        }
      } catch (e) {
        console.error("[PokePrice] Could not read error response body:", e);
      }

      throw new Error(
        `HTTP ${response.status}: ${
          response.statusText
        }. Body: ${errorBody.substring(0, 200)}`
      );
    }

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error("[PokePrice] JSON parse error:", parseError);
      console.log("[PokePrice] Full response text:", rawText);
      throw new Error("Invalid JSON response from API");
    }

    console.log("[PokePrice] Parsed API Response:", data);

    // Check API status first
    if (data.status !== "success") {
      console.error("[PokePrice] API returned error status:", data.status);

      // Check for specific error conditions that might warrant retry
      if (
        data.status === "error" &&
        data.error &&
        data.error.includes("DeadlineExceeded")
      ) {
        if (retryCount < maxRetries) {
          console.log("[PokePrice] Retrying due to server timeout...");
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * (retryCount + 1))
          );
          return await fetchPriceFromPriceChartingAPI(title, retryCount + 1);
        }
      }

      return null;
    }

    // Look for PSA 10 graded cards in the results
    if (
      data &&
      data.products &&
      Array.isArray(data.products) &&
      data.products.length > 0
    ) {
      console.log("[PokePrice] Found", data.products.length, "products");

      // Log all products for debugging with correct field names - enhanced for Charizard debugging
      console.log("[PokePrice] ===== API RESULTS DEBUG =====");
      console.log(
        "[PokePrice] Found",
        data.products.length,
        "products for search:",
        title
      );

      data.products.forEach((product, index) => {
        // Log more products for Charizard debugging
        if (index < 5) {
          console.log(`[PokePrice] Product ${index}:`, {
            name: product["product-name"] || "NO_NAME",
            console: product["console-name"] || "NO_CONSOLE",
            id: product.id,
            psa10: (product["manual-only-price"] || 0) / 100,
            bgs10: (product["bgs-10-price"] || 0) / 100,
            graded9: (product["graded-price"] || 0) / 100,
            graded8: (product["new-price"] || 0) / 100,
            ungraded: (product["loose-price"] || 0) / 100,
            topPrice:
              Math.max(
                product["manual-only-price"] || 0, // PSA 10
                product["bgs-10-price"] || 0, // BGS 10
                product["graded-price"] || 0, // Graded 9
                product["new-price"] || 0, // Graded 8
                product["loose-price"] || 0 // Ungraded
              ) / 100, // Convert to dollars
          });
        }
      });
      console.log("[PokePrice] ========================");

      // First, try to find exact PSA 10 matches with correct field names
      let psa10Product = data.products.find((product) => {
        const name = product["product-name"] || "";
        const lowerName = name.toLowerCase();
        return (
          lowerName.includes("psa 10") ||
          lowerName.includes("psa grade 10") ||
          lowerName.includes("psa-10")
        );
      });

      console.log(
        "[PokePrice] PSA 10 exact match:",
        psa10Product?.["product-name"] || "None"
      );

      // If no exact PSA 10 match, look for products that contain key terms from our search
      if (!psa10Product && title.toLowerCase().includes("charizard")) {
        console.log("[PokePrice] Searching for Charizard-specific matches...");

        // Look for products that match Charizard and Paldean Fates
        psa10Product = data.products.find((product) => {
          const name = product["product-name"] || "";
          const lowerName = name.toLowerCase();
          return (
            lowerName.includes("charizard") && lowerName.includes("paldean")
          );
        });

        console.log(
          "[PokePrice] Charizard Paldean match:",
          psa10Product?.["product-name"] || "None"
        );

        // If still no match, just look for Charizard
        if (!psa10Product) {
          psa10Product = data.products.find((product) => {
            const name = product["product-name"] || "";
            const lowerName = name.toLowerCase();
            return lowerName.includes("charizard");
          });

          console.log(
            "[PokePrice] General Charizard match:",
            psa10Product?.["product-name"] || "None"
          );
        }
      }

      // If no exact PSA 10 match, look for graded cards
      if (!psa10Product) {
        psa10Product = data.products.find((product) => {
          const name = product["product-name"] || "";
          return (
            name.toLowerCase().includes("psa") ||
            name.toLowerCase().includes("graded")
          );
        });
        console.log(
          "[PokePrice] Graded match:",
          psa10Product?.["product-name"] || "None"
        );
      }

      // If still no match, use the first result
      if (!psa10Product) {
        psa10Product = data.products[0];
        console.log(
          "[PokePrice] Using first result:",
          psa10Product?.["product-name"] || "None"
        );
      }

      // Return the highest available price with correct field names and priority
      if (psa10Product) {
        // ALWAYS prioritize PSA 10 price if available (extension default behavior)
        if (
          psa10Product["manual-only-price"] &&
          psa10Product["manual-only-price"] > 0
        ) {
          const psa10Price = (psa10Product["manual-only-price"] / 100).toFixed(
            2
          );
          console.log(
            "[PokePrice] Found PSA 10 price (extension default):",
            psa10Price
          );
          console.log(
            "[PokePrice] Selected product:",
            psa10Product["product-name"]
          );
          return psa10Price;
        }

        // If no PSA 10 price available, fall back to other high-grade prices
        const fallbackPrices = [
          psa10Product["bgs-10-price"], // BGS 10
          psa10Product["condition-17-price"], // CGC 10
          psa10Product["condition-18-price"], // SGC 10
          psa10Product["graded-price"], // Graded 9
          psa10Product["new-price"], // Graded 8-8.5
          psa10Product["cib-price"], // Graded 7-7.5
          psa10Product["loose-price"], // Ungraded
        ].filter((price) => price && price > 0);

        console.log("[PokePrice] All available prices (in cents):", {
          psa10: psa10Product["manual-only-price"],
          bgs10: psa10Product["bgs-10-price"],
          cgc10: psa10Product["condition-17-price"],
          sgc10: psa10Product["condition-18-price"],
          graded9: psa10Product["graded-price"],
          graded8: psa10Product["new-price"],
          graded7: psa10Product["cib-price"],
          ungraded: psa10Product["loose-price"],
        });

        console.log("[PokePrice] All available prices (in dollars):", {
          psa10: psa10Product["manual-only-price"]
            ? (psa10Product["manual-only-price"] / 100).toFixed(2)
            : null,
          bgs10: psa10Product["bgs-10-price"]
            ? (psa10Product["bgs-10-price"] / 100).toFixed(2)
            : null,
          cgc10: psa10Product["condition-17-price"]
            ? (psa10Product["condition-17-price"] / 100).toFixed(2)
            : null,
          sgc10: psa10Product["condition-18-price"]
            ? (psa10Product["condition-18-price"] / 100).toFixed(2)
            : null,
          graded9: psa10Product["graded-price"]
            ? (psa10Product["graded-price"] / 100).toFixed(2)
            : null,
          graded8: psa10Product["new-price"]
            ? (psa10Product["new-price"] / 100).toFixed(2)
            : null,
          graded7: psa10Product["cib-price"]
            ? (psa10Product["cib-price"] / 100).toFixed(2)
            : null,
          ungraded: psa10Product["loose-price"]
            ? (psa10Product["loose-price"] / 100).toFixed(2)
            : null,
        });

        if (fallbackPrices.length > 0) {
          // Use the highest available fallback price
          const maxPriceCents = Math.max(...fallbackPrices);
          const maxPrice = (maxPriceCents / 100).toFixed(2);

          // Log which fallback price field was selected
          const fallbackPriceFields = [
            "bgs10",
            "cgc10",
            "sgc10",
            "graded9",
            "graded8",
            "graded7",
            "ungraded",
          ];
          const selectedPriceField = fallbackPrices.indexOf(maxPriceCents);
          console.log(
            "[PokePrice] No PSA 10 price available, using fallback field:",
            fallbackPriceFields[selectedPriceField]
          );
          console.log("[PokePrice] Returning fallback price:", maxPrice);
          return maxPrice;
        } else {
          console.log(
            "[PokePrice] No valid prices found for product (including fallbacks)"
          );
        }
      }
    } else {
      console.log("[PokePrice] No products found in API response");
      console.log("[PokePrice] Response structure check:");
      console.log("  - data exists:", !!data);
      console.log("  - data.products exists:", !!data?.products);
      console.log("  - data.products is array:", Array.isArray(data?.products));
      console.log("  - data.products length:", data?.products?.length || 0);

      // Check if there's an error message in the response
      if (data && data.error) {
        console.error("[PokePrice] API Error:", data.error);
        throw new Error(`API Error: ${data.error}`);
      }
    }

    return null;
  } catch (error) {
    console.error("[PokePrice] API fetch error:", error);
    throw error;
  }
}

// Web scraping fallback function
async function fetchPriceFromScrapingFallback(title, retryCount = 0) {
  const maxRetries = 2;

  console.log("[PokePrice] Attempting fallback scraping for:", title);
  if (retryCount > 0) {
    console.log("[PokePrice] Scraping retry attempt:", retryCount);
  }

  try {
    // Clean up the title for search
    const cleanTitle = title
      .replace(/pokemon|pokémon/gi, "")
      .replace(/tcg|trading card game/gi, "")
      .replace(/psa\s*\d+/gi, "")
      .replace(/mint|nm|near mint/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // Search for the card on PriceCharting via scraping
    const searchUrl = `https://www.pricecharting.com/search?q=${encodeURIComponent(
      cleanTitle
    )}&type=prices`;
    console.log("[PokePrice] Scraping search URL:", searchUrl);

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      // Add timeout for scraping
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log("[PokePrice] Scraping response status:", response.status);

    if (!response.ok) {
      // Check for specific 404 or server errors that might warrant retry
      if (response.status >= 500 && retryCount < maxRetries) {
        console.log("[PokePrice] Server error, retrying scraping...");
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 * (retryCount + 1))
        );
        return await fetchPriceFromScrapingFallback(title, retryCount + 1);
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log("[PokePrice] Scraping response length:", html.length);

    // Look for PSA 10 graded prices in the HTML
    // This is a simple pattern match - could be enhanced
    const psa10Matches = html.match(
      /PSA\s*10[^$]*\$([0-9,]+(?:\.[0-9]{2})?)/gi
    );

    if (psa10Matches && psa10Matches.length > 0) {
      // Extract the first price found
      const priceMatch = psa10Matches[0].match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ""));
        console.log("[PokePrice] Scraped PSA 10 price:", price);
        return price;
      }
    }

    // If no PSA 10 found, look for general high-grade prices
    const priceMatches = html.match(/\$([0-9,]+(?:\.[0-9]{2})?)/g);
    if (priceMatches && priceMatches.length > 0) {
      // Return the highest price found (rough estimate)
      const prices = priceMatches
        .map((p) => parseFloat(p.replace(/[\$,]/g, "")))
        .filter((p) => p > 0 && p < 10000) // Filter reasonable prices
        .sort((a, b) => b - a);

      if (prices.length > 0) {
        console.log("[PokePrice] Scraped estimated price:", prices[0]);
        return prices[0];
      }
    }

    console.log("[PokePrice] No prices found in scraped content");
    return null;
  } catch (error) {
    console.error("[PokePrice] Scraping fallback error:", error);

    // Retry on network errors if we haven't exceeded max retries
    if (
      (error.name === "AbortError" ||
        error.message.includes("timeout") ||
        error.message.includes("network")) &&
      retryCount < maxRetries
    ) {
      console.log("[PokePrice] Retrying scraping due to network error...");
      await new Promise((resolve) =>
        setTimeout(resolve, 3000 * (retryCount + 1))
      );
      return await fetchPriceFromScrapingFallback(title, retryCount + 1);
    }

    throw new Error(`Scraping failed: ${error.message}`);
  }
}
