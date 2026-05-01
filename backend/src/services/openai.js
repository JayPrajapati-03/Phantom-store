import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

const client = hasOpenRouter
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173",
        "X-Title": process.env.APP_NAME || "Phantom Store"
      }
    })
  : new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "missing-key"
    });

const aiModel = hasOpenRouter
  ? process.env.OPENROUTER_MODEL || "openrouter/free"
  : process.env.OPENAI_MODEL || "gpt-4o-mini";

const hasRemoteAi = hasOpenRouter || hasOpenAI;

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
  if (!hasRemoteAi) {
    return [name, category, arCategory]
      .join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean)
      .slice(0, 12);
  }

  const response = await client.chat.completions.create({
    model: aiModel,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `Generate semantic search tags for this product:
Name: ${name}
Category: ${category}
AR Category: ${arCategory}
Description: ${description}
Return ONLY JSON: { "tags": ["tag1","tag2",...] }
Generate 8-10 descriptive, searchable tags.`
      }
    ]
  });

  const parsed = parseJsonObject(response.choices[0]?.message?.content || "{}", { tags: [] });

  return parseJsonArray(JSON.stringify(parsed.tags || []))
    .map((tag) => String(tag).toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 10);
};

export const suggestStyles = async ({ profile = {}, occasion = "", productIds = [], preferences = "" }) => {
  if (!hasRemoteAi) {
    return [
      {
        title: "Clean everyday fit",
        reason: "Balances neutral colors with one statement accessory.",
        items: productIds
      }
    ];
  }

  const response = await client.chat.completions.create({
    model: aiModel,
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

export const suggestComplementaryCategories = async ({
  productName = "",
  productCategory = "",
  category = ""
}) => {
  const baseCategory = productCategory || category;

  if (!hasRemoteAi) {
    const fallbackSuggestions = [
      "glasses",
      "jacket",
      "watch",
      "bag",
      "shoes",
      "hat"
    ].filter((item) => item.toLowerCase() !== String(baseCategory).toLowerCase());

    return {
      suggestions: fallbackSuggestions.slice(0, 3),
      reason: "These picks add balance and contrast to the main look."
    };
  }

  const response = await client.chat.completions.create({
    model: aiModel,
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a fashion stylist AI for an AR e-commerce app."
      },
      {
        role: "user",
        content: `The user is trying on: "${productName}" (${baseCategory}).
Suggest 3 complementary product categories they should also try.
Return ONLY JSON: { "suggestions": ["category1","category2","category3"], "reason": "short styling tip" }`
      }
    ]
  });

  const parsed = parseJsonObject(response.choices[0]?.message?.content || "{}", {
    suggestions: [],
    reason: ""
  });

  return {
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [],
    reason: typeof parsed.reason === "string" ? parsed.reason.trim() : ""
  };
};

export const rankProductsForSearch = async ({ query = "", products = [] }) => {
  if (!query) {
    return [];
  }

  if (!hasRemoteAi) {
    const normalizedQuery = query.toLowerCase();

    return products
      .filter((product) => {
        const haystack = [
          product.name,
          product.description,
          product.category,
          ...(product.aiTags || [])
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .map((product) => String(product._id))
      .slice(0, 12);
  }

  const catalog = products
    .map(
      (product) =>
        `ID:${product._id} Name:${product.name} Category:${product.category} Tags:${(product.aiTags || []).join(",")}`
    )
    .join("\n");

  const response = await client.chat.completions.create({
    model: aiModel,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `User searched: "${query}"
Product catalog:
${catalog}

Return ONLY JSON: { "ids": ["id1","id2","id3"] }
Pick the most relevant product IDs for the search query.`
      }
    ]
  });

  const parsed = parseJsonObject(response.choices[0]?.message?.content || "{}", { ids: [] });
  return Array.isArray(parsed.ids)
    ? parsed.ids.map((item) => String(item).trim()).filter(Boolean)
    : [];
};

export const reviewOutfit = async ({ items = [], imageDescription = "", occasion = "" }) => {
  if (!hasRemoteAi) {
    return {
      score: 8,
      summary: "The outfit is cohesive and ready for everyday wear.",
      improvements: ["Add contrast with texture or a focused accent color."]
    };
  }

  const response = await client.chat.completions.create({
    model: aiModel,
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
