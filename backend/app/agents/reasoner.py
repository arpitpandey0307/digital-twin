"""
Agent 4 — Gemini Reasoner
Uses RAG pipeline to answer questions with city data context.
"""
import json
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.weather import WeatherData
from app.models.aqi import AQIData
from app.models.prediction import Prediction
from app.models.alert import Alert
from app.models.ward import WardProfile
from app.services.gemini_service import chat_with_context


async def answer_question(question: str, db: Session) -> dict:
    """Answer a user question using RAG — retrieves relevant context from the database."""

    # Build context from the database (simple RAG — retrieves latest data)
    context = []

    # Recent weather
    weather = db.query(WeatherData).order_by(WeatherData.recorded_at.desc()).first()
    if weather:
        context.append({
            "type": "current_weather",
            "data": {
                "temperature": weather.temperature,
                "humidity": weather.humidity,
                "rainfall_mm": weather.rainfall_mm,
                "condition": weather.condition,
                "ward": weather.ward,
            },
        })

    # Recent AQI
    aqi = db.query(AQIData).order_by(AQIData.recorded_at.desc()).first()
    if aqi:
        context.append({
            "type": "current_aqi",
            "data": {"aqi": aqi.aqi, "pm25": aqi.pm25, "pm10": aqi.pm10, "ward": aqi.ward},
        })

    # Active predictions
    predictions = db.query(Prediction).order_by(Prediction.probability.desc()).limit(5).all()
    for pred in predictions:
        context.append({
            "type": "prediction",
            "data": {
                "ward": pred.ward,
                "type": pred.prediction_type,
                "probability": pred.probability,
                "impact": pred.impact,
                "description": pred.description,
            },
        })

    # Active alerts
    alerts = db.query(Alert).filter(Alert.status == "active").order_by(Alert.created_at.desc()).limit(5).all()
    for alert in alerts:
        context.append({
            "type": "active_alert",
            "data": {"title": alert.title, "severity": alert.severity, "ward": alert.target_ward, "message": alert.message},
        })

    # Recent complaints summary
    from collections import Counter
    recent_complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(20).all()
    if recent_complaints:
        categories = Counter(c.category for c in recent_complaints)
        wards = Counter(c.ward for c in recent_complaints if c.ward)
        context.append({
            "type": "recent_complaints_summary",
            "data": {
                "total": len(recent_complaints),
                "categories": dict(categories),
                "wards": dict(wards),
                "active": len([c for c in recent_complaints if c.status != "resolved"]),
            },
        })

    # Ward profiles
    ward_profiles = db.query(WardProfile).all()
    for wp in ward_profiles[:5]:
        context.append({
            "type": "ward_profile",
            "data": {
                "name": wp.ward_name,
                "population": wp.population,
                "hospitals": wp.num_hospitals,
                "schools": wp.num_schools,
                "drainage_capacity": wp.drainage_capacity,
            },
        })

    return await chat_with_context(question, context)
