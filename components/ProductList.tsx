import { Product } from "@/app/types";
import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { Link } from "expo-router";

type ProductListItemProps = {
  product: Product;
};

const ProductList = ({ product }: ProductListItemProps) => {
  return (
    <Link href={`/${product.id}`} asChild>
        <Pressable style={styles.container}>
        <Image source={{ uri: product.image }} resizeMode="contain" style={styles.image} />
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
    backgroundColor: 'white'
  }
});

export default ProductList;
