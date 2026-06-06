import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("wisemart_cart");
    return saved ? JSON.parse(saved) : [];
  });

  function sync(next) {
    setItems(next);
    localStorage.setItem("wisemart_cart", JSON.stringify(next));
  }

  function addItem(product, quantity = 1) {
    const existing = items.find((item) => item.product_id === product.product_id);
    const next = existing
      ? items.map((item) => (item.product_id === product.product_id ? { ...item, quantity: item.quantity + quantity } : item))
      : [...items, { ...product, quantity }];
    sync(next);
  }

  function updateQuantity(productId, quantity) {
    const next = items
      .map((item) => (item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
      .filter((item) => item.quantity > 0);
    sync(next);
  }

  function removeItem(productId) {
    sync(items.filter((item) => item.product_id !== productId));
  }

  function clearCart() {
    sync([]);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 2500 || subtotal === 0 ? 0 : 99;
  const total = subtotal + tax + shipping;

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, subtotal, tax, shipping, total, count: items.reduce((sum, item) => sum + item.quantity, 0) }),
    [items, subtotal, tax, shipping, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
