import json
import os
from typing import Any, Dict, List

import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models import Conversation, Message
from main import Item
from redis_config import redis_manager
from openai import AzureOpenAI


load_dotenv()


if not os.getenv("OPENAI_HOST") or not os.getenv("OPENAI_KEY"):
    raise ValueError("Missing config for OpenAI.")

client = AzureOpenAI(
    api_version="2025-04-01-preview",
    azure_endpoint=os.getenv("OPENAI_HOST"),
    api_key=os.getenv("OPENAI_KEY"),
    http_client=httpx.Client(verify=False),
)


system_prompt_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "prompts", "sys_prompt.txt")
)


async def get_conversation_messages(
    conversation_id: str, db: Session
) -> List[Dict[str, str]]:
    """Get conversation messages from cache or database."""

    # Try to get from Redis cache first
    cached_messages = await redis_manager.get_conversation_cache(conversation_id)
    if cached_messages:
        return cached_messages

    # If not in cache, get from database
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )

    if not conversation:
        # Create new conversation
        conversation = Conversation()
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        # Initialize with system prompt
        system_prompt = open("sys_prompt.txt", "r").read()
        system_message = Message(
            conversation_id=conversation.id, role="system", content=system_prompt
        )
        db.add(system_message)
        db.commit()

        messages = [{"role": "system", "content": system_prompt}]
    else:
        # Get messages from database
        db_messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .all()
        )

        messages = [
            {"role": str(msg.role), "content": str(msg.content)} for msg in db_messages
        ]

    # Cache the messages
    await redis_manager.set_conversation_cache(conversation_id, messages)

    return messages


async def save_message_to_db(
    conversation_id: str, role: str, content: str, db: Session
):
    """Save a message to the database."""
    message = Message(conversation_id=conversation_id, role=role, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)

    return message


async def ask_AI(conversation_id: str, item: Item, db: Session) -> Dict[str, Any]:
    """Send a message to the Azure OpenAI and return the response."""

    # Check rate limiting
    if not await redis_manager.set_rate_limit(conversation_id, 10, 60):
        return {"error": "Rate limit exceeded. Please try again later."}

    try:
        # Get conversation messages
        messages = await get_conversation_messages(conversation_id, db)
        messages.append({"role": "user", "content": item.message})

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL"),
            messages=messages,
            max_tokens=1000,
        )

        content = response.choices[0].message.content
        rawData = content.strip() if content is not None else ""

        # Save new messages to database and cache
        messages.append({"role": "assistant", "content": rawData})
        await save_message_to_db(conversation_id, "user", item.message, db)
        await save_message_to_db(conversation_id, "assistant", rawData, db)
        await redis_manager.set_conversation_cache(conversation_id, messages)

        try:
            data = json.loads(rawData)
            return data
        except json.JSONDecodeError:
            return {"response": rawData}
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return {"error": "Failed to get AI response"}


async def get_conversation_history(
    conversation_id: str, db: Session
) -> List[Dict[str, Any]]:
    """Get conversation history from database."""
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )

    return [
        {
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
