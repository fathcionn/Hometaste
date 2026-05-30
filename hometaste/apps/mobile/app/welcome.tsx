import { router } from "expo-router";
import { MotiView } from "moti";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card } from "../components/ui";
import { COUNTRIES } from "../constants/countries";
import { CUISINES } from "../constants/cuisines";
import { Colors, Radii, Spacing, Typography } from "../constants/theme";
import { useContextStore } from "../store/context.store";

export default function WelcomeScreen() {
  const { countryCode, city, cuisinePrefs, setCountry, setCity, toggleCuisine } = useContextStore();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }}>
        <Text style={styles.logo}>HomeTaste</Text>
        <Text style={styles.subtitle}>First, tell us where you are</Text>
      </MotiView>

      <Card style={styles.card}>
        <Text style={styles.label}>Which country are you in right now?</Text>
        <View style={styles.chipWrap}>
          {COUNTRIES.map((country) => (
            <Text key={country.code} onPress={() => setCountry(country.code)} style={[styles.chip, countryCode === country.code ? styles.chipActive : null]}>
              {country.flag} {country.name}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>Which city?</Text>
        <TextInput value={city ?? ""} onChangeText={setCity} placeholder="Istanbul, Berlin, Cairo..." placeholderTextColor={Colors.soft} style={styles.input} />

        <Text style={styles.label}>What cuisine are you craving today?</Text>
        <View style={styles.chipWrap}>
          {CUISINES.map((cuisine) => (
            <Text key={cuisine.id} onPress={() => toggleCuisine(cuisine.id)} style={[styles.chip, cuisinePrefs.includes(cuisine.id) ? styles.chipActive : null]}>
              {cuisine.emoji} {cuisine.name}
            </Text>
          ))}
        </View>

        <Button onPress={() => router.replace("/(tabs)")}>Find My Food</Button>
        <Button variant="ghost" onPress={() => router.replace("/(tabs)")}>Browse all</Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    gap: Spacing.xl,
    justifyContent: "center",
    backgroundColor: Colors.bg,
    padding: Spacing.lg
  },
  logo: {
    ...Typography.displayLarge,
    color: Colors.brand2,
    textAlign: "center"
  },
  subtitle: {
    ...Typography.body,
    color: Colors.muted,
    marginTop: Spacing.sm,
    textAlign: "center"
  },
  card: {
    gap: Spacing.lg
  },
  label: {
    ...Typography.label,
    color: Colors.muted,
    textTransform: "uppercase"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm
  },
  chip: {
    ...Typography.bodySmall,
    overflow: "hidden",
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    color: Colors.muted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  chipActive: {
    borderColor: Colors.brand,
    backgroundColor: "rgba(249,115,22,0.14)",
    color: Colors.brand2
  },
  input: {
    ...Typography.body,
    minHeight: 48,
    borderColor: Colors.line,
    borderRadius: Radii.md,
    borderWidth: 1,
    color: Colors.text,
    paddingHorizontal: Spacing.md
  }
});
