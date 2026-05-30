import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import type { Order } from "@hometaste/types";
import ConfettiCannon from "react-native-confetti-cannon";
import { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";
import { Button } from "../ui";

export interface RatingSheetProps {
  order: Order;
  open: boolean;
  onClose: () => void;
}

function RatingSheetBase({ order, open, onClose }: RatingSheetProps) {
  const t = useT();
  const snapPoints = useMemo(() => ["95%"], []);
  const [overall, setOverall] = useState(0);
  const [food, setFood] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [packaging, setPackaging] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [comment, setComment] = useState("");
  const [skipEnabled, setSkipEnabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSkipEnabled(true), 3000);
    return () => clearTimeout(timeout);
  }, [open]);

  function setAll(value: number): void {
    setOverall(value);
    setFood(value);
    setSpeed(value);
    setPackaging(value);
    setCommunication(value);
  }

  async function submit(): Promise<void> {
    if (!overall) return;
    await apiRequest(`/api/orders/${order.id}/review`, {
      auth: true,
      method: "POST",
      body: JSON.stringify({
        ratingOverall: overall,
        ratingFood: food || overall,
        ratingSpeed: speed || overall,
        ratingPackaging: packaging || overall,
        ratingComm: communication || overall,
        comment
      })
    });
    setSubmitted(true);
    setTimeout(onClose, 1200);
  }

  return (
    <BottomSheet index={open ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose={skipEnabled} onClose={onClose} backgroundStyle={styles.sheet}>
      <BottomSheetView style={styles.content}>
        {submitted ? <ConfettiCannon count={100} origin={{ x: 180, y: 0 }} colors={[Colors.brand, Colors.text]} fadeOut /> : null}
        <Text style={styles.title}>How was your order?</Text>
        <Text style={styles.muted}>{order.cook?.user?.name ?? "Home cook"} · {order.items.map((item) => item.dish?.name).filter(Boolean).join(", ")}</Text>
        <Stars value={overall} onChange={setAll} large />
        <RatingRow label={t("rating.food")} value={food || overall} onChange={setFood} />
        <RatingRow label={t("rating.speed")} value={speed || overall} onChange={setSpeed} />
        <RatingRow label={t("rating.packaging")} value={packaging || overall} onChange={setPackaging} />
        <RatingRow label={t("rating.communication")} value={communication || overall} onChange={setCommunication} />
        <TextInput value={comment} onChangeText={(value) => setComment(value.slice(0, 200))} multiline placeholder="Write a review" placeholderTextColor={Colors.soft} style={styles.input} />
        <Button disabled={!overall} onPress={() => void submit()}>Submit Review</Button>
        <Pressable disabled={!skipEnabled} onPress={onClose}><Text style={[styles.skip, !skipEnabled ? styles.skipDisabled : null]}>{skipEnabled ? "Skip for now" : "Skip (3)"}</Text></Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <View style={styles.ratingRow}><Text style={styles.label}>{label}</Text><Stars value={value} onChange={onChange} /></View>;
}

function Stars({ value, onChange, large }: { value: number; onChange: (value: number) => void; large?: boolean }) {
  return <View style={styles.stars}>{[1, 2, 3, 4, 5].map((star) => <Text key={star} onPress={() => onChange(star)} style={[large ? styles.starLarge : styles.star, star <= value ? styles.starActive : null]}>★</Text>)}</View>;
}

export const RatingSheet = memo(RatingSheetBase);

const styles = StyleSheet.create({
  sheet: { backgroundColor: Colors.panel },
  content: { gap: Spacing.md, padding: Spacing.lg },
  title: { ...Typography.headingLarge, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  stars: { flexDirection: "row", gap: Spacing.xs },
  star: { fontSize: 24, color: Colors.line },
  starLarge: { fontSize: 40, color: Colors.line },
  starActive: { color: Colors.brand },
  ratingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { ...Typography.body, color: Colors.text },
  input: { ...Typography.body, minHeight: 110, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, padding: Spacing.md, textAlignVertical: "top" },
  skip: { ...Typography.label, color: Colors.brand2, textAlign: "center" },
  skipDisabled: { color: Colors.soft }
});
