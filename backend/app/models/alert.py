import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String, ForeignKey("predictions.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(
        SQLEnum("info", "warning", "critical", "emergency", name="alert_severity"),
        default="warning",
    )
    target_ward = Column(String, nullable=True)
    status = Column(
        SQLEnum("active", "acknowledged", "resolved", name="alert_status"),
        default="active",
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    prediction = relationship("Prediction", back_populates="alerts")
