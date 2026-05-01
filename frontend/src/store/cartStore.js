import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item._id === product._id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item._id === product._id
                  ? {
                      ...item,
                      qty: item.qty + qty,
                      quantity: item.qty + qty
                    }
                  : item
              )
            };
          }

          return {
            items: [
              ...state.items,
              {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images || [],
                modelUrl: product.modelUrl,
                arCategory: product.arCategory,
                qty,
                quantity: qty
              }
            ]
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId)
        })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === productId
              ? {
                  ...item,
                  qty: Math.max(Number(qty) || 1, 1),
                  quantity: Math.max(Number(qty) || 1, 1)
                }
              : item
          )
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, item) => sum + Number(item.price) * (item.qty ?? item.quantity ?? 1), 0)
    }),
    {
      name: "phantom-cart"
    }
  )
);
