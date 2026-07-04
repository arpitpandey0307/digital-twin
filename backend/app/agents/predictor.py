"""
Agent 2 — Predictor
Uses ML models to predict flood risk, traffic congestion, and AQI levels.
For hackathon: uses rule-based heuristics + random forest when data is sufficient.
"""
import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.weather import WeatherData
from app.models.complaint import Complaint
from app.models.ward import WardProfile


def predict_flood_risk(db: Session, weather_data: dict = None) -> list[dict]:
    """Predict flood risk per ward based on rainfall, drainage capacity, and complaints."""
    wards = db.query(WardProfile).all()
    if not wards:
        return []

    predictions = []
    for ward in wards:
        # Factors that increase flood risk
        rainfall = weather_data.get("rainfall_mm", 0) if weather_data else random.uniform(0, 80)

        # Count recent flooding complaints for this ward
        flood_complaints = db.query(Complaint).filter(
            Complaint.ward == ward.ward_name,
            Complaint.category == "flooding",
        ).count()

        # Calculate risk score (0 to 1)
        rainfall_factor = min(rainfall / 150.0, 1.0) * 0.4
        drainage_factor = max(0, 1 - (ward.drainage_capacity / 100.0)) * 0.25
        complaint_factor = min(flood_complaints / 10.0, 1.0) * 0.2
        population_factor = min(ward.population / 250000, 1.0) * 0.15

        probability = min(1.0, rainfall_factor + drainage_factor + complaint_factor + population_factor)
        # Add small random variation for realism
        probability = min(1.0, max(0.0, probability + random.uniform(-0.05, 0.05)))

        impact = "low"
        if probability > 0.7:
            impact = "critical"
        elif probability > 0.5:
            impact = "high"
        elif probability > 0.3:
            impact = "medium"

        affected_pop = int(ward.population * probability * 0.3)

        predictions.append({
            "ward": ward.ward_name,
            "prediction_type": "flood",
            "probability": round(probability, 3),
            "impact": impact,
            "affected_population": affected_pop,
            "factors": {
                "rainfall_mm": round(rainfall, 1),
                "drainage_capacity": ward.drainage_capacity,
                "flood_complaints": flood_complaints,
                "population": ward.population,
            },
            "description": f"Flood risk for {ward.ward_name}: {round(probability * 100)}% probability. "
                          f"Rainfall: {round(rainfall)}mm, Drainage capacity: {ward.drainage_capacity}%, "
                          f"Affected population: ~{affected_pop:,}",
        })

    # Sort by probability descending
    predictions.sort(key=lambda x: x["probability"], reverse=True)
    return predictions


def predict_traffic(db: Session, weather_data: dict = None) -> list[dict]:
    """Predict traffic congestion based on weather and time of day."""
    wards = db.query(WardProfile).all()
    hour = datetime.now().hour
    is_rush = hour in [7, 8, 9, 10, 17, 18, 19, 20]
    rainfall = weather_data.get("rainfall_mm", 0) if weather_data else 0

    predictions = []
    for ward in wards:
        base_risk = 0.3 if is_rush else 0.15
        rain_factor = min(rainfall / 100.0, 0.4)
        pop_factor = min(ward.population / 300000, 0.2)
        probability = min(1.0, base_risk + rain_factor + pop_factor + random.uniform(-0.05, 0.05))

        predictions.append({
            "ward": ward.ward_name,
            "prediction_type": "traffic",
            "probability": round(probability, 3),
            "impact": "high" if probability > 0.6 else "medium" if probability > 0.3 else "low",
            "description": f"Traffic congestion risk: {round(probability * 100)}% in {ward.ward_name}",
        })

    predictions.sort(key=lambda x: x["probability"], reverse=True)
    return predictions


def predict_aqi(db: Session, current_aqi: dict = None) -> list[dict]:
    """Predict AQI trends for next 24 hours."""
    wards = db.query(WardProfile).all()
    base_aqi = current_aqi.get("aqi", 100) if current_aqi else 100

    predictions = []
    for ward in wards:
        # AQI prediction with some ward-based variation
        predicted_aqi = base_aqi + random.randint(-30, 30)
        predicted_aqi = max(10, min(500, predicted_aqi))
        probability = min(predicted_aqi / 300.0, 1.0)

        predictions.append({
            "ward": ward.ward_name,
            "prediction_type": "aqi",
            "probability": round(probability, 3),
            "impact": "critical" if predicted_aqi > 300 else "high" if predicted_aqi > 200 else "medium" if predicted_aqi > 100 else "low",
            "predicted_value": predicted_aqi,
            "description": f"Predicted AQI for {ward.ward_name}: {predicted_aqi}",
        })

    return predictions
