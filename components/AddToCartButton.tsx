import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Product } from '@/types';
import { useCart } from '@/context/CartProvider';
import Icon from "react-native-vector-icons/Ionicons";
import { useState } from 'react';

type AddToCartButtonProps = {
  product: Product;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      // Thêm mặc định size M
      await addItem(product, 'S');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleAddToCart}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Icon name="add" size={24} color="white" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.tint,
    padding: 8,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AddToCartButton;