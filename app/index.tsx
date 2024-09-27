import { FlatList } from "react-native-gesture-handler";
import products from "@/assets/data/products";
import { StyleSheet } from "react-native";
import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductList product={item} />}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{gap: 10}}
      columnWrapperStyle={{gap: 10}}
    />
  );
}