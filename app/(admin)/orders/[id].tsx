import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import OrderList from "@/components/OrderList";
import OrderDetail from "@/components/OrderDetail";
import { OrderStatusList, Tables } from "@/app/types";
import { Colors } from "@/constants/Colors";
import { useOrderDetails, useUpdateOrder } from "@/api/orders";
import Icon from "react-native-vector-icons/Ionicons";
import { useAdminOrdersSubscription } from "@/api/orders/subcriptions";
import { supabase } from "@/lib/supabase";

// Custom hook để lấy thông tin địa chỉ giao hàng
const useDeliveryAddress = (order: any) => {
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) {
      setLoading(false);
      return;
    }

    try {
      if (order.delivery_address) {
        let deliveryData = order.delivery_address;
        
        if (typeof order.delivery_address === 'string') {
          deliveryData = JSON.parse(order.delivery_address);
        }

        setAddress({
          full_name: deliveryData.full_name || deliveryData.name || 'N/A',
          phone: deliveryData.phone || 'N/A',
          street: deliveryData.street || 'N/A',
          district: deliveryData.district || 'N/A',
          city: deliveryData.city || 'N/A',
          address: `${deliveryData.street || ''}, ${deliveryData.city || ''}`
        });
      } else {
        setAddress(null);
      }
    } catch (err) {
      console.error('Error handling delivery address:', err);
      console.error('Delivery address data:', order.delivery_address);
      setAddress(null);
    }
    setLoading(false);
  }, [order]);

  return { address, loading };
};

const OrderDetailScreen = () => {
  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);
  
  const { data: order, isLoading, error } = useOrderDetails(id);
  const { mutate: updateOrder } = useUpdateOrder();
  
  const { address, loading: addressLoading } = useDeliveryAddress(order);

  const updateOrderStatus = (status: string) => {
    updateOrder({ id: id, updatedField: { status } });
  };

  useAdminOrdersSubscription(id);

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />;
  }

  if (error || !order) {
    return <Text style={styles.errorText}>Failed to fetch order details</Text>;
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'New': return 'star-outline';
      case 'Cooking': return 'flame-outline';
      case 'Delivering': return 'bicycle-outline';
      case 'Delivered': return 'checkmark-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Order #${id}`,
          headerStyle: {
            backgroundColor: Colors.light.tint,
          },
          headerTintColor: '#fff',
        }} 
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.sectionHeader}>
            <Icon name="timer-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Order Status</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusContainer}
          >
            {OrderStatusList.map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: order.status === status 
                      ? Colors.light.tint 
                      : 'white',
                  },
                ]}
                onPress={() => updateOrderStatus(status)}
              >
                <Icon 
                  name={getStatusIcon(status)} 
                  size={20} 
                  color={order.status === status ? 'white' : Colors.light.tint}
                />
                <Text style={[
                  styles.statusText,
                  {color: order.status === status ? 'white' : Colors.light.tint}
                ]}>
                  {status}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Order Info Section */}
        <View style={styles.infoSection}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Icon name="cart-outline" size={24} color={Colors.light.tint} style={styles.summaryIcon} />
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{order.order_items.length}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Icon name="cash-outline" size={24} color={Colors.light.tint} style={styles.summaryIcon} />
                <Text style={styles.summaryLabel}>Order Total</Text>
                <Text style={styles.summaryValue}>${order.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Delivery Info Card */}
          <View style={styles.deliveryCard}>
            <View style={styles.cardHeader}>
              <Icon name="location" size={24} color={Colors.light.tint} />
              <Text style={styles.cardTitle}>Delivery Information</Text>
            </View>
            
            {addressLoading ? (
              <ActivityIndicator color={Colors.light.tint} style={styles.loader} />
            ) : address ? (
              <View style={styles.deliveryContent}>
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Customer</Text>
                    <Text style={styles.infoValue}>{address.full_name}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Icon name="call" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{address.phone}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="map" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>
                      {address.street}
                      {address.district && `, ${address.district}`}
                      {address.city && `, ${address.city}`}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="alert-circle-outline" size={50} color="#999" />
                <Text style={styles.noDataText}>No delivery information</Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Items Section */}
        <View style={styles.itemsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="list" size={24} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Order Items</Text>
          </View>
          <View style={styles.itemsContainer}>
            {order.order_items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <OrderDetail item={item} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  loader: {
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    margin: 20,
    fontSize: 14,
  },
  statusSection: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 20,
    margin: 15,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    paddingHorizontal: 15,
    gap: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    gap: 8,
    elevation: 1,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 15,
  },
  infoSection: {
    paddingHorizontal: 15,
    gap: 15,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  deliveryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deliveryContent: {
    gap: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  itemsSection: {
    margin: 15,
  },
  itemsContainer: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
  },
});

export default OrderDetailScreen;