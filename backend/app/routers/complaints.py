"""
Complaints Router — CRUD for citizen complaints + AI analysis.
"""
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintResponse, ComplaintUpdate
from app.services.gemini_service import analyze_complaint_text, analyze_image

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])


@router.post("", response_model=ComplaintResponse)
async def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
):
    """Submit a new complaint with AI analysis."""
    # Use Gemini to analyze and classify the complaint
    ai_result = await analyze_complaint_text(complaint.description)

    new_complaint = Complaint(
        user_id="system",  # In production, get from JWT
        category=ai_result.get("category", complaint.category or "other"),
        description=complaint.description,
        image_url=complaint.image_url,
        ai_analysis=json.dumps(ai_result),
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        ward=ai_result.get("ward") or complaint.ward,
        severity=ai_result.get("severity", "medium"),
        status="submitted",
        assigned_department=ai_result.get("department", "Municipality"),
        ai_confidence=ai_result.get("confidence", 0.5),
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return ComplaintResponse.model_validate(new_complaint)


@router.post("/analyze-image")
async def analyze_complaint_image(
    file: UploadFile = File(...),
    description: str = Form(""),
):
    """Upload an image for AI analysis (Gemini Vision)."""
    image_data = await file.read()
    result = await analyze_image(image_data, description)
    return result


@router.get("")
async def list_complaints(
    ward: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List complaints with optional filters."""
    query = db.query(Complaint)
    if ward:
        query = query.filter(Complaint.ward == ward)
    if category:
        query = query.filter(Complaint.category == category)
    if status:
        query = query.filter(Complaint.status == status)
    if severity:
        query = query.filter(Complaint.severity == severity)

    complaints = query.order_by(Complaint.created_at.desc()).limit(limit).all()
    return [ComplaintResponse.model_validate(c) for c in complaints]


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    """Get a specific complaint by ID."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return ComplaintResponse.model_validate(complaint)


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: str,
    update: ComplaintUpdate,
    db: Session = Depends(get_db),
):
    """Update complaint status/assignment (for officials)."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if update.status:
        complaint.status = update.status
        if update.status == "resolved":
            complaint.resolved_at = datetime.utcnow()
    if update.assigned_department:
        complaint.assigned_department = update.assigned_department
    if update.severity:
        complaint.severity = update.severity

    db.commit()
    db.refresh(complaint)
    return ComplaintResponse.model_validate(complaint)
