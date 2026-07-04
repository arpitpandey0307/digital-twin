"""
Weather Service — Fetches weather data from OpenWeatherMap API.
Falls back to realistic mock data when no API key is configured.
"""
import httpx
import random
from datetime import datetime
from app.config import get_settings

settings = get_settings()

WEATHER_CONDITIONS = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Moderate Rain", "Heavy Rain", "Thunderstorm", "Haze", "Fog"]


async def fetch_current_weather() -> dict:
    """Fetch current weather. Uses OpenWeatherMap if key available, else mock data."""
    if settings.openweather_api_key:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={
                        "lat": settings.city_lat,
                        "lon": settings.city_lng,
                        "appid": settings.openweather_api_key,
                        "units": "metric",
                    },
                    timeout=10,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "temperature": data["main"]["temp"],
                        "humidity": data["main"]["humidity"],
                        "rainfall_mm": data.get("rain", {}).get("1h", 0.0),
                        "wind_speed": data["wind"]["speed"],
                        "condition": data["weather"][0]["main"],
                        "recorded_at": datetime.utcnow().isoformat(),
                        "source": "openweathermap",
                    }
        except Exception as e:
            print(f"Weather API error: {e}")

    # Mock data — realistic for Mumbai
    hour = datetime.now().hour
    base_temp = 28 + random.uniform(-3, 5)
    # Monsoon season simulation (higher rainfall)
    is_monsoon = datetime.now().month in [6, 7, 8, 9]
    rainfall = random.uniform(0, 80) if is_monsoon else random.uniform(0, 10)
    condition_weights = [0.1, 0.15, 0.15, 0.2, 0.15, 0.1, 0.05, 0.05, 0.05] if is_monsoon else [0.3, 0.25, 0.15, 0.1, 0.05, 0.02, 0.01, 0.07, 0.05]
    condition = random.choices(WEATHER_CONDITIONS, weights=condition_weights, k=1)[0]

    return {
        "temperature": round(base_temp, 1),
        "humidity": round(random.uniform(60, 95) if is_monsoon else random.uniform(40, 75), 1),
        "rainfall_mm": round(rainfall, 1),
        "wind_speed": round(random.uniform(2, 25), 1),
        "condition": condition,
        "recorded_at": datetime.utcnow().isoformat(),
        "source": "mock",
    }


def generate_ward_weather(base_weather: dict, ward_name: str) -> dict:
    """Generate slightly varied weather for each ward based on city-wide data."""
    return {
        **base_weather,
        "ward": ward_name,
        "temperature": round(base_weather["temperature"] + random.uniform(-1.5, 1.5), 1),
        "humidity": round(min(100, max(0, base_weather["humidity"] + random.uniform(-5, 5))), 1),
        "rainfall_mm": round(max(0, base_weather["rainfall_mm"] + random.uniform(-10, 15)), 1),
    }
