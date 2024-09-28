import { CartItem, PizzaSize, Product } from "@/app/types";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { randomUUID } from "expo-crypto";

type CartType = {
  cartItems: CartItem[];
  addItem: (product: Product, size: PizzaSize) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  getTotalCartAmount: () => number;
};

const CartContext = createContext<CartType>({
  cartItems: [],
  addItem: () => {},
  updateQuantity: () => {},
  getTotalCartAmount: () => 0,
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const addItem = (product: Product, size: PizzaSize) => {
    const existingItem = cartItems.find((item) => item.product === product && item.size === size)

    if(existingItem) {
        updateQuantity(existingItem.id, 1);
        return;
    }

    const items: CartItem = {
      id: randomUUID(),
      product: product,
      product_id: product.id,
      size: size,
      quantity: 1,
    };
    setCartItems([items, ...cartItems]);
  };

  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    const updatedItem = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + amount } : item
    ).filter((item) => item.quantity > 0);

    setCartItems(updatedItem);
  };

  const getTotalCartAmount = () => {
    let total = 0;
    cartItems.forEach((item) => {
        total += item.quantity * item.product.price;
    })
    return total
  }

  const contextValue = {
    cartItems,
    addItem,
    updateQuantity,
    getTotalCartAmount,
  };
  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
