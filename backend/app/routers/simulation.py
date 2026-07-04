"""
Simulation Router — What-if scenario endpoint.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.engine.simulator import run_simulation
from app.models.simulation import SimulationHistory
from app.schemas.data import SimulationRequest

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])


@router.post("/run")
async def run_what_if(request: SimulationRequest, db: Session = Depends(get_db)):
    """Run a what-if simulation with custom parameters."""
    params = {
        "rainfall_mm": request.rainfall_mm,
        "temperature": request.temperature,
        "aqi_level": request.aqi_level,
        "road_closure": request.road_closure,
        "population_change_pct": request.population_change_pct,
        "infrastructure_offline": request.infrastructure_offline or [],
    }
    result = await run_simulation(params, db)
    return result


@router.get("/history")
async def get_simulation_history(limit: int = 10, db: Session = Depends(get_db)):
    """Get past simulation results."""
    sims = db.query(SimulationHistory).order_by(
        SimulationHistory.created_at.desc()
    ).limit(limit).all()

    import json
    return [
        {
            "id": s.id,
            "scenario_name": s.scenario_name,
            "input_parameters": json.loads(s.input_parameters) if s.input_parameters else {},
            "output_results": json.loads(s.output_results) if s.output_results else {},
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in sims
    ]


@router.get("/presets")
async def get_presets():
    """Get pre-built simulation scenarios."""
    return {
        "presets": [
            {
                "name": "Monsoon Worst Case",
                "description": "Simulate extreme monsoon conditions with 300mm rainfall",
                "params": {"rainfall_mm": 300, "temperature": 25, "aqi_level": 80},
            },
            {
                "name": "Heatwave + Pollution",
                "description": "Simulate heatwave with poor air quality",
                "params": {"rainfall_mm": 0, "temperature": 45, "aqi_level": 400},
            },
            {
                "name": "Major Road Closure",
                "description": "Simulate closing Western Express Highway",
                "params": {"rainfall_mm": 20, "road_closure": "Western Express Highway"},
            },
            {
                "name": "Population Surge (Festival)",
                "description": "Simulate 30% population increase during a festival",
                "params": {"rainfall_mm": 10, "population_change_pct": 30},
            },
            {
                "name": "Infrastructure Failure",
                "description": "Simulate pump station failure during moderate rain",
                "params": {"rainfall_mm": 150, "infrastructure_offline": ["Pump Station Alpha"]},
            },
        ]
    }
