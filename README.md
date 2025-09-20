# PokePrice eBay Extension - Complete Setup

## 🎯 What This Extension Does

Your Chrome extension now overlays PSA 10 Pokemon card prices on eBay listings. It uses the PriceCharting API with a secure fallback to web scraping when the API is unavailable.

## 🔐 Security Features

- ✅ API key stored in `config.js` (excluded from Git)
- ✅ `.gitignore` prevents API key exposure
- ✅ No hardcoded credentials in tracked files

## 🚀 Quick Start

1. **Load the Extension:**

   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this folder: `/Users/judegilligan/Downloads/career/projects/pokeprice-ebay-extension`

2. **Test the Extension:**
   - Open `test.html` in Chrome for comprehensive testing
   - OR visit eBay and search for "Charizard PSA 10"
   - Look for yellow price overlay tags

## 🧪 Testing Functions

Open the browser console (F12) and use these commands:

```javascript
// Basic tests
testConnectivity(); // Test internet connection to PriceCharting
testAPIKey(); // Validate your API key
testScraping(); // Test web scraping fallback

// Search tests
searchPokePrice("Charizard PSA 10"); // Test specific card search
searchPokePrice("Pikachu"); // Test another card
```

## 🔧 How It Works

1. **API First:** Tries PriceCharting API for accurate prices
2. **Fallback Mode:** If API fails (HTTP 500 errors), uses web scraping
3. **Smart Extraction:** Cleans card titles and finds PSA 10 prices
4. **Visual Overlay:** Shows prices in yellow tags on eBay listings

## 📁 File Structure

```
pokeprice-ebay-extension/
├── manifest.json       # Extension configuration
├── background.js       # API calls and message handling
├── content.js         # eBay page integration
├── config.js          # Secure API key storage (not in Git)
├── test.html          # Testing interface
├── setup.sh           # Setup helper script
├── .gitignore         # Protects sensitive files
└── README.md          # This file
```

## ⚡ Key Features

### Robust Error Handling

- API failures automatically trigger scraping fallback
- Comprehensive logging for debugging
- Multiple test endpoints for diagnostics

### Smart Card Recognition

- Removes common terms (Pokemon, TCG, PSA grades)
- Handles various eBay title formats
- Focuses on PSA 10 graded card prices

### Security-First Design

- API key never committed to Git
- Secure configuration management
- No sensitive data in tracked files

## 🐛 Troubleshooting

### API Issues (Expected)

The PriceCharting API currently returns HTTP 500 errors. This is a known issue with their service, not your extension. The scraping fallback handles this automatically.

### No Prices Showing

1. Check browser console for errors
2. Run `testScraping()` to verify fallback works
3. Ensure you're on eBay Pokemon card listings
4. Try different search terms

### Extension Not Loading

1. Verify all files are present
2. Check `chrome://extensions/` for error messages
3. Reload the extension after changes
4. Run `./setup.sh` to verify configuration

## 🔄 Development Workflow

### Making Changes

1. Edit files in this directory
2. Go to `chrome://extensions/`
3. Click the reload button on your extension
4. Test changes on eBay or with `test.html`

### Testing

- Use the test functions in browser console
- Check `test.html` for comprehensive testing
- Monitor console logs for debugging info

### Git Safety

The `.gitignore` file protects your API key. Always verify `config.js` is not tracked before committing.

## 📊 Current Status

| Feature           | Status      | Notes                              |
| ----------------- | ----------- | ---------------------------------- |
| API Integration   | ⚠️ Issues   | HTTP 500 errors from PriceCharting |
| Scraping Fallback | ✅ Working  | Backup when API fails              |
| Security          | ✅ Complete | API key protected                  |
| eBay Integration  | ✅ Working  | Price overlays functional          |
| Testing Tools     | ✅ Complete | Comprehensive test suite           |

## 🎉 Success Metrics

Your extension is ready when:

- ✅ No console errors during loading
- ✅ `testScraping()` returns price data
- ✅ Yellow price tags appear on eBay Pokemon listings
- ✅ Console shows "[PokePrice] Service worker started"

## 🔮 Future Enhancements

- Enhanced scraping patterns for better price detection
- Support for other grading services (BGS, SGC)
- Price history tracking
- Multiple marketplace support

---

**Ready to test?** Run `./setup.sh` and load the extension in Chrome!
