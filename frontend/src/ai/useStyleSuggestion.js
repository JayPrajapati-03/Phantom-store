import { useCallback, useState } from "react";
import api from "../utils/api.js";

export function useStyleSuggestion() {
  const [suggestions, setSuggestions] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = useCallback(async (productIdOrPayload, category) => {
    setLoading(true);
    setError(null);

    try {
      const payload =
        typeof productIdOrPayload === "object" && productIdOrPayload !== null
          ? productIdOrPayload
          : { productId: productIdOrPayload, category };

      const response = await api.post("/ai/suggest", payload);
      setSuggestions(response.data.products || []);
      setReason(response.data.reason || "");
      return response.data;
    } catch (suggestionError) {
      setError(suggestionError);
      throw suggestionError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, reason, loading, error, getSuggestions };
}
