import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import React, { useEffect } from "react";
import { Order, Tables } from "@/app/types";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { Link, useSegments } from "expo-router";
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useUpdateOrderSubcription } from "@/api/orders/subcriptions";
import { useAdminOrdersSubscription } from "@/api/orders/subcriptions";
dayjs.extend(relativeTime);

// Status configurations
const STATUS_CONFIG = {
  pending: {
    icon: "notifications-outline",
    color: "#FFA500",
    label: "New"
  },
  cooking: {
    icon: "flame-outline",
    color: "#FF4444",
    label: "Cooking"
  },
  delivering: {
    icon: "bicycle-outline",
    color: "#2196F3",
    label: "Delivering"
  },
  delivered: {  // Thêm trạng thái delivered
    icon: "checkmark-circle-outline",
    color: "#4CAF50",
    label: "Delivered"
  }
};

type OrderListItemProps = {
  order: Tables<"orders">;
};

const OrderList = ({ order }: OrderListItemProps) => {
  const segments = useSegments();
  
  // Subscribe to order updates
  useAdminOrdersSubscription(order.id);

  // Get status configuration
  const statusConfig = STATUS_CONFIG[order.status.toLowerCase()] || STATUS_CONFIG.pending;

  return (
    <Link href={`/${segments[0]}/orders/${order.id}`} asChild>
      <Pressable style={styles.container}>
        {/* Left Section with Order Icon */}
        <View style={styles.iconContainer}>
          <Icon 
            name="restaurant-outline" 
            size={24} 
            color={Colors.light.tint} 
          />
        </View>

        {/* Middle Section with Order Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Order #{order.id}</Text>
          <Text style={styles.time}>{dayjs(order.created_at).fromNow()}</Text>
          
          {/* Order Items Preview */}
          <View style={styles.itemsPreview}>
            {order.items && order.items.map((item, index) => (
              <Text key={index} numberOfLines={1} style={styles.itemText}>
                • {item.quantity}x {item.product.name}
              </Text>
            ))}
          </View>
        </View>

        {/* Right Section with Status */}
        <View style={[styles.statusContainer, { backgroundColor: `${statusConfig.color}15` }]}>
          <Icon 
            name={statusConfig.icon} 
            size={20} 
            color={statusConfig.color} 
          />
          <Text style={[styles.status, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Price Tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.tint}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  itemsPreview: {
    marginTop: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  priceTag: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OrderList;