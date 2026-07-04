import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward = Column(String, nullable=True, index=True)
    prediction_type = Column(
        SQLEnum("flood", "traffic", "aqi", "disease", "energy", "waste",
                name="prediction_type"),
        nullable=False,
    )
    probability = Column(Float, nullable=False)
    impact = Column(
        SQLEnum("low", "medium", "high", "critical", name="impact_level"),
        default="medium",
    )
    description = Column(Text, nullable=True)
    factors = Column(Text, nullable=True)  # JSON string
    predicted_for = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    model_version = Column(String, default="v1.0")

    # Relationships
    recommendations = relationship("Recommendation", back_populates="prediction")
    alerts = relationship("Alert", back_populates="prediction")
