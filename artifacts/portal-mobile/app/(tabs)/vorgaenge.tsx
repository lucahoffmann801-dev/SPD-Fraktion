import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge, priorityTone } from "@/components/StatusBadge";
import { usePortal } from "@/context/PortalContext";
import { useColors } from "@/hooks/useColors";
import type { FraktionCase } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  offen: "offen",
  in_bearbeitung: "in Bearbeitung",
  wartet: "wartet",
  entschieden: "entschieden",
  erledigt: "erledigt",
  archiv: "Archiv",
};

function statusTone(status: string | null | undefined) {
  if (status === "erledigt" || status === "entschieden") return "green" as const;
  if (status === "in_bearbeitung") return "blue" as const;
  if (status === "wartet") return "gold" as const;
  if (status === "archiv") return "gray" as const;
  return "default" as const;
}

function CaseCard({ caseItem }: { caseItem: FraktionCase }) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
          {caseItem.title}
        </Text>
        <StatusBadge tone={statusTone(caseItem.status)}>
          {STATUS_LABEL[caseItem.status] ?? caseItem.status}
        </StatusBadge>
      </View>

      {caseItem.description && (
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {caseItem.description.replace(/\s*\[[^\]]*\]/g, "").trim()}
        </Text>
      )}

      <View style={styles.cardMeta}>
        {caseItem.owner && (
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            <Feather name="user" size={11} /> {caseItem.owner}
          </Text>
        )}
        {caseItem.next_step && (
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            <Feather name="arrow-right" size={11} /> {caseItem.next_step}
          </Text>
        )}
        <StatusBadge tone={priorityTone(caseItem.priority)}>
          {caseItem.priority ?? "normal"}
        </StatusBadge>
      </View>
    </View>
  );
}

export default function VorgaengeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, loading, reload } = usePortal();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const cases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.cases ?? []).filter(c => {
      if (!showArchived && (c.status === "archiv" || c.status === "erledigt")) return false;
      if (q && !`${c.title} ${c.owner ?? ""} ${c.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data?.cases, query, showArchived]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Vorgänge</Text>
        <Pressable
          onPress={() => setShowArchived(!showArchived)}
          style={[styles.archiveBtn, { backgroundColor: showArchived ? colors.primary : colors.muted }]}
        >
          <Feather name="archive" size={16} color={showArchived ? "#fff" : colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Vorgänge suchen…"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="folder" title="Keine Vorgänge" subtitle={showArchived ? "Keine Vorgänge gefunden." : "Keine aktiven Vorgänge."} />
        }
        renderItem={({ item }) => <CaseCard caseItem={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  heading: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  archiveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, flex: 1 },
  cardDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
