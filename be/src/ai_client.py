import json
import os
from typing import Any, Dict, List

import httpx
from dotenv import load_dotenv
from models import Conversation, Message, MessageRequest
from openai import AzureOpenAI
from redis_config import redis_manager
from sqlalchemy.orm import Session

load_dotenv()


if not os.getenv("OPENAI_HOST") or not os.getenv("OPENAI_KEY"):
    raise ValueError("Missing config for OpenAI.")

openai_host = os.getenv("OPENAI_HOST")
openai_key = os.getenv("OPENAI_KEY")

if not openai_host or not openai_key:
    raise ValueError("Missing required OpenAI configuration")

client = AzureOpenAI(
    api_version="2025-04-01-preview",
    azure_endpoint=openai_host,
    api_key=openai_key,
    http_client=httpx.Client(verify=False),
)


system_prompt_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "prompts", "sys_prompt.txt")
)


def load_system_prompt() -> str:
    """Load the system prompt with fallback handling."""
    try:
        # Try to load the main system prompt
        with open(system_prompt_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                return content
    except (FileNotFoundError, IOError, UnicodeDecodeError) as e:
        print(f"Warning: Could not load main system prompt: {e}")

    # Fallback
    return """
You are a professional AI career assistant.
Help users refine their CVs by asking specific questions about their experience, skills, and career goals.
Always respond in JSON format with the structure:

{
    "extracted_questions": "Your question here",
    "examples": ["Example 1", "Example 2"],
    "display_question": "Formatted question with examples",
    "summary": null
}
"""


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

        # Initialize with system prompt using the improved loading function
        system_prompt = load_system_prompt()

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


async def ask_AI(
    conversation_id: str, item: MessageRequest, db: Session
) -> Dict[str, Any]:
    """Send a message to the Azure OpenAI and return the response."""

    # Check rate limiting
    if not await redis_manager.set_rate_limit(conversation_id, 10, 60):
        return {"error": "Rate limit exceeded. Please try again later."}

    try:
        # Get conversation messages
        messages = await get_conversation_messages(conversation_id, db)
        messages.append({"role": "user", "content": item.message})

        # Ensure we have the required environment variables
        model = os.getenv("OPENAI_MODEL")
        if not model:
            return {"error": "OpenAI model not configured"}

        # Make the API call with improved parameters
        response = client.chat.completions.create(
            model=model,
            messages=messages,  # type: ignore
            max_tokens=1500,
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        rawData = content.strip() if content is not None else ""

        if not rawData:
            return {"error": "Empty response from AI"}

        # Parse and validate JSON response
        try:
            data = json.loads(rawData)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON parsing error: {str(e)}, Raw response: {rawData}")
            data = {
                "extracted_questions": "I apologize, but I had trouble formatting my response. Could you please rephrase your last message?",
                "examples": None,
                "display_question": "I apologize, but I had trouble formatting my response. Could you please rephrase your last message?",
                "summary": None,
            }
        finally:
            # Save the raw response even if it's not valid JSON
            await save_message_to_db(conversation_id, "user", item.message, db)
            await save_message_to_db(conversation_id, "assistant", rawData, db)
            # Update cache with new messages
            messages.append({"role": "assistant", "content": rawData})
            await redis_manager.set_conversation_cache(conversation_id, messages)

        return data

    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        return {"error": f"Failed to get AI response: {str(e)}"}


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
