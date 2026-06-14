import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvatarInitials } from "@/components/AvatarInitials";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge, prepTone, statusTone } from "@/components/StatusBadge";
import { usePortal } from "@/context/PortalContext";
import { useColors } from "@/hooks/useColors";
import type { FraktionEvent, FraktionTask } from "@/lib/types";

const PREP_LABEL: Record<string, string> = {
  offen: "offen",
  unterlagen_fehlen: "Unterlagen fehlen",
  vorbereiten: "vorbereiten",
  rueckfrage: "Rückfrage",
  vorbereitet: "vorbereitet",
  erledigt: "erledigt",
};

const TASK_LABEL: Record<string, string> = {
  offen: "offen",
  in_bearbeitung: "in Arbeit",
  rueckfrage: "Rückfrage",
  wartend: "wartet",
  pruefung: "zur Prüfung",
  erledigt: "erledigt",
  verworfen: "verworfen",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "kein Datum";
  const d = new Date(value);
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

function StatCard({ label, value, hint, color }: { label: string; value: number; hint: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.statHint, { color: colors.mutedForeground }]}>{hint}</Text>
    </View>
  );
}

function EventRow({ event, onPrep }: { event: FraktionEvent; onPrep: (event: FraktionEvent, status: string) => Promise<void> }) {
  const colors = useColors();
  const status = event.preparation_status || "offen";
  const prepOptions = ["offen", "vorbereiten", "vorbereitet", "erledigt"];

  async function cyclePrep() {
    const idx = prepOptions.indexOf(status);
    const next = prepOptions[(idx + 1) % prepOptions.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onPrep(event, next);
  }

  return (
    <View style={[styles.eventRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>
          {formatDate(event.starts_at)}
        </Text>
        {event.location && (
          <Text style={[styles.eventLocation, { color: colors.mutedForeground }]} numberOfLines={1}>
            <Feather name="map-pin" size={11} /> {event.location}
          </Text>
        )}
      </View>
      <Pressable onPress={cyclePrep} style={styles.prepButton}>
        <StatusBadge tone={prepTone(status)}>
          {PREP_LABEL[status] ?? status}
        </StatusBadge>
      </Pressable>
    </View>
  );
}

function TaskRow({ task, onStatus }: { task: FraktionTask; onStatus: (task: FraktionTask, status: string) => Promise<void> }) {
  const colors = useColors();
  const statusOptions = ["offen", "in_bearbeitung", "pruefung", "erledigt"];

  async function cycleStatus() {
    const idx = statusOptions.indexOf(task.status);
    const next = statusOptions[(idx + 1) % statusOptions.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onStatus(task, next);
  }

  return (
    <View style={[styles.taskRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.due_date && (
          <Text style={[styles.taskDue, { color: colors.mutedForeground }]}>
            fällig {new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(new Date(task.due_date))}
          </Text>
        )}
      </View>
      <Pressable onPress={cycleStatus} style={styles.prepButton}>
        <StatusBadge tone={statusTone(task.status)}>
          {TASK_LABEL[task.status] ?? task.status}
        </StatusBadge>
      </Pressable>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, loading, currentProfile, reload, updateTaskStatus, updateEventPrep } = usePortal();

  const upcoming = useMemo(() => {
    if (!data?.events) return [];
    return data.events
      .filter(e => new Date(e.starts_at).getTime() >= Date.now() - 86400000)
      .slice(0, 10);
  }, [data?.events]);

  const prepEvents = useMemo(() =>
    upcoming.filter(e => e.requires_preparation !== false && (e.preparation_status ?? "offen") !== "erledigt"),
    [upcoming]);

  const openTasks = useMemo(() => {
    if (!data?.tasks) return [];
    return data.tasks.filter(t =>
      t.status !== "erledigt" && t.status !== "verworfen"
    );
  }, [data?.tasks]);

  const myTasks = useMemo(() => {
    if (!currentProfile) return openTasks;
    return openTasks.filter(t => {
      if (!t.assignee) return true;
      return t.assignee.includes(currentProfile.full_name) || t.assignee.includes(currentProfile.display_name);
    });
  }, [openTasks, currentProfile]);

  const activeCases = useMemo(() =>
    (data?.cases ?? []).filter(c => c.status !== "erledigt" && c.status !== "archiv"),
    [data?.cases]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
      }
    >
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Heute</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {currentProfile?.display_name ?? ""}
          </Text>
        </View>
        {currentProfile && <AvatarInitials profile={currentProfile} size={40} />}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Vorbereitung" value={prepEvents.length} hint="offen" color={colors.primary} />
        <StatCard label="Aufgaben" value={myTasks.length} hint="für dich" color={colors.info} />
        <StatCard label="Vorgänge" value={activeCases.length} hint="aktiv" color={colors.warning} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vorbereitung</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Termine mit offenem Status</Text>
        {prepEvents.length === 0 ? (
          <EmptyState icon="calendar" title="Alles vorbereitet" subtitle="Keine offenen Termine." />
        ) : (
          prepEvents.slice(0, 6).map(event => (
            <EventRow key={event.id} event={event} onPrep={updateEventPrep} />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Meine Aufgaben</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Offene Aufgaben für dich</Text>
        {myTasks.length === 0 ? (
          <EmptyState icon="check-circle" title="Keine offenen Aufgaben" />
        ) : (
          myTasks.slice(0, 6).map(task => (
            <TaskRow key={task.id} task={task} onStatus={updateTaskStatus} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -1,
  },
  statLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textAlign: "center",
  },
  statHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: -4,
    marginBottom: 4,
  },
  eventRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  eventInfo: { flex: 1, gap: 3 },
  eventTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  eventDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  eventLocation: { fontFamily: "Inter_400Regular", fontSize: 12 },
  taskRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  taskInfo: { flex: 1, gap: 3 },
  taskTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  taskDue: { fontFamily: "Inter_400Regular", fontSize: 12 },
  prepButton: { paddingTop: 2 },
});
