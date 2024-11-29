import { ActivityIndicator, FlatList, View } from "react-native";
import OrderList from "@/components/OrderList";
import { useAdminOrderList } from "@/api/orders";
import { Text } from "react-native";

export default function OrderScreen() {
  const { data: orders, isLoading, error } = useAdminOrderList();
  console.log(orders);

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return <Text>Failed to fetch</Text>;
  }
  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => <OrderList order={item} />}
      contentContainerStyle={{ gap: 10, padding: 10 }}
    />
  );
}
