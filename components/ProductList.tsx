import { Product } from "@/app/types";
import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { Link, useSegments } from "expo-router";
import { defaultPizzaImage } from "@/app/(admin)/menu/create";

type ProductListItemProps = {
  product: Product;
};

const ProductList = ({ product }: ProductListItemProps) => {
  const segments = useSegments();
  return (
    <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
      <Pressable style={styles.container}>
        <Image
          source={{ uri: product.image || defaultPizzaImage }}
          resizeMode="contain"
          style={styles.image}
        />
        <Text style={styles.title}>{product.name}</Text>
        <Text>{product.price}</Text>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  container: {
    padding: 10,
    borderRadius: 20,
    flex: 1,
    backgroundColor: "white",
    maxWidth: "50%",
  },
});

export default ProductList;
