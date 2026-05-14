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

const fallbackTags = ({ name = "", category = "", arCategory = "" }) =>
  [name, category, arCategory]
    .join(" ")
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean)
    .slice(0, 12);

const fallbackComplementaryCategories = (baseCategory = "") => ({
  suggestions: ["glasses", "jacket", "watch", "bag", "shoes", "hat"]
    .filter((item) => item.toLowerCase() !== String(baseCategory).toLowerCase())
    .slice(0, 3),
  reason: "These picks add balance and contrast to the main look."
});

const fallbackReview = () => ({
  score: 8,
  tips: [
    "Keep the overall look balanced with one standout accessory.",
    "Match the outfit with clean, occasion-appropriate footwear."
  ]
});

const fallbackOutfitReview = () => ({
  score: 8,
  summary: "The outfit is cohesive and ready for everyday wear.",
  improvements: ["Add contrast with texture or a focused accent color."]
});

const extractJsonSnippet = (content = "", fallback = "{}") => {
  const trimmed = String(content || "").trim();
  if (!trimmed) return fallback;

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];

  return fallback;
};

const parseJsonArray = (content, fallback = []) => {
  try {
    const parsed = JSON.parse(extractJsonSnippet(content, "[]"));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const parseJsonObject = (content, fallback = {}) => {
  try {
    const parsed = JSON.parse(extractJsonSnippet(content, "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const createTextCompletion = async (prompt, { temperature = 0.3 } = {}) => {
  const response = await client.chat.completions.create({
    model: aiModel,
    temperature,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0]?.message?.content || "";
};

const logAiFallback = (scope, error) => {
  console.warn(`[ai:${scope}] Falling back to local logic: ${error?.message || "Unknown error"}`);
};

export const generateTags = async ({ name = "", description = "", category = "", arCategory = "" }) => {
  if (!hasRemoteAi) {
    return fallbackTags({ name, category, arCategory });
  }

  try {
    const content = await createTextCompletion(
      `Generate semantic search tags for this product.
Name: ${name}
Category: ${category}
AR Category: ${arCategory}
Description: ${description}

Return only valid JSON in this shape:
{"tags":["tag1","tag2","tag3"]}

Generate 8 to 10 descriptive, searchable tags.`,
      { temperature: 0.2 }
    );

    const parsed = parseJsonObject(content, { tags: [] });
    const tags = Array.isArray(parsed.tags) ? parsed.tags : [];

    return tags
      .map((tag) => String(tag).toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 10);
  } catch (error) {
    logAiFallback("generateTags", error);
    return fallbackTags({ name, category, arCategory });
  }
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

  try {
    const content = await createTextCompletion(
      `You are a fashion stylist for an AR commerce app.
Return only valid JSON in this shape:
{"suggestions":[{"title":"","reason":"","palette":[],"stylingTips":[]}]}

Input:
${JSON.stringify({ profile, occasion, productIds, preferences })}`,
      { temperature: 0.6 }
    );

    const parsed = parseJsonObject(content, { suggestions: [] });
    return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  } catch (error) {
    logAiFallback("suggestStyles", error);
    return [
      {
        title: "Clean everyday fit",
        reason: "Balances neutral colors with one statement accessory.",
        items: productIds
      }
    ];
  }
};

export const suggestComplementaryCategories = async ({
  productName = "",
  productCategory = "",
  category = ""
}) => {
  const baseCategory = productCategory || category;

  if (!hasRemoteAi) {
    return fallbackComplementaryCategories(baseCategory);
  }

  try {
    const content = await createTextCompletion(
      `The user is trying on "${productName}" in the category "${baseCategory}".
Suggest 3 complementary product categories they should also try.

Return only valid JSON in this shape:
{"suggestions":["category1","category2","category3"],"reason":"short styling tip"}`,
      { temperature: 0.5 }
    );

    const parsed = parseJsonObject(content, {
      suggestions: [],
      reason: ""
    });

    return {
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
        : [],
      reason: typeof parsed.reason === "string" ? parsed.reason.trim() : ""
    };
  } catch (error) {
    logAiFallback("suggestComplementaryCategories", error);
    return fallbackComplementaryCategories(baseCategory);
  }
};

export const rankProductsForSearch = async ({ query = "", products = [] }) => {
  if (!query) {
    return [];
  }

  const localRank = () =>
    products
      .filter((product) => {
        const haystack = [
          product.name,
          product.description,
          product.category,
          ...(product.aiTags || [])
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query.toLowerCase());
      })
      .map((product) => String(product._id))
      .slice(0, 12);

  if (!hasRemoteAi) {
    return localRank();
  }

  try {
    const catalog = products
      .map(
        (product) =>
          `ID:${product._id} Name:${product.name} Category:${product.category} Tags:${(product.aiTags || []).join(",")}`
      )
      .join("\n");

    const content = await createTextCompletion(
      `User searched for "${query}".
Product catalog:
${catalog}

Return only valid JSON in this shape:
{"ids":["id1","id2","id3"]}

Pick the most relevant product IDs for the search query.`,
      { temperature: 0.2 }
    );

    const parsed = parseJsonObject(content, { ids: [] });
    return Array.isArray(parsed.ids)
      ? parsed.ids.map((item) => String(item).trim()).filter(Boolean)
      : localRank();
  } catch (error) {
    logAiFallback("rankProductsForSearch", error);
    return localRank();
  }
};

export const reviewOutfit = async ({ items = [], imageDescription = "", occasion = "" } = {}) => {
  if (typeof items === "object" && items !== null && ("imageBase64" in items || "productName" in items)) {
    const { imageBase64 = "", productName = "" } = items;

    if (!hasRemoteAi) {
      return fallbackReview();
    }

    try {
      const reviewModel = hasOpenRouter ? aiModel : "gpt-4o";
      const response = await client.chat.completions.create({
        model: reviewModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The person is trying on "${productName}".
Rate this look out of 10 and give 2 styling tips.
Return only valid JSON in this shape:
{"score":8,"tips":["tip1","tip2"]}`
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ]
      });

      const parsed = parseJsonObject(response.choices[0]?.message?.content || "{}", {
        score: 0,
        tips: []
      });

      return {
        score: Number(parsed.score) || 8,
        tips: Array.isArray(parsed.tips)
          ? parsed.tips.map((tip) => String(tip).trim()).filter(Boolean).slice(0, 2)
          : fallbackReview().tips
      };
    } catch (error) {
      logAiFallback("reviewOutfit:image", error);
      return {
        score: 8,
        tips: [
          "The outfit is visible, but camera framing or model support may limit precise review.",
          "Center yourself in the frame and keep the product fully visible for better results."
        ]
      };
    }
  }

  if (!hasRemoteAi) {
    return fallbackOutfitReview();
  }

  try {
    const content = await createTextCompletion(
      `Review an outfit for fit, color, occasion, and styling coherence.
Return only valid JSON in this shape:
{"score":8,"summary":"...","strengths":["..."],"improvements":["..."]}

Input:
${JSON.stringify({ items, imageDescription, occasion })}`,
      { temperature: 0.4 }
    );

    return parseJsonObject(content, fallbackOutfitReview());
  } catch (error) {
    logAiFallback("reviewOutfit:text", error);
    return fallbackOutfitReview();
  }
};
