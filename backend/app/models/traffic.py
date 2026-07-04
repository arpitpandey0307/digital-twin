import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
from app.database import Base


class TrafficData(Base):
    __tablename__ = "traffic_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward = Column(String, nullable=True, index=True)
    road_name = Column(String, nullable=True)
    congestion_level = Column(
        SQLEnum("free", "moderate", "heavy", "gridlock", name="congestion_level"),
        default="free",
    )
    travel_time_seconds = Column(Integer, nullable=True)
    incidents_count = Column(Integer, default=0)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, default="tomtom")
