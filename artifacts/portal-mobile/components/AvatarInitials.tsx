import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { FraktionProfile } from "@/lib/types";

const ACCENT_COLORS: Record<string, string> = {
  red: "#E3000F",
  blue: "#1e40af",
  green: "#15803d",
  gold: "#b45309",
  purple: "#7c3aed",
};

type Props = {
  profile: FraktionProfile;
  size?: number;
};

export function AvatarInitials({ profile, size = 40 }: Props) {
  const colors = useColors();
  const accentColor = profile.accent ? (ACCENT_COLORS[profile.accent] ?? colors.primary) : colors.primary;
  const fontSize = size * 0.38;

  return (
    <View style={[styles.avatar, {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: accentColor,
    }]}>
      <Text style={[styles.initials, { fontSize, color: "#fff" }]}>
        {profile.avatar_initials || profile.display_name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
