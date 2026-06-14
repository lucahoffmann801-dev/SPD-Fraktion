import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Tone = "default" | "red" | "green" | "blue" | "gold" | "gray";

const TONE_COLORS: Record<Tone, { bg: string; text: string }> = {
  default: { bg: "#e2e2e7", text: "#1a1a1a" },
  red: { bg: "#fee2e2", text: "#b91c1c" },
  green: { bg: "#dcfce7", text: "#15803d" },
  blue: { bg: "#dbeafe", text: "#1d4ed8" },
  gold: { bg: "#fef3c7", text: "#b45309" },
  gray: { bg: "#f4f4f5", text: "#71717a" },
};

type Props = {
  children: string;
  tone?: Tone;
};

export function StatusBadge({ children, tone = "default" }: Props) {
  const c = TONE_COLORS[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{children}</Text>
    </View>
  );
}

export function priorityTone(priority: string | null | undefined): Tone {
  if (priority === "kritisch" || priority === "hoch") return "red";
  if (priority === "normal") return "blue";
  return "gray";
}

export function statusTone(status: string | null | undefined): Tone {
  if (status === "erledigt") return "green";
  if (status === "in_bearbeitung") return "blue";
  if (status === "rueckfrage" || status === "verworfen") return "red";
  if (status === "pruefung") return "gold";
  return "gray";
}

export function prepTone(status: string | null | undefined): Tone {
  if (status === "vorbereitet" || status === "erledigt") return "green";
  if (status === "unterlagen_fehlen" || status === "rueckfrage") return "red";
  if (status === "vorbereiten") return "blue";
  return "gray";
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
