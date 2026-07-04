from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ComplaintCreate(BaseModel):
    category: Optional[str] = None
    description: str
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ward: Optional[str] = None


class ComplaintResponse(BaseModel):
    id: str
    user_id: str
    category: str
    description: str
    image_url: Optional[str]
    ai_analysis: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    ward: Optional[str]
    severity: str
    status: str
    assigned_department: Optional[str]
    ai_confidence: Optional[float]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    assigned_department: Optional[str] = None
    severity: Optional[str] = None
