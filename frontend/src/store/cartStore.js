import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item._id === product._id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
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
                quantity
              }
            ]
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId)
        })),
      updateQty: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === productId ? { ...item, quantity: Math.max(Number(quantity) || 1, 1) } : item
          )
        })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    }),
    {
      name: "phantom-store-cart"
    }
  )
);
