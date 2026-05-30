import { Heart } from "lucide-react-native";
import { memo, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { useFavoritesStore } from "../../store/favorites.store";

export interface FavoriteButtonProps {
  dishId?: string;
  cookId?: string;
  size?: number;
}

function FavoriteButtonBase({ dishId, cookId, size = 18 }: FavoriteButtonProps) {
  const isDishFavorited = useFavoritesStore((state) => state.isDishFavorited);
  const isCookFavorited = useFavoritesStore((state) => state.isCookFavorited);
  const toggleDish = useFavoritesStore((state) => state.toggleDish);
  const toggleCook = useFavoritesStore((state) => state.toggleCook);
  const active = dishId ? isDishFavorited(dishId) : cookId ? isCookFavorited(cookId) : false;
  const progress = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(active ? 1 : 0);
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], ["rgba(16,16,18,0.52)", "rgba(239,68,68,0.95)"])
  }));

  function toggle(): void {
    scale.value = withSequence(withSpring(1.3), withSpring(1));
    if (dishId) toggleDish(dishId);
    if (cookId) toggleCook(cookId);
  }

  return (
    <Pressable accessibilityRole="button" onPress={toggle} hitSlop={10}>
      <Animated.View style={[styles.button, { width: size + 18, height: size + 18, borderRadius: (size + 18) / 2 }, animatedStyle]}>
        <Heart size={size} color={active ? Colors.text : Colors.muted} fill={active ? Colors.text : "transparent"} />
      </Animated.View>
    </Pressable>
  );
}

export const FavoriteButton = memo(FavoriteButtonBase);

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center"
  }
});
