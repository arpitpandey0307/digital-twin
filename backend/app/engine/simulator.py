"""
What-If Simulator — The killer feature.
8-stage cascading chain simulation + crisis mode.
Rain → Flood → Road Closure → Traffic → Ambulance Delay → Hospital Overload → Economic Loss → Citizen Satisfaction
"""
import json
import random
from sqlalchemy.orm import Session
from app.models.ward import WardProfile
from app.models.infrastructure import Infrastructure
from app.models.simulation import SimulationHistory
from app.services.gemini_service import run_simulation_analysis


def _cascading_chain(params: dict, wards: list, infra: list) -> list[dict]:
    """
    Simulate the 8-stage cascading event chain.
    Each stage feeds into the next — this is the real Digital Twin.
    """
    rainfall = params.get("rainfall_mm", 50)
    temp = params.get("temperature", 30)
    aqi = params.get("aqi_level", 100)
    pop_change = params.get("population_change_pct", 0)
    road_closure = params.get("road_closure", "")

    chain = []

    # Stage 1: Rain / Weather Event
    rain_severity = min(1.0, rainfall / 200)
    chain.append({
        "stage": 1,
        "name": "Weather Event",
        "icon": "cloud-rain",
        "severity": rain_severity,
        "severity_label": "Extreme" if rain_severity > 0.8 else "Heavy" if rain_severity > 0.5 else "Moderate" if rain_severity > 0.25 else "Light",
        "description": f"{rainfall}mm rainfall with {temp}°C temperature",
        "metrics": [
            {"label": "Rainfall", "value": f"{rainfall}mm", "status": "critical" if rainfall > 150 else "warning" if rainfall > 50 else "ok"},
            {"label": "Temperature", "value": f"{temp}°C", "status": "critical" if temp > 42 else "warning" if temp > 38 else "ok"},
            {"label": "AQI Level", "value": str(aqi), "status": "critical" if aqi > 300 else "warning" if aqi > 150 else "ok"},
        ],
    })

    # Stage 2: Flooding
    avg_drainage = sum(w.drainage_capacity for w in wards) / max(len(wards), 1) if wards else 50
    flood_prob = min(1.0, rainfall / (avg_drainage * 2 + 1))
    flood_prob = min(1.0, flood_prob + rain_severity * 0.15)
    flooded_wards = [w for w in wards if rainfall / (w.drainage_capacity * 2 + 1) > 0.5]
    water_level = round(rainfall * 0.35, 1)

    chain.append({
        "stage": 2,
        "name": "Flooding",
        "icon": "droplets",
        "severity": flood_prob,
        "severity_label": "Critical" if flood_prob > 0.7 else "High" if flood_prob > 0.4 else "Moderate" if flood_prob > 0.2 else "Low",
        "description": f"{len(flooded_wards)} wards at flood risk, est. water level {water_level}cm",
        "metrics": [
            {"label": "Flood Probability", "value": f"{round(flood_prob*100)}%", "status": "critical" if flood_prob > 0.7 else "warning" if flood_prob > 0.4 else "ok"},
            {"label": "Wards Affected", "value": str(len(flooded_wards)), "status": "critical" if len(flooded_wards) > 4 else "warning" if len(flooded_wards) > 2 else "ok"},
            {"label": "Water Level", "value": f"{water_level}cm", "status": "critical" if water_level > 40 else "warning" if water_level > 15 else "ok"},
        ],
    })

    # Stage 3: Road Closures
    road_closures = max(0, int(flood_prob * 12 + (2 if road_closure else 0)))
    road_severity = min(1.0, road_closures / 10)
    chain.append({
        "stage": 3,
        "name": "Road Closures",
        "icon": "construction",
        "severity": road_severity,
        "severity_label": "Severe" if road_closures > 6 else "Moderate" if road_closures > 3 else "Minor",
        "description": f"{road_closures} roads impassable" + (f", including {road_closure}" if road_closure else ""),
        "metrics": [
            {"label": "Roads Closed", "value": str(road_closures), "status": "critical" if road_closures > 6 else "warning" if road_closures > 3 else "ok"},
            {"label": "Area Isolated", "value": f"{round(road_severity * 30)}%", "status": "critical" if road_severity > 0.6 else "warning" if road_severity > 0.3 else "ok"},
        ],
    })

    # Stage 4: Traffic Congestion
    congestion_pct = min(100, int(road_severity * 65 + rain_severity * 20 + (pop_change * 0.5)))
    avg_delay = round(congestion_pct * 0.4, 1)
    chain.append({
        "stage": 4,
        "name": "Traffic Congestion",
        "icon": "car",
        "severity": congestion_pct / 100,
        "severity_label": "Gridlock" if congestion_pct > 70 else "Heavy" if congestion_pct > 40 else "Moderate" if congestion_pct > 20 else "Normal",
        "description": f"{congestion_pct}% increase in congestion, avg delay {avg_delay} min",
        "metrics": [
            {"label": "Congestion Increase", "value": f"+{congestion_pct}%", "status": "critical" if congestion_pct > 60 else "warning" if congestion_pct > 30 else "ok"},
            {"label": "Avg Delay", "value": f"{avg_delay} min", "status": "critical" if avg_delay > 25 else "warning" if avg_delay > 10 else "ok"},
        ],
    })

    # Stage 5: Ambulance Delays
    amb_delay = round(avg_delay * 0.6 + flood_prob * 12, 1)
    amb_severity = min(1.0, amb_delay / 25)
    chain.append({
        "stage": 5,
        "name": "Ambulance Delays",
        "icon": "siren",
        "severity": amb_severity,
        "severity_label": "Critical" if amb_delay > 15 else "Dangerous" if amb_delay > 8 else "Minor",
        "description": f"+{amb_delay} min avg ambulance response time",
        "metrics": [
            {"label": "Extra Delay", "value": f"+{amb_delay} min", "status": "critical" if amb_delay > 15 else "warning" if amb_delay > 8 else "ok"},
            {"label": "Lives at Risk", "value": str(int(amb_delay * 3)), "status": "critical" if amb_delay > 15 else "warning" if amb_delay > 8 else "ok"},
        ],
    })

    # Stage 6: Hospital Overload
    total_hospitals = sum(w.num_hospitals for w in wards) if wards else 10
    hospitals_at_risk = min(total_hospitals, max(0, int(flood_prob * total_hospitals * 0.6)))
    hosp_severity = hospitals_at_risk / max(total_hospitals, 1)
    chain.append({
        "stage": 6,
        "name": "Hospital Overload",
        "icon": "hospital",
        "severity": hosp_severity,
        "severity_label": "Critical" if hospitals_at_risk > total_hospitals * 0.5 else "Stressed" if hospitals_at_risk > 2 else "Normal",
        "description": f"{hospitals_at_risk}/{total_hospitals} hospitals facing access/overload issues",
        "metrics": [
            {"label": "Hospitals at Risk", "value": f"{hospitals_at_risk}/{total_hospitals}", "status": "critical" if hosp_severity > 0.5 else "warning" if hosp_severity > 0.2 else "ok"},
            {"label": "Bed Availability", "value": f"{max(10, 100 - int(hosp_severity * 80))}%", "status": "critical" if hosp_severity > 0.6 else "warning" if hosp_severity > 0.3 else "ok"},
        ],
    })

    # Stage 7: Economic Loss
    total_pop = sum(w.population for w in wards) if wards else 2000000
    adjusted_pop = int(total_pop * (1 + pop_change / 100))
    affected_pop = int(adjusted_pop * flood_prob * 0.3)
    economic_loss_cr = round(flood_prob * 45 + congestion_pct * 0.8 + hospitals_at_risk * 5 + random.uniform(0, 10), 1)
    econ_severity = min(1.0, economic_loss_cr / 80)
    chain.append({
        "stage": 7,
        "name": "Economic Loss",
        "icon": "indian-rupee",
        "severity": econ_severity,
        "severity_label": f"₹{economic_loss_cr} Cr",
        "description": f"Estimated ₹{economic_loss_cr} Cr loss, {affected_pop:,} people affected",
        "metrics": [
            {"label": "Economic Loss", "value": f"₹{economic_loss_cr} Cr", "status": "critical" if economic_loss_cr > 50 else "warning" if economic_loss_cr > 20 else "ok"},
            {"label": "People Affected", "value": f"{affected_pop:,}", "status": "critical" if affected_pop > 100000 else "warning" if affected_pop > 30000 else "ok"},
        ],
    })

    # Stage 8: Citizen Satisfaction
    satisfaction_drop = min(50, int(flood_prob * 25 + congestion_pct * 0.15 + amb_delay * 0.5))
    satisfaction = max(10, 85 - satisfaction_drop)
    sat_severity = 1 - (satisfaction / 100)
    chain.append({
        "stage": 8,
        "name": "Citizen Satisfaction",
        "icon": "users",
        "severity": sat_severity,
        "severity_label": f"{satisfaction}/100",
        "description": f"Projected satisfaction: {satisfaction}/100 (↓{satisfaction_drop} pts)",
        "metrics": [
            {"label": "Satisfaction Score", "value": f"{satisfaction}/100", "status": "critical" if satisfaction < 40 else "warning" if satisfaction < 60 else "ok"},
            {"label": "Drop", "value": f"-{satisfaction_drop} pts", "status": "critical" if satisfaction_drop > 25 else "warning" if satisfaction_drop > 10 else "ok"},
        ],
    })

    return chain


