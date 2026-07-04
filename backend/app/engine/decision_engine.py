"""
Decision Intelligence Engine — Orchestrates all 5 agents.
This is the central brain that combines outputs from all agents
into actionable decision intelligence.
"""
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.alert import Alert
from app.agents.analyst import analyze_complaint_trends, analyze_weather_patterns, analyze_aqi_patterns
from app.agents.predictor import predict_flood_risk, predict_traffic, predict_aqi
from app.agents.recommender import generate_recommendations


async def run_decision_cycle(db: Session, weather_data: dict = None, aqi_data: dict = None) -> dict:
    """
    Run a full decision intelligence cycle:
    1. Agent 1 (Analyst) → Find patterns
    2. Agent 2 (Predictor) → Generate predictions
    3. Agent 5 (Recommender) → Generate recommendations
    4. Store predictions + recommendations + alerts
    """
    results = {
        "timestamp": datetime.utcnow().isoformat(),
        "analysis": {},
        "predictions": [],
        "recommendations": [],
        "alerts_generated": 0,
    }

    # Step 1: Agent 1 — Analyze trends
    complaint_trends = analyze_complaint_trends(db)
    weather_patterns = analyze_weather_patterns(db)
    aqi_patterns = analyze_aqi_patterns(db)
    results["analysis"] = {
        "complaints": complaint_trends,
        "weather": weather_patterns,
        "aqi": aqi_patterns,
    }

    # Step 2: Agent 2 — Generate predictions
    flood_preds = predict_flood_risk(db, weather_data)
    traffic_preds = predict_traffic(db, weather_data)
    aqi_preds = predict_aqi(db, aqi_data)

    all_preds = flood_preds + traffic_preds + aqi_preds

    # Store predictions in DB
    for pred_data in all_preds:
        prediction = Prediction(
            ward=pred_data["ward"],
            prediction_type=pred_data["prediction_type"],
            probability=pred_data["probability"],
            impact=pred_data.get("impact", "medium"),
            description=pred_data.get("description", ""),
            factors=json.dumps(pred_data.get("factors", {})),
            predicted_for=datetime.utcnow(),
        )
        db.add(prediction)

    results["predictions"] = all_preds

    # Step 3: Agent 5 — Generate recommendations
    recommendations = generate_recommendations(all_preds, db)
    for rec_data in recommendations:
        rec = Recommendation(
            action=rec_data["action"],
            priority=rec_data["priority"],
            assigned_department=rec_data.get("department"),
            rationale=rec_data.get("rationale"),
        )
        db.add(rec)

    results["recommendations"] = recommendations

    # Step 4: Generate alerts for high-risk predictions
    alerts_created = 0
    for pred_data in all_preds:
        if pred_data["probability"] > 0.6 and pred_data.get("impact") in ("high", "critical"):
            severity = "critical" if pred_data["probability"] > 0.8 else "warning"
            alert = Alert(
                title=f"{pred_data['prediction_type'].title()} Risk Alert — {pred_data['ward']}",
                message=pred_data.get("description", f"High {pred_data['prediction_type']} risk detected"),
                severity=severity,
                target_ward=pred_data["ward"],
            )
            db.add(alert)
            alerts_created += 1

    results["alerts_generated"] = alerts_created

    db.commit()
    return results
