import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(
        SQLEnum("flooding", "garbage", "pothole", "streetlight", "noise",
                "parking", "road_damage", "water_supply", "sewage", "other",
                name="complaint_category"),
        nullable=False,
    )
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    ward = Column(String, nullable=True)
    severity = Column(
        SQLEnum("low", "medium", "high", "critical", name="severity_level"),
        default="medium",
    )
    status = Column(
        SQLEnum("submitted", "processing", "assigned", "in_progress", "resolved",
                name="complaint_status"),
        default="submitted",
    )
    assigned_department = Column(String, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="complaints")
