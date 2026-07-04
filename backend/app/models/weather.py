import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.database import Base


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward = Column(String, nullable=True, index=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall_mm = Column(Float, default=0.0)
    wind_speed = Column(Float, nullable=True)
    condition = Column(String, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, default="openweathermap")
