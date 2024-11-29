import { FlatList } from "react-native";
import OrderList from "@/components/OrderList";
import { useMyOrderList } from "@/api/orders";

export default function OrderScreen() {
  const {data: orders, isLoading, error} = useMyOrderList();

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => <OrderList order={item} />}
      contentContainerStyle={{ gap: 10, padding: 10 }}
    />
  );

}