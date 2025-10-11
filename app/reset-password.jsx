import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import supabase from "../contexts/supabaseClient";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkRecoverySession();
  }, []);

  const checkRecoverySession = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setError("Invalid or expired reset link. Please request a new password reset.");
    }
  };

  const handleResetPassword = async () => {
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess(true);

      // Sign out after password reset
      await supabase.auth.signOut();

      setTimeout(() => {
        alert("Password reset successfully! You can now login with your new password in the app.");
      }, 500);

    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.title}>Password Reset Successful!</Text>
          <Text style={styles.message}>
            Your password has been changed successfully.
          </Text>
          <Text style={styles.message}>
            You can now close this page and login with your new password in the RESBAC app.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>RESBAC</Text>
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>Enter your new password below</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password (min 6 characters)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Having trouble? Contact your barangay administrator for assistance.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    maxWidth: 450,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0060ff",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#0060ff",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 6,
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  successIcon: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
});
