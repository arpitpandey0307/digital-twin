"""
Agent 5 — Recommendation Engine
Rule-based + AI hybrid engine that generates actionable recommendations
with cost estimates, savings projections, and confidence scores.
"""
import random
from sqlalchemy.orm import Session
from app.models.prediction import Prediction
from app.models.infrastructure import Infrastructure
from app.models.ward import WardProfile


def generate_recommendations(predictions: list[dict], db: Session) -> list[dict]:
    """Generate actionable recommendations with budget impact analysis."""
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
                affected = pred.get("affected_population", 0)
                damage_without = int(affected * 1200 + random.randint(500000, 2000000))
                deploy_cost = int(len(pumps) * 85000 + 120000)
                savings = max(0, damage_without - deploy_cost)

                recommendations.append({
                    "action": f"Deploy {len(pumps)} pump stations in {ward_name} immediately",
                    "priority": "urgent",
                    "department": "Flood Control",
                    "rationale": f"Flood probability {round(pred['probability']*100)}% — drainage capacity at {ward.drainage_capacity if ward else 'unknown'}%",
                    "confidence": round(pred.get("confidence", 0.85), 2),
                    "cost_estimate": deploy_cost,
                    "without_action_cost": damage_without,
                    "savings": savings,
                    "impact_type": "flood",
                })
                if shelters:
                    evac_cost = int(shelters[0].capacity * 350)
                    recommendations.append({
                        "action": f"Open {shelters[0].name} (capacity: {shelters[0].capacity}) for evacuation",
                        "priority": "urgent",
                        "department": "Disaster Management",
                        "rationale": f"Estimated {pred.get('affected_population', 0):,} residents at risk",
                        "confidence": round(pred.get("confidence", 0.80), 2),
                        "cost_estimate": evac_cost,
                        "without_action_cost": int(affected * 2500),
                        "savings": max(0, int(affected * 2500) - evac_cost),
                        "impact_type": "flood",
                    })
                recommendations.append({
                    "action": f"Issue flood warning alert to all residents of {ward_name}",
                    "priority": "urgent",
                    "department": "Communications",
                    "rationale": "Early warning saves lives — 6 hour lead time recommended",
                    "confidence": 0.95,
                    "cost_estimate": 15000,
                    "without_action_cost": 500000,
                    "savings": 485000,
                    "impact_type": "flood",
                })
            elif pred["probability"] > 0.5:
                recommendations.append({
                    "action": f"Pre-position pumps near low-lying areas in {ward_name}",
                    "priority": "high",
                    "department": "Flood Control",
                    "rationale": f"Moderate flood risk ({round(pred['probability']*100)}%) detected",
                    "confidence": round(pred.get("confidence", 0.75), 2),
                    "cost_estimate": 45000,
                    "without_action_cost": 350000,
                    "savings": 305000,
                    "impact_type": "flood",
                })
                recommendations.append({
                    "action": f"Clear drainage channels in {ward_name}",
                    "priority": "high",
                    "department": "Municipality",
                    "rationale": "Preventive maintenance reduces flood impact",
                    "confidence": 0.88,
                    "cost_estimate": 25000,
                    "without_action_cost": 180000,
                    "savings": 155000,
                    "impact_type": "flood",
                })

        elif pred_type == "traffic":
            if pred["probability"] > 0.6:
                recommendations.append({
                    "action": f"Deploy traffic police at major junctions in {ward_name}",
                    "priority": "high",
                    "department": "Traffic Police",
                    "rationale": f"Heavy congestion expected ({round(pred['probability']*100)}% probability)",
                    "confidence": round(pred.get("confidence", 0.78), 2),
                    "cost_estimate": 35000,
                    "without_action_cost": 220000,
                    "savings": 185000,
                    "impact_type": "traffic",
                })
                if hospitals:
                    recommendations.append({
                        "action": f"Designate emergency vehicle corridors near {hospitals[0].name}",
                        "priority": "high",
                        "department": "Traffic Police",
                        "rationale": "Ensure ambulance access during congestion",
                        "confidence": 0.92,
                        "cost_estimate": 12000,
                        "without_action_cost": 800000,
                        "savings": 788000,
                        "impact_type": "traffic",
                    })

        elif pred_type == "aqi":
            predicted_aqi = pred.get("predicted_value", 100)
            if predicted_aqi > 200:
                recommendations.append({
                    "action": f"Issue health advisory for {ward_name} — AQI expected to reach {predicted_aqi}",
                    "priority": "high",
                    "department": "Health Department",
                    "rationale": "AQI above 200 is unhealthy for sensitive groups",
                    "confidence": round(pred.get("confidence", 0.72), 2),
                    "cost_estimate": 8000,
                    "without_action_cost": 350000,
                    "savings": 342000,
                    "impact_type": "aqi",
                })
                recommendations.append({
                    "action": f"Increase water sprinkling on major roads in {ward_name}",
                    "priority": "medium",
                    "department": "Municipality",
                    "rationale": "Dust suppression can reduce local PM10 levels",
                    "confidence": 0.68,
                    "cost_estimate": 18000,
                    "without_action_cost": 120000,
                    "savings": 102000,
                    "impact_type": "aqi",
                })

    return recommendations
