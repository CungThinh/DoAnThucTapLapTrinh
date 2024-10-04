import { FlatList } from "react-native-gesture-handler";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import ProductList from "@/components/ProductList";
import { Text } from "react-native";
import { useFetchProducts } from "@/api/products";

export default function Home() {
  const { data: products, error, isLoading } = useFetchProducts();

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text>Failed to fetch products</Text>;
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductList product={item} />}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{ gap: 10 }}
      columnWrapperStyle={{ gap: 10 }}
    />
  );
}
