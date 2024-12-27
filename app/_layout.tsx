import { Stack, Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CartProvider from "@/context/CartProvider";
import AuthProvider from "@/context/AuthProvider";
import QueryProvider from "@/context/QueryProvider";
import RevenueScreen from '@/components/RevenueScreen';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@/constants/StripeSettings';

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <QueryProvider>
          <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            urlScheme="pizzaapp"
            merchantIdentifier="merchant.com.pizzaapp"
          >
            <CartProvider>
              <Stack>
                <Stack.Screen name="(user)" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="cart" options={{ presentation: "modal", headerShown: false }} />
              </Stack>
            </CartProvider>
          </StripeProvider>
        </QueryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
