from datetime import datetime
from typing import cast

import uvicorn
from ai_client import ask_AI, get_conversation_history
from database import Base, engine, get_db
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Conversation, ConversationResponse, MessageRequest, MessageResponse
from redis_config import redis_manager
from sqlalchemy import text
from sqlalchemy.orm import Session

load_dotenv()


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Chat API with PostgreSQL and Redis",
    description="A FastAPI application with PostgreSQL for persistence and Redis for caching",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    try:
        # Test Redis connection
        redis_manager.client.ping()
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"

    return {
        "status": (
            "healthy"
            if db_status == "healthy" and redis_status == "healthy"
            else "unhealthy"
        ),
        "database": db_status,
        "redis": redis_status,
    }


# Create new conversation
@app.post("/conversations", response_model=ConversationResponse)
async def create_conversation(db: Session = Depends(get_db)):
    """Create a new conversation"""
    conversation = Conversation()
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return ConversationResponse(
        id=str(conversation.id),
        created_at=cast(datetime, conversation.created_at),
    )


# Get conversation history
@app.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, db: Session = Depends(get_db)):
    """Get all messages for a conversation"""
    try:
        messages = await get_conversation_history(conversation_id, db)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Post message with conversation ID
@app.post("/conversations/{conversation_id}/messages")
async def chat_message(
    conversation_id: str, body: MessageRequest, db: Session = Depends(get_db)
) -> MessageResponse:
    """Send a message to a specific conversation"""
    try:
        response = await ask_AI(conversation_id, body, db)

        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"])

        # Extract the question to display
        content = (
            response.get("next_question")
            or response.get("message")
            or "I apologize, but I couldn't generate a proper response. Could you please try rephrasing your message?"
        )
        examples = response.get("examples", [])
        jobs_list = response.get("jobs_list", [])

        if not isinstance(content, str):
            content = str(content)

        return MessageResponse(
            conversation_id=conversation_id,
            role="assistant",
            content={
                "next_question": content,
                "examples": examples,
                "jobs_list": jobs_list,
            },
            created_at=datetime.utcnow(),
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in chat_message: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An unexpected error occurred. Please try again."
        )


# Get all conversations
@app.get("/conversations")
async def get_conversations(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Get all conversations with pagination"""
    conversations = db.query(Conversation).offset(skip).limit(limit).all()

    return {
        "conversations": [
            ConversationResponse(
                id=str(conv.id), created_at=cast(datetime, conv.created_at)
            )
            for conv in conversations
        ]
    }


# Delete conversation
@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Delete a conversation and all its messages"""
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Delete from cache
    await redis_manager.delete_conversation_cache(conversation_id)

    # Delete from database
    db.delete(conversation)
    db.commit()

    return {"message": "Conversation deleted successfully"}


# Root endpoint for checking if the server is running
@app.get("/")
async def root():
    return {
        "message": "AI Chat API is running",
        "endpoints": {
            "health": "/health",
            "create_conversation": "POST /conversations",
            "send_message": "POST /conversations/{conversation_id}/messages",
            "get_messages": "GET /conversations/{conversation_id}/messages",
            "get_conversations": "GET /conversations",
            "delete_conversation": "DELETE /conversations/{conversation_id}",
            "legacy_api": "POST /api (requires X-Request-ID header)",
            "legacy_id": "GET /id",
        },
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
