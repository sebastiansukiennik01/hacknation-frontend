# HackNation Frontend

A React chatbot webapp built with Next.js that uses API routes for proxying requests to a Python backend AI model.

## Features

- Next.js 13+ with App Router
- TypeScript support
- Tailwind CSS for styling
- Rounded chatbot interface with chat history
- Agent instructions input for longer-form configuration
- Markdown rendering for rich text responses
- API routes that proxy to Python backend
- Clean, modern UI design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure your Python backend URL:
Create a `.env.local` file in the root directory:
```
PYTHON_BACKEND_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Generic Proxy
- `GET/POST/PUT/DELETE /api/proxy?path=/your-endpoint`

### Chatbot API
- `POST /api/prompt` - Send message to AI model or agent instructions

All API routes proxy requests to your Python backend using the `PYTHON_BACKEND_URL` environment variable.

## Python Backend Requirements

Your Python backend should expose a `/prompt` endpoint that accepts POST requests with JSON payload for both regular messages and instructions:

**Regular Messages:**
```json
{
  "prompt": "User's message content"
}
```

**Agent Instructions:**
```json
{
  "instructions": "Long-form instructions for the agent"
}
```

And returns a response in this format:

```json
{
  "response": "AI model's reply",
  "tools": [...],
  "tools_used": [...],
  "user_id": "user123",
  "session_id": "session456",
  "success": true
}
```

The frontend will automatically extract and display the `response` field content.

## Response Handling

The frontend automatically extracts the `response` field from API responses for display. If your backend returns complex JSON with a `response` field, only the content of that field will be displayed to the user, allowing for clean separation of metadata and display content.

## Tools Integration

If your AI responses include a `tools` array, the frontend will display small tool buttons below the message. Each tool button shows:

- **Tool Name**: Displayed on the button
- **Description**: Shown on hover in a tooltip

Example API response with tools:
```json
{
  "response": "I've analyzed your request using the following tools:",
  "tools": [
    {
      "name": "Web Search",
      "description": "Searched for current information about AI chatbots"
    },
    {
      "name": "Data Analysis",
      "description": "Processed and analyzed the retrieved data"
    }
  ]
}
```

## Tools Integration

If your AI responses include a `tools` array, the frontend will display small tool buttons below the message. Each tool button shows:

- **Tool Name**: Displayed on the button
- **Description**: Shown on hover in a tooltip

Example API response with tools:
```json
{
  "response": "I've analyzed your request using the following tools:",
  "tools": [
    {
      "name": "Web Search",
      "description": "Searched for information about AI chatbots"
    },
    {
      "name": "Calculator",
      "description": "Performed mathematical calculations"
    }
  ]
}
```

## Building for Production

```bash
npm run build
npm start
```