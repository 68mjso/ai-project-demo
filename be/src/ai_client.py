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
        # Craft prompt
        prompt = f"""
{item.message}

If you need more information, ask the user specific questions.
Always push the user to provide as much specific information as possible.

Respond in JSON format with the following structure:
```json
{{
    "next_question": "Your question here",
    "examples": ["Example 1", "Example 2"],
    "summary": {{
        "skills": "summary of skills. Include specific technologies or methodologies if applicable.",
        "experience": "summary of work experience. Include specific roles or projects if applicable.",
        "education": "summary of education. Include degrees or certifications if applicable.",
        "career_goals": "summary of career goals. Include specific aspirations or industries if applicable.",
        "matching": "summary of how the user's profile matches the wanted job and position. Include specific skills or experiences that align with the requirements.",
        "level": "summary of the user's level of expertise. Include specific levels such as junior, mid-level, or senior."
        "wanted_level": "summary of the user's level of expertise in the field of the wanted job and position. Include specific levels such as junior, mid-level, or senior."
    }},
    "completed": bool,
}}

With the following rules:
- Always respond in JSON format.
- If you cannot answer, return a JSON object with an error message.
- Set the "completed" field to `true` when you have enough information to conclude the conversation.
```
        """
        # Get conversation messages
        messages = await get_conversation_messages(conversation_id, db)
        messages.append({"role": "user", "content": prompt})

        assistant_responses = [
            message for message in messages if message["role"] == "assistant"
        ]
        answers = [message for message in messages if message["role"] == "user"]
        if len(answers) > 10:
            # If the conversation has more than 5 user messages, summarize the conversation
            job_response = await search_job(assistant_responses[-1].get("summary", {}))
            await save_message_to_db(
                conversation_id,
                "assistant",
                json.dumps(job_response),
                db,
            )
            messages.append({"role": "assistant", "content": json.dumps(job_response)})
            return job_response

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
                "next_question": "I apologize, but I had trouble formatting my response. Could you please rephrase your last message?",
                "examples": [],
                "summary": {},
                "completed": False,
            }

        await save_message_to_db(conversation_id, "user", item.message, db)

        if not data["completed"]:
            # Save the assistant's response to the database if the conversation is not completed
            await save_message_to_db(conversation_id, "assistant", rawData, db)
            messages.append({"role": "assistant", "content": rawData})
        else:
            # If the conversation is completed, search for jobs
            job_response = await search_job(data.get("summary", {}))
            await save_message_to_db(
                conversation_id,
                "assistant",
                json.dumps(job_response),
                db,
            )
            messages.append({"role": "assistant", "content": json.dumps(job_response)})
            data = job_response

        # Update cache with new messages
        await redis_manager.set_conversation_cache(conversation_id, messages)

        return data

    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        return {"error": f"Failed to get AI response: {str(e)}"}


async def search_job(summary: Dict[str, str]):
    """Search for jobs using the OpenAI API."""

    system_prompt = """
You are a professional headhunter focusing on finding job opportunities for users.
Help users find job opportunities based on their profile and career aspirations.
The job search should be based on the provided profile summary.
The position must be actively hiring at the moment.

DO NOT make up job postings. If you cannot find any jobs, return an empty list.

Always respond in JSON format with the structure:
```json
{
    "jobs_list": [
        {
            "title": "Job Title",
            "company": "Company Name",
            "location": "Job Location",
            "description": "Job Description",
            "url": "Link to job posting"
        }
    ],
    "message": "Your message here"
}
"""

    prompt = f"""
I'm looking for job opportunities based on the following profile summary:
```{json.dumps(summary)}```

Please provide a list of actively hiring jobs that match this profile.
Prefer jobs that is uploaded in the last 30 days.
"""

    # Ensure we have the required environment variables
    model = os.getenv("OPENAI_MODEL")
    if not model:
        return {"error": "OpenAI model not configured"}

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        max_tokens=1500,
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    rawData = content.strip() if content is not None else ""

    try:
        data = json.loads(rawData)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"JSON parsing error: {str(e)}, Raw response: {rawData}")
        data = {
            "jobs_list": [],
            "message": "I apologize, but I had trouble formatting my response. Could you please rephrase your last message?",
        }

    print(f"Search job response: {data}")
    return data


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
