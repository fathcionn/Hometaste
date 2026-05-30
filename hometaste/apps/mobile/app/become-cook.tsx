import { CUISINES, SpiceLevel, type AuthSession } from "@hometaste/types";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { apiRequest } from "../services/api";
import { Colors, Radii, Spacing, Typography } from "../constants/theme";
import { COUNTRIES } from "../constants/countries";
import { useAuthStore } from "../store/auth.store";
import { useContextStore } from "../store/context.store";
import { useT } from "../store/locale.store";
import { Button } from "../components/ui";
import { LocationPermissionSheet } from "../components/common/LocationPermissionSheet";
import { useCookLocation } from "../hooks/useCookLocation";
import { MMKVStorage } from "../utils/mmkv";

const DRAFT_KEY = "draft";

const personalSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10)
});

interface CookDraft {
  name: string;
  email: string;
  password: string;
  phone: string;
  originCountry: string;
  city: string;
  bio: string;
  specialties: string[];
  languages: string[];
  photoUri: string | null;
  photoVerified: boolean;
  dishName: string;
  dishCuisine: string;
  dishDescription: string;
  basePrice: string;
  prepTime: string;
  spiceLevel: SpiceLevel;
  dishPhotoUri: string | null;
  dishPhotoVerified: boolean;
  availabilityDays: string[];
  fromTime: string;
  toTime: string;
}

const initialDraft: CookDraft = {
  name: "",
  email: "",
  password: "",
  phone: "",
  originCountry: "TR",
  city: "",
  bio: "",
  specialties: [],
  languages: ["English"],
  photoUri: null,
  photoVerified: false,
  dishName: "",
  dishCuisine: "turkish",
  dishDescription: "",
  basePrice: "",
  prepTime: "45",
  spiceLevel: SpiceLevel.Medium,
  dishPhotoUri: null,
  dishPhotoVerified: false,
  availabilityDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  fromTime: "12:00",
  toTime: "20:00"
};

export default function BecomeCookScreen() {
  const t = useT();
  const currencySymbol = useContextStore((state) => state.currencySymbol ?? "$");
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CookDraft>(() => readDraft());
  const [pendingLocationCookId, setPendingLocationCookId] = useState<string | null>(null);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const { updateCookLocation } = useCookLocation();
  const progress = (step + 1) / 5;

  useEffect(() => {
    MMKVStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  function update<K extends keyof CookDraft>(key: K, value: CookDraft[K]): void {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function next(): void {
    if (step === 0) {
      const parsed = personalSchema.safeParse(draft);
      if (!parsed.success) {
        Alert.alert("Check your details", parsed.error.issues[0]?.message ?? "Please complete the fields");
        return;
      }
    }
    if (step < 4) setStep((value) => value + 1);
  }

  async function pickPhoto(kind: "profile" | "dish", camera: boolean): Promise<void> {
    const result = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (!uri) return;
    const cropped = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG });
    if (kind === "profile") {
      update("photoUri", cropped.uri);
      update("photoVerified", camera);
    } else {
      update("dishPhotoUri", cropped.uri);
      update("dishPhotoVerified", camera);
    }
  }

  async function submit(): Promise<void> {
    try {
      const session = await apiRequest<AuthSession>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email: draft.email, password: draft.password, name: draft.name, phone: draft.phone, role: "COOK" })
      });
      await setSession(session.user, session.accessToken, session.refreshToken);
      const cook = await apiRequest<{ id: string }>("/api/cooks", {
        auth: true,
        method: "POST",
        body: JSON.stringify({
          originCountry: draft.originCountry,
          currentCity: draft.city,
          bio: draft.bio,
          cuisines: draft.specialties.length > 0 ? draft.specialties : [draft.dishCuisine],
          specialties: draft.specialties,
          availability: `${draft.availabilityDays.join(", ")} ${draft.fromTime}-${draft.toTime}`,
          prepTime: `${draft.prepTime} min`
        })
      });
      await apiRequest("/api/dishes", {
        auth: true,
        method: "POST",
        body: JSON.stringify({
          name: draft.dishName,
          description: draft.dishDescription,
          cuisine: draft.dishCuisine,
          ingredients: [],
          spiceLevel: draft.spiceLevel,
          prepTime: Number(draft.prepTime),
          basePrice: Number(draft.basePrice),
          imageVerified: draft.dishPhotoVerified,
          tags: draft.specialties
        })
      });
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status === "undetermined") {
        setPendingLocationCookId(cook.id);
        setShowLocationSheet(true);
        return;
      }
      updateCookLocation(cook.id).catch(() => {});
      finishCookSignup();
    } catch (error) {
      Alert.alert(t("toast.error"), error instanceof Error ? error.message : t("toast.error"));
    }
  }

  function finishCookSignup(): void {
    MMKVStorage.removeItem(DRAFT_KEY);
    router.replace("/cook/studio");
  }

  function allowLocation(): void {
    const cookId = pendingLocationCookId;
    setShowLocationSheet(false);
    setPendingLocationCookId(null);
    if (cookId) updateCookLocation(cookId).catch(() => {});
    finishCookSignup();
  }

  function skipLocation(): void {
    setShowLocationSheet(false);
    setPendingLocationCookId(null);
    finishCookSignup();
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>{t("become.title")}</Text>
        <View style={styles.progress}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
        <MotiView key={step} from={{ opacity: 0, translateX: 24 }} animate={{ opacity: 1, translateX: 0 }} style={styles.card}>
          {step === 0 ? <PersonalStep draft={draft} update={update} /> : null}
          {step === 1 ? <KitchenStep draft={draft} update={update} /> : null}
          {step === 2 ? <PhotoStep title={t("form.photo")} uri={draft.photoUri} verified={draft.photoVerified} onPick={(camera) => void pickPhoto("profile", camera)} /> : null}
          {step === 3 ? <MenuStep draft={draft} update={update} currencySymbol={currencySymbol} onPick={(camera) => void pickPhoto("dish", camera)} /> : null}
          {step === 4 ? <AvailabilityStep draft={draft} update={update} /> : null}
        </MotiView>
        <View style={styles.actions}>
          {step > 0 ? <Button variant="secondary" onPress={() => setStep((value) => value - 1)}>Back</Button> : null}
          {step < 4 ? <Button onPress={next}>Next</Button> : <Button onPress={() => void submit()}>Start Cooking Now</Button>}
        </View>
      </ScrollView>
      <LocationPermissionSheet visible={showLocationSheet} onAllow={allowLocation} onSkip={skipLocation} />
    </>
  );
}