# Crisis presets
CRISIS_PRESETS = {
    "cyclone_cat5": {
        "name": "Cyclone — Category 5",
        "icon": "🌀",
        "description": "Catastrophic cyclone with 250+ km/h winds and extreme rainfall",
        "params": {"rainfall_mm": 450, "temperature": 22, "aqi_level": 60, "road_closure": "All Major Highways", "population_change_pct": -10},
    },
    "monsoon_extreme": {
        "name": "Monsoon — Worst Case",
        "icon": "🌊",
        "description": "300mm rainfall, widespread flooding, all wards affected",
        "params": {"rainfall_mm": 300, "temperature": 25, "aqi_level": 80, "population_change_pct": 0},
    },
    "heatwave": {
        "name": "Heatwave + Pollution",
        "icon": "🔥",
        "description": "Extreme heat (48°C) combined with severe air quality deterioration",
        "params": {"rainfall_mm": 0, "temperature": 48, "aqi_level": 450, "population_change_pct": 0},
    },
    "earthquake": {
        "name": "Earthquake — 6.5 Richter",
        "icon": "🏚️",
        "description": "Major earthquake causing infrastructure damage and road failures",
        "params": {"rainfall_mm": 0, "temperature": 30, "aqi_level": 200, "road_closure": "Multiple Structural Failures", "infrastructure_offline": ["Pump Station Alpha", "Pump Station Beta"], "population_change_pct": 5},
    },
    "pandemic_surge": {
        "name": "Pandemic — Hospital Surge",
        "icon": "🦠",
        "description": "Sudden pandemic wave overwhelming healthcare infrastructure",
        "params": {"rainfall_mm": 20, "temperature": 32, "aqi_level": 130, "population_change_pct": 15},
    },
}


