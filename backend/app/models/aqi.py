import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.database import Base


class AQIData(Base):
    __tablename__ = "aqi_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward = Column(String, nullable=True, index=True)
    aqi = Column(Integer, nullable=True)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, default="aqicn")
