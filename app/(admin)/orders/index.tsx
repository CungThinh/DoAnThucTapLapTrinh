import { FlatList } from "react-native";
import orders from "@/assets/data/order";
import OrderList from "@/components/OrderList";

export default function OrderScreen() {


  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => <OrderList order={item} />}
      contentContainerStyle={{ gap: 10, padding: 10 }}
    />
  );

}