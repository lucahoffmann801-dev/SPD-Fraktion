import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { StatusBadge, prepTone } from "@/components/StatusBadge";
import { usePortal } from "@/context/PortalContext";
import { useColors } from "@/hooks/useColors";
import type { FraktionEvent } from "@/lib/types";

const PREP_LABEL: Record<string, string> = {
  offen: "offen",
  unterlagen_fehlen: "Unterlagen fehlen",
  vorbereiten: "vorbereiten",
  rueckfrage: "Rückfrage",
  vorbereitet: "vorbereitet",
  erledigt: "erledigt",
};

const PREP_OPTIONS = ["offen", "unterlagen_fehlen", "vorbereiten", "rueckfrage", "vorbereitet", "erledigt"];

function formatDate(value: string | null | undefined) {
  if (!value) return "kein Datum";
  const d = new Date(value);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function EventCard({ event, onPrep }: { event: FraktionEvent; onPrep: (event: FraktionEvent, status: string) => Promise<void> }) {
  const colors = useColors();
  const status = event.preparation_status || "offen";

  async function cyclePrep() {
    const idx = PREP_OPTIONS.indexOf(status);
    const next = PREP_OPTIONS[(idx + 1) % PREP_OPTIONS.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onPrep(event, next);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardMeta}>
          {event.category && (
            <Text style={[styles.category, { color: colors.primary }]}>{event.category}</Text>
          )}
          {event.meeting_body && (
            <Text style={[styles.body, { color: colors.mutedForeground }]} numberOfLines={1}>
              {event.meeting_body}
            </Text>
          )}
        </View>
        {event.requires_preparation !== false && (
          <Pressable onPress={cyclePrep}>
            <StatusBadge tone={prepTone(status)}>
              {PREP_LABEL[status] ?? status}
            </StatusBadge>
          </Pressable>
        )}
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        <Feather name="clock" size={12} /> {formatDate(event.starts_at)}
      </Text>
      {event.location && (
        <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
          <Feather name="map-pin" size={12} /> {event.location}
        </Text>
      )}
    </View>
  );
}

export default function TermineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, loading, reload, updateEventPrep } = usePortal();
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = useMemo(() => {
    return Array.from(new Set((data?.events ?? []).map(e => e.category || "Sonstiges"))).sort();
  }, [data?.events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.events ?? []).filter(e => {
      const cat = e.category || "Sonstiges";
      const matchCat = selectedCategories.length === 0 || selectedCategories.includes(cat);
      const matchQ = !q || `${e.title} ${e.meeting_body ?? ""} ${e.location ?? ""}`.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [data?.events, query, selectedCategories]);

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const activeFilters = selectedCategories.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Termine</Text>
        <Pressable onPress={() => setShowFilter(!showFilter)}>
          <View style={[styles.filterBtn, { backgroundColor: activeFilters > 0 ? colors.primary : colors.muted }]}>
            <Feather name="filter" size={16} color={activeFilters > 0 ? "#fff" : colors.mutedForeground} />
            {activeFilters > 0 && (
              <Text style={styles.filterCount}>{activeFilters}</Text>
            )}
          </View>
        </Pressable>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Suchen…"
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

      {showFilter && (
        <View style={[styles.filterPanel, { borderBottomColor: colors.border }]}>
          <Text style={[styles.filterTitle, { color: colors.mutedForeground }]}>Kategorie</Text>
          <View style={styles.chips}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                onPress={() => { toggleCategory(cat); Haptics.selectionAsync(); }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedCategories.includes(cat) ? colors.primary : colors.muted,
                    borderColor: selectedCategories.includes(cat) ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selectedCategories.includes(cat) ? "#fff" : colors.foreground }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
          {activeFilters > 0 && (
            <Pressable onPress={() => setSelectedCategories([])}>
              <Text style={[styles.clearText, { color: colors.primary }]}>Zurücksetzen</Text>
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="calendar" title="Keine Termine" subtitle="Keine Termine gefunden." />
        }
        renderItem={({ item }) => (
          <EventCard event={item} onPrep={updateEventPrep} />
        )}
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
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  filterCount: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#fff",
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
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  filterPanel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  clearText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardMeta: { flex: 1, gap: 2 },
  category: { fontFamily: "Inter_600SemiBold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  body: { fontFamily: "Inter_400Regular", fontSize: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 15 },
  date: { fontFamily: "Inter_400Regular", fontSize: 13 },
  location: { fontFamily: "Inter_400Regular", fontSize: 13 },
});
