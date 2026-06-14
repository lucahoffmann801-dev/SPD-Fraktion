import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvatarInitials } from "@/components/AvatarInitials";
import { usePortal } from "@/context/PortalContext";
import { useColors } from "@/hooks/useColors";
import type { FraktionProfile } from "@/lib/types";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, loading, currentProfile, login } = usePortal();
  const [selected, setSelected] = useState<string>("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      router.replace("/(tabs)");
    }
  }, [currentProfile]);

  useEffect(() => {
    if (data?.profiles?.length && !selected) {
      setSelected(data.profiles[0].slug);
    }
  }, [data?.profiles]);

  async function handleLogin() {
    if (!selected || !code) return;
    setLoggingIn(true);
    setErrorMsg(null);
    const err = await login(selected, code);
    setLoggingIn(false);
    if (err) {
      setErrorMsg(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Wird geladen…
        </Text>
      </View>
    );
  }

  const profiles = (data?.profiles ?? []).filter((p: FraktionProfile) => p.login_enabled !== false);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 20, paddingBottom: insets.bottom + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brandRow}>
        <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.brandText, { color: colors.foreground }]}>
          SPD-Fraktion Kaiserslautern
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Anmelden</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Profil auswählen
      </Text>

      {errorMsg && (
        <View style={[styles.errorBox, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
          <Text style={[styles.errorText, { color: "#b91c1c" }]}>{errorMsg}</Text>
        </View>
      )}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.slug}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.profileList}
        contentContainerStyle={styles.profileListContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelected(item.slug);
              Haptics.selectionAsync();
            }}
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: selected === item.slug ? colors.primary : colors.border,
                borderWidth: selected === item.slug ? 2 : 1,
              },
            ]}
          >
            <AvatarInitials profile={item} size={44} />
            <Text
              style={[styles.profileName, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {item.full_name}
            </Text>
            <Text style={[styles.profileRole, { color: colors.mutedForeground }]} numberOfLines={1}>
              {item.role}
            </Text>
            {selected === item.slug && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={12} color="#fff" />
              </View>
            )}
          </Pressable>
        )}
        scrollEnabled={profiles.length > 3}
      />

      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Zugangscode"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          value={code}
          onChangeText={setCode}
          onSubmitEditing={handleLogin}
          returnKeyType="done"
        />
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={loggingIn || !selected || !code}
        style={({ pressed }) => [
          styles.loginBtn,
          {
            backgroundColor:
              !selected || !code ? colors.muted : colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {loggingIn ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginBtnText}>Einloggen</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: -8,
    marginBottom: 4,
  },
  errorBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  profileList: {
    marginHorizontal: -24,
  },
  profileListContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  profileCard: {
    width: 110,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
  profileRole: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  loginBtn: {
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
});
