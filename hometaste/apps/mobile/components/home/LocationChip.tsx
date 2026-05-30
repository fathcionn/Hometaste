import { ChevronDown } from "lucide-react-native";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { COUNTRIES } from "../../constants/countries";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useContextStore } from "../../store/context.store";

function LocationChipBase() {
  const countryCode = useContextStore((state) => state.countryCode);
  const city = useContextStore((state) => state.city);
  const rotate = useSharedValue(0);
  const country = COUNTRIES.find((item) => item.code === countryCode) ?? COUNTRIES[0]!;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        rotate.value = withSpring(180);
        router.push("/welcome");
      }}
      style={styles.chip}
    >
      <Text style={styles.text}>{country.flag} {city ?? country.name}</Text>
      <Animated.View style={animatedStyle}>
        <ChevronDown color={Colors.muted} size={16} />
      </Animated.View>
    </Pressable>
  );
}

export const LocationChip = memo(LocationChipBase);

const styles = StyleSheet.create({
  chip: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    backgroundColor: Colors.panel,
    paddingHorizontal: Spacing.md
  },
  text: {
    ...Typography.label,
    color: Colors.text
  }
});
