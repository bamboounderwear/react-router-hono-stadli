import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
        key: string;
        id: string;
        name: string;
        quantity: number;
        price?: number;
        size?: string;
        color?: string;
};

export type CartItemInput = {
        id: string;
        name: string;
        quantity?: number;
        price?: number;
        size?: string;
        color?: string;
};

type CartContextValue = {
        items: CartItem[];
        totalItems: number;
        addItem: (item: CartItemInput) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
        const [items, setItems] = useState<CartItem[]>([]);

        const addItem = useCallback((input: CartItemInput) => {
                const quantity = input.quantity && input.quantity > 0 ? input.quantity : 1;
                const key = [input.id, input.size ?? "", input.color ?? ""].join("::");

                setItems((prev) => {
                        const existing = prev.find((item) => item.key === key);

                        if (existing) {
                                return prev.map((item) =>
                                        item.key === key
                                                ? {
                                                          ...item,
                                                          quantity: item.quantity + quantity,
                                                  }
                                                : item,
                                );
                        }

                        return [
                                ...prev,
                                {
                                        key,
                                        id: input.id,
                                        name: input.name,
                                        price: input.price,
                                        size: input.size,
                                        color: input.color,
                                        quantity,
                                },
                        ];
                });
        }, []);

        const totalItems = useMemo(
                () => items.reduce((total, item) => total + item.quantity, 0),
                [items],
        );

        const value = useMemo(
                () => ({
                        items,
                        totalItems,
                        addItem,
                }),
                [items, totalItems, addItem],
        );

        return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
        const context = useContext(CartContext);

        if (!context) {
                throw new Error("useCart must be used within a CartProvider");
        }

        return context;
}
