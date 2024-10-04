import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import orders from "@/assets/data/order";
import OrderList from "@/components/OrderList";
import { FlatList } from "react-native";
import OrderItemListItem from "@/components/OrderDetail";
import OrderDetail from "@/components/OrderDetail";

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const order = orders.find((o) => o.id.toString() === id)
    if(!order) {
        return <Text>Not found</Text>
    }

  return (
    <View style={{gap: 10, padding: 10}}>
      <Stack.Screen options={{title: `Order #${id}`}}/>
      <FlatList
        data={order.order_items}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListHeaderComponent={() => <OrderList order={order}/>}
      />
    </View>
  );
};

export default OrderDetailScreen;
