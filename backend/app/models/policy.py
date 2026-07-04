import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum
from app.database import Base


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String, nullable=True)
    status = Column(
        SQLEnum("active", "draft", "archived", name="policy_status"),
        default="active",
    )
    rules = Column(Text, nullable=True)  # JSON string
    effective_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
