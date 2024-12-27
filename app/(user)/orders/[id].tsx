// app/(user)/orders/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import RemoteImage from '@/components/RemoteImage';
import { defaultPizzaImage } from '@/app/(admin)/menu/create';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Định nghĩa hàm getPriceBySize ở đây
  const getPriceBySize = (basePrice, size) => {
    const sizeMultipliers = {
      S: 1,
      M: 1.2,
      L: 1.5,
      XL: 1.8,
    };
    return basePrice * sizeMultipliers[size];
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          items,
          status,
          total,
          delivery_address,
          created_at
        `)
        .eq('id', id)
        .single();
  
      if (orderError) throw orderError;
  
      const parsedItems = orderData.items || [];
  
      let calculatedTotal = 0; // Tổng giá trị mới sẽ được tính ở đây
  
      const itemsWithProducts = await Promise.all(
        parsedItems.map(async (item) => {
          const { data: productData } = await supabase
            .from('products')
            .select('name, price, image')
            .eq('id', item.product_id)
            .single();
  
          // Tính giá cho từng item
          const itemPrice = getPriceBySize(productData.price, item.size) * item.quantity;
          calculatedTotal += itemPrice;
  
          return {
            ...item,
            product: productData,
          };
        })
      );
  
      setOrder({
        ...orderData,
        items: itemsWithProducts,
        total: calculatedTotal, // Gán tổng giá trị mới tính vào order.total
      });
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Details', headerShown: false }} />
      <ScrollView style={styles.content}>
        {/* Header với Order Status */}
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{id}</Text>
            <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {/* Delivery Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="location-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Delivery Information</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.customerName}>{order.delivery_address.full_name}</Text>
            <Text style={styles.deliveryText}>{order.delivery_address.phone}</Text>
            <Text style={styles.deliveryText}>
              {order.delivery_address.street}
              {'\n'}
              {order.delivery_address.district}, {order.delivery_address.city}
            </Text>
          </View>
        </View>

        {/* Order Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="fast-food-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Order Items</Text>
          </View>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <RemoteImage
                path={item.product.image}
                fallback={defaultPizzaImage}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <View style={styles.itemSpecs}>
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>Size {item.size}</Text>
                  </View>
                  <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>
                ${(getPriceBySize(item.product.price, item.size) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="receipt-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Payment Summary</Text>
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>$2.99</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ${(order.total + 2.99).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  deliveryInfo: {
    marginLeft: 32,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  specText: {
    fontSize: 12,
    color: '#666',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  summaryContainer: {
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
  },
});