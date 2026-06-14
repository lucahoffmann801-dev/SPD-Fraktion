import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvatarInitials } from "@/components/AvatarInitials";
import { EmptyState } from "@/components/EmptyState";
import { usePortal } from "@/context/PortalContext";
import { useColors } from "@/hooks/useColors";
import type { FraktionCommittee, FraktionDocument, FraktionMember } from "@/lib/types";

type Section = "ausschuesse" | "mitglieder" | "dokumente" | "kalender";

const SECTIONS: { id: Section; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { id: "ausschuesse", label: "Ausschüsse", icon: "users" },
  { id: "mitglieder", label: "Fraktion", icon: "user" },
  { id: "dokumente", label: "Dokumente", icon: "file-text" },
  { id: "kalender", label: "Kalender", icon: "refresh-cw" },
];

function CommitteeCard({ committee, members }: { committee: FraktionCommittee; members: { person_name: string; role: string }[] }) {
  const colors = useColors();
  const ordentlich = members.filter(m => m.role === "member");
  const stellvertretend = members.filter(m => m.role === "substitute");

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{committee.title}</Text>
        {committee.short_ref && (
          <View style={[styles.refBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.refBadgeText}>{committee.short_ref}</Text>
          </View>
        )}
      </View>
      {ordentlich.length > 0 && (
        <View style={styles.memberGroup}>
          <Text style={[styles.memberRole, { color: colors.mutedForeground }]}>Ordentlich</Text>
          {ordentlich.map(m => (
            <Text key={m.person_name} style={[styles.memberName, { color: colors.foreground }]}>
              • {m.person_name}
            </Text>
          ))}
        </View>
      )}
      {stellvertretend.length > 0 && (
        <View style={styles.memberGroup}>
          <Text style={[styles.memberRole, { color: colors.mutedForeground }]}>Stellvertretend</Text>
          {stellvertretend.map(m => (
            <Text key={m.person_name} style={[styles.memberName, { color: colors.foreground }]}>
              • {m.person_name}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function MemberCard({ member }: { member: FraktionMember }) {
  const colors = useColors();
  return (
    <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.memberAvatarText}>
          {member.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberFullName, { color: colors.foreground }]}>{member.name}</Text>
        {member.role && (
          <Text style={[styles.memberRoleText, { color: colors.mutedForeground }]}>{member.role}</Text>
        )}
        {member.committees && (
          <Text style={[styles.memberCommittees, { color: colors.mutedForeground }]} numberOfLines={2}>
            {member.committees}
          </Text>
        )}
      </View>
      {member.phone && (
        <Pressable
          onPress={() => Linking.openURL(`tel:${member.phone}`)}
          style={[styles.contactBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="phone" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

function DocumentCard({ doc }: { doc: FraktionDocument }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => {
        if (doc.url) Linking.openURL(doc.url);
      }}
      style={[styles.docCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Feather name="file-text" size={20} color={colors.primary} />
      <View style={styles.docInfo}>
        <Text style={[styles.docTitle, { color: colors.foreground }]} numberOfLines={2}>
          {doc.title}
        </Text>
        {doc.category && (
          <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>{doc.category}</Text>
        )}
      </View>
      {doc.url && <Feather name="external-link" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function MehrScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, currentProfile, logout } = usePortal();
  const [activeSection, setActiveSection] = useState<Section>("ausschuesse");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleLogout() {
    Alert.alert("Profil wechseln", "Möchtest du dich abmelden?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Abmelden",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          logout();
          router.replace("/");
        },
      },
    ]);
  }

  const committees = data?.committees ?? [];
  const memberships = data?.committee_memberships ?? [];
  const members = data?.members ?? [];
  const documents = data?.documents ?? [];
  const calendarSources = data?.calendar_sources ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Mehr</Text>
        {currentProfile && (
          <View style={styles.profileRow}>
            <AvatarInitials profile={currentProfile} size={32} />
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {currentProfile.display_name}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabsRow}
      >
        {SECTIONS.map(s => (
          <Pressable
            key={s.id}
            onPress={() => { setActiveSection(s.id); Haptics.selectionAsync(); }}
            style={[
              styles.tab,
              {
                backgroundColor: activeSection === s.id ? colors.primary : colors.muted,
                borderColor: activeSection === s.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather name={s.icon} size={14} color={activeSection === s.id ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeSection === s.id ? "#fff" : colors.foreground }]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeSection === "ausschuesse" && (
        <FlatList
          data={committees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 10 }}
          ListEmptyComponent={<EmptyState icon="users" title="Keine Ausschüsse" />}
          renderItem={({ item }) => (
            <CommitteeCard
              committee={item}
              members={memberships.filter(m => m.committee_slug === item.slug)}
            />
          )}
        />
      )}

      {activeSection === "mitglieder" && (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 10 }}
          ListEmptyComponent={<EmptyState icon="user" title="Keine Mitglieder" />}
          renderItem={({ item }) => <MemberCard member={item} />}
        />
      )}

      {activeSection === "dokumente" && (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 10 }}
          ListEmptyComponent={<EmptyState icon="file-text" title="Keine Dokumente" />}
          renderItem={({ item }) => <DocumentCard doc={item} />}
        />
      )}

      {activeSection === "kalender" && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 12 }}>
          {calendarSources.length === 0 ? (
            <EmptyState icon="refresh-cw" title="Keine Kalenderquellen" />
          ) : (
            calendarSources.map(src => (
              <View key={src.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{src.name}</Text>
                  <View style={[styles.refBadge, { backgroundColor: src.enabled ? colors.success : colors.muted }]}>
                    <Text style={[styles.refBadgeText, { color: src.enabled ? "#fff" : colors.mutedForeground }]}>
                      {src.enabled ? "aktiv" : "inaktiv"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.memberRole, { color: colors.mutedForeground }]}>
                  {src.type} · {src.owner ?? "ohne Eigentümer"}
                </Text>
                {src.last_synced_at && (
                  <Text style={[styles.memberRole, { color: colors.mutedForeground }]}>
                    Zuletzt: {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(src.last_synced_at))}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Pressable
        onPress={handleLogout}
        style={[styles.logoutBtn, { borderColor: colors.border, marginBottom: insets.bottom + 100 }]}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Profil wechseln</Text>
      </Pressable>
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
  profileRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  tabsRow: { maxHeight: 52 },
  tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 14, flex: 1 },
  refBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  refBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#fff" },
  memberGroup: { gap: 2 },
  memberRole: { fontFamily: "Inter_600SemiBold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 },
  memberName: { fontFamily: "Inter_400Regular", fontSize: 13 },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  memberInfo: { flex: 1, gap: 2 },
  memberFullName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  memberRoleText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  memberCommittees: { fontFamily: "Inter_400Regular", fontSize: 11 },
  contactBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  docInfo: { flex: 1, gap: 2 },
  docTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  docMeta: { fontFamily: "Inter_400Regular", fontSize: 12 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
