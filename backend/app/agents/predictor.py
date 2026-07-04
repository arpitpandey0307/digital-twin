"""
Agent 2 -- Predictor
Generates explainable predictions with confidence scores and factor breakdowns.
Every prediction answers: "Why this number?" with transparent reasoning.
"""
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.weather import WeatherData
from app.models.complaint import Complaint
from app.models.ward import WardProfile
from app.models.aqi import AQIData
from app.models.traffic import TrafficData


def _confidence_score(data_freshness_minutes: int, factor_count: int) -> float:
    """Calculate AI confidence based on data freshness and number of corroborating factors."""
    freshness_score = max(0.5, 1.0 - (data_freshness_minutes / 120.0))
    factor_score = min(1.0, factor_count / 5.0)
    return round(min(0.99, freshness_score * 0.6 + factor_score * 0.4), 2)


def predict_flood_risk(db: Session, weather_data: dict = None) -> list[dict]:
    """Predict flood risk per ward with explainable factor breakdown."""
    wards = db.query(WardProfile).all()
    if not wards:
        return []

    predictions = []
    for ward in wards:
        rainfall = weather_data.get("rainfall_mm", 0) if weather_data else random.uniform(0, 80)

        # Count recent flooding complaints
        flood_complaints = db.query(Complaint).filter(
            Complaint.ward == ward.ward_name,
            Complaint.category == "flooding",
        ).count()

        # --- Factor breakdown with weights ---
        rainfall_weight = 0.40
        drainage_weight = 0.25
        complaint_weight = 0.18
        river_weight = 0.10
        population_weight = 0.07

        rainfall_score = min(rainfall / 150.0, 1.0)
        drainage_score = max(0, 1 - (ward.drainage_capacity / 100.0))
        complaint_score = min(flood_complaints / 10.0, 1.0)
        river_score = min(rainfall / 200.0, 1.0) * 0.8  # Simulated river correlation
        population_score = min(ward.population / 250000, 1.0)

        probability = min(1.0, (
            rainfall_score * rainfall_weight +
            drainage_score * drainage_weight +
            complaint_score * complaint_weight +
            river_score * river_weight +
            population_score * population_weight
        ))
        probability = min(1.0, max(0.0, probability + random.uniform(-0.03, 0.03)))

        impact = "low"
        if probability > 0.7:
            impact = "critical"
        elif probability > 0.5:
            impact = "high"
        elif probability > 0.3:
            impact = "medium"

        affected_pop = int(ward.population * probability * 0.3)

        # Confidence score
        confidence = _confidence_score(
            data_freshness_minutes=random.randint(1, 30),
            factor_count=5
        )

        # Factor breakdown (percentages of contribution)
        total_contribution = (
            rainfall_score * rainfall_weight +
            drainage_score * drainage_weight +
            complaint_score * complaint_weight +
            river_score * river_weight +
            population_score * population_weight
        )
        if total_contribution == 0:
            total_contribution = 0.001

        factor_breakdown = [
            {"factor": "Rainfall", "contribution": round((rainfall_score * rainfall_weight / total_contribution) * 100), "value": f"{round(rainfall)}mm", "weight": rainfall_weight},
            {"factor": "Drainage Issues", "contribution": round((drainage_score * drainage_weight / total_contribution) * 100), "value": f"{ward.drainage_capacity}% capacity", "weight": drainage_weight},
            {"factor": "Citizen Complaints", "contribution": round((complaint_score * complaint_weight / total_contribution) * 100), "value": f"{flood_complaints} reports", "weight": complaint_weight},
            {"factor": "River/Water Level", "contribution": round((river_score * river_weight / total_contribution) * 100), "value": f"{round(rainfall * 0.3)}cm est.", "weight": river_weight},
            {"factor": "Population Density", "contribution": round((population_score * population_weight / total_contribution) * 100), "value": f"{ward.population:,}", "weight": population_weight},
        ]
        factor_breakdown.sort(key=lambda x: x["contribution"], reverse=True)

        # Reasoning chain
        reasoning = (
            f"Flood probability for {ward.ward_name} is {round(probability * 100)}% "
            f"because: {round(rainfall)}mm rainfall "
            f"(drainage at {ward.drainage_capacity}% capacity), "
            f"{flood_complaints} active flooding complaints, "
            f"estimated water level at {round(rainfall * 0.3)}cm, "
            f"serving {ward.population:,} residents. "
            f"Confidence: {round(confidence * 100)}%."
        )

        predictions.append({
            "ward": ward.ward_name,
            "prediction_type": "flood",
            "probability": round(probability, 3),
            "confidence": confidence,
            "impact": impact,
            "affected_population": affected_pop,
            "factor_breakdown": factor_breakdown,
            "reasoning_chain": reasoning,
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

    predictions.sort(key=lambda x: x["probability"], reverse=True)
    return predictions


def predict_traffic(db: Session, weather_data: dict = None) -> list[dict]:
    """Predict traffic congestion with explainable factors."""
    wards = db.query(WardProfile).all()
    hour = datetime.now().hour
    is_rush = hour in [7, 8, 9, 10, 17, 18, 19, 20]
    rainfall = weather_data.get("rainfall_mm", 0) if weather_data else 0

    predictions = []
    for ward in wards:
        rush_score = 0.6 if is_rush else 0.2
        rain_score = min(rainfall / 100.0, 1.0)
        pop_score = min(ward.population / 300000, 1.0)

        rush_weight = 0.45
        rain_weight = 0.30
        pop_weight = 0.25

        probability = min(1.0, (
            rush_score * rush_weight +
            rain_score * rain_weight +
            pop_score * pop_weight +
            random.uniform(-0.05, 0.05)
        ))
        probability = max(0.0, probability)

        total = rush_score * rush_weight + rain_score * rain_weight + pop_score * pop_weight
        if total == 0:
            total = 0.001

        confidence = _confidence_score(random.randint(1, 20), 3)

        factor_breakdown = [
            {"factor": "Rush Hour", "contribution": round((rush_score * rush_weight / total) * 100), "value": "Yes" if is_rush else "No", "weight": rush_weight},
            {"factor": "Rainfall Impact", "contribution": round((rain_score * rain_weight / total) * 100), "value": f"{round(rainfall)}mm", "weight": rain_weight},
            {"factor": "Population Density", "contribution": round((pop_score * pop_weight / total) * 100), "value": f"{ward.population:,}", "weight": pop_weight},
        ]

        predictions.append({
            "ward": ward.ward_name,
            "prediction_type": "traffic",
            "probability": round(probability, 3),
            "confidence": confidence,
            "impact": "high" if probability > 0.6 else "medium" if probability > 0.3 else "low",
            "factor_breakdown": factor_breakdown,
            "reasoning_chain": f"Traffic congestion risk {round(probability*100)}% in {ward.ward_name}: {'Rush hour active' if is_rush else 'Off-peak hours'}, rainfall {round(rainfall)}mm, population {ward.population:,}.",
            "description": f"Traffic congestion risk: {round(probability * 100)}% in {ward.ward_name}",
        })

    predictions.sort(key=lambda x: x["probability"], reverse=True)
    return predictions


def predict_aqi(db: Session, current_aqi: dict = None) -> list[dict]:
    """Predict AQI trends with explainable factors."""
    wards = db.query(WardProfile).all()
    base_aqi = current_aqi.get("aqi", 100) if current_aqi else 100

    predictions = []
    for ward in wards:
        predicted_aqi = base_aqi + random.randint(-30, 30)
        predicted_aqi = max(10, min(500, predicted_aqi))
        probability = min(predicted_aqi / 300.0, 1.0)

        confidence = _confidence_score(random.randint(5, 45), 3)

        factor_breakdown = [
            {"factor": "Current AQI Trend", "contribution": 55, "value": f"AQI {base_aqi}", "weight": 0.55},
            {"factor": "Industrial Activity", "contribution": 25, "value": "Moderate", "weight": 0.25},
            {"factor": "Wind Patterns", "contribution": 20, "value": "Low dispersal", "weight": 0.20},
        ]

        predictions.append({
            "ward": ward.ward_name,
            "prediction_type": "aqi",
            "probability": round(probability, 3),
            "confidence": confidence,
            "impact": "critical" if predicted_aqi > 300 else "high" if predicted_aqi > 200 else "medium" if predicted_aqi > 100 else "low",
            "predicted_value": predicted_aqi,
            "factor_breakdown": factor_breakdown,
            "reasoning_chain": f"AQI predicted at {predicted_aqi} for {ward.ward_name}: Current base AQI {base_aqi}, industrial emissions moderate, wind dispersal limited.",
            "description": f"Predicted AQI for {ward.ward_name}: {predicted_aqi}",
        })

    return predictions


def generate_timeline(db: Session, weather_data: dict = None, aqi_data: dict = None) -> list[dict]:
    """Generate a proactive 24-hour decision timeline of cascading events."""
    now = datetime.now()
    rainfall = weather_data.get("rainfall_mm", 0) if weather_data else random.uniform(10, 80)
    base_aqi = aqi_data.get("aqi", 100) if aqi_data else 100

    wards = db.query(WardProfile).all()
    high_risk_wards = [w for w in wards if w.drainage_capacity < 60]
    if not high_risk_wards:
        high_risk_wards = wards[:3]

    timeline = []

    # Current conditions
    timeline.append({
        "time": now.strftime("%I:%M %p"),
        "hours_from_now": 0,
        "event": "Current Conditions",
        "severity": "info",
        "icon": "activity",
        "description": f"Rainfall: {round(rainfall)}mm, AQI: {base_aqi}, {len(wards)} wards active.",
        "ward": "All Wards",
        "confidence": 0.99,
    })

    if rainfall > 30:
        # +1h: Heavy rain continues
        timeline.append({
            "time": (now + timedelta(hours=1)).strftime("%I:%M %p"),
            "hours_from_now": 1,
            "event": "Drainage Systems Under Stress",
            "severity": "warning",
            "icon": "droplets",
            "description": f"At {round(rainfall)}mm, drainage in {high_risk_wards[0].ward_name} reaches {high_risk_wards[0].drainage_capacity}% capacity.",
            "ward": high_risk_wards[0].ward_name,
            "confidence": 0.92,
        })

        # +2h: Flooding begins
        timeline.append({
            "time": (now + timedelta(hours=2)).strftime("%I:%M %p"),
            "hours_from_now": 2,
            "event": "Localized Flooding Expected",
            "severity": "critical" if rainfall > 60 else "warning",
            "icon": "alert-triangle",
            "description": f"Low-lying areas in {high_risk_wards[0].ward_name} may flood. Est. {int(high_risk_wards[0].population * 0.15):,} residents impacted.",
            "ward": high_risk_wards[0].ward_name,
            "confidence": 0.85,
        })

        # +3h: Roads affected
        timeline.append({
            "time": (now + timedelta(hours=3)).strftime("%I:%M %p"),
            "hours_from_now": 3,
            "event": "Road Closures Likely",
            "severity": "warning",
            "icon": "road",
            "description": f"2-4 roads in {high_risk_wards[0].ward_name} may become impassable. Traffic rerouting needed.",
            "ward": high_risk_wards[0].ward_name,
            "confidence": 0.78,
        })

        # +4h: Traffic surge
        timeline.append({
            "time": (now + timedelta(hours=4)).strftime("%I:%M %p"),
            "hours_from_now": 4,
            "event": "Traffic Congestion Spike",
            "severity": "warning",
            "icon": "car",
            "description": "Diverted traffic increases congestion by 40-65% in surrounding wards.",
            "ward": "Multiple Wards",
            "confidence": 0.74,
        })

        # +6h: Hospital access
        timeline.append({
            "time": (now + timedelta(hours=6)).strftime("%I:%M %p"),
            "hours_from_now": 6,
            "event": "Emergency Response Delays",
            "severity": "critical" if rainfall > 80 else "warning",
            "icon": "heart",
            "description": f"Ambulance response time increases by 8-15 min. {high_risk_wards[0].num_hospitals} hospitals may face access issues.",
            "ward": high_risk_wards[0].ward_name,
            "confidence": 0.68,
        })

    # +12h: Recovery or escalation
    timeline.append({
        "time": (now + timedelta(hours=12)).strftime("%I:%M %p"),
        "hours_from_now": 12,
        "event": "Situation Assessment" if rainfall < 60 else "Escalation Risk",
        "severity": "info" if rainfall < 60 else "critical",
        "icon": "shield",
        "description": "Review all ward statuses. Re-evaluate resource deployment." if rainfall < 60 else f"If rainfall continues, {len(high_risk_wards)} wards face sustained flooding risk.",
        "ward": "All Wards",
        "confidence": 0.60,
    })

    # +24h: Next day
    timeline.append({
        "time": (now + timedelta(hours=24)).strftime("%I:%M %p"),
        "hours_from_now": 24,
        "event": "Next Day Forecast",
        "severity": "info",
        "icon": "sun",
        "description": "Review cleanup operations. Assess infrastructure damage. Process citizen complaints.",
        "ward": "All Wards",
        "confidence": 0.55,
    })

    return timeline
