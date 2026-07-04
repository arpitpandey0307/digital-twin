import uuid
from sqlalchemy import Column, String, Integer, Float, Text
from app.database import Base


class WardProfile(Base):
    __tablename__ = "ward_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward_name = Column(String, unique=True, nullable=False, index=True)
    population = Column(Integer, default=0)
    area_sq_km = Column(Float, default=0.0)
    num_hospitals = Column(Integer, default=0)
    num_schools = Column(Integer, default=0)
    num_shelters = Column(Integer, default=0)
    drainage_capacity = Column(Float, default=0.0)
    demographic_data = Column(Text, nullable=True)  # JSON string
    center_lat = Column(Float, nullable=True)
    center_lng = Column(Float, nullable=True)