function readDraft(): CookDraft {
  const value = MMKVStorage.getItem(DRAFT_KEY);
  if (!value) return initialDraft;
  try {
    return { ...initialDraft, ...(JSON.parse(value) as Partial<CookDraft>) };
  } catch {
    return initialDraft;
  }
}

function Field({ label, value, onChangeText, secure }: { label: string; value: string; onChangeText: (value: string) => void; secure?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} secureTextEntry={secure} placeholder={label} placeholderTextColor={Colors.soft} style={styles.input} /></View>;
}

function PersonalStep({ draft, update }: { draft: CookDraft; update: <K extends keyof CookDraft>(key: K, value: CookDraft[K]) => void }) {
  const strength = passwordStrength(draft.password);
  return <><Field label="Full name" value={draft.name} onChangeText={(value) => update("name", value)} /><Field label="Email" value={draft.email} onChangeText={(value) => update("email", value)} /><Field label="Password" value={draft.password} secure onChangeText={(value) => update("password", value)} /><View style={styles.strength}><View style={[styles.strengthFill, { width: `${strength * 25}%`, backgroundColor: strength > 3 ? Colors.success : strength > 1 ? Colors.brand : Colors.error }]} /></View><Field label="Phone" value={draft.phone} onChangeText={(value) => update("phone", value)} /></>;
}

function KitchenStep({ draft, update }: { draft: CookDraft; update: <K extends keyof CookDraft>(key: K, value: CookDraft[K]) => void }) {
  return <><Text style={styles.label}>Country of origin</Text><View style={styles.wrap}>{COUNTRIES.map((country) => <Text key={country.code} onPress={() => update("originCountry", country.code)} style={[styles.chip, draft.originCountry === country.code ? styles.chipActive : null]}>{country.flag} {country.name}</Text>)}</View><Field label="City" value={draft.city} onChangeText={(value) => update("city", value)} /><Field label="Bio" value={draft.bio} onChangeText={(value) => update("bio", value.slice(0, 200))} /><Text style={styles.label}>Specialties</Text><CuisinePicker selected={draft.specialties} onToggle={(id) => update("specialties", toggle(draft.specialties, id))} /></>;
}

