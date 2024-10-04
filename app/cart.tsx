import { View, Text, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useCart } from "@/context/CartProvider";
import { useContext } from "react";
import { FlatList } from "react-native-gesture-handler";
import CartListItem from "@/components/CartListItems";
import Button from "@/components/Button";

export default function CartScreen() {
  const { cartItems, getTotalCartAmount } = useCart();
  return (
    <View>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{ padding: 10, gap: 10 }}
      />
      <Text style={{marginTop: 20, fontSize: 20,  fontWeight: '500'}}>Total: ${getTotalCartAmount()}</Text>
      <Button text="Checkout"></Button>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
