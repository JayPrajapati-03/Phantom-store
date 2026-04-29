import { useCallback, useState } from "react";
import api from "../utils/api.js";

export function useProductSearch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = query
        ? await api.post("/ai/semantic-search", { query })
        : await api.get("/products");
      const nextProducts = response.data.products || [];
      setProducts(nextProducts);
      return nextProducts;
    } catch (searchError) {
      setError(searchError);
      throw searchError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, search };
}
