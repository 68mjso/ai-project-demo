import os
import redis
import json
from dotenv import load_dotenv


load_dotenv()


class RedisManager:
    def __init__(self):
        REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.client = redis.from_url(REDIS_URL, decode_responses=True)
        self.prefix = "conversation:"

    async def set_conversation_cache(
        self, conversation_id: str, messages: list, ttl: int = 3600
    ):
        """Cache conversation messages with TTL (default 1 hour)"""
        try:
            self.client.setex(
                f"{self.prefix}:{conversation_id}", ttl, json.dumps(messages)
            )
            return True
        except Exception as e:
            print(f"Error caching conversation: {e}")
            return False

    async def get_conversation_cache(self, conversation_id: str):
        """Get cached conversation messages"""
        try:
            cached_data = self.client.get(f"{self.prefix}:{conversation_id}")
            if isinstance(cached_data, (str, bytes, bytearray)) and cached_data:
                return json.loads(cached_data)
            return None
        except Exception as e:
            print(f"Error retrieving cached conversation: {e}")
            return None

    async def delete_conversation_cache(self, conversation_id: str):
        """Delete cached conversation"""
        try:
            self.client.delete(f"{self.prefix}:{conversation_id}")
            return True
        except Exception as e:
            print(f"Error deleting cached conversation: {e}")
            return False

    async def set_rate_limit(self, conversation_id: str, limit: int, window: int):
        """Set rate limiting"""
        try:
            key = f"rate_limit:{conversation_id}"
            current = self.client.get(key)
            if current is None:
                self.client.setex(key, window, 1)
                return True
            elif (
                isinstance(current, (str, bytes))
                and current.isdigit()
                and int(current) < limit
            ):
                self.client.incr(key)
                return True
            elif isinstance(current, int) and current < limit:
                self.client.incr(key)
                return True
            else:
                return False
        except Exception as e:
            print(f"Error setting rate limit: {e}")
            return False


# Global Redis manager instance
redis_manager = RedisManager()
