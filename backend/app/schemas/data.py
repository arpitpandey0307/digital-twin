from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class WeatherResponse(BaseModel):
    id: str
    ward: Optional[str]
    temperature: Optional[float]
    humidity: Optional[float]
    rainfall_mm: float
    wind_speed: Optional[float]
    condition: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


class AQIResponse(BaseModel):
    id: str
    ward: Optional[str]
    aqi: Optional[int]
    pm25: Optional[float]
    pm10: Optional[float]
    no2: Optional[float]
    recorded_at: datetime

    class Config:
        from_attributes = True


class TrafficResponse(BaseModel):
    id: str
    ward: Optional[str]
    road_name: Optional[str]
    congestion_level: str
    travel_time_seconds: Optional[int]
    incidents_count: int
    recorded_at: datetime

    class Config:
        from_attributes = True


class PredictionResponse(BaseModel):
    id: str
    ward: Optional[str]
    prediction_type: str
    probability: float
    impact: str
    description: Optional[str]
    factors: Optional[str]
    predicted_for: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: str
    prediction_id: Optional[str]
    title: str
    message: str
    severity: str
    target_ward: Optional[str]
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    id: str
    prediction_id: Optional[str]
    action: str
    priority: str
    status: str
    assigned_department: Optional[str]
    rationale: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    question: str
    answer: str
    context_used: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None


class SimulationRequest(BaseModel):
    rainfall_mm: float = 50.0
    temperature: float = 30.0
    aqi_level: int = 100
    road_closure: Optional[str] = None
    population_change_pct: float = 0.0
    infrastructure_offline: Optional[List[str]] = None


class SimulationResponse(BaseModel):
    scenario_name: str
    input_parameters: Dict[str, Any]
    flood_risk: Dict[str, Any]
    traffic_impact: Dict[str, Any]
    health_impact: Dict[str, Any]
    affected_population: int
    recommended_actions: List[str]
    risk_score: float


class DashboardOverview(BaseModel):
    city_risk_score: float
    total_complaints: int
    active_complaints: int
    resolved_complaints: int
    active_alerts: int
    current_weather: Optional[Dict[str, Any]]
    current_aqi: Optional[Dict[str, Any]]
    flood_risk_by_ward: List[Dict[str, Any]]
    recent_alerts: List[AlertResponse]
    ai_insight: str
    complaint_stats: Dict[str, int]
    ward_summary: List[Dict[str, Any]]
