import { MapPin } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";

export interface LocationPermissionSheetProps {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
}

export function LocationPermissionSheet({ visible, onAllow, onSkip }: LocationPermissionSheetProps) {
  const t = useT();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <MapPin size={40} color={Colors.brand} />
          <Text style={styles.title}>{t("location.permTitle")}</Text>
          <Text style={styles.body}>{t("location.permBody")}</Text>
          <Pressable accessibilityRole="button" style={styles.allowBtn} onPress={onAllow}>
            <Text style={styles.allowBtnText}>{t("location.allow")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipBtnText}>{t("location.skip")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)"
  },
  container: {
    gap: Spacing.md,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    backgroundColor: Colors.panel,
    padding: Spacing.xl
  },
  title: {
    ...Typography.headingLarge,
    color: Colors.text
  },
  body: {
    ...Typography.body,
    color: Colors.muted,
    lineHeight: 20
  },
  allowBtn: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
    backgroundColor: Colors.brand
  },
  allowBtnText: {
    ...Typography.button,
    color: Colors.text
  },
  skipBtn: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  skipBtnText: {
    ...Typography.button,
    color: Colors.muted
  }
});
