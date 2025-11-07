# Fix-ISH AI - n8n Webhook Integration Guide

## Overview
This document explains how to connect the Fix-ISH AI chat interface to your custom n8n webhook backend.

## Configuration

### 1. Webhook URL Setup
The chat interface is configured to send messages to your n8n webhook. To update the webhook URL:

**File:** `src/pages/Chat.tsx`  
**Line:** ~474 (inside `handleSend` function)

```typescript
const N8N_WEBHOOK_URL = "https://navaroneturnerviii.app.n8n.cloud/webhook/fixish-ai";
```

Replace this URL with your actual n8n webhook endpoint.

### 2. Request Format

The chat sends a POST request to your webhook with the following JSON structure:

```json
{
  "message": "User's message text",
  "session_id": "conv_1234567890123",
  "user_id": "user_1234567890_abc123def",
  "file": {
    "name": "image.png",
    "type": "image/png",
    "data": "data:image/png;base64,...",
    "size": 12345
  },
  "mode": "repair_analysis"
}
```

**Required Fields:**
- `message` (string): The user's text input
- `session_id` (string): Unique conversation identifier for maintaining context
- `user_id` (string): Unique user identifier stored in localStorage

**Optional Fields:**
- `file` (object): File attachment with base64 data (if user uploaded a file)
- `mode` (string): Analysis mode (e.g., "repair_analysis", "repair", "diagnose", "learn")

### 3. Expected Response Format

Your n8n webhook should return a JSON response with one of these fields:

```json
{
  "reply": "Fix-ISH AI response text here..."
}
```

**Supported Response Fields** (checked in order of priority):
1. `reply` - Primary field expected from n8n
2. `response` - Alternative field name
3. `message` - Fallback field name

**Example Response:**
```json
{
  "reply": "Hey there — I can see you've uploaded an image of a damaged car. Let me analyze it for you...\n\n**Visible Damage:**\n1. Front bumper severely cracked\n2. Hood dented\n3. Headlight assembly broken\n\n**Repair Plans:**\n\n### Quick Fix (Temporary)\n- Duct tape the bumper\n- Use plastic filler\n- Time: 1-2 hours\n\n### Full Repair (Recommended)\n- Replace bumper assembly\n- Repair hood dent\n- Install new headlight\n- Time: 4-6 hours"
}
```

### 4. Session Management

**Session ID (Conversation Context):**
- Each conversation gets a unique `session_id` (e.g., `conv_1234567890123`)
- This ID is sent with every message in that conversation
- Use this in your n8n workflow to maintain conversation memory
- Store conversation history keyed by `session_id` in your n8n Memory node

**User ID:**
- Persistent across all conversations for a single user
- Stored in browser localStorage as `fixish_userId`
- Format: `user_{timestamp}_{random}`

### 5. n8n Workflow Structure

Your n8n workflow should follow this pattern:

```
1. Webhook Trigger (POST)
   ↓
2. Extract Data (message, session_id, user_id, file)
   ↓
3. Session Memory (Load conversation history using session_id)
   ↓
4. AI Agent (OpenAI GPT-5-Turbo)
   - Include conversation history
   - Use Fix-ISH AI system prompt
   - Process image if file.data is present
   ↓
5. Session Memory (Save updated conversation)
   ↓
6. Respond to Webhook
   - Return JSON: { "reply": "..." }
```

### 6. Error Handling

If your webhook returns an error:
- Non-200 status codes will trigger an error toast
- The chat will display a fallback message
- Error details are logged to browser console

**Error Response Example:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Please try again in a few moments"
}
```

### 7. File Upload Support

When users upload images:
- Files are converted to base64 data URLs
- Sent in the `file` object with `name`, `type`, `data`, and `size`
- Your OpenAI node should handle vision/image analysis
- Max file size: 20MB
- Max files per message: 10 (only first file is sent currently)

### 8. Testing the Integration

**Test Steps:**
1. Update `N8N_WEBHOOK_URL` in `src/pages/Chat.tsx`
2. Rebuild the frontend
3. Open the chat interface at `/chat`
4. Send a test message: "hi"
5. Expected response: "Hey there, how are you doing? What project are we fixing today?"

**Test with Image:**
1. Upload an image of broken equipment
2. Expected: Detailed repair analysis with Quick/Full/Budget plans

### 9. CORS Configuration

Make sure your n8n webhook has CORS enabled:

**n8n Webhook Settings:**
- Enable "Respond Immediately" or "Wait for Completion"
- Add CORS headers if needed:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`

### 10. Security Considerations

**Current Setup:**
- No authentication/API keys required (public webhook)
- Rate limiting should be configured in n8n
- User tracking via `user_id` for abuse prevention

**Recommendations:**
- Add API key authentication if needed
- Implement rate limiting per `user_id`
- Monitor webhook usage in n8n
- Consider adding request validation

## Support

For issues or questions:
1. Check browser console for error logs
2. Verify webhook URL is accessible
3. Test webhook directly with Postman/curl
4. Check n8n execution logs
5. Confirm response format matches expected structure

## Quick Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's input text |
| `session_id` | string | Yes | Conversation ID |
| `user_id` | string | Yes | User identifier |
| `file` | object | No | File attachment data |
| `mode` | string | No | Analysis mode |

**Response Field:** `reply` (string)
