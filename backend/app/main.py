"""
City Digital Twin — Main FastAPI Application
AI-powered Decision Intelligence Platform
"""
import json
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.database import init_db, SessionLocal
from app.config import get_settings
from app.models import *
from app.models.ward import WardProfile
from app.models.infrastructure import Infrastructure
from app.models.weather import WeatherData
from app.models.aqi import AQIData
from app.models.traffic import TrafficData

from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.complaints import router as complaints_router
from app.routers.chat import router as chat_router
from app.routers.simulation import router as simulation_router
from app.routers.data import (
    weather_router, aqi_router, traffic_router,
    predictions_router, alerts_router, map_router,
    reports_router,
)

from app.services.weather_service import fetch_current_weather, generate_ward_weather
from app.services.aqi_service import fetch_current_aqi, generate_ward_aqi
from app.services.traffic_service import fetch_current_traffic
from app.engine.decision_engine import run_decision_cycle

settings = get_settings()

# --- Data seeding ---
def seed_database():
    """Seed the database with ward profiles and infrastructure data."""
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(WardProfile).count() > 0:
            print("[OK] Database already seeded")
            return

        # Seed wards
        import os
        data_dir = os.path.join(os.path.dirname(__file__), "data")

        with open(os.path.join(data_dir, "wards.json"), "r") as f:
            wards = json.load(f)
            for w in wards:
                db.add(WardProfile(**w))
            print(f"[SEED] Seeded {len(wards)} wards")

        with open(os.path.join(data_dir, "infrastructure.json"), "r") as f:
            infra = json.load(f)
            for i in infra:
                db.add(Infrastructure(**i))
            print(f"[SEED] Seeded {len(infra)} infrastructure points")

        db.commit()
        print("[OK] Database seeding complete")
    except Exception as e:
        print(f"[ERROR] Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


# --- Periodic data fetch ---
async def periodic_data_fetch():
    """Background task that fetches data from APIs every 15 minutes."""
    while True:
        try:
            db = SessionLocal()
            print(f"[FETCH] [{datetime.now().strftime('%H:%M:%S')}] Running periodic data fetch...")

            # Fetch weather
            base_weather = await fetch_current_weather()
            wards = db.query(WardProfile).all()
            ward_names = [w.ward_name for w in wards]

            for ward_name in ward_names:
                ward_weather = generate_ward_weather(base_weather, ward_name)
                db.add(WeatherData(
                    ward=ward_name,
                    temperature=ward_weather["temperature"],
                    humidity=ward_weather["humidity"],
                    rainfall_mm=ward_weather["rainfall_mm"],
                    wind_speed=ward_weather.get("wind_speed"),
                    condition=ward_weather.get("condition"),
                    source=ward_weather.get("source", "mock"),
                ))

            # Fetch AQI
            base_aqi = await fetch_current_aqi()
            for ward_name in ward_names:
                ward_aqi = generate_ward_aqi(base_aqi, ward_name)
                db.add(AQIData(
                    ward=ward_name,
                    aqi=ward_aqi["aqi"],
                    pm25=ward_aqi.get("pm25"),
                    pm10=ward_aqi.get("pm10"),
                    no2=ward_aqi.get("no2"),
                    so2=ward_aqi.get("so2"),
                    co=ward_aqi.get("co"),
                    source=ward_aqi.get("source", "mock"),
                ))

            # Fetch traffic
            traffic_data = await fetch_current_traffic()
            for td in traffic_data:
                db.add(TrafficData(
                    ward=td["ward"],
                    road_name=td["road_name"],
                    congestion_level=td["congestion_level"],
                    travel_time_seconds=td["travel_time_seconds"],
                    incidents_count=td["incidents_count"],
                    source=td.get("source", "mock"),
                ))

            db.commit()
            print(f"[OK] Data fetch complete - {len(ward_names)} wards updated")

            # Run decision cycle
            await run_decision_cycle(db, base_weather, base_aqi)
            print("[AI] Decision cycle complete")

            db.close()
        except Exception as e:
            print(f"[ERROR] Periodic fetch error: {e}")

        # Wait 15 minutes
        await asyncio.sleep(900)


# --- App lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    print("[START] Starting City Digital Twin...")
    init_db()
    seed_database()

    # Run initial data fetch
    asyncio.create_task(periodic_data_fetch())
    print("[LIVE] Background data fetch started (every 15 min)")

    yield

    # Shutdown
    print("[STOP] Shutting down...")


# --- Create FastAPI app ---
app = FastAPI(
    title="City Digital Twin — Decision Intelligence Platform",
    description="AI-powered simulation platform for city administration",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(complaints_router)
app.include_router(chat_router)
app.include_router(simulation_router)
app.include_router(weather_router)
app.include_router(aqi_router)
app.include_router(traffic_router)
app.include_router(predictions_router)
app.include_router(alerts_router)
app.include_router(map_router)
app.include_router(reports_router)


# --- SSE Stream ---
@app.get("/api/stream")
async def sse_stream():
    """Server-Sent Events stream for real-time dashboard updates."""
    async def event_generator():
        while True:
            # Send heartbeat every 30 seconds
            yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': datetime.utcnow().isoformat()})}\n\n"
            await asyncio.sleep(30)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# --- Health check ---
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "City Digital Twin",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
