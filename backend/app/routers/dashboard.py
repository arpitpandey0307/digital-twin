"""
Dashboard Router — Aggregated city overview endpoint.
"""
import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter

from app.database import get_db
from app.models.complaint import Complaint
from app.models.weather import WeatherData
from app.models.aqi import AQIData
from app.models.prediction import Prediction
from app.models.alert import Alert
from app.models.ward import WardProfile
from app.models.recommendation import Recommendation
from app.services.gemini_service import generate_daily_insight

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_overview(db: Session = Depends(get_db)):
    """Get aggregated dashboard data."""
    # Complaints stats
    total_complaints = db.query(Complaint).count()
    active_complaints = db.query(Complaint).filter(Complaint.status != "resolved").count()
    resolved_complaints = db.query(Complaint).filter(Complaint.status == "resolved").count()

    # Category breakdown
    all_complaints = db.query(Complaint).all()
    category_counts = dict(Counter(c.category for c in all_complaints))

    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.status == "active").count()
    recent_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()

    # Latest weather
    latest_weather = db.query(WeatherData).order_by(WeatherData.recorded_at.desc()).first()
    weather_dict = None
    if latest_weather:
        weather_dict = {
            "temperature": latest_weather.temperature,
            "humidity": latest_weather.humidity,
            "rainfall_mm": latest_weather.rainfall_mm,
            "wind_speed": latest_weather.wind_speed,
            "condition": latest_weather.condition,
        }

    # Latest AQI
    latest_aqi = db.query(AQIData).order_by(AQIData.recorded_at.desc()).first()
    aqi_dict = None
    if latest_aqi:
        aqi_dict = {
            "aqi": latest_aqi.aqi,
            "pm25": latest_aqi.pm25,
            "pm10": latest_aqi.pm10,
            "no2": latest_aqi.no2,
        }

    # Flood risk by ward (latest predictions)
    flood_preds = db.query(Prediction).filter(
        Prediction.prediction_type == "flood"
    ).order_by(Prediction.created_at.desc()).limit(12).all()

    flood_risk_by_ward = [
        {"ward": p.ward, "probability": p.probability, "impact": p.impact}
        for p in flood_preds
    ]

    # Ward summary
    wards = db.query(WardProfile).all()
    ward_summary = []
    for w in wards:
        ward_complaints = len([c for c in all_complaints if c.ward == w.ward_name])
        ward_summary.append({
            "ward": w.ward_name,
            "population": w.population,
            "complaints": ward_complaints,
            "hospitals": w.num_hospitals,
            "schools": w.num_schools,
        })

    # Calculate city risk score (0-100)
    risk_factors = []
    if latest_weather and latest_weather.rainfall_mm:
        risk_factors.append(min(latest_weather.rainfall_mm / 100.0 * 30, 30))
    if latest_aqi and latest_aqi.aqi:
        risk_factors.append(min(latest_aqi.aqi / 300.0 * 20, 20))
    risk_factors.append(min(active_complaints / 50.0 * 25, 25))
    risk_factors.append(min(active_alerts / 5.0 * 25, 25))
    city_risk_score = min(100, sum(risk_factors))

    # AI insight
    ai_data = {
        "active_complaints": active_complaints,
        "weather": weather_dict or {},
        "aqi": aqi_dict or {},
        "active_alerts": active_alerts,
        "top_categories": dict(list(sorted(category_counts.items(), key=lambda x: x[1], reverse=True))[:3]) if category_counts else {},
    }
    ai_insight = await generate_daily_insight(ai_data)

    # Recent recommendations
    recent_recs = db.query(Recommendation).order_by(
        Recommendation.created_at.desc()
    ).limit(5).all()

    return {
        "city_risk_score": round(city_risk_score, 1),
        "total_complaints": total_complaints,
        "active_complaints": active_complaints,
        "resolved_complaints": resolved_complaints,
        "active_alerts": active_alerts,
        "current_weather": weather_dict,
        "current_aqi": aqi_dict,
        "flood_risk_by_ward": flood_risk_by_ward,
        "recent_alerts": [
            {
                "id": a.id, "title": a.title, "message": a.message,
                "severity": a.severity, "target_ward": a.target_ward,
                "status": a.status, "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in recent_alerts
        ],
        "ai_insight": ai_insight,
        "complaint_stats": category_counts,
        "ward_summary": ward_summary,
        "recent_recommendations": [
            {
                "id": r.id, "action": r.action, "priority": r.priority,
                "department": r.assigned_department, "status": r.status,
            }
            for r in recent_recs
        ],
    }
