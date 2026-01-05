# Flight Search: Prague to Beijing (Before CNY 2026)

Quick script to find cheap flights from Prague to Beijing before Chinese New Year.

## Setup (2 minutes)

1. **Get free API key:**
   - Go to https://serpapi.com/
   - Sign up (100 free searches/month)
   - Copy your API key

2. **Add API key:**
   - Open `flight_search.py`
   - Find line with `SERPAPI_KEY = ""`
   - Paste your key: `SERPAPI_KEY = "your_key_here"`

3. **Install dependencies:**
   ```bash
   pip3 install requests
   ```

4. **Run:**
   ```bash
   python3 flight_search.py
   ```

## What it searches

- **Dates:** Multiple dates in Jan-Feb 2026 (before CNY on Feb 17)
- **Airports:**
  - Prague (PRG) → Beijing Capital (PEK)
  - Prague (PRG) → Beijing Daxing (PKX)
  - Vienna (VIE) → Beijing (alternative origin)
  - Munich (MUC) → Beijing (alternative origin)

## Output

Shows cheapest flights for each date/route combination, sorted by price.

Example:
```
1. €487 | PRG→PEK | 2026-01-28 | Late January departure
2. €512 | VIE→PEK | 2026-01-28 | From Vienna
3. €535 | PRG→PKX | 2026-01-28 | Daxing Airport
```

## Tips

- Prices spike ~2 weeks before CNY
- Vienna/Munich are 4hrs from Prague by train (€20-50)
- Consider indirect routes (via Istanbul, Dubai, Doha)
- PKX (Daxing) sometimes has cheaper flights than PEK (Capital)

## Alternative: Manual Search

If you don't want to use the API, here are direct links:

- **Google Flights:** https://www.google.com/travel/flights
- **Skyscanner:** https://www.skyscanner.com/
- **Kiwi.com:** https://www.kiwi.com/ (good for multi-airline combos)

Search: PRG → PEK, dates around Jan 20-28, 2026
