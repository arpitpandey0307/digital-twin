import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Enum as SQLEnum
from app.database import Base


class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(
        SQLEnum("hospital", "school", "shelter", "pump_station", "fire_station",
                "drainage", "police_station", "power_station", name="infra_type"),
        nullable=False,
    )
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    ward = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)
    status = Column(
        SQLEnum("operational", "maintenance", "closed", name="infra_status"),
        default="operational",
    )
    metadata_json = Column(Text, nullable=True)  # JSON string for extra data
    created_at = Column(DateTime, default=datetime.utcnow)
