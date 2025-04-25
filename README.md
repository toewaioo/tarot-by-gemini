# Three-Card Tarot Reading API

[![Edge Compatible](https://img.shields.io/badge/edge-%3E%3D%20v8-green)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
[![Hono Framework](https://img.shields.io/badge/Hono-v3.11.2-blue)](https://hono.dev)

An edge-ready API for generating professional tarot card readings using Google's Gemini AI. This service analyzes three-card spreads (past, present, future) and provides insightful interpretations with practical guidance.

## Features

- 🃏 Three-card spread analysis with reverse card handling
- 💬 Streaming responses for real-time interpretation
- 🔒 Request validation and error handling
- 🌍 Multi-language support (based on user input)
- 📝 Markdown-formatted responses for rich text
- 🌐 CORS enabled for cross-origin access

## Installation & Setup

1. Clone repository:
```bash
git clone https://github.com/toewaioo/tarot-by-gemini.git
cd tarot-by-gemini
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variable:
```bash
export GEMINI_API_KEY=your_google_api_key
```

4. Deploy to edge runtime (e.g., Vercel Edge Functions)

## API Endpoints

### Health Check
`GET /api/`
```json
{
  "status": "ready",
  "model": "gemini-2.5-flash-preview-04-17"
}
```

### Generate Reading
`POST /api/threecard`

**Request Body:**
```typescript
interface ThreeCardRequest {
  question: string;       // User's query/concern
  past: string;           // Past card name
  present: string;        // Present card name
  future: string;         // Future card name
  past_reverse: boolean;  // Is past card reversed?
  present_reverse: boolean;
  future_reverse: boolean;
}
```

**Example Request:**
```bash
curl -X POST https://your-api-domain/api/threecard \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Will my career transition succeed?",
    "past": "The Hierophant",
    "present": "The Chariot",
    "future": "The World",
    "past_reverse": true,
    "present_reverse": false,
    "future_reverse": false
  }'
```

## Response Format

Streaming text response with markdown formatting:
```markdown
**Past Interpretation**  
The reversed Hierophant suggests...

**Present Situation**  
The Chariot in upright position indicates...

**Future Outlook**  
The World card promises...

**Overall Guidance**  
Focus on...
```

## Error Handling

**400 Bad Request**
```json
{
  "error": "Missing required fields: question, past"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to generate reading",
  "details": "API quota exceeded"
}
```

## Configuration

- **Runtime**: Edge-compatible (Vercel Edge Functions)
- **AI Model**: Gemini 1.5 Flash (gemini-2.5-flash-preview-04-17)
- **Timeout**: Default edge function timeout (30s)

## Deployment

Recommended deployment platforms:
- Vercel Edge Functions
- Cloudflare Workers
- Deno Deploy

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add some feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open Pull Request

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Disclaimer**: Tarot interpretations are AI-generated and should be used for entertainment purposes only. Results may vary and should not replace professional advice.