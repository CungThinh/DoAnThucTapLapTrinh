import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { CartItem } from '@/app/types';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '@/context/CartProvider';
import RemoteImage from './RemoteImage';
import { defaultPizzaImage } from '@/app/(admin)/menu/create';
import Icon from "react-native-vector-icons/Ionicons";

type CartListItemProps = {
  cartItem: CartItem;
};

const CartListItem = ({ cartItem }: CartListItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const [deleteAnim] = useState(new Animated.Value(1));

  const handleDelete = () => {
    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      removeItem(cartItem.id);
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: deleteAnim,
          transform: [{
            scale: deleteAnim
          }]
        }
      ]}
    >
      <RemoteImage
        path={cartItem.product.image}
        fallback={defaultPizzaImage}
        style={styles.image}
        resizeMode="contain"
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{cartItem.product.name}</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.price}>${cartItem.product.price.toFixed(2)}</Text>
          <Text style={styles.size}>Size: {cartItem.size}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            onPress={() => updateQuantity(cartItem.id, -1)}
            style={styles.quantityButton}
          >
            <FontAwesome name="minus" size={12} color={Colors.light.tint} />
          </TouchableOpacity>

          <Text style={styles.quantity}>{cartItem.quantity}</Text>

          <TouchableOpacity 
            onPress={() => updateQuantity(cartItem.id, 1)}
            style={styles.quantityButton}
          >
            <FontAwesome name="plus" size={12} color={Colors.light.tint} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 70,
    aspectRatio: 1,
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 15,
  },
  size: {
    color: '#666',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantity: {
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
});

export default CartListItem;