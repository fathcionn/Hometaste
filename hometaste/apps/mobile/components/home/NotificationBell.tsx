import type { Notification } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { memo, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

interface NotificationsResponse {
  notifications: Notification[];
}

function NotificationBellBase() {
  const previousCount = useRef(0);
  const shake = useSharedValue(0);
  const { data } = useQuery<NotificationsResponse, Error>({
    queryKey: ["notifications", "unread"],
    queryFn: () => apiRequest<NotificationsResponse>("/api/notifications?unread=true", { auth: true }),
    refetchInterval: 30000,
    retry: false
  });
  const count = data?.notifications.length ?? 0;

  useEffect(() => {
    if (count > previousCount.current) {
      shake.value = withSequence(withSpring(-10), withSpring(10), withSpring(0));
    }
    previousCount.current = count;
  }, [count, shake]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));

  return (
    <Pressable accessibilityRole="button" onPress={() => router.push("/notifications")} style={styles.button}>
      <Animated.View style={animatedStyle}>
        <Bell color={Colors.text} size={20} />
      </Animated.View>
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const NotificationBell = memo(NotificationBellBase);

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    backgroundColor: Colors.panel
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.pill,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.xs
  },
  badgeText: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 10
  }
});
