import ProductDetail from "@/components/ProductDetail";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import products from "@/assets/data/products";
import { useState } from "react";
import Button from "@/components/Button";
import { useCart } from "@/context/CartProvider";
import { PizzaSize, Product } from "@/app/types";

const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const product = products.find((p) => p.id.toString() === id);
  const [sizeSelected, setSizeSelected] = useState(sizes[0])
  const {addItem} = useCart();
  const router = useRouter()

  const addToCart = () => {
    if(!product) {
        return;
    }
    addItem(product, sizeSelected);
    router.push('/cart')
  }

  if (!product) {
    return <h1>Product not found</h1>;
  }
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.name }} />
      <Image source={{ uri: product.image }} style={styles.image} />

      <Text> Select size</Text>
      <View style={styles.option}>
            {sizes.map((size) => 
            <Pressable onPress={() => setSizeSelected(size)} 
            style= {[styles.size, {
                backgroundColor: sizeSelected === size? 'gainsboro' : 'white'
            }]} key={size}>
                <Text style={styles.sizeText} key={size}>{size}</Text>
            </Pressable>
            )}
      </View>
      <Text style={styles.price}>${product.price}</Text>
      <Button text="Add to cart" onPress={addToCart}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 'auto'
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  size: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10
  },
  sizeText: {
    fontWeight: '500',
    fontSize: 20
  }
});

export default ProductDetailScreen;
