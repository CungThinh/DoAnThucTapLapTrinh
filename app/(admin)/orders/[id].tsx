import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import orders from "@/assets/data/order";
import OrderList from "@/components/OrderList";
import { FlatList } from "react-native";
import OrderDetail from "@/components/OrderDetail";
import { OrderStatusList } from "@/app/types";
import { Colors } from "@/constants/Colors";
import { useOrderDetails, useUpdateOrder } from "@/api/orders";

const OrderDetailScreen = () => {
  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);
  const { data: order, isLoading, error } = useOrderDetails(id);
  const { mutate: updateOrder } = useUpdateOrder();

  const updateOrderStatus = (status: string) => {
    updateOrder({ id: id, updatedField: { status } });
  };

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
        renderItem={({ item }) => <OrderDetail item={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListHeaderComponent={() => <OrderList order={order} />}
      />
      <Text style={{ fontWeight: "bold" }}>Status</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {OrderStatusList.map((status) => (
          <Pressable
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  order.status === status ? Colors.light.tint : "transparent",
              },
            ]}
            key={status}
            onPress={() => updateOrderStatus(status)}
          >
            <Text
              style={{
                color: order.status === status ? "white" : Colors.light.tint,
              }}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusButton: {
    borderColor: Colors.light.tint,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});

export default OrderDetailScreen;
