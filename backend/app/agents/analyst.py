"""
Agent 1 — Data Analyst
Finds patterns, trends, and anomalies in city data using statistical methods.
"""
from datetime import datetime, timedelta
from collections import Counter
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.weather import WeatherData
from app.models.aqi import AQIData


def analyze_complaint_trends(db: Session, days: int = 30) -> dict:
    """Analyze complaint trends over the specified period."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    complaints = db.query(Complaint).filter(Complaint.created_at >= cutoff).all()

    if not complaints:
        return {"trends": [], "anomalies": [], "correlations": [], "total": 0}

    # Category distribution
    categories = Counter(c.category for c in complaints)

    # Ward distribution
    wards = Counter(c.ward for c in complaints if c.ward)

    # Severity distribution
    severities = Counter(c.severity for c in complaints)

    # Weekly trend
    weekly = {}
    for c in complaints:
        week_key = c.created_at.strftime("%Y-W%U")
        weekly[week_key] = weekly.get(week_key, 0) + 1

    # Detect increasing trends
    trends = []
    sorted_weeks = sorted(weekly.items())
    if len(sorted_weeks) >= 2:
        recent = sorted_weeks[-1][1]
        previous = sorted_weeks[-2][1]
        if recent > previous * 1.2:
            trends.append({
                "type": "increasing",
                "metric": "total_complaints",
                "change_pct": round((recent - previous) / max(previous, 1) * 100, 1),
                "message": f"Complaints increased {round((recent - previous) / max(previous, 1) * 100, 1)}% this week",
            })

    # Top problem areas
    hotspot_ward = max(wards, key=wards.get) if wards else None
    hotspot_category = max(categories, key=categories.get) if categories else None

    anomalies = []
    if hotspot_ward and wards[hotspot_ward] > len(complaints) * 0.3:
        anomalies.append({
            "type": "hotspot",
            "ward": hotspot_ward,
            "count": wards[hotspot_ward],
            "message": f"{hotspot_ward} has {round(wards[hotspot_ward] / len(complaints) * 100)}% of all complaints",
        })

    return {
        "total": len(complaints),
        "categories": dict(categories),
        "wards": dict(wards),
        "severities": dict(severities),
        "weekly_trend": dict(sorted_weeks) if sorted_weeks else {},
        "trends": trends,
        "anomalies": anomalies,
        "hotspot_ward": hotspot_ward,
        "hotspot_category": hotspot_category,
    }


def analyze_weather_patterns(db: Session, days: int = 7) -> dict:
    """Analyze recent weather patterns."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    records = db.query(WeatherData).filter(WeatherData.recorded_at >= cutoff).all()

    if not records:
        return {"avg_temperature": None, "avg_rainfall": None, "trend": "unknown"}

    temps = [r.temperature for r in records if r.temperature]
    rain = [r.rainfall_mm for r in records if r.rainfall_mm is not None]

    return {
        "avg_temperature": round(sum(temps) / len(temps), 1) if temps else None,
        "max_temperature": round(max(temps), 1) if temps else None,
        "min_temperature": round(min(temps), 1) if temps else None,
        "avg_rainfall": round(sum(rain) / len(rain), 1) if rain else None,
        "max_rainfall": round(max(rain), 1) if rain else None,
        "total_records": len(records),
        "heavy_rain_days": len([r for r in rain if r > 50]),
    }


def analyze_aqi_patterns(db: Session, days: int = 7) -> dict:
    """Analyze recent AQI patterns."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    records = db.query(AQIData).filter(AQIData.recorded_at >= cutoff).all()

    if not records:
        return {"avg_aqi": None, "trend": "unknown"}

    aqis = [r.aqi for r in records if r.aqi]
    return {
        "avg_aqi": round(sum(aqis) / len(aqis)) if aqis else None,
        "max_aqi": max(aqis) if aqis else None,
        "min_aqi": min(aqis) if aqis else None,
        "unhealthy_readings": len([a for a in aqis if a > 150]),
        "total_records": len(records),
    }
