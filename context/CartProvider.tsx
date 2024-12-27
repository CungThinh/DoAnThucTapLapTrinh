import { CartItem, Tables } from '@/app/types';
import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { useInsertOrder } from '@/api/orders';
import { useRouter } from 'expo-router';
import { useInsertOrderItems } from '@/api/order-items';
import { Alert } from 'react-native';

type Product = Tables<'products'>;

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem['size']) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  total: number;
  getTotalCartAmount: () => number;
  checkout: () => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void; // Thêm clearCart vào đây
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  getTotalCartAmount: () => 0,
  checkout: () => {},
  removeItem: () => {},
  clearCart: () => {}, // Thêm clearCart vào đây
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]); // Giỏ hàng
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { mutate: insertOrder } = useInsertOrder(); // API để thêm đơn hàng
  const { mutate: insertOrderItems } = useInsertOrderItems(); // API để thêm các item vào đơn hàng
  const router = useRouter();

   // Thêm hàm removeItem
   const removeItem = (itemId: string) => {
    setItems((currentItems) => 
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  // Thêm sản phẩm vào giỏ hàng
  const addItem = (product: Product, size: CartItem['size']) => {
    const existingItem = items.find(
      (item) => item.product.id === product.id && item.size === size
    );

    if (existingItem) {
      updateQuantity(existingItem.id, 1);
      return;
    }

    const newCartItem: CartItem = {
      id: randomUUID(),
      product,
      product_id: product.id,
      size,
      quantity: 1,
    };

    setItems([newCartItem, ...items]);
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    setItems(
      items
        .map((item) =>
          item.id !== itemId
            ? item
            : { ...item, quantity: item.quantity + amount }
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Tính tổng giá trị giỏ hàng
  const getTotalCartAmount = () => {
    return items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
  };

  // Xóa giỏ hàng
  const clearCart = () => {
    setItems([]);
  };

  // Hàm thanh toán (checkout)
  const checkout = () => {
    const total = getTotalCartAmount();
    setIsLoading(true); // Bắt đầu trạng thái loading

    // Bước 1: Tạo đơn hàng
    insertOrder(
      { total }, // Dữ liệu order (tổng tiền)
      {
        onSuccess: (orderData) => {
          // Bước 2: Tạo các order_items từ giỏ hàng
          const orderItems = items.map((item) => ({
            order_id: orderData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size,
          }));

          insertOrderItems(orderItems, {
            onSuccess: () => {
              // Thành công: Xóa giỏ hàng và chuyển hướng
              clearCart();
              setIsLoading(false);
              router.push(`/(user)/orders/${orderData.id}`);
            },
            onError: (error) => {
              // Xử lý lỗi khi thêm order items
              console.error('Failed to add order items:', error.message);
              setIsLoading(false);
              Alert.alert('Error', 'Failed to add items to the order.');
            },
          });
        },
        onError: (error) => {
          // Xử lý lỗi khi tạo đơn hàng
          console.error('Failed to create order:', error.message);
          setIsLoading(false);
          Alert.alert('Error', 'Failed to create order. Please try again.');
        },
      }
    );
  };

  // Tổng giá trị giỏ hàng
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        total,
        getTotalCartAmount,
        checkout,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

// Hook sử dụng CartContext
export const useCart = () => useContext(CartContext);
