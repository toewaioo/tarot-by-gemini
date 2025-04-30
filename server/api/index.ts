import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { GoogleGenAI, Modality } from "@google/genai";
import { stream, streamText, streamSSE } from "hono/streaming";
interface ThreeCardRequest {
  question: string;
  past: string;
  present: string;
  future: string;
  past_reverse: boolean;
  present_reverse: boolean;
  future_reverse: boolean;
}

export const config = {
  runtime: "edge",
};

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable");

//
const ai = new GoogleGenAI({ vertexai: false, apiKey: apiKey });
const app = new Hono().basePath("/api");
app.use("*", cors({ origin: "*" }));

// Health check
app.get("/", (c) =>
  c.json({
    status: "ready",
    model: "gemini-2.5-flash-preview-04-17",
  })
);

// Validation helper
function validateRequest(
  body: any
): { valid: false; error: string } | { valid: true; data: ThreeCardRequest } {
  const requiredFields = [
    "question",
    "past",
    "present",
    "future",
    "past_reverse",
    "present_reverse",
    "future_reverse",
  ];

  const missing = requiredFields.filter((field) => !(field in body));
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(", ")}`,
    };
  }

  const stringFields = ["question", "past", "present", "future"];
  const invalidStrings = stringFields.filter(
    (field) => typeof body[field] !== "string" || body[field].trim() === ""
  );

  const booleanFields = ["past_reverse", "present_reverse", "future_reverse"];
  const invalidBooleans = booleanFields.filter(
    (field) => typeof body[field] !== "boolean"
  );

  const errors = [
    ...invalidStrings.map((f) => `${f} must be a non-empty string`),
    ...invalidBooleans.map((f) => `${f} must be a boolean`),
  ];

  if (errors.length > 0) {
    return {
      valid: false,
      error: `Invalid fields: ${errors.join(", ")}`,
    };
  }

  return {
    valid: true,
    data: body as ThreeCardRequest,
  };
}

app.post("/threecard", async (c) => {
  try {
    // Parse and validate request
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const validation = validateRequest(body);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    // Build prompt
    const { data } = validation;
    const cardPosition = (reversed: boolean) =>
      reversed ? "Reversed" : "Upright";
    const instruction = `You are a professional tarot reader with 30+ years experience. Analyze this 3-card spread:
      1. Consider both card meaning and position
      2. Provide insights in natural, conversational language
      3. Use markdown formatting for emphasis
      4. Maintain cultural sensitivity
      5. Include practical advice based on the reading
      
      Respond in the user's preferred language. Structure your analysis with:
      - Past Interpretation
      - Present Situation
      - Future Outlook
      - Overall Guidance`;

    const prompt = `
      **Professional Tarot Reading Request**
      Question: ${data.question}

      Card Spread Analysis:
      - Past: ${data.past} (${cardPosition(data.past_reverse)})
      - Present: ${data.present} (${cardPosition(data.present_reverse)})
      - Future: ${data.future} (${cardPosition(data.future_reverse)})
    `.trim();

    // Generate content
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: { systemInstruction: instruction },
    });
    // Handle response
    if (!response) {
      return c.json({ error: "No response from AI service" }, 500);
    }

    return streamText(c, async (stream) => {
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          stream.write(text);
        }
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        error: "Failed to generate reading",
        details: message,
      },
      500
    );
  }
});

export default handle(app);
