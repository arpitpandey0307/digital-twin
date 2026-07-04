"""
Agent 5 — Recommendation Engine
Rule-based + AI hybrid engine that generates actionable recommendations.
"""
from sqlalchemy.orm import Session
from app.models.prediction import Prediction
from app.models.infrastructure import Infrastructure
from app.models.ward import WardProfile


def generate_recommendations(predictions: list[dict], db: Session) -> list[dict]:
    """Generate actionable recommendations based on predictions and infrastructure data."""
    recommendations = []

    for pred in predictions:
        if pred["probability"] < 0.3:
            continue  # Skip low-risk predictions

        ward_name = pred.get("ward", "Unknown")
        pred_type = pred.get("prediction_type", "unknown")

        # Get ward infrastructure
        ward = db.query(WardProfile).filter(WardProfile.ward_name == ward_name).first()
        shelters = db.query(Infrastructure).filter(
            Infrastructure.ward == ward_name,
            Infrastructure.type == "shelter",
            Infrastructure.status == "operational",
        ).all()
        pumps = db.query(Infrastructure).filter(
            Infrastructure.ward == ward_name,
            Infrastructure.type == "pump_station",
            Infrastructure.status == "operational",
        ).all()
        hospitals = db.query(Infrastructure).filter(
            Infrastructure.ward == ward_name,
            Infrastructure.type == "hospital",
            Infrastructure.status == "operational",
        ).all()

        if pred_type == "flood":
            if pred["probability"] > 0.7:
                recommendations.append({
                    "action": f"Deploy {len(pumps)} pump stations in {ward_name} immediately",
                    "priority": "urgent",
                    "department": "Flood Control",
                    "rationale": f"Flood probability {round(pred['probability']*100)}% — drainage capacity at {ward.drainage_capacity if ward else 'unknown'}%",
                })
                if shelters:
                    recommendations.append({
                        "action": f"Open {shelters[0].name} (capacity: {shelters[0].capacity}) for evacuation",
                        "priority": "urgent",
                        "department": "Disaster Management",
                        "rationale": f"Estimated {pred.get('affected_population', 0):,} residents at risk",
                    })
                recommendations.append({
                    "action": f"Issue flood warning alert to all residents of {ward_name}",
                    "priority": "urgent",
                    "department": "Communications",
                    "rationale": "Early warning saves lives — 6 hour lead time recommended",
                })
            elif pred["probability"] > 0.5:
                recommendations.append({
                    "action": f"Pre-position pumps near low-lying areas in {ward_name}",
                    "priority": "high",
                    "department": "Flood Control",
                    "rationale": f"Moderate flood risk ({round(pred['probability']*100)}%) detected",
                })
                recommendations.append({
                    "action": f"Clear drainage channels in {ward_name}",
                    "priority": "high",
                    "department": "Municipality",
                    "rationale": "Preventive maintenance reduces flood impact",
                })

        elif pred_type == "traffic":
            if pred["probability"] > 0.6:
                recommendations.append({
                    "action": f"Deploy traffic police at major junctions in {ward_name}",
                    "priority": "high",
                    "department": "Traffic Police",
                    "rationale": f"Heavy congestion expected ({round(pred['probability']*100)}% probability)",
                })
                if hospitals:
                    recommendations.append({
                        "action": f"Designate emergency vehicle corridors near {hospitals[0].name}",
                        "priority": "high",
                        "department": "Traffic Police",
                        "rationale": "Ensure ambulance access during congestion",
                    })

        elif pred_type == "aqi":
            predicted_aqi = pred.get("predicted_value", 100)
            if predicted_aqi > 200:
                recommendations.append({
                    "action": f"Issue health advisory for {ward_name} — AQI expected to reach {predicted_aqi}",
                    "priority": "high",
                    "department": "Health Department",
                    "rationale": "AQI above 200 is unhealthy for sensitive groups",
                })
                recommendations.append({
                    "action": f"Increase water sprinkling on major roads in {ward_name}",
                    "priority": "medium",
                    "department": "Municipality",
                    "rationale": "Dust suppression can reduce local PM10 levels",
                })

    return recommendations
