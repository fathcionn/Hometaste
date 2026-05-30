import { ShoppingCart } from "lucide-react-native";
import { memo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useCartStore } from "../../store/cart.store";

export interface CartButtonProps {
  onPress?: () => void;
}

function CartButtonBase({ onPress }: CartButtonProps) {
  const count = useCartStore((state) => state.getItemCount());
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) scale.value = withSequence(withSpring(1.16), withSpring(1));
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Animated.View style={animatedStyle}>
        <ShoppingCart color={Colors.text} size={20} />
      </Animated.View>
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const CartButton = memo(CartButtonBase);

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
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.xs
  },
  badgeText: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 10
  }
});
