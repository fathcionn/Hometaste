import { Tabs } from "expo-router";
import { Home, MessageCircle, Search, ShoppingBag, User } from "lucide-react-native";
import { Colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand2,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: { backgroundColor: Colors.panel, borderTopColor: Colors.line }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Home color={color} size={20} /> }} />
      <Tabs.Screen name="browse" options={{ title: "Browse", tabBarIcon: ({ color }) => <Search color={color} size={20} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color }) => <ShoppingBag color={color} size={20} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color }) => <MessageCircle color={color} size={20} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <User color={color} size={20} /> }} />
    </Tabs>
  );
}
