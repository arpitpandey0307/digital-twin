"""
Agent 3 — Vision AI
Analyzes citizen-uploaded images using Gemini Vision.
"""
from app.services.gemini_service import analyze_image


async def process_complaint_image(image_data: bytes, description: str = "") -> dict:
    """Process a citizen-uploaded image and return structured analysis."""
    result = await analyze_image(image_data, description)
    return result