async def run_simulation(params: dict, db: Session, user_id: str = None) -> dict:
    """
    Run a what-if simulation with 8-stage cascading chain.
    """
    # Gather city data for context
    wards = db.query(WardProfile).all()
    infra = db.query(Infrastructure).all()

    city_data = {
        "wards": [
            {
                "name": w.ward_name,
                "population": w.population,
                "hospitals": w.num_hospitals,
                "schools": w.num_schools,
                "shelters": w.num_shelters,
                "drainage_capacity": w.drainage_capacity,
            }
            for w in wards
        ],
        "infrastructure": [
            {
                "name": i.name,
                "type": i.type,
                "ward": i.ward,
                "capacity": i.capacity,
                "status": i.status,
            }
            for i in infra
        ],
        "total_population": sum(w.population for w in wards),
    }

    # Run through Gemini for intelligent analysis
    sim_result = await run_simulation_analysis(params, city_data)

    # Calculate cascading chain
    cascade_chain = _cascading_chain(params, wards, infra)

    # Calculate local risk per ward (rule-based)
    ward_risks = []
    rainfall = params.get("rainfall_mm", 50)
    for ward in wards:
        flood_prob = min(1.0, rainfall / (ward.drainage_capacity * 2 + 1))
        pop_change = params.get("population_change_pct", 0)
        adjusted_pop = int(ward.population * (1 + pop_change / 100))
        affected = int(adjusted_pop * flood_prob * 0.3)

        ward_risks.append({
            "ward": ward.ward_name,
            "flood_probability": round(flood_prob, 3),
            "affected_population": affected,
            "hospitals": ward.num_hospitals,
            "schools": ward.num_schools,
            "drainage_capacity": ward.drainage_capacity,
        })

    ward_risks.sort(key=lambda x: x["flood_probability"], reverse=True)

    # Overall risk from cascade
    overall_risk = round(sum(s["severity"] for s in cascade_chain) / len(cascade_chain) * 100, 1)

    # Merge rule-based and AI results
    final_result = {
        "scenario_name": f"Simulation — Rainfall {rainfall}mm",
        "input_parameters": params,
        "cascade_chain": cascade_chain,
        "ward_level_risks": ward_risks,
        "flood_risk": sim_result.get("flood_risk", {}),
        "traffic_impact": sim_result.get("traffic_impact", {}),
        "health_impact": sim_result.get("health_impact", {}),
        "affected_population": sim_result.get("affected_population", sum(w["affected_population"] for w in ward_risks)),
        "risk_score": overall_risk,
        "recommended_actions": sim_result.get("recommended_actions", []),
        "critical_warning": sim_result.get("critical_warning"),
    }

    # Save to history
    sim_history = SimulationHistory(
        user_id=user_id,
        scenario_name=final_result["scenario_name"],
        input_parameters=json.dumps(params),
        output_results=json.dumps(final_result, default=str),
    )
    db.add(sim_history)
    db.commit()

    return final_result
