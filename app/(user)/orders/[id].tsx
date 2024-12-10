import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import orders from "@/assets/data/order";
import OrderList from "@/components/OrderList";
import { FlatList } from "react-native";
import OrderItemListItem from "@/components/OrderDetail";
import { useOrderDetails } from "@/api/orders";
import { ActivityIndicator } from "react-native";

const OrderDetailScreen = () => {
  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);
  const { data: order, isLoading, error } = useOrderDetails(id);

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  if (error || !order) {
    return <Text>Failed to fetch</Text>;
  }

  return (
    <View style={{ gap: 10, padding: 10 }}>
      <Stack.Screen options={{ title: `Order #${id}` }} />
      <FlatList
        data={order.order_items}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListHeaderComponent={() => <OrderList order={order} />}
      />
    </View>
  );
};

export default OrderDetailScreen;
