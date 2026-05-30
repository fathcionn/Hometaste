import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

export function Input(props: TextInputProps) {
  return placeholderTextColorAwareInput(props);
}

function placeholderTextColorAwareInput(props: TextInputProps) {
  return <TextInput placeholderTextColor={Colors.soft} style={[styles.input, props.style]} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    ...Typography.body,
    minHeight: 48,
    borderColor: Colors.line,
    borderRadius: Radii.md,
    borderWidth: 1,
    backgroundColor: Colors.panel2,
    color: Colors.text,
    paddingHorizontal: Spacing.md
  }
});
