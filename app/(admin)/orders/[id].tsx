import { View, Text, Pressable, StyleSheet} from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import orders from "@/assets/data/order";
import OrderList from "@/components/OrderList";
import { FlatList } from "react-native";
import OrderDetail from "@/components/OrderDetail";
import { OrderStatusList } from "@/app/types";
import { Colors } from "@/constants/Colors";

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const order = orders.find((o) => o.id.toString() === id);
  if (!order) {
    return <Text>Not found</Text>;
  }

  const updateOrderStatus = () => {
    console.log("Updated");
  };

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
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        {OrderStatusList.map((status) => (
          <Pressable style={[styles.statusButton, {backgroundColor: order.status === status ? Colors.light.tint :'transparent'}]} key={status} onPress={updateOrderStatus}>
            <Text style={{color: order.status === status ? 'white': Colors.light.tint}}>{status}</Text>
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
    borderRadius: 5 ,
    marginVertical: 10
  }
})

export default OrderDetailScreen;
