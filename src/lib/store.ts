"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bundleItems, clampDay, type Season } from "@/app/data";

export type Progress = {
  /** Player 1 has the item in hand. */
  p1: boolean;
  /** Player 2 has the item in hand. */
  p2: boolean;
  /** Item has been deposited into the Community Center bundle. */
  turnedIn: boolean;
};

export type CustomItem = {
  id: string;
  name: string;
  note?: string;
  done: boolean;
};

export type TrackOwner = "p1" | "p2" | "both";

export type TrackItem = {
  id: string;
  label: string;
  done: boolean;
};

/** A shared goal on the tracker board — a romance, a build, a custom mission. */
export type Track = {
  id: string;
  title: string;
  icon: string;
  owner: TrackOwner;
  /** Reference context shown above the checklist (gift list, timing tips…). */
  note?: string;
  items: TrackItem[];
};

/** A planned building on the board — how many to build and how many are done. */
export type BuildPlan = {
  id: string;
  /** Matches a Building.name in data.ts; cost & materials are pulled from there. */
  building: string;
  /** How many of this building the players want to build. */
  count: number;
  /** How many have actually been built so far. */
  built: number;
};

export type FarmState = {
  /** Monotonic revision used for last-write-wins sync. */
  rev: number;
  players: [string, string];
  season: Season;
  day: number;
  year: number;
  progress: Record<string, Progress>;
  /** Per-day checklist, keyed by `${year}-${season}-${day}-${action}`. */
  dailyDone: Record<string, boolean>;
  /** Bundle item ids the players starred as important / don't-sell. */
  starred: Record<string, boolean>;
  /** Free-text important items beyond the bundle list. */
  customItems: CustomItem[];
  /** Shared goal board — romances, builds, and custom missions. */
  tracks: Track[];
  /** Buildings the players plan to build, with target count and cost tracking. */
  buildPlans: BuildPlan[];
  /** Cooking recipes the players have learned, keyed by recipe name. */
  recipesUnlocked: Record<string, boolean>;
  /** Unlocked recipes picked for the "save these ingredients" plan, by name. */
  recipesPicked: Record<string, boolean>;
};

export type SyncStatus = "local" | "connecting" | "synced" | "offline";

const STATE_KEY = "strawdew-valley-state-v2";
const ROOM_KEY = "strawdew-valley-room-v1";
const POLL_MS = 3000;
const PUSH_DEBOUNCE_MS = 500;

export const emptyProgress: Progress = { p1: false, p2: false, turnedIn: false };

function freshProgress(): Record<string, Progress> {
  return Object.fromEntries(bundleItems.map((item) => [item.id, { ...emptyProgress }]));
}

export function defaultFarmState(): FarmState {
  return {
    rev: 0,
    players: ["Player 1", "Player 2"],
    season: "Spring",
    day: 1,
    year: 1,
    progress: freshProgress(),
    dailyDone: {},
    starred: {},
    customItems: [],
    tracks: [],
    buildPlans: [],
    recipesUnlocked: {},
    recipesPicked: {},
  };
}

// Normalise any loaded/remote state so every bundle item always has a progress row.
function normalize(input: Partial<FarmState> | null | undefined): FarmState {
  const base = defaultFarmState();
  if (!input) return base;
  return {
    rev: typeof input.rev === "number" ? input.rev : 0,
    players: [input.players?.[0] ?? base.players[0], input.players?.[1] ?? base.players[1]],
    season: input.season ?? base.season,
    day: clampDay(input.day ?? base.day),
    year: Math.max(1, input.year ?? 1),
    progress: { ...freshProgress(), ...(input.progress ?? {}) },
    dailyDone: input.dailyDone ?? {},
    starred: input.starred ?? {},
    customItems: Array.isArray(input.customItems) ? input.customItems : [],
    tracks: Array.isArray(input.tracks) ? input.tracks : [],
    buildPlans: Array.isArray(input.buildPlans) ? input.buildPlans : [],
    recipesUnlocked: input.recipesUnlocked ?? {},
    recipesPicked: input.recipesPicked ?? {},
  };
}

export function progressFor(state: FarmState, id: string): Progress {
  return state.progress[id] ?? emptyProgress;
}

/**
 * Single source of truth for the planner.
 *
 * - Always persists to localStorage so it works offline / with no backend.
 * - When a room code is set, syncs with the server: polls every few seconds and
 *   pushes local edits (debounced). Conflicts resolve last-write-wins by `rev`,
 *   which is fine for two players who rarely toggle the same item in the same second.
 */
export function useFarm() {
  const [state, setStateRaw] = useState<FarmState>(defaultFarmState);
  const [hydrated, setHydrated] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>("local");

  const stateRef = useRef(state);
  stateRef.current = state;
  const roomRef = useRef<string | null>(null);
  roomRef.current = roomCode;
  const dirtyRef = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial hydrate from localStorage.
  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(STATE_KEY);
      if (savedState) setStateRaw(normalize(JSON.parse(savedState)));
      const savedRoom = window.localStorage.getItem(ROOM_KEY);
      if (savedRoom) setRoomCode(savedRoom);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const pushNow = useCallback(async () => {
    const code = roomRef.current;
    if (!code) return;
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state: stateRef.current }),
      });
      if (!res.ok) throw new Error("push failed");
      const data = (await res.json()) as { state: FarmState };
      dirtyRef.current = false;
      // Adopt the canonical server copy (its rev is always >= ours).
      setStateRaw(normalize(data.state));
      setStatus("synced");
    } catch {
      setStatus("offline");
    }
  }, []);

  const schedulePush = useCallback(() => {
    if (!roomRef.current) return;
    dirtyRef.current = true;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => void pushNow(), PUSH_DEBOUNCE_MS);
  }, [pushNow]);

  // Poll the server while a room is active.
  useEffect(() => {
    if (!hydrated || !roomCode) {
      setStatus("local");
      return;
    }
    let cancelled = false;
    setStatus("connecting");

    const poll = async () => {
      try {
        const res = await fetch(`/api/room?code=${encodeURIComponent(roomCode)}`);
        if (!res.ok) throw new Error("poll failed");
        const data = (await res.json()) as { state: FarmState | null };
        if (cancelled) return;
        if (!data.state) {
          // Room is empty on the server — seed it with our current state.
          void pushNow();
          return;
        }
        // Only adopt remote state if it's newer and we have no pending local edit.
        if (!dirtyRef.current && data.state.rev > stateRef.current.rev) {
          setStateRaw(normalize(data.state));
        }
        setStatus("synced");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };

    void poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hydrated, roomCode, pushNow]);

  // Apply a local mutation: bump rev, persist, and schedule a sync push.
  const mutate = useCallback(
    (updater: (prev: FarmState) => FarmState) => {
      setStateRaw((prev) => {
        const next = updater(prev);
        return { ...next, rev: prev.rev + 1 };
      });
      schedulePush();
    },
    [schedulePush],
  );

  const joinRoom = useCallback((code: string) => {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (!clean) return;
    window.localStorage.setItem(ROOM_KEY, clean);
    setRoomCode(clean);
    dirtyRef.current = true; // ensure we push our state into the (maybe new) room
  }, []);

  const leaveRoom = useCallback(() => {
    window.localStorage.removeItem(ROOM_KEY);
    setRoomCode(null);
    setStatus("local");
  }, []);

  return { state, mutate, hydrated, roomCode, status, joinRoom, leaveRoom };
}
