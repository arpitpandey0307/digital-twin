"""
AQI Service — Fetches air quality data from AQICN API.
Falls back to realistic mock data when no API key is configured.
"""
import httpx
import random
from datetime import datetime
from app.config import get_settings

settings = get_settings()


async def fetch_current_aqi() -> dict:
    """Fetch current AQI. Uses AQICN if key available, else mock data."""
    if settings.aqicn_api_key:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.waqi.info/feed/geo:{settings.city_lat};{settings.city_lng}/",
                    params={"token": settings.aqicn_api_key},
                    timeout=10,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == "ok":
                        d = data["data"]
                        iaqi = d.get("iaqi", {})
                        return {
                            "aqi": d.get("aqi", 0),
                            "pm25": iaqi.get("pm25", {}).get("v", 0),
                            "pm10": iaqi.get("pm10", {}).get("v", 0),
                            "no2": iaqi.get("no2", {}).get("v", 0),
                            "so2": iaqi.get("so2", {}).get("v", 0),
                            "co": iaqi.get("co", {}).get("v", 0),
                            "recorded_at": datetime.utcnow().isoformat(),
                            "source": "aqicn",
                        }
        except Exception as e:
            print(f"AQI API error: {e}")

    # Mock data — realistic for Mumbai
    hour = datetime.now().hour
    # AQI tends to be worse during rush hours
    base_aqi = 80 + (30 if hour in [8, 9, 17, 18, 19] else 0) + random.randint(-20, 40)
    pm25 = base_aqi * random.uniform(0.4, 0.7)
    pm10 = base_aqi * random.uniform(0.6, 1.1)

    return {
        "aqi": min(500, max(10, base_aqi)),
        "pm25": round(pm25, 1),
        "pm10": round(pm10, 1),
        "no2": round(random.uniform(10, 60), 1),
        "so2": round(random.uniform(5, 30), 1),
        "co": round(random.uniform(0.5, 3.0), 1),
        "recorded_at": datetime.utcnow().isoformat(),
        "source": "mock",
    }


def generate_ward_aqi(base_aqi: dict, ward_name: str) -> dict:
    """Generate slightly varied AQI for each ward."""
    variation = random.uniform(0.7, 1.3)
    return {
        **base_aqi,
        "ward": ward_name,
        "aqi": min(500, max(10, int(base_aqi["aqi"] * variation))),
        "pm25": round(base_aqi["pm25"] * variation, 1),
        "pm10": round(base_aqi["pm10"] * variation, 1),
    }