function PhotoStep({ title, uri, verified, onPick }: { title: string; uri: string | null; verified: boolean; onPick: (camera: boolean) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{title}</Text><View style={styles.photo}>{uri ? <Text style={styles.photoText}>{verified ? "📸 Live Verified" : "Gallery photo"}</Text> : <Text style={styles.photoText}>No photo yet</Text>}</View><Button onPress={() => onPick(true)}>Camera</Button><Button variant="secondary" onPress={() => onPick(false)}>Gallery</Button></View>;
}

function MenuStep({ draft, update, currencySymbol, onPick }: { draft: CookDraft; update: <K extends keyof CookDraft>(key: K, value: CookDraft[K]) => void; currencySymbol: string; onPick: (camera: boolean) => void }) {
  return <><Field label="Dish name" value={draft.dishName} onChangeText={(value) => update("dishName", value)} /><Field label="Description" value={draft.dishDescription} onChangeText={(value) => update("dishDescription", value)} /><Field label={`Base price (${currencySymbol})`} value={draft.basePrice} onChangeText={(value) => update("basePrice", value)} /><Field label="Prep time minutes" value={draft.prepTime} onChangeText={(value) => update("prepTime", value)} /><Text style={styles.label}>Cuisine</Text><CuisinePicker selected={[draft.dishCuisine]} onToggle={(id) => update("dishCuisine", id)} /><Text style={styles.label}>Spice</Text><View style={styles.wrap}>{Object.values(SpiceLevel).map((level) => <Text key={level} onPress={() => update("spiceLevel", level)} style={[styles.chip, draft.spiceLevel === level ? styles.chipActive : null]}>{level}</Text>)}</View><PhotoStep title="Dish photo" uri={draft.dishPhotoUri} verified={draft.dishPhotoVerified} onPick={onPick} /></>;
}

function AvailabilityStep({ draft, update }: { draft: CookDraft; update: <K extends keyof CookDraft>(key: K, value: CookDraft[K]) => void }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return <><Text style={styles.label}>Days available</Text><View style={styles.wrap}>{days.map((day) => <Text key={day} onPress={() => update("availabilityDays", toggle(draft.availabilityDays, day))} style={[styles.chip, draft.availabilityDays.includes(day) ? styles.chipActive : null]}>{day}</Text>)}</View><Field label="From time" value={draft.fromTime} onChangeText={(value) => update("fromTime", value)} /><Field label="To time" value={draft.toTime} onChangeText={(value) => update("toTime", value)} /><View style={styles.preview}><Text style={styles.sectionTitle}>{draft.name || "Your profile"}</Text><Text style={styles.muted}>{draft.bio || "Bio preview"}</Text></View></>;
}

function CuisinePicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return <View style={styles.wrap}>{CUISINES.filter((cuisine) => cuisine.id !== "all").map((cuisine) => <Text key={cuisine.id} onPress={() => onToggle(cuisine.id)} style={[styles.chip, selected.includes(cuisine.id) ? styles.chipActive : null]}>{cuisine.emoji} {cuisine.name}</Text>)}</View>;
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function passwordStrength(password: string): number {
  return [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: Spacing.lg, backgroundColor: Colors.bg, padding: Spacing.lg, paddingTop: 64 },
  title: { ...Typography.displayMedium, color: Colors.text },
  progress: { height: 8, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.line },
  progressFill: { height: 8, borderRadius: Radii.pill, backgroundColor: Colors.brand },
  card: { gap: Spacing.md, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.lg },
  field: { gap: Spacing.sm },
  label: { ...Typography.label, color: Colors.muted, textTransform: "uppercase" },
  input: { ...Typography.body, minHeight: 48, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, paddingHorizontal: Spacing.md },
  strength: { height: 6, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.line },
  strengthFill: { height: 6, borderRadius: Radii.pill },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: { ...Typography.bodySmall, overflow: "hidden", borderColor: Colors.line, borderRadius: Radii.pill, borderWidth: 1, color: Colors.muted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  chipActive: { borderColor: Colors.brand, backgroundColor: Colors.brand, color: Colors.text },
  photo: { height: 120, alignItems: "center", justifyContent: "center", borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, backgroundColor: Colors.panel2 },
  photoText: { ...Typography.body, color: Colors.muted },
  preview: { gap: Spacing.sm, borderRadius: Radii.md, backgroundColor: Colors.panel2, padding: Spacing.md },
  sectionTitle: { ...Typography.headingMedium, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  actions: { flexDirection: "row", gap: Spacing.md, justifyContent: "flex-end" }
});
