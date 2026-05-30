import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Button, Card, Input } from "../../components/ui";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { apiRequest } from "../../services/api";
import { useAuthStore, type AuthUser } from "../../store/auth.store";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type LoginForm = z.infer<typeof loginSchema>;

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const { control, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  async function onSubmit(values: LoginForm) {
    try {
      const session = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values)
      });
      await setSession(session.user, session.accessToken, session.refreshToken);
      router.replace("/welcome");
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Please try again");
    }
  }

  return (
    <View style={styles.screen}>
      <Card style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Controller control={control} name="email" render={({ field }) => <Input autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />} />
        <Controller control={control} name="password" render={({ field }) => <Input placeholder="Password" secureTextEntry value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />} />
        <Button disabled={formState.isSubmitting} onPress={handleSubmit(onSubmit)}>Log In</Button>
        <Link href="/(auth)/signup" style={styles.link}>Create an account</Link>
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
