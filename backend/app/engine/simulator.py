"""
What-If Simulator — The killer feature.
Allows users to change parameters and see cascading effects across the city.
"""
import json
from sqlalchemy.orm import Session
from app.models.ward import WardProfile
from app.models.infrastructure import Infrastructure
from app.models.simulation import SimulationHistory
from app.services.gemini_service import run_simulation_analysis


async def run_simulation(params: dict, db: Session, user_id: str = None) -> dict:
    """
    Run a what-if simulation.
    
    Parameters:
    - rainfall_mm: simulated rainfall
    - temperature: simulated temperature
    - aqi_level: simulated AQI
    - road_closure: which road to simulate closing
    - population_change_pct: population surge/decrease
    - infrastructure_offline: list of infrastructure IDs to take offline
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

    # Calculate local risk per ward (rule-based backup)
    ward_risks = []
    rainfall = params.get("rainfall_mm", 50)
    for ward in wards:
        flood_prob = min(1.0, rainfall / (ward.drainage_capacity * 2 + 1))

        # Apply population change
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

    # Merge rule-based and AI results
    final_result = {
        "scenario_name": f"Simulation — Rainfall {rainfall}mm",
        "input_parameters": params,
        "ward_level_risks": ward_risks,
        "flood_risk": sim_result.get("flood_risk", {}),
        "traffic_impact": sim_result.get("traffic_impact", {}),
        "health_impact": sim_result.get("health_impact", {}),
        "affected_population": sim_result.get("affected_population", sum(w["affected_population"] for w in ward_risks)),
        "risk_score": sim_result.get("risk_score", min(100, rainfall / 2)),
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
