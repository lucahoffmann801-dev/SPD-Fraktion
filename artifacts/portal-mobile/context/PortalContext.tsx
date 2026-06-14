import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchPortalData, loginWithCode, patchRecord, postRecord } from "@/lib/api";
import type { FraktionEvent, FraktionProfile, FraktionTask, PortalData } from "@/lib/types";

const PROFILE_KEY = "fraktion-profile-slug";

type PortalContextValue = {
  data: PortalData | null;
  loading: boolean;
  error: string | null;
  currentProfile: FraktionProfile | null;
  login: (profileSlug: string, code: string) => Promise<string | null>;
  logout: () => void;
  reload: () => Promise<void>;
  updateTaskStatus: (task: FraktionTask, status: string) => Promise<void>;
  updateEventPrep: (event: FraktionEvent, preparation_status: string) => Promise<void>;
};

const PortalContext = createContext<PortalContextValue>({
  data: null,
  loading: true,
  error: null,
  currentProfile: null,
  login: async () => null,
  logout: () => {},
  reload: async () => {},
  updateTaskStatus: async () => {},
  updateEventPrep: async () => {},
});

export function usePortal() {
  return useContext(PortalContext);
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<FraktionProfile | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPortalData();
      setData(result);
      const saved = await AsyncStorage.getItem(PROFILE_KEY);
      if (saved && result.profiles) {
        const profile = result.profiles.find((p: FraktionProfile) => p.slug === saved);
        if (profile) setCurrentProfile(profile);
      }
    } catch (err: any) {
      setError(err.message ?? "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, []);

  const login = useCallback(async (profileSlug: string, code: string): Promise<string | null> => {
    try {
      const json = await loginWithCode(profileSlug, code);
      const profile = json.profile as FraktionProfile;
      setCurrentProfile(profile);
      await AsyncStorage.setItem(PROFILE_KEY, profile.slug);
      return null;
    } catch (err: any) {
      return err.message ?? "Login fehlgeschlagen";
    }
  }, []);

  const logout = useCallback(async () => {
    setCurrentProfile(null);
    await AsyncStorage.removeItem(PROFILE_KEY);
  }, []);

  const updateTaskStatus = useCallback(async (task: FraktionTask, status: string) => {
    await patchRecord("tasks", task.id, {
      status,
      completed_at: status === "erledigt" ? new Date().toISOString() : null,
    });
    await reload();
  }, [reload]);

  const updateEventPrep = useCallback(async (event: FraktionEvent, preparation_status: string) => {
    await patchRecord("events", event.id, { preparation_status });
    await reload();
  }, [reload]);

  return (
    <PortalContext.Provider value={{
      data,
      loading,
      error,
      currentProfile,
      login,
      logout,
      reload,
      updateTaskStatus,
      updateEventPrep,
    }}>
      {children}
    </PortalContext.Provider>
  );
}
