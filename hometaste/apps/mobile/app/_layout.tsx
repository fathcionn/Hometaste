import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const publishableKey = "pk_test_placeholder";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={publishableKey}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaProvider>
        </StripeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
