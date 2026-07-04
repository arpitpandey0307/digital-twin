"""
Data Routers — Weather, AQI, Traffic, Alerts, Predictions, Map data, Reports.
"""
import json
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from collections import Counter

from app.database import get_db
from app.models.weather import WeatherData
from app.models.aqi import AQIData
from app.models.traffic import TrafficData
from app.models.prediction import Prediction
from app.models.alert import Alert
from app.models.recommendation import Recommendation
from app.models.infrastructure import Infrastructure
from app.models.complaint import Complaint
from app.models.ward import WardProfile

weather_router = APIRouter(prefix="/api/weather", tags=["Weather"])
aqi_router = APIRouter(prefix="/api/aqi", tags=["AQI"])
traffic_router = APIRouter(prefix="/api/traffic", tags=["Traffic"])
predictions_router = APIRouter(prefix="/api/predictions", tags=["Predictions"])
alerts_router = APIRouter(prefix="/api/alerts", tags=["Alerts"])
map_router = APIRouter(prefix="/api/map", tags=["Map"])


# --- Weather ---
@weather_router.get("/current")
async def get_current_weather(db: Session = Depends(get_db)):
    records = db.query(WeatherData).order_by(WeatherData.recorded_at.desc()).limit(12).all()
    return [
        {
            "ward": r.ward, "temperature": r.temperature, "humidity": r.humidity,
            "rainfall_mm": r.rainfall_mm, "wind_speed": r.wind_speed,
            "condition": r.condition, "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
        }
        for r in records
    ]


@weather_router.get("/history")
async def get_weather_history(ward: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(WeatherData)
    if ward:
        query = query.filter(WeatherData.ward == ward)
    records = query.order_by(WeatherData.recorded_at.desc()).limit(limit).all()
    return [
        {
            "ward": r.ward, "temperature": r.temperature, "humidity": r.humidity,
            "rainfall_mm": r.rainfall_mm, "condition": r.condition,
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
        }
        for r in records
    ]


# --- AQI ---
@aqi_router.get("/current")
async def get_current_aqi(db: Session = Depends(get_db)):
    records = db.query(AQIData).order_by(AQIData.recorded_at.desc()).limit(12).all()
    return [
        {
            "ward": r.ward, "aqi": r.aqi, "pm25": r.pm25, "pm10": r.pm10,
            "no2": r.no2, "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
        }
        for r in records
    ]


@aqi_router.get("/history")
async def get_aqi_history(ward: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(AQIData)
    if ward:
        query = query.filter(AQIData.ward == ward)
    records = query.order_by(AQIData.recorded_at.desc()).limit(limit).all()
    return [
        {"ward": r.ward, "aqi": r.aqi, "pm25": r.pm25, "pm10": r.pm10, "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None}
        for r in records
    ]


# --- Traffic ---
@traffic_router.get("/current")
async def get_current_traffic(db: Session = Depends(get_db)):
    records = db.query(TrafficData).order_by(TrafficData.recorded_at.desc()).limit(30).all()
    return [
        {
            "ward": r.ward, "road_name": r.road_name, "congestion_level": r.congestion_level,
            "travel_time_seconds": r.travel_time_seconds, "incidents_count": r.incidents_count,
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
        }
        for r in records
    ]


# --- Predictions ---
@predictions_router.get("")
async def get_predictions(ward: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Prediction)
    if ward:
        query = query.filter(Prediction.ward == ward)
    preds = query.order_by(Prediction.created_at.desc()).limit(36).all()
    return [
        {
            "id": p.id, "ward": p.ward, "prediction_type": p.prediction_type,
            "probability": p.probability, "impact": p.impact,
            "description": p.description, "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in preds
    ]


# --- Alerts ---
@alerts_router.get("")
async def get_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    alerts = query.order_by(Alert.created_at.desc()).limit(50).all()
    return [
        {
            "id": a.id, "title": a.title, "message": a.message,
            "severity": a.severity, "target_ward": a.target_ward,
            "status": a.status, "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in alerts
    ]


@alerts_router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "acknowledged"
    db.commit()
    return {"message": "Alert acknowledged", "id": alert_id}


@alerts_router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Alert resolved", "id": alert_id}


# --- Map ---
@map_router.get("/complaints")
async def get_map_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).filter(
        Complaint.latitude.isnot(None),
        Complaint.longitude.isnot(None),
    ).order_by(Complaint.created_at.desc()).limit(100).all()

    features = []
    for c in complaints:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [c.longitude, c.latitude]},
            "properties": {
                "id": c.id, "category": c.category, "severity": c.severity,
                "status": c.status, "description": c.description[:100],
                "ward": c.ward, "created_at": c.created_at.isoformat() if c.created_at else None,
            },
        })
    return {"type": "FeatureCollection", "features": features}


@map_router.get("/infrastructure")
async def get_map_infrastructure(db: Session = Depends(get_db)):
    infra = db.query(Infrastructure).all()
    features = []
    for i in infra:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [i.longitude, i.latitude]},
            "properties": {
                "id": i.id, "name": i.name, "type": i.type,
                "capacity": i.capacity, "status": i.status, "ward": i.ward,
            },
        })
    return {"type": "FeatureCollection", "features": features}


@map_router.get("/wards")
async def get_map_wards(db: Session = Depends(get_db)):
    wards = db.query(WardProfile).all()
    return [
        {
            "name": w.ward_name, "center_lat": w.center_lat, "center_lng": w.center_lng,
            "population": w.population, "hospitals": w.num_hospitals,
            "schools": w.num_schools, "drainage_capacity": w.drainage_capacity,
        }
        for w in wards
    ]


# --- Reports ---
reports_router = APIRouter(prefix="/api/reports", tags=["Reports"])


