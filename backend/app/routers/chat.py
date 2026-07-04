"""
Chat Router — AI chat with RAG pipeline.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.reasoner import answer_question
from app.models.chat_history import AIChatHistory
from app.schemas.data import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Ask the AI assistant a question about the city."""
    result = await answer_question(request.question, db)

    # Save to chat history
    history = AIChatHistory(
        question=request.question,
        answer=result.get("answer", ""),
        context_used=str(result.get("context_used", [])),
    )
    db.add(history)
    db.commit()

    return ChatResponse(
        question=request.question,
        answer=result.get("answer", "No response available"),
        context_used=result.get("context_used"),
        suggestions=result.get("suggestions"),
    )


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
    """Get suggested questions."""
    return {
        "suggestions": [
            "What are the biggest risks tomorrow?",
            "Which ward needs the most attention right now?",
            "Show me complaint trends this month",
            "What should we do if rainfall doubles?",
            "Why is pollution increasing?",
            "What is the flood risk in Ward 4?",
            "Compare traffic across all wards",
            "Generate a summary of today's alerts",
        ]
    }
