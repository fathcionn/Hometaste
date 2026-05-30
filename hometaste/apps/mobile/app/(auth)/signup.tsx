import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Button, Card, Input } from "../../components/ui";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { apiRequest } from "../../services/api";
import { useAuthStore, type AuthUser } from "../../store/auth.store";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});

type SignupForm = z.infer<typeof signupSchema>;

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export default function SignupScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const { control, handleSubmit, formState } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" }
  });

  async function onSubmit(values: SignupForm) {
    try {
      const session = await apiRequest<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(values)
      });
      await setSession(session.user, session.accessToken, session.refreshToken);
      router.replace("/welcome");
    } catch (error) {
      Alert.alert("Signup failed", error instanceof Error ? error.message : "Please try again");
    }
  }

  return (
    <View style={styles.screen}>
      <Card style={styles.card}>
        <Text style={styles.title}>Create your account</Text>
        <Controller control={control} name="name" render={({ field }) => <Input placeholder="Full name" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />} />
        <Controller control={control} name="email" render={({ field }) => <Input autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />} />
        <Controller control={control} name="password" render={({ field }) => <Input placeholder="Password" secureTextEntry value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />} />
        <Controller control={control} name="phone" render={({ field }) => <Input keyboardType="phone-pad" placeholder="Phone number" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />} />
        <Button disabled={formState.isSubmitting} onPress={handleSubmit(onSubmit)}>Sign Up</Button>
        <Link href="/(auth)/login" style={styles.link}>Already have an account?</Link>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", backgroundColor: Colors.bg, padding: Spacing.lg },
  card: { gap: Spacing.md },
  title: { ...Typography.displayMedium, color: Colors.text },
  link: { color: Colors.brand2, textAlign: "center" }
});