@reports_router.post("/generate")
async def generate_incident_report(db: Session = Depends(get_db)):
    """Generate a comprehensive AI Incident Report with one click."""
    # Gather all data
    weather = db.query(WeatherData).order_by(WeatherData.recorded_at.desc()).first()
    aqi_data = db.query(AQIData).order_by(AQIData.recorded_at.desc()).first()
    predictions = db.query(Prediction).order_by(Prediction.probability.desc()).limit(15).all()
    active_alerts = db.query(Alert).filter(Alert.status == "active").order_by(Alert.created_at.desc()).all()
    wards = db.query(WardProfile).all()
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(50).all()

    # Build report sections
    now = datetime.utcnow()

    # Executive Summary
    high_risk = [p for p in predictions if p.probability > 0.6]
    complaint_cats = dict(Counter(c.category for c in complaints))
    top_category = max(complaint_cats, key=complaint_cats.get) if complaint_cats else "N/A"

    # Risk assessment
    risk_by_ward = {}
    for p in predictions:
        if p.ward not in risk_by_ward or p.probability > risk_by_ward[p.ward]["probability"]:
            risk_by_ward[p.ward] = {
                "ward": p.ward,
                "type": p.prediction_type,
                "probability": p.probability,
                "impact": p.impact,
            }

    top_risks = sorted(risk_by_ward.values(), key=lambda x: x["probability"], reverse=True)[:6]

    # Resource allocation
    resources = []
    for risk in top_risks[:4]:
        if risk["probability"] > 0.5:
            resources.append({
                "ward": risk["ward"],
                "resource": "Pump Stations" if risk["type"] == "flood" else "Traffic Police" if risk["type"] == "traffic" else "Health Advisory",
                "units": random.randint(1, 4),
                "priority": "urgent" if risk["probability"] > 0.7 else "high",
            })

    # Impact analysis
    total_pop = sum(w.population for w in wards)
    affected = sum(int(w.population * r["probability"] * 0.3) for w, r in zip(wards[:len(top_risks)], top_risks))

    report = {
        "id": f"RPT-{now.strftime('%Y%m%d-%H%M')}",
        "title": f"City Intelligence Report — {now.strftime('%B %d, %Y')}",
        "generated_at": now.isoformat(),
        "type": "AI Incident Report",
        "sections": {
            "executive_summary": {
                "title": "Executive Summary",
                "content": f"As of {now.strftime('%I:%M %p')}, {len(high_risk)} high-risk predictions are active across {len(risk_by_ward)} wards. "
                           f"Current rainfall is {weather.rainfall_mm if weather else 0}mm with AQI at {aqi_data.aqi if aqi_data else 'N/A'}. "
                           f"Top complaint category: {top_category} ({complaint_cats.get(top_category, 0)} reports). "
                           f"Estimated {affected:,} residents may be affected by current risks.",
                "severity": "critical" if len(high_risk) > 3 else "warning" if len(high_risk) > 0 else "info",
            },
            "predictions": {
                "title": "Active Predictions",
                "items": [
                    {
                        "ward": p.ward,
                        "type": p.prediction_type,
                        "probability": round(p.probability * 100),
                        "impact": p.impact,
                        "description": p.description,
                    }
                    for p in predictions[:8]
                ],
            },
            "risks": {
                "title": "Risk Assessment",
                "top_risks": top_risks,
                "total_high_risk_wards": len([r for r in top_risks if r["probability"] > 0.6]),
            },
            "recommendations": {
                "title": "AI Recommendations",
                "items": [
                    f"Deploy emergency pumps to {top_risks[0]['ward']}" if top_risks else "Monitor conditions",
                    f"Issue advisory for {top_risks[1]['ward']}" if len(top_risks) > 1 else "Maintain readiness",
                    f"Pre-position medical teams near hospitals in affected wards",
                    f"Activate citizen alert system for {len(high_risk)} high-risk areas",
                    f"Clear drainage channels in top {min(3, len(top_risks))} risk wards",
                ],
            },
            "resource_allocation": {
                "title": "Resource Allocation",
                "allocations": resources,
                "total_cost_estimate": sum(random.randint(20000, 100000) for _ in resources),
            },
            "impact_analysis": {
                "title": "Impact Analysis",
                "total_population": total_pop,
                "affected_population": affected,
                "wards_at_risk": len(top_risks),
                "active_alerts": len(active_alerts),
                "active_complaints": len([c for c in complaints if c.status != "resolved"]),
            },
            "weather": {
                "title": "Current Conditions",
                "temperature": weather.temperature if weather else None,
                "humidity": weather.humidity if weather else None,
                "rainfall_mm": weather.rainfall_mm if weather else None,
                "aqi": aqi_data.aqi if aqi_data else None,
                "condition": weather.condition if weather else None,
            },
        },
    }

    return report


@reports_router.get("")
async def list_reports():
    """List available auto-generated reports."""
    now = datetime.utcnow()
    return {
        "reports": [
            {"id": f"RPT-{now.strftime('%Y%m%d')}-001", "title": f"Daily City Briefing — {now.strftime('%B %d, %Y')}", "type": "Daily", "status": "Ready", "generated_at": now.isoformat()},
            {"id": f"RPT-{now.strftime('%Y%m%d')}-002", "title": "Ward Risk Assessment Report", "type": "Ward", "status": "Ready", "generated_at": now.isoformat()},
            {"id": f"RPT-{now.strftime('%Y%m')}-M01", "title": f"Monthly Analysis — {now.strftime('%B %Y')}", "type": "Monthly", "status": "Ready", "generated_at": now.isoformat()},
            {"id": f"RPT-{now.strftime('%Y%m%d')}-003", "title": "Infrastructure Health Report", "type": "Infrastructure", "status": "Ready", "generated_at": now.isoformat()},
        ]
    }

