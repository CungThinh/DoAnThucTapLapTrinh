import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useCart } from "@/context/CartProvider";

function CartIcon() {
  const { items } = useCart();
  
  // Đếm số loại item khác nhau trong giỏ hàng
  const itemCount = items.length;

  return (
    <Link href="/cart" asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={styles.container}>
            <FontAwesome
              name="shopping-cart"
              size={25}
              color={Colors.light.tint}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

export default function MenuStack() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <CartIcon />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Menu" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 3,
  },
});