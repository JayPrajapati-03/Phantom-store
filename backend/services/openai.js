import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing-key"
});

const parseJsonArray = (content, fallback = []) => {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const parseJsonObject = (content, fallback = {}) => {
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const generateTags = async ({ name = "", description = "", category = "", arCategory = "" }) => {
  if (!process.env.OPENAI_API_KEY) {
    return [name, category, arCategory]
      .join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean)
      .slice(0, 12);
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "Return only a JSON array of short ecommerce search tags."
      },
      {
        role: "user",
        content: JSON.stringify({ name, description, category, arCategory })
      }
    ]
  });

  return parseJsonArray(response.choices[0]?.message?.content || "[]")
    .map((tag) => String(tag).toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 20);
};

export const suggestStyles = async ({ profile = {}, occasion = "", productIds = [], preferences = "" }) => {
  if (!process.env.OPENAI_API_KEY) {
    return [
      {
        title: "Clean everyday fit",
        reason: "Balances neutral colors with one statement accessory.",
        items: productIds
      }
    ];
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a fashion stylist for an AR commerce app. Return JSON with a suggestions array. Each suggestion has title, reason, palette, and stylingTips."
      },
      {
        role: "user",
        content: JSON.stringify({ profile, occasion, productIds, preferences })
      }
    ]
  });

  const parsed = parseJsonObject(response.choices[0]?.message?.content || "{}");
  return parsed.suggestions || [];
};

export const reviewOutfit = async ({ items = [], imageDescription = "", occasion = "" }) => {
  if (!process.env.OPENAI_API_KEY) {
    return {
      score: 8,
      summary: "The outfit is cohesive and ready for everyday wear.",
      improvements: ["Add contrast with texture or a focused accent color."]
    };
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Review an outfit for fit, color, occasion, and styling coherence. Return JSON with score, summary, strengths, and improvements."
      },
      {
        role: "user",
        content: JSON.stringify({ items, imageDescription, occasion })
      }
    ]
  });

  return parseJsonObject(response.choices[0]?.message?.content || "{}");
};
