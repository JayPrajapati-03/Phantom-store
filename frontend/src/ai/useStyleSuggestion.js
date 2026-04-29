import { useCallback, useState } from "react";
import api from "../utils/api.js";

export function useStyleSuggestion() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/ai/style-suggest", payload);
      setSuggestions(response.data.suggestions || []);
      return response.data.suggestions || [];
    } catch (suggestionError) {
      setError(suggestionError);
      throw suggestionError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, loading, error, getSuggestions };
}
