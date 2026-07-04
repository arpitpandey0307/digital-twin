"""
Gemini AI Service -- wraps Google's Gemini 2.5 Flash API for all AI operations.
Used by all agents (Vision, Reasoner, Analyst, etc.)
"""
import json
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()

# Configure the Gemini API
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

DEFAULT_MODEL = "gemini-2.5-flash"


def _generate(prompt, model_name=None):
    """Generate content using the Gemini model. Returns response text."""
    model = genai.GenerativeModel(model_name or DEFAULT_MODEL)
    response = model.generate_content(prompt)
    return response.text


async def analyze_complaint_text(description: str) -> dict:
    """Use Gemini to classify and enrich a complaint from text."""
    prompt = f"""You are a city complaint analysis AI. Analyze this citizen complaint and return a JSON response.

Complaint: "{description}"

Return ONLY valid JSON (no markdown, no code blocks) with these fields:
{{
    "category": "one of: flooding, garbage, pothole, streetlight, noise, parking, road_damage, water_supply, sewage, other",
    "severity": "one of: low, medium, high, critical",
    "ward": "best guess ward name or null",
    "department": "which department should handle this (e.g., Municipality, Water Board, Electricity Board, Traffic Police, Sanitation)",
    "confidence": 0.0 to 1.0,
    "summary": "one-line AI summary of the issue",
    "estimated_resolution_days": number
}}"""

    try:
        text = _generate(prompt).strip()
        # Clean potential markdown code blocks
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        return {
            "category": "other",
            "severity": "medium",
            "ward": None,
            "department": "Municipality",
            "confidence": 0.5,
            "summary": description[:100],
            "estimated_resolution_days": 7,
            "error": str(e),
        }


async def analyze_image(image_data: bytes, description: str = "") -> dict:
    """Use Gemini Vision to analyze a citizen-uploaded image."""
    prompt = f"""You are a city infrastructure AI inspector. Analyze this image uploaded by a citizen.
Additional context from citizen: "{description}"

Identify any issues visible in the image and return ONLY valid JSON:
{{
    "category": "one of: flooding, garbage, pothole, streetlight, noise, parking, road_damage, water_supply, sewage, other",
    "objects_detected": ["list of objects/issues found"],
    "severity": "one of: low, medium, high, critical",
    "estimated_size": "estimated size of the issue if applicable",
    "danger_level": "one of: none, low, moderate, high, extreme",
    "description": "detailed description of what the AI sees",
    "recommended_action": "what should be done"
}}"""

    try:
        import PIL.Image
        import io
        image = PIL.Image.open(io.BytesIO(image_data))
        text = _generate([prompt, image]).strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        return {
            "category": "other",
            "objects_detected": [],
            "severity": "medium",
            "danger_level": "low",
            "description": f"Image analysis unavailable: {str(e)}",
            "recommended_action": "Manual inspection required",
        }


async def chat_with_context(question: str, context: list[dict]) -> dict:
    """RAG-powered chat -- Gemini answers using city data context."""

    context_text = "\n".join([
        f"- {item.get('type', 'data')}: {json.dumps(item.get('data', item), default=str)}"
        for item in context[:10]  # Limit context size
    ])

    prompt = f"""You are an AI assistant for city administrators (Digital Twin Decision Intelligence).
You have access to the following real-time city data:

{context_text}

User Question: "{question}"

Provide a clear, actionable answer based on the data above. Include:
1. Direct answer to the question
2. Supporting data/evidence from the context
3. Recommended actions if applicable
4. Risk assessment if relevant

Be concise but thorough. Use specific numbers and ward names from the data."""

    try:
        answer = _generate(prompt)
        return {
            "answer": answer,
            "context_used": [item.get('type', 'unknown') for item in context[:10]],
            "suggestions": [
                "What are the biggest risks tomorrow?",
                "Which ward needs the most attention?",
                "Show me complaint trends this month",
                "What should we do if rainfall doubles?",
            ],
        }
    except Exception as e:
        return {
            "answer": f"I apologize, but I'm unable to process your question right now. Error: {str(e)}",
            "context_used": [],
            "suggestions": [],
        }


async def generate_daily_insight(data: dict) -> str:
    """Generate today's AI insight for the dashboard."""
    prompt = f"""You are a city intelligence AI. Based on today's data, generate a brief (2-3 sentence) 
insight about the city's current state and biggest risk.

Data:
- Active complaints: {data.get('active_complaints', 0)}
- Weather: {json.dumps(data.get('weather', {}), default=str)}
- AQI: {json.dumps(data.get('aqi', {}), default=str)}
- Active alerts: {data.get('active_alerts', 0)}
- Top complaint categories: {json.dumps(data.get('top_categories', {}), default=str)}

Be specific with ward names and numbers. Start with the most critical finding."""

    try:
        text = _generate(prompt)
        return text.strip()
    except Exception:
        return "System is collecting city data. Insights will be available once sufficient data is gathered."


async def run_simulation_analysis(params: dict, city_data: dict) -> dict:
    """Use Gemini to analyze what-if simulation results."""
    prompt = f"""You are a city simulation AI. A city administrator wants to know what happens if conditions change.

Current City Data:
{json.dumps(city_data, default=str)}

Scenario Parameters Changed:
{json.dumps(params, default=str)}

Analyze the impact and return ONLY valid JSON:
{{
    "flood_risk": {{
        "overall_probability": 0.0 to 1.0,
        "high_risk_wards": ["list of ward names most at risk"],
        "affected_zones": number of zones affected,
        "water_level_estimate_cm": estimated water level
    }},
    "traffic_impact": {{
        "congestion_increase_pct": percentage increase,
        "affected_roads": number of roads affected,
        "avg_delay_minutes": average additional delay,
        "reroute_needed": true/false
    }},
    "health_impact": {{
        "hospitals_at_risk": number,
        "ambulance_delay_minutes": additional delay,
        "population_needing_shelter": number
    }},
    "affected_population": total number of people affected,
    "risk_score": 0 to 100 overall risk score,
    "recommended_actions": ["list of 3-5 specific actions to take"],
    "critical_warning": "one-line critical warning if applicable or null"
}}"""

    try:
        text = _generate(prompt).strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        # Return reasonable defaults based on parameters
        rainfall = params.get("rainfall_mm", 50)
        risk = min(rainfall / 200.0, 1.0) * 100
        return {
            "flood_risk": {
                "overall_probability": min(rainfall / 200.0, 1.0),
                "high_risk_wards": ["Ward 4 - Kurla", "Ward 12 - Kandivali"],
                "affected_zones": int(risk / 10),
                "water_level_estimate_cm": rainfall * 0.3,
            },
            "traffic_impact": {
                "congestion_increase_pct": risk * 0.5,
                "affected_roads": int(risk / 5),
                "avg_delay_minutes": risk * 0.2,
                "reroute_needed": risk > 50,
            },
            "health_impact": {
                "hospitals_at_risk": max(0, int(risk / 25)),
                "ambulance_delay_minutes": risk * 0.15,
                "population_needing_shelter": int(risk * 50),
            },
            "affected_population": int(risk * 200),
            "risk_score": risk,
            "recommended_actions": [
                "Monitor weather updates closely",
                "Alert emergency services",
                "Prepare evacuation routes",
            ],
            "critical_warning": "High rainfall scenario detected" if risk > 60 else None,
            "error": str(e),
        }
