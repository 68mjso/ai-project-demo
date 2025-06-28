# AI Project Demo with PostgreSQL and Redis

This project is a full-stack AI chat application with FastAPI backend, React frontend, PostgreSQL database, and Redis caching.

## Architecture

- **Backend**: FastAPI with Python
- **Frontend**: React TypeScript
- **Database**: PostgreSQL for persistent storage
- **Cache**: Redis for session caching

## Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API credentials

### Setup

1. Set up environment variables:
   - Modify the docker-compose.yml file to include your OpenAI API key.
     ```env
     OPENAI_KEY=your_openai_api_key
     ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Endpoints

### Conversations
- `POST /conversations` - Create a new conversation
- `GET /conversations` - List all conversations
- `GET /conversations/{id}/messages` - Get conversation messages
- `POST /conversations/{id}/messages` - Send a message to conversation
- `DELETE /conversations/{id}` - Delete a conversation

### Health & Status
- `GET /` - Root endpoint with API information
- `GET /health` - Health check for database and Redis

