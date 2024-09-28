import { Stack, Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "@/context/CartProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <CartProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{presentation: 'modal'}}/>
        </Stack>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
