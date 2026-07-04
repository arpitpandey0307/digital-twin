"""
Chat Router — AI Chief Officer chat with RAG pipeline + action plans.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.reasoner import answer_question
from app.models.chat_history import AIChatHistory
from app.schemas.data import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Ask the AI Chief Officer a question — get answers + action plans."""
    result = await answer_question(request.question, db)

    # Save to chat history
    history = AIChatHistory(
        question=request.question,
        answer=result.get("answer", ""),
        context_used=str(result.get("context_used", [])),
    )
    db.add(history)
    db.commit()

    return {
        "question": request.question,
        "answer": result.get("answer", "No response available"),
        "context_used": result.get("context_used"),
        "suggestions": result.get("suggestions"),
        "action_plan": result.get("action_plan"),
    }


@router.get("/history")
async def get_chat_history(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent chat history."""
    chats = db.query(AIChatHistory).order_by(
        AIChatHistory.created_at.desc()
    ).limit(limit).all()

    return [
        {
            "id": c.id,
            "question": c.question,
            "answer": c.answer,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in chats
    ]


@router.get("/suggestions")
async def get_suggestions():
    """Get suggested questions — designed for the AI Chief Officer."""
    return {
        "suggestions": [
            "What should I do to prepare for tomorrow?",
            "Which ward needs the most attention right now?",
            "Deploy resources — where are the biggest risks?",
            "Generate an emergency action plan for a flood scenario",
            "What is the optimal resource allocation right now?",
            "Show me the cost-benefit of deploying pumps",
            "Why is flood risk high in Ward 4?",
            "Compare all wards and prioritize response",
        ]
    }
