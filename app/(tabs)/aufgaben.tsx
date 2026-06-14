import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge, priorityTone, statusTone } from "@/components/StatusBadge";
import { usePortal } from "@/context/PortalContext";
import { useColors } from "@/hooks/useColors";
import type { FraktionTask } from "@/lib/types";

const TASK_LABEL: Record<string, string> = {
  offen: "offen",
  in_bearbeitung: "in Arbeit",
  rueckfrage: "Rückfrage",
  wartend: "wartet",
  pruefung: "zur Prüfung",
  erledigt: "erledigt",
  verworfen: "verworfen",
};

const BOARD_STATUSES = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt"];
const ACTIVE_STATUSES = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung"];

function formatDue(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(new Date(value));
}

function StatusPicker({ task, onStatus, onClose }: {
  task: FraktionTask;
  onStatus: (task: FraktionTask, status: string) => Promise<void>;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.pickerOverlay, { paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.pickerSheet, { backgroundColor: colors.card }]}>
        <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
        <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Status ändern</Text>
        {BOARD_STATUSES.map(s => (
          <Pressable
            key={s}
            onPress={async () => {
              Haptics.selectionAsync();
              await onStatus(task, s);
              onClose();
            }}
            style={[styles.pickerOption, {
              backgroundColor: task.status === s ? colors.muted : "transparent",
            }]}
          >
            <StatusBadge tone={statusTone(s)}>{TASK_LABEL[s]}</StatusBadge>
            {task.status === s && <Feather name="check" size={16} color={colors.primary} />}
          </Pressable>
        ))}
        <Pressable onPress={onClose} style={[styles.pickerCancel, { backgroundColor: colors.muted }]}>
          <Text style={[styles.pickerCancelText, { color: colors.foreground }]}>Abbrechen</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TaskCard({ task, onStatus }: { task: FraktionTask; onStatus: (task: FraktionTask, status: string) => Promise<void> }) {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const due = formatDue(task.due_date);

  return (
    <>
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskTop}>
          <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>
            {task.title}
          </Text>
          <Pressable onPress={() => setShowPicker(true)}>
            <StatusBadge tone={statusTone(task.status)}>
              {TASK_LABEL[task.status] ?? task.status}
            </StatusBadge>
          </Pressable>
        </View>
        <View style={styles.taskMeta}>
          {task.assignee && (
            <Text style={[styles.taskMuted, { color: colors.mutedForeground }]}>
              <Feather name="user" size={11} /> {task.assignee.split(",")[0].trim()}
            </Text>
          )}
          {due && (
            <Text style={[styles.taskMuted, { color: colors.mutedForeground }]}>
              <Feather name="calendar" size={11} /> {due}
            </Text>
          )}
          <StatusBadge tone={priorityTone(task.priority)}>
            {task.priority ?? "normal"}
          </StatusBadge>
        </View>
      </View>

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.modalScrim} onPress={() => setShowPicker(false)} />
        <StatusPicker task={task} onStatus={onStatus} onClose={() => setShowPicker(false)} />
      </Modal>
    </>
  );
}

export default function AufgabenScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, loading, reload, updateTaskStatus, currentProfile } = usePortal();
  const [filter, setFilter] = useState<"alle" | "meine">("meine");

  const tasks = useMemo(() => {
    const all = (data?.tasks ?? []).filter(t => t.status !== "verworfen");
    if (filter === "meine" && currentProfile) {
      return all.filter(t => {
        if (!t.assignee) return true;
        return t.assignee.includes(currentProfile.full_name) || t.assignee.includes(currentProfile.display_name);
      });
    }
    return all;
  }, [data?.tasks, filter, currentProfile]);

  const grouped = useMemo(() => {
    const open = tasks.filter(t => ACTIVE_STATUSES.includes(t.status));
    const done = tasks.filter(t => t.status === "erledigt");
    return { open, done };
  }, [tasks]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Aufgaben</Text>
        <View style={[styles.segmented, { backgroundColor: colors.muted }]}>
          {(["meine", "alle"] as const).map(f => (
            <Pressable
              key={f}
              onPress={() => { setFilter(f); Haptics.selectionAsync(); }}
              style={[styles.segment, f === filter && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }]}
            >
              <Text style={[styles.segmentText, { color: f === filter ? colors.foreground : colors.mutedForeground }]}>
                {f === "meine" ? "Meine" : "Alle"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={grouped.open}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 8 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          grouped.open.length > 0 ? (
            <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
              {grouped.open.length} OFFEN
            </Text>
          ) : null
        }
        ListFooterComponent={
          grouped.done.length > 0 ? (
            <View style={{ gap: 8, marginTop: 16 }}>
              <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
                {grouped.done.length} ERLEDIGT
              </Text>
              {grouped.done.map(task => (
                <TaskCard key={task.id} task={task} onStatus={updateTaskStatus} />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState icon="check-circle" title="Keine Aufgaben" subtitle="Keine offenen Aufgaben." />
        }
        renderItem={({ item }) => (
          <TaskCard task={item} onStatus={updateTaskStatus} />
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
  heading: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  groupLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  taskCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  taskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  taskTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  taskMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  taskMuted: { fontFamily: "Inter_400Regular", fontSize: 12 },
  pickerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  pickerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 8 },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pickerCancel: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  pickerCancelText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
