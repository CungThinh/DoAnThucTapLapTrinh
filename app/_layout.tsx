import { Stack, Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "@/context/CartProvider";
import AuthProvider from "@/context/AuthProvider";
import QueryProvider from "@/context/QueryProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <QueryProvider>
          <CartProvider>
            <Stack>
              <Stack.Screen name="(user)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen name="cart" options={{ presentation: "modal" }} />
            </Stack>
          </CartProvider>
        </QueryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
