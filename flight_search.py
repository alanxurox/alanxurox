#!/usr/bin/env python3
"""
Flight Search: Prague to Beijing (Before CNY 2026)

Chinese New Year 2026: February 17, 2026
This script searches for flights before CNY from Prague to Beijing.

SETUP:
1. Get free SerpAPI key: https://serpapi.com/ (100 searches/month free)
2. Add your API key below
3. Run: python3 flight_search.py
"""

import requests
import json
from datetime import datetime, timedelta

# ============================================
# PASTE YOUR SERPAPI KEY HERE:
SERPAPI_KEY = ""  # <-- Your key here
# ============================================

# Flight parameters
ORIGIN = "PRG"  # Prague
CNY_DATE = "2026-02-17"  # Chinese New Year 2026

# Search configurations
SEARCH_CONFIGS = [
    # One-way flights (cheaper, more flexible)
    {
        "name": "Early January departure",
        "origin": "PRG",
        "destination": "PEK",
        "outbound": "2026-01-15",
        "return": None
    },
    {
        "name": "Late January departure",
        "origin": "PRG",
        "destination": "PEK",
        "outbound": "2026-01-28",
        "return": None
    },
    {
        "name": "Early February departure",
        "origin": "PRG",
        "destination": "PEK",
        "outbound": "2026-02-05",
        "return": None
    },
    {
        "name": "Week before CNY",
        "origin": "PRG",
        "destination": "PEK",
        "outbound": "2026-02-10",
        "return": None
    },
    # Alternative airport: Beijing Daxing
    {
        "name": "Daxing Airport - Late Jan",
        "origin": "PRG",
        "destination": "PKX",
        "outbound": "2026-01-28",
        "return": None
    },
    # Alternative origins (nearby major airports)
    {
        "name": "From Vienna",
        "origin": "VIE",
        "destination": "PEK",
        "outbound": "2026-01-28",
        "return": None
    },
    {
        "name": "From Munich",
        "origin": "MUC",
        "destination": "PEK",
        "outbound": "2026-01-28",
        "return": None
    },
]


def search_flights(origin, destination, outbound_date, return_date=None):
    """Search Google Flights via SerpAPI"""

    if not SERPAPI_KEY:
        print("❌ Please add your SerpAPI key at the top of this file!")
        print("   Get one free at: https://serpapi.com/")
        return None

    params = {
        "engine": "google_flights",
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": outbound_date,
        "currency": "EUR",
        "hl": "en",
        "api_key": SERPAPI_KEY
    }

    if return_date:
        params["return_date"] = return_date
        params["type"] = "1"  # Round trip
    else:
        params["type"] = "2"  # One way

    try:
        response = requests.get("https://serpapi.com/search", params=params, timeout=30)
        data = response.json()

        if "error" in data:
            print(f"   ❌ API Error: {data['error']}")
            return None

        return data
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return None


def get_cheapest_price(data):
    """Extract cheapest price from results"""
    if not data:
        return None

    prices = []

    for flight_list in [data.get("best_flights", []), data.get("other_flights", [])]:
        for flight in flight_list:
            if "price" in flight:
                prices.append(flight["price"])

    return min(prices) if prices else None


def display_flight_summary(data, max_results=3):
    """Show top flight options"""
    if not data:
        return

    best = data.get("best_flights", [])

    if not best:
        print("   No flights found")
        return

    for i, flight in enumerate(best[:max_results], 1):
        price = flight.get("price", "N/A")
        duration = flight.get("total_duration", "N/A")
        stops = len(flight.get("flights", [])) - 1

        # Get airline info
        legs = flight.get("flights", [])
        airlines = list(set([leg.get("airline", "Unknown") for leg in legs]))

        # Departure/arrival times
        if legs:
            dep_time = legs[0].get("departure_airport", {}).get("time", "")
            arr_time = legs[-1].get("arrival_airport", {}).get("time", "")

        print(f"   {i}. €{price} | {duration} min | {stops} stop(s) | {', '.join(airlines)}")
        if i == 1:  # Show details for cheapest
            print(f"      Depart: {dep_time} → Arrive: {arr_time}")


def main():
    print("=" * 70)
    print("✈️  PRAGUE → BEIJING FLIGHT SEARCH (Before CNY 2026)")
    print("=" * 70)
    print(f"Chinese New Year: {CNY_DATE}")
    print(f"Searching one-way flights departing before CNY...")
    print()

    if not SERPAPI_KEY:
        print("⚠️  NO API KEY DETECTED")
        print()
        print("To use this script:")
        print("1. Sign up at https://serpapi.com/ (free tier: 100 searches/month)")
        print("2. Copy your API key")
        print("3. Paste it at the top of this file where it says SERPAPI_KEY = \"\"")
        print()
        return

    results_summary = []

    for config in SEARCH_CONFIGS:
        print(f"🔍 {config['name']}")
        print(f"   {config['origin']} → {config['destination']} on {config['outbound']}")

        data = search_flights(
            config['origin'],
            config['destination'],
            config['outbound'],
            config.get('return')
        )

        if data:
            cheapest = get_cheapest_price(data)
            if cheapest:
                results_summary.append({
                    'name': config['name'],
                    'route': f"{config['origin']}→{config['destination']}",
                    'date': config['outbound'],
                    'price': cheapest
                })
                print(f"   💰 Cheapest: €{cheapest}")
                display_flight_summary(data, max_results=2)
            else:
                print("   No prices found")

        print()

    # Final summary
    if results_summary:
        print("=" * 70)
        print("📊 SUMMARY - All Routes Sorted by Price")
        print("=" * 70)

        sorted_results = sorted(results_summary, key=lambda x: x['price'])

        for i, result in enumerate(sorted_results, 1):
            print(f"{i}. €{result['price']:>6} | {result['route']} | {result['date']} | {result['name']}")

        print()
        print(f"✅ Best deal: €{sorted_results[0]['price']} - {sorted_results[0]['name']}")

    print()
    print("=" * 70)
    print("💡 TIPS:")
    print("   • Prague to Vienna/Munich is ~4hrs by train (~€20-50)")
    print("   • Check both PEK (Capital) and PKX (Daxing) airports")
    print("   • Prices typically spike 2 weeks before CNY")
    print("   • Consider indirect routes (via Middle East/Istanbul)")
    print("=" * 70)


if __name__ == "__main__":
    main()
