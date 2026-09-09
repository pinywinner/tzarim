import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  activeContraction,
  createContraction,
  createSession,
  DEFAULT_SETTINGS,
  durationOf,
  PRESETS,
  STALE_ACTIVE_MS,
  type BirthType,
  type Contraction,
  type Intensity,
  type Session,
  type Settings,
} from "@/lib/contractions";

export type AppState = {
  hydrated: boolean;
  onboardingDone: boolean;
  settings: Settings;
  sessions: Session[];
  currentSessionId: string;
  pendingIntensityId: string | null;
  stalePromptId: string | null;
};

export type AppActions = {
  setHydrated: (value: boolean) => void;
  completeOnboarding: (birthType?: BirthType) => void;
  currentSession: () => Session;
  startContraction: () => void;
  endContraction: (opts?: { promptIntensity?: boolean }) => void;
  cancelContraction: () => void;
  resolveStale: (action: "end" | "cancel") => void;
  setIntensity: (id: string, intensity: Intensity) => void;
  dismissIntensity: () => void;
  deleteContraction: (id: string) => void;
  restoreContraction: (contraction: Contraction) => void;
  undoLast: () => void;
  setWaterBroke: (broke: boolean) => void;
  endSession: () => void;
  openSession: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setBirthType: (type: BirthType) => void;
  resetAll: () => void;
  checkStaleOnResume: () => void;
};

function newEmpty() {
  const session = createSession();
  return {
    onboardingDone: false,
    settings: { ...DEFAULT_SETTINGS },
    sessions: [session],
    currentSessionId: session.id,
    pendingIntensityId: null,
    stalePromptId: null,
  };
}

const initial = newEmpty();

function withCurrent(
  sessions: Session[],
  currentSessionId: string,
  updater: (session: Session) => Session,
): Session[] {
  return sessions.map((session) => (session.id === currentSessionId ? updater(session) : session));
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initial,

      setHydrated: (value) => set({ hydrated: value }),
      completeOnboarding: (birthType) => {
        if (birthType === "first" || birthType === "subsequent") {
          set({
            onboardingDone: true,
            settings: {
              ...get().settings,
              birthType,
              ...PRESETS[birthType],
            },
          });
          return;
        }
        set({ onboardingDone: true });
      },

      currentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find((session) => session.id === currentSessionId) ?? sessions[0] ?? createSession();
      },

      startContraction: () => {
        const now = Date.now();
        const session = get().currentSession();
        if (activeContraction(session)) return;
        set({
          pendingIntensityId: null,
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            endedAt: null,
            contractions: [...current.contractions, createContraction(now)],
          })),
        });
      },

      endContraction: (opts) => {
        const now = Date.now();
        const session = get().currentSession();
        const active = activeContraction(session);
        if (!active) return;
        const promptIntensity = opts?.promptIntensity ?? true;
        set({
          pendingIntensityId: promptIntensity ? active.id : null,
          stalePromptId: null,
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            contractions: current.contractions.map((contraction) =>
              contraction.id === active.id ? { ...contraction, endedAt: now } : contraction,
            ),
          })),
        });
      },

      cancelContraction: () => {
        const session = get().currentSession();
        const active = activeContraction(session);
        if (!active) return;
        set({
          stalePromptId: null,
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            contractions: current.contractions.filter((contraction) => contraction.id !== active.id),
          })),
        });
      },

      resolveStale: (action) => {
        if (action === "end") get().endContraction({ promptIntensity: false });
        else get().cancelContraction();
      },

      setIntensity: (id, intensity) => {
        set({
          pendingIntensityId: null,
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            contractions: current.contractions.map((contraction) =>
              contraction.id === id ? { ...contraction, intensity } : contraction,
            ),
          })),
        });
      },

      dismissIntensity: () => set({ pendingIntensityId: null }),

      deleteContraction: (id) => {
        set({
          pendingIntensityId: get().pendingIntensityId === id ? null : get().pendingIntensityId,
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            contractions: current.contractions.filter((contraction) => contraction.id !== id),
          })),
        });
      },

      restoreContraction: (contraction) => {
        set({
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            contractions: [...current.contractions, contraction].sort(
              (left, right) => left.startedAt - right.startedAt,
            ),
          })),
        });
      },

      undoLast: () => {
        const session = get().currentSession();
        if (session.contractions.length === 0) return;
        const last = session.contractions[session.contractions.length - 1];
        if (!last) return;
        get().deleteContraction(last.id);
      },

      setWaterBroke: (broke) => {
        const now = Date.now();
        set({
          sessions: withCurrent(get().sessions, get().currentSessionId, (current) => ({
            ...current,
            waterBrokeAt: broke ? (current.waterBrokeAt ?? now) : null,
          })),
        });
      },

      endSession: () => {
        const now = Date.now();
        const current = get().currentSession();
        if (current.contractions.length === 0 && !current.waterBrokeAt) {
          return;
        }
        const next = createSession(now);
        set({
          pendingIntensityId: null,
          stalePromptId: null,
          currentSessionId: next.id,
          sessions: [
            ...get().sessions.map((session) =>
              session.id === current.id
                ? {
                    ...session,
                    endedAt: now,
                    contractions: session.contractions.map((contraction) =>
                      contraction.endedAt == null ? { ...contraction, endedAt: now } : contraction,
                    ),
                  }
                : session,
            ),
            next,
          ],
        });
      },

      openSession: (id) => {
        const exists = get().sessions.some((session) => session.id === id);
        if (!exists) return;
        const liveId = get().currentSessionId;
        set({
          currentSessionId: id,
          pendingIntensityId: null,
          stalePromptId: null,
          sessions: get()
            .sessions
            .filter((session) => session.id === id || session.id !== liveId || session.contractions.length > 0 || session.waterBrokeAt)
            .map((session) => (session.id === id ? { ...session, endedAt: null } : session)),
        });
      },

      updateSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },

      setBirthType: (type) => {
        if (type === "custom") {
          set({ settings: { ...get().settings, birthType: "custom" } });
          return;
        }
        set({
          settings: {
            ...get().settings,
            birthType: type,
            ...PRESETS[type],
          },
        });
      },

      resetAll: () => {
        const next = newEmpty();
        set({ ...next, hydrated: true, onboardingDone: true });
      },

      checkStaleOnResume: () => {
        const session = get().currentSession();
        const active = activeContraction(session);
        if (!active) return;
        if (durationOf(active) >= STALE_ACTIVE_MS) {
          set({ stalePromptId: active.id });
        }
      },
    }),
    {
      name: "tzirim-labor-tracker",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage,
      ),
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        settings: state.settings,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        pendingIntensityId: state.pendingIntensityId,
      }),
      onRehydrateStorage: () => () => {
        useAppStore.getState().setHydrated(true);
        useAppStore.getState().checkStaleOnResume();
      },
    },
  ),
);

export function useCurrentSession(): Session {
  return useAppStore(
    (state) =>
      state.sessions.find((session) => session.id === state.currentSessionId) ??
      state.sessions[0] ??
      createSession(),
  );
}
