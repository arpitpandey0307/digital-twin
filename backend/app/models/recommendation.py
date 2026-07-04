import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String, ForeignKey("predictions.id"), nullable=True)
    action = Column(Text, nullable=False)
    priority = Column(
        SQLEnum("low", "medium", "high", "urgent", name="rec_priority"),
        default="medium",
    )
    status = Column(
        SQLEnum("pending", "approved", "executed", "dismissed", name="rec_status"),
        default="pending",
    )
    assigned_department = Column(String, nullable=True)
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

    # Relationships
    prediction = relationship("Prediction", back_populates="recommendations")
