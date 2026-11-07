import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';

import { newId } from './id';
import type { AppData, Drill, Rep, Skill } from './types';

const STORAGE_KEY = 'rotoskill:data';

const EMPTY: AppData = { version: 1, skills: [], reps: [], activeSkillId: null };

function load(): AppData {
  try {
    const raw = Storage.getItemSync(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AppData;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

/** A tiny persisted store: one JSON document in SQLite's key-value table. */
function createStore() {
  let data: AppData = load();
  const listeners = new Set<() => void>();

  const set = (next: AppData) => {
    data = next;
    Storage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    listeners.forEach((l) => l());
  };

  const updateSkill = (id: string, fn: (s: Skill) => Skill) =>
    set({ ...data, skills: data.skills.map((s) => (s.id === id ? fn(s) : s)) });

  const actions = {
    addSkill(skill: Skill, makeActive = true) {
      set({
        ...data,
        skills: [...data.skills, skill],
        activeSkillId: makeActive || !data.activeSkillId ? skill.id : data.activeSkillId,
      });
    },
    updateSkill,
    deleteSkill(id: string) {
      const skills = data.skills.filter((s) => s.id !== id);
      set({
        ...data,
        skills,
        reps: data.reps.filter((r) => r.skillId !== id),
        activeSkillId: data.activeSkillId === id ? (skills[0]?.id ?? null) : data.activeSkillId,
      });
    },
    setActiveSkill(id: string) {
      set({ ...data, activeSkillId: id });
    },
    startRep(skillId: string, drill: Drill, prompt?: string): Rep {
      return {
        id: newId('rep_'),
        skillId,
        drillId: drill.id,
        startedAt: Date.now(),
        durationSec: 0,
        prompt,
        scores: {},
        reviewed: false,
      };
    },
    saveRep(rep: Rep) {
      const exists = data.reps.some((r) => r.id === rep.id);
      set({
        ...data,
        reps: exists ? data.reps.map((r) => (r.id === rep.id ? rep : r)) : [...data.reps, rep],
      });
    },
    deleteRep(id: string) {
      set({ ...data, reps: data.reps.filter((r) => r.id !== id) });
    },
  };

  return {
    getSnapshot: () => data,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    actions,
  };
}

type Store = ReturnType<typeof createStore>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createStore);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}

export function useData(): AppData {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useActions() {
  return useStore().actions;
}

export function useActiveSkill(): Skill | undefined {
  const data = useData();
  return data.skills.find((s) => s.id === data.activeSkillId) ?? data.skills[0];
}
