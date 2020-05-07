import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: object): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const newProducts = await AsyncStorage.getItem('@GoMarketplace:products');

      if (newProducts) {
        setProducts(JSON.parse(newProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existentProduct = products.find(
        aProduct => aProduct.id === product.id,
      );

      if (existentProduct) {
        const newProducts = products.map(aProduct => {
          if (aProduct.id === existentProduct.id) {
            return {
              ...existentProduct,
              quantity: existentProduct.quantity + 1,
            };
          }

          return aProduct;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      } else {
        const newProducts = [
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ];

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(aProduct => {
        if (aProduct.id === id) {
          return { ...aProduct, quantity: aProduct.quantity + 1 };
        }

        return aProduct;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(aProduct => {
        if (aProduct.id === id) {
          return { ...aProduct, quantity: aProduct.quantity - 1 };
        }

        return aProduct;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
