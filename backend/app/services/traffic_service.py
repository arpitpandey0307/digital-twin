"""
Traffic Service — Fetches traffic data.
Falls back to realistic mock data when no API key is configured.
"""
import random
from datetime import datetime
from app.config import get_settings

settings = get_settings()

MAJOR_ROADS = [
    "Western Express Highway", "Eastern Express Highway", "LBS Marg",
    "SV Road", "Link Road", "JVLR", "Sion-Panvel Highway",
    "Ghodbunder Road", "Andheri-Kurla Road", "Jogeshwari-Vikhroli Link Road",
    "Bandra Worli Sea Link", "Peddar Road",
]

WARD_ROADS = {
    "Ward 1 - Colaba": ["Colaba Causeway", "Shahid Bhagat Singh Road"],
    "Ward 2 - Byculla": ["Dr. Ambedkar Road", "Bellasis Road"],
    "Ward 3 - Dadar": ["Senapati Bapat Marg", "LJ Road"],
    "Ward 4 - Kurla": ["LBS Marg", "CST Road"],
    "Ward 5 - Andheri": ["Western Express Highway", "SV Road", "Link Road"],
    "Ward 6 - Borivali": ["Western Express Highway", "Ghodbunder Road"],
    "Ward 7 - Mulund": ["Eastern Express Highway", "LBS Marg"],
    "Ward 8 - Chembur": ["Sion-Panvel Highway", "Eastern Express Highway"],
    "Ward 9 - Bandra": ["Bandra Worli Sea Link", "SV Road", "Link Road"],
    "Ward 10 - Goregaon": ["Western Express Highway", "SV Road"],
    "Ward 11 - Malad": ["Western Express Highway", "Link Road"],
    "Ward 12 - Kandivali": ["Western Express Highway", "SV Road"],
}


async def fetch_current_traffic() -> list[dict]:
    """Fetch current traffic for all wards. Uses mock data."""
    hour = datetime.now().hour
    is_rush = hour in [7, 8, 9, 10, 17, 18, 19, 20]

    results = []
    for ward, roads in WARD_ROADS.items():
        for road in roads:
            if is_rush:
                congestion_weights = [0.05, 0.2, 0.45, 0.3]
            else:
                congestion_weights = [0.4, 0.35, 0.2, 0.05]

            level = random.choices(
                ["free", "moderate", "heavy", "gridlock"],
                weights=congestion_weights,
                k=1,
            )[0]

            base_time = {"free": 300, "moderate": 600, "heavy": 1200, "gridlock": 2400}
            travel_time = base_time[level] + random.randint(-60, 120)

            results.append({
                "ward": ward,
                "road_name": road,
                "congestion_level": level,
                "travel_time_seconds": max(120, travel_time),
                "incidents_count": random.choices([0, 0, 0, 1, 2], k=1)[0],
                "recorded_at": datetime.utcnow().isoformat(),
                "source": "mock",
            })

    return results
