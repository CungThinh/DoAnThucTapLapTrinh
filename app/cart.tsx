import React from 'react';
import { View, Text, Platform, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCart } from '@/context/CartProvider';
import CartListItem from '@/components/CartListItems';
import Button from '@/components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { useRouter, useFocusEffect } from 'expo-router';

interface DeliveryAddress {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  is_default: boolean;
}

const CartScreen = () => {
  const { items, total } = useCart();
  const { session } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const router = useRouter();

  // Trong CartScreen.tsx, sửa hàm checkout:
  const checkout = () => {
    if (!deliveryAddress) {
      router.push('/menu/address');
      return;
    }
    router.push('/menu/payment');
  };
  
  const fetchDeliveryAddress = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_default', true)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching delivery address:', error);
        }
        setDeliveryAddress(null);
        return;
      }

      setDeliveryAddress(data);
    } catch (error) {
      console.error('Error:', error);
      setDeliveryAddress(null);
    }
  };

  // Fetch address when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchDeliveryAddress();
    }, [session])
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Icon name="cart-outline" size={120} color={Colors.light.tint} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubText}>Add some delicious items to your cart</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>

      <TouchableOpacity
        style={styles.addressContainer}
        onPress={() => router.push('/menu/address')}
        activeOpacity={0.7}
      >
        <View style={styles.addressHeader}>
          <Icon name="location-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.addressTitle}>Delivery Address</Text>
        </View>

        {deliveryAddress ? (
          <View style={styles.addressContent}>
            <Text style={styles.addressName}>
              {deliveryAddress.full_name} | {deliveryAddress.phone}
            </Text>
            <Text style={styles.addressText}>
              {deliveryAddress.street}
            </Text>
            <Text style={styles.addressText}>
              {deliveryAddress.district}, {deliveryAddress.city}
            </Text>
          </View>
        ) : (
          <View style={styles.addAddressContainer}>
            <Icon name="add-circle-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.addAddressText}>Add delivery address</Text>
          </View>
        )}

        <Icon
          name="chevron-forward"
          size={20}
          color="#666"
          style={styles.addressArrow}
        />
      </TouchableOpacity>

      <FlatList
        data={items}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>$2.99</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${(total + 2.99).toFixed(2)}</Text>
          </View>
        </View>

        <Button
          onPress={deliveryAddress ? checkout : () => router.push('/menu/address')}
          text={deliveryAddress ? "Proceed to Checkout" : "Add Delivery Address"}
          style={styles.checkoutButton}
        />

        {!deliveryAddress && (
          <Text style={styles.noAddressWarning}>
            Please add a delivery address to continue
          </Text>
        )}
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  itemCount: {
    fontSize: 16,
    color: '#666',
  },
  addressContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  addressContent: {
    marginLeft: 32,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    lineHeight: 20,
  },
  addAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
  },
  addAddressText: {
    fontSize: 15,
    color: Colors.light.tint,
    marginLeft: 8,
    fontWeight: '500',
  },
  addressArrow: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 15,
  },
  summaryContainer: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  checkoutButton: {
    borderRadius: 12,
    marginTop: 5,
  },
  noAddressWarning: {
    textAlign: 'center',
    color: '#FF4444',
    marginTop: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default CartScreen;

