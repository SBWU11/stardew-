"use client";

import { useMemo, useState } from "react";
import {
  buildings,
  bundleGroups,
  bundleItems,
  bundleRewards,
  calendarData,
  characterSchedules,
  clampDay,
  crops,
  isAvailableInSeason,
  missionTemplates,
  recipes,
  roomAccent,
  roomOrder,
  seasonFocus,
  seasons,
  toolUpgrades,
  tools,
  universalGifts,
  villagerRoutines,
  villagers,
  type BundleGroup,
  type BundleItem,
  type Building,
  type CharacterSchedule,
  type MissionTemplate,
  type ScheduleStop,
  type Season,
  type Villager,
  type Weekday,
} from "./data";
import {
  progressFor,
  useFarm,
  type BuildPlan,
  type FarmState,
  type Progress,
  type SyncStatus,
  type Track,
  type TrackItem,
  type TrackOwner,
} from "@/lib/store";

type Tab =
  | "today"
  | "board"
  | "bundles"
  | "watchlist"
  | "season"
  | "calendar"
  | "crops"
  | "villagers"
  | "builds"
  | "recipes"
  | "schedule"
  | "layout";

const TABS: [Tab, string, string][] = [
  ["today", "Today", "🌅"],
  ["board", "Board", "🎯"],
  ["bundles", "Bundles", "📦"],
  ["watchlist", "Starred", "⭐"],
  ["season", "Season", "🌱"],
  ["calendar", "Calendar", "📅"],
  ["crops", "Crops", "🌾"],
  ["villagers", "Villagers", "🎁"],
  ["builds", "Builds", "🔨"],
  ["recipes", "Recipes", "🍳"],
  ["schedule", "Where", "📍"],
  ["layout", "Layout", "🗺️"],
];

let customIdSeq = 0;

let idSeq = 0;
function newId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`;
}

const seasonEmoji: Record<Season, string> = {
  Spring: "🌸",
  Summer: "🌞",
  Fall: "🍂",
  Winter: "❄️",
};

// Stardew weeks start on Monday: day 1 = Monday … day 7 = Sunday, repeating.
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekdayFor = (day: number) => WEEKDAYS[(day - 1) % 7];

export default function Home() {
  const { state, mutate, hydrated, roomCode, status, joinRoom, leaveRoom } = useFarm();
  const [tab, setTab] = useState<Tab>("today");

  // ---- mutations -------------------------------------------------------
  const setDate = (patch: Partial<Pick<FarmState, "season" | "day" | "year">>) =>
    mutate((s) => ({ ...s, ...patch, day: clampDay(patch.day ?? s.day) }));

  const stepDay = (delta: number) =>
    mutate((s) => {
      let day = s.day + delta;
      let year = s.year;
      let seasonIdx = seasons.indexOf(s.season);
      while (day > 28) {
        day -= 28;
        seasonIdx += 1;
        if (seasonIdx > 3) {
          seasonIdx = 0;
          year += 1;
        }
      }
      while (day < 1) {
        day += 28;
        seasonIdx -= 1;
        if (seasonIdx < 0) {
          seasonIdx = 3;
          year = Math.max(1, year - 1);
        }
      }
      return { ...s, day, year, season: seasons[seasonIdx] };
    });

  const toggle = (id: string, field: keyof Progress) =>
    mutate((s) => {
      const cur = progressFor(s, id);
      return { ...s, progress: { ...s.progress, [id]: { ...cur, [field]: !cur[field] } } };
    });

  const setPlayer = (i: 0 | 1, name: string) =>
    mutate((s) => {
      const players: [string, string] = [...s.players];
      players[i] = name;
      return { ...s, players };
    });

  const toggleDaily = (id: string) =>
    mutate((s) => ({ ...s, dailyDone: { ...s.dailyDone, [id]: !s.dailyDone[id] } }));

  const toggleStar = (id: string) =>
    mutate((s) => ({ ...s, starred: { ...s.starred, [id]: !s.starred[id] } }));

  const addCustom = (name: string, note?: string) => {
    const clean = name.trim();
    if (!clean) return;
    customIdSeq += 1;
    const id = `c${Date.now().toString(36)}${customIdSeq}`;
    mutate((s) => ({ ...s, customItems: [...s.customItems, { id, name: clean, note, done: false }] }));
  };
  const toggleCustom = (id: string) =>
    mutate((s) => ({
      ...s,
      customItems: s.customItems.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    }));
  const removeCustom = (id: string) =>
    mutate((s) => ({ ...s, customItems: s.customItems.filter((c) => c.id !== id) }));

  // ---- recipes ---------------------------------------------------------
  const toggleRecipeUnlocked = (name: string) =>
    mutate((s) => {
      const unlocked = { ...s.recipesUnlocked, [name]: !s.recipesUnlocked[name] };
      // Dropping a recipe you no longer have shouldn't leave it on the save plan.
      const picked = unlocked[name] ? s.recipesPicked : { ...s.recipesPicked, [name]: false };
      return { ...s, recipesUnlocked: unlocked, recipesPicked: picked };
    });
  const toggleRecipePicked = (name: string) =>
    mutate((s) => ({ ...s, recipesPicked: { ...s.recipesPicked, [name]: !s.recipesPicked[name] } }));

  // ---- tracker board ---------------------------------------------------
  const trackActions: TrackActions = {
    addTrack: (track) =>
      mutate((s) => ({ ...s, tracks: [...s.tracks, { ...track, id: newId("trk") }] })),
    removeTrack: (id) => mutate((s) => ({ ...s, tracks: s.tracks.filter((t) => t.id !== id) })),
    patchTrack: (id, patch) =>
      mutate((s) => ({ ...s, tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    addTrackItem: (id, label) => {
      const clean = label.trim();
      if (!clean) return;
      mutate((s) => ({
        ...s,
        tracks: s.tracks.map((t) =>
          t.id === id ? { ...t, items: [...t.items, { id: newId("itm"), label: clean, done: false }] } : t,
        ),
      }));
    },
    toggleTrackItem: (tid, iid) =>
      mutate((s) => ({
        ...s,
        tracks: s.tracks.map((t) =>
          t.id === tid
            ? { ...t, items: t.items.map((i) => (i.id === iid ? { ...i, done: !i.done } : i)) }
            : t,
        ),
      })),
    removeTrackItem: (tid, iid) =>
      mutate((s) => ({
        ...s,
        tracks: s.tracks.map((t) =>
          t.id === tid ? { ...t, items: t.items.filter((i) => i.id !== iid) } : t,
        ),
      })),
  };

  // ---- buildables planner ----------------------------------------------
  const buildPlanActions: BuildPlanActions = {
    addBuildPlan: (building) =>
      mutate((s) => {
        // Re-adding a building just bumps its target count.
        if (s.buildPlans.some((p) => p.building === building)) {
          return {
            ...s,
            buildPlans: s.buildPlans.map((p) =>
              p.building === building ? { ...p, count: p.count + 1 } : p,
            ),
          };
        }
        return {
          ...s,
          buildPlans: [...s.buildPlans, { id: newId("bld"), building, count: 1, built: 0 }],
        };
      }),
    removeBuildPlan: (id) =>
      mutate((s) => ({ ...s, buildPlans: s.buildPlans.filter((p) => p.id !== id) })),
    setBuildCount: (id, count) =>
      mutate((s) => ({
        ...s,
        buildPlans: s.buildPlans.map((p) =>
          p.id === id ? { ...p, count: Math.max(1, count), built: Math.min(p.built, Math.max(1, count)) } : p,
        ),
      })),
    setBuildBuilt: (id, built) =>
      mutate((s) => ({
        ...s,
        buildPlans: s.buildPlans.map((p) =>
          p.id === id ? { ...p, built: Math.min(Math.max(0, built), p.count) } : p,
        ),
      })),
  };

  const [search, setSearch] = useState("");

  // ---- derived ---------------------------------------------------------
  const turnedIn = bundleItems.filter((i) => progressFor(state, i.id).turnedIn).length;

  // Items you can only get this season, still needed, and not yet collected.
  const keepNow = useMemo(
    () =>
      bundleItems.filter((i) => {
        const p = progressFor(state, i.id);
        return isAvailableInSeason(i, state.season) && !p.turnedIn && !p.p1 && !p.p2;
      }),
    [state],
  );

  return (
    <div className={`shell season-${state.season.toLowerCase()}`}>
      <TopBar
        state={state}
        status={status}
        roomCode={roomCode}
        hydrated={hydrated}
        setDate={setDate}
        stepDay={stepDay}
        setPlayer={setPlayer}
        joinRoom={joinRoom}
        leaveRoom={leaveRoom}
      />

      <ProgressRibbon
        turnedIn={turnedIn}
        total={bundleItems.length}
        keepCount={keepNow.length}
        state={state}
      />

      <div className="global-search">
        <span aria-hidden="true">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any item or villager — bundle, season, source, gifts…"
        />
        {search && (
          <button type="button" className="clear" onClick={() => setSearch("")} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      <nav className="tabbar" aria-label="Views" aria-hidden={search ? true : undefined}>
        {TABS.map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            className={tab === id && !search ? "tab active" : "tab"}
            onClick={() => {
              setSearch("");
              setTab(id);
            }}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <main className="content">
        {search ? (
          <SearchResults
            query={search}
            state={state}
            toggle={toggle}
            toggleStar={toggleStar}
            addCustom={addCustom}
            setDate={setDate}
            clear={() => setSearch("")}
          />
        ) : (
          <>
            {tab === "today" && (
              <TodayView
                state={state}
                keepNow={keepNow}
                setDate={setDate}
                goBundles={() => setTab("bundles")}
                toggleDaily={toggleDaily}
              />
            )}
            {tab === "board" && (
              <BoardView state={state} actions={trackActions} buildActions={buildPlanActions} />
            )}
            {tab === "bundles" && <BundlesView state={state} toggle={toggle} toggleStar={toggleStar} />}
            {tab === "watchlist" && (
              <WatchlistView
                state={state}
                toggle={toggle}
                toggleStar={toggleStar}
                addCustom={addCustom}
                toggleCustom={toggleCustom}
                removeCustom={removeCustom}
                goBundles={() => setTab("bundles")}
              />
            )}
            {tab === "season" && <SeasonView state={state} toggle={toggle} toggleStar={toggleStar} />}
            {tab === "calendar" && <CalendarView state={state} setDate={setDate} />}
            {tab === "crops" && <CropsView state={state} />}
            {tab === "villagers" && <VillagersView state={state} />}
            {tab === "builds" && <BuildsView />}
            {tab === "recipes" && (
              <RecipesView
                state={state}
                toggleUnlocked={toggleRecipeUnlocked}
                togglePicked={toggleRecipePicked}
              />
            )}
            {tab === "schedule" && <ScheduleView state={state} />}
            {tab === "layout" && <LayoutView />}
          </>
        )}
      </main>

      <footer className="credits">
        Data from the{" "}
        <a href="https://destructiveburn.com/StardewValley/bundles.html" target="_blank" rel="noreferrer">
          DestructiveBurn bundle list
        </a>
        , the{" "}
        <a href="https://noobsenpai.com/stardew-valley-calendar/" target="_blank" rel="noreferrer">
          NoobSenpai calendar
        </a>
        , and the{" "}
        <a href="https://stardewvalleywiki.com/Bundles" target="_blank" rel="noreferrer">
          Stardew Valley Wiki
        </a>
        . Made for co-op farming. 🚜
      </footer>
    </div>
  );
}

/* ============================ Top bar ============================ */

function TopBar({
  state,
  status,
  roomCode,
  hydrated,
  setDate,
  stepDay,
  setPlayer,
  joinRoom,
  leaveRoom,
}: {
  state: FarmState;
  status: SyncStatus;
  roomCode: string | null;
  hydrated: boolean;
  setDate: (p: Partial<Pick<FarmState, "season" | "day" | "year">>) => void;
  stepDay: (d: number) => void;
  setPlayer: (i: 0 | 1, name: string) => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
}) {
  const [showRoom, setShowRoom] = useState(false);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <span className="logo-sun" />
          <span className="logo-hill" />
        </div>
        <div>
          <p className="kicker">Co-op Community Center Planner</p>
          <h1>Strawdew Valley</h1>
        </div>
      </div>

      <div className="datebox">
        <button type="button" className="day-step" onClick={() => stepDay(-1)} aria-label="Previous day">
          ◀
        </button>
        <div className="datebox-center">
          <div className="date-display">
            <span className="date-emoji" aria-hidden="true">
              {seasonEmoji[state.season]}
            </span>
            <strong>
              {state.season} {state.day}
            </strong>
            <small>Year {state.year}</small>
          </div>
          <div className="date-controls">
            <select
              value={state.season}
              onChange={(e) => setDate({ season: e.target.value as Season })}
              aria-label="Season"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={28}
              value={state.day}
              onChange={(e) => setDate({ day: Number(e.target.value) })}
              aria-label="Day"
            />
          </div>
        </div>
        <button type="button" className="day-step" onClick={() => stepDay(1)} aria-label="Next day">
          ▶
        </button>
      </div>

      <div className="topbar-right">
        <div className="players">
          <label className="player-chip p1">
            <span aria-hidden="true">①</span>
            <input value={state.players[0]} onChange={(e) => setPlayer(0, e.target.value)} aria-label="Player 1 name" />
          </label>
          <label className="player-chip p2">
            <span aria-hidden="true">②</span>
            <input value={state.players[1]} onChange={(e) => setPlayer(1, e.target.value)} aria-label="Player 2 name" />
          </label>
        </div>
        <button type="button" className={`sync-badge ${status}`} onClick={() => setShowRoom((v) => !v)}>
          <span className="sync-dot" aria-hidden="true" />
          {!hydrated
            ? "…"
            : roomCode
              ? status === "synced"
                ? `Synced · ${roomCode}`
                : status === "connecting"
                  ? `Connecting · ${roomCode}`
                  : `Offline · ${roomCode}`
              : "Play solo"}
        </button>
      </div>

      {showRoom && (
        <RoomPanel
          roomCode={roomCode}
          status={status}
          joinRoom={joinRoom}
          leaveRoom={leaveRoom}
          close={() => setShowRoom(false)}
        />
      )}
    </header>
  );
}

function RoomPanel({
  roomCode,
  status,
  joinRoom,
  leaveRoom,
  close,
}: {
  roomCode: string | null;
  status: SyncStatus;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  close: () => void;
}) {
  const [code, setCode] = useState("");
  const suggestion = useMemo(() => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) out += letters[Math.floor((i * 7 + status.length * 3 + 11) % letters.length)];
    return out;
  }, [status]);

  return (
    <div className="room-pop">
      <div className="room-pop-head">
        <strong>Shared farm room</strong>
        <button type="button" onClick={close} aria-label="Close">
          ✕
        </button>
      </div>
      {roomCode ? (
        <>
          <p>
            You and your friend are sharing room <code>{roomCode}</code>. Anything either of you ticks shows up for both
            within a few seconds.
          </p>
          <div className="room-actions">
            <button type="button" onClick={() => navigator.clipboard?.writeText(roomCode)}>
              Copy code
            </button>
            <button type="button" className="ghost" onClick={leaveRoom}>
              Leave room
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            Pick a shared code and give it to your friend, or paste theirs. Same code = same checklist, live across both
            devices.
          </p>
          <div className="room-actions">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={`e.g. ${suggestion}`}
              aria-label="Room code"
            />
            <button type="button" onClick={() => joinRoom(code || suggestion)}>
              {code ? "Join" : "Create"}
            </button>
          </div>
          <p className="room-hint">
            Your current local progress will seed the room. Works offline too — it just won&apos;t sync until you&apos;re
            back online.
          </p>
        </>
      )}
    </div>
  );
}

/* ======================== Progress ribbon ======================== */

function ProgressRibbon({
  turnedIn,
  total,
  keepCount,
  state,
}: {
  turnedIn: number;
  total: number;
  keepCount: number;
  state: FarmState;
}) {
  const pct = Math.round((turnedIn / total) * 100);
  const held = bundleItems.filter((i) => {
    const p = progressFor(state, i.id);
    return !p.turnedIn && (p.p1 || p.p2);
  }).length;

  return (
    <section className="ribbon">
      <div className="ribbon-bar">
        <div className="ribbon-fill" style={{ width: `${pct}%` }} />
        <span className="ribbon-label">
          Community Center · {turnedIn}/{total} items turned in ({pct}%)
        </span>
      </div>
      <div className="ribbon-stats">
        <Stat value={String(keepCount)} label="Don't sell now" tone="keep" />
        <Stat value={String(held)} label="In a backpack" tone="held" />
        <Stat value={`${total - turnedIn}`} label="Still needed" tone="todo" />
      </div>
    </section>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className={`mini-stat ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

/* ============================ Today ============================ */

function TodayView({
  state,
  keepNow,
  setDate,
  goBundles,
  toggleDaily,
}: {
  state: FarmState;
  keepNow: BundleItem[];
  setDate: (p: Partial<Pick<FarmState, "season" | "day" | "year">>) => void;
  goBundles: () => void;
  toggleDaily: (id: string) => void;
}) {
  const todayEvents = calendarData[state.season][state.day] ?? [];
  const upcoming = Object.entries(calendarData[state.season])
    .flatMap(([day, evts]) => (evts ?? []).map((e) => ({ day: Number(day), ...e })))
    .filter((e) => e.day > state.day)
    .sort((a, b) => a.day - b.day)
    .slice(0, 6);

  // Crops whose last viable planting day is today or tomorrow this season.
  const plantingDeadlines = crops
    .filter((c) => c.season === state.season)
    .map((c) => ({ crop: c, last: 28 - c.grow }))
    .filter((d) => d.last >= state.day && d.last <= state.day + 2)
    .sort((a, b) => a.last - b.last);

  // This season's birthdays still ahead — hold their loved gifts, don't sell them.
  const birthdayHold = villagers
    .filter((v) => v.season === state.season && v.day >= state.day)
    .sort((a, b) => a.day - b.day);

  return (
    <div className="grid-today">
      <Card title={`Today · ${state.season} ${state.day}`} accent="#6aa84f">
        {todayEvents.length === 0 ? (
          <p className="muted">No fixed event today. A good day for the mines, fishing, crops, or friendship.</p>
        ) : (
          <div className="event-stack">
            {todayEvents.map((e) => (
              <div key={`${e.type}-${e.text}`} className={`event ${e.type}`}>
                <span className="event-tag">{e.type}</span>
                <strong>{e.text}</strong>
                {e.type === "birthday" && (
                  <small>❤️ {villagers.find((v) => v.name === e.text)?.loved}</small>
                )}
              </div>
            ))}
          </div>
        )}
        {plantingDeadlines.length > 0 && (
          <div className="deadline-box">
            <strong>⏳ Last chance to plant</strong>
            {plantingDeadlines.map(({ crop, last }) => (
              <span key={crop.name} className={last === state.day ? "urgent" : ""}>
                {crop.name} — by day {last}
                {last === state.day ? " (today!)" : ""}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card title="🛑 Don't sell these right now" accent="#b1563f" subtitle="Season-only bundle items you still need">
        {keepNow.length === 0 ? (
          <p className="muted">Nothing season-locked is outstanding. Sell freely!</p>
        ) : (
          <div className="keep-list">
            {keepNow.slice(0, 18).map((i) => (
              <button key={i.id} type="button" className="keep-item" onClick={goBundles} title={i.source}>
                <span className="keep-name">{i.name}</span>
                <small>{i.bundle}</small>
              </button>
            ))}
            {keepNow.length > 18 && (
              <button type="button" className="keep-more" onClick={goBundles}>
                +{keepNow.length - 18} more in Bundles →
              </button>
            )}
          </div>
        )}
      </Card>

      <Card
        title="🎂 Hold these birthday gifts"
        accent="#b15ba0"
        subtitle="Loved gifts for this season's upcoming birthdays — don't sell them"
      >
        {birthdayHold.length === 0 ? (
          <p className="muted">No more birthdays left in {state.season}. Gifts are fair game to sell.</p>
        ) : (
          <div className="bday-hold">
            {birthdayHold.map((v) => (
              <button key={v.name} type="button" className="bday-row" onClick={() => setDate({ day: v.day })}>
                <span className="bday-when">{v.day === state.day ? "Today" : `Day ${v.day}`}</span>
                <span className="bday-who">{v.name}</span>
                <span className="bday-loves">{v.loved}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card title="📌 Coming up this season" accent="#8a6bb0">
        {upcoming.length === 0 ? (
          <p className="muted">Nothing else scheduled this season.</p>
        ) : (
          <div className="timeline">
            {upcoming.map((e) => (
              <button key={`${e.day}-${e.text}`} type="button" onClick={() => setDate({ day: e.day })}>
                <span className="t-day">Day {e.day}</span>
                <span className="t-text">{e.text}</span>
                <span className={`t-type ${e.type}`}>{e.type}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card title="✅ Daily routine" accent="#3b88b5">
        <DailyChecklist state={state} toggleDaily={toggleDaily} />
      </Card>
    </div>
  );
}

function DailyChecklist({ state, toggleDaily }: { state: FarmState; toggleDaily: (id: string) => void }) {
  const actions = [
    "Water / harvest crops",
    "Check the TV (weather + luck)",
    "Visit the Traveling Cart / shops",
    "Give today's birthday gift",
    "Deposit bundle items",
    "Pet the animals",
  ];
  const dayKey = `daily:${state.year}:${state.season}:${state.day}`;
  return (
    <ul className="daily">
      {actions.map((a) => {
        const id = `${dayKey}:${a}`;
        const done = state.dailyDone[id] ?? false;
        return (
          <li key={a}>
            <label className={done ? "daily-row done" : "daily-row"}>
              <input type="checkbox" checked={done} onChange={() => toggleDaily(id)} />
              <span className="daily-box" aria-hidden="true" />
              <span className="daily-text">{a}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/* ============================ Bundles ============================ */

function BundlesView({
  state,
  toggle,
  toggleStar,
}: {
  state: FarmState;
  toggle: (id: string, field: keyof Progress) => void;
  toggleStar: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  // Default to the current season so you only see what you can work on right now.
  const [seasonOnly, setSeasonOnly] = useState(true);
  // "Must-get": seasonal items you can ONLY get now — no "Any" fallback, so don't miss them.
  const [mustGet, setMustGet] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const q = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    return bundleGroups
      .map((g) => {
        const items = g.items.filter((i) => {
          const p = progressFor(state, i.id);
          const text = `${i.name} ${i.bundle} ${i.source}`.toLowerCase();
          if (q && !text.includes(q)) return false;
          if (seasonOnly && !isAvailableInSeason(i, state.season)) return false;
          if (mustGet && (i.seasons.includes("Any") || !isAvailableInSeason(i, state.season))) return false;
          if (hideDone && p.turnedIn) return false;
          return true;
        });
        return { ...g, items };
      })
      .filter((g) => g.items.length > 0);
  }, [q, seasonOnly, mustGet, hideDone, state]);

  const byRoom = roomOrder
    .map((room) => ({ room, groups: visibleGroups.filter((g) => g.room === room) }))
    .filter((r) => r.groups.length > 0);

  return (
    <div className="bundles">
      <div className="filters">
        <label className="search">
          <span aria-hidden="true">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search item, bundle, or source…"
          />
        </label>
        <label className="chk">
          <input type="checkbox" checked={seasonOnly} onChange={(e) => setSeasonOnly(e.target.checked)} />
          Available in {state.season}
        </label>
        <label className="chk must">
          <input type="checkbox" checked={mustGet} onChange={(e) => setMustGet(e.target.checked)} />
          Must-get in {state.season}
        </label>
        <label className="chk">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Hide completed
        </label>
      </div>

      {byRoom.length === 0 && <p className="empty">Nothing matches those filters.</p>}

      {byRoom.map(({ room, groups }) => {
        const roomReq = groups.reduce((a, g) => a + g.required, 0);
        const roomDone = groups.reduce(
          (a, g) => a + Math.min(g.required, g.items.filter((i) => progressFor(state, i.id).turnedIn).length),
          0,
        );
        return (
          <section key={room} className="room" style={{ ["--room" as string]: roomAccent[room] }}>
            <div className="room-head">
              <h2>{room}</h2>
              <span className="room-prog">
                {roomDone}/{roomReq}
              </span>
            </div>
            <div className="bundle-grid">
              {groups.map((g) => (
                <BundleCard key={g.bundle} group={g} state={state} toggle={toggle} toggleStar={toggleStar} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BundleCard({
  group,
  state,
  toggle,
  toggleStar,
}: {
  group: BundleGroup;
  state: FarmState;
  toggle: (id: string, field: keyof Progress) => void;
  toggleStar: (id: string) => void;
}) {
  const done = group.items.filter((i) => progressFor(state, i.id).turnedIn).length;
  const complete = done >= group.required;
  const pct = Math.min(100, Math.round((done / group.required) * 100));
  const choice = group.items.find((i) => i.choice)?.choice;

  return (
    <article className={complete ? "bundle done" : "bundle"}>
      <div className="bundle-top static">
        <div className="bundle-title">
          <strong>{group.bundle}</strong>
          {choice && <em className="choice">pick {choice}</em>}
        </div>
        <span className="bundle-count">
          {done}/{group.required} {complete ? "✔" : ""}
        </span>
      </div>
      <div className="bundle-bar">
        <div className="bundle-fill" style={{ width: `${pct}%` }} />
      </div>
      {bundleRewards[group.bundle] && <p className="reward">🎁 {bundleRewards[group.bundle]}</p>}

      <ul className="items">
        {group.items.map((i) => (
          <ItemRow key={i.id} item={i} state={state} toggle={toggle} toggleStar={toggleStar} />
        ))}
      </ul>
    </article>
  );
}

function ItemRow({
  item,
  state,
  toggle,
  toggleStar,
}: {
  item: BundleItem;
  state: FarmState;
  toggle: (id: string, field: keyof Progress) => void;
  toggleStar: (id: string) => void;
}) {
  const p = progressFor(state, item.id);
  const available = isAvailableInSeason(item, state.season);
  const keep = !p.turnedIn && !p.p1 && !p.p2 && available;
  const starred = state.starred[item.id] ?? false;
  return (
    <li className={p.turnedIn ? "item done" : "item"}>
      <button
        type="button"
        className={starred ? "star on" : "star"}
        onClick={() => toggleStar(item.id)}
        title={starred ? "Unstar" : "Mark important"}
        aria-pressed={starred}
      >
        {starred ? "★" : "☆"}
      </button>
      <div className="item-main">
        <div className="item-name-row">
          <span className="item-name">{item.name}</span>
          {Number(item.need) > 1 && <span className="need">×{item.need}</span>}
          {keep && <span className="keep-tag">don&apos;t sell</span>}
        </div>
        <small className="item-source">{item.source}</small>
        <div className="seasons">
          {item.seasons
            .filter((s) => s !== "Any")
            .map((s) => (
              <span key={s} className={`season-pip ${String(s).toLowerCase()}`}>
                {s}
              </span>
            ))}
          {item.seasons.includes("Any") && <span className="season-pip any">Any</span>}
        </div>
      </div>
      <div className="checks">
        <Check tone="p1" checked={p.p1} label={`${state.players[0]} has ${item.name}`} onChange={() => toggle(item.id, "p1")} text={state.players[0]?.slice(0, 1) || "1"} />
        <Check tone="p2" checked={p.p2} label={`${state.players[1]} has ${item.name}`} onChange={() => toggle(item.id, "p2")} text={state.players[1]?.slice(0, 1) || "2"} />
        <Check tone="turned" checked={p.turnedIn} label={`${item.name} turned in`} onChange={() => toggle(item.id, "turnedIn")} text="✓" />
      </div>
    </li>
  );
}

function Check({
  checked,
  label,
  onChange,
  tone,
  text,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  tone: string;
  text: string;
}) {
  return (
    <button
      type="button"
      className={`check ${tone} ${checked ? "on" : ""}`}
      onClick={onChange}
      title={label}
      aria-pressed={checked}
    >
      {checked ? text : ""}
    </button>
  );
}

/* ============================ Season ============================ */

function SeasonView({
  state,
  toggle,
  toggleStar,
}: {
  state: FarmState;
  toggle: (id: string, field: keyof Progress) => void;
  toggleStar: (id: string) => void;
}) {
  const available = bundleGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => isAvailableInSeason(i, state.season) && !progressFor(state, i.id).turnedIn),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="season-view">
      <Card title={`${seasonEmoji[state.season]} ${state.season} game plan`} accent="#6aa84f">
        <ul className="focus">
          {seasonFocus[state.season].map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Card>
      <Card title={`Bundle work available in ${state.season}`} accent="#c98a2b" subtitle="Outstanding items you can get right now">
        {available.length === 0 ? (
          <p className="muted">Every {state.season} item is already turned in. 🎉</p>
        ) : (
          <div className="bundle-grid">
            {available.map((g) => (
              <article key={`${g.room}-${g.bundle}`} className="bundle">
                <div className="bundle-top static">
                  <strong>{g.bundle}</strong>
                  <span className="bundle-count">{g.items.length} left</span>
                </div>
                <ul className="items">
                  {g.items.map((i) => (
                    <ItemRow key={i.id} item={i} state={state} toggle={toggle} toggleStar={toggleStar} />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================ Calendar ============================ */

function CalendarView({
  state,
  setDate,
}: {
  state: FarmState;
  setDate: (p: Partial<Pick<FarmState, "season" | "day" | "year">>) => void;
}) {
  const [view, setView] = useState<Season>(state.season);
  const events = calendarData[view];

  return (
    <div className="calendar">
      <div className="cal-head">
        <strong>
          {seasonEmoji[view]} {view} · Year {state.year}
        </strong>
        <span className="cal-note">Birthdays & festivals repeat every year (e.g. the Desert Festival, Spring 15–17).</span>
      </div>
      <div className="cal-switch">
        {seasons.map((s) => (
          <button key={s} type="button" className={s === view ? "active" : ""} onClick={() => setView(s)}>
            {seasonEmoji[s]} {s}
          </button>
        ))}
      </div>
      <div className="cal-legend">
        <span className="lg birthday">Birthday</span>
        <span className="lg festival">Festival</span>
        <span className="lg new">Event</span>
        <span className="lg forage">Forage</span>
      </div>
      <div className="cal-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="cal-dow">
            {d}
          </div>
        ))}
        {Array.from({ length: 28 }, (_, idx) => {
          const day = idx + 1;
          const evts = events[day] ?? [];
          const isToday = state.season === view && state.day === day;
          return (
            <button
              key={day}
              type="button"
              className={isToday ? "cal-day today" : "cal-day"}
              onClick={() => setDate({ season: view, day })}
            >
              <span className="cal-num">{day}</span>
              {evts.map((e) => (
                <span key={`${e.type}-${e.text}`} className={`cal-evt ${e.type}`}>
                  {e.type === "birthday" ? "🎂 " : e.type === "festival" ? "🎉 " : e.type === "forage" ? "🍓 " : "✨ "}
                  {e.text}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Crops ============================ */

function CropsView({ state }: { state: FarmState }) {
  // Current season first, so what to plant now is at the top.
  const orderedSeasons = [state.season, ...seasons.filter((s) => s !== state.season)];
  return (
    <div className="crops">
      {orderedSeasons.map((s) => {
        // Top picks first, then the rest — both in their listed order.
        const seasonCrops = crops.filter((c) => c.season === s);
        const ordered = [...seasonCrops].sort((a, b) => Number(!!b.top) - Number(!!a.top));
        const topNames = seasonCrops.filter((c) => c.top).map((c) => c.name);
        return (
          <Card
            key={s}
            title={`${seasonEmoji[s]} ${s}${s === state.season ? " · now" : ""}`}
            accent={s === state.season ? "#c2693a" : "#6aa84f"}
            subtitle={topNames.length ? `★ Best earners: ${topNames.join(", ")}` : undefined}
          >
            <ul className="crop-list">
              {ordered.map((c) => {
                const last = 28 - c.grow;
                const tooLate = state.season === s && state.day > last;
                return (
                  <li key={c.name} className={`crop${c.top ? " top" : ""}${tooLate ? " too-late" : ""}`}>
                    <div className="crop-main">
                      <div className="crop-name-row">
                        <strong>{c.name}</strong>
                        {c.top && <span className="crop-top-tag">★ top</span>}
                      </div>
                      {c.note && <small>{c.note}</small>}
                    </div>
                    <span className="crop-grow">
                      {c.grow}d{c.regrow ? ` +${c.regrow}d` : ""}
                    </span>
                    <span className="crop-last">{tooLate ? "too late" : `plant by ${last}`}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================ Villagers ============================ */

function VillagersView({ state }: { state: FarmState }) {
  const [q, setQ] = useState("");
  // Start on the current season's birthdays — the gifts that matter right now.
  const [seasonFilter, setSeasonFilter] = useState<Season | "All">(state.season);

  const query = q.trim().toLowerCase();
  const list = villagers
    .filter((v) => (seasonFilter === "All" ? true : v.season === seasonFilter))
    .filter(
      (v) =>
        !query ||
        v.name.toLowerCase().includes(query) ||
        v.loved.toLowerCase().includes(query) ||
        (v.liked ?? "").toLowerCase().includes(query),
    )
    .sort((a, b) => seasons.indexOf(a.season) - seasons.indexOf(b.season) || a.day - b.day);

  return (
    <div className="villagers-view">
      <div className="villager-controls">
        <label className="search">
          <span aria-hidden="true">🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a villager or a gift…" />
        </label>
        <div className="season-filter">
          {(["All", ...seasons] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={seasonFilter === s ? "active" : ""}
              onClick={() => setSeasonFilter(s)}
            >
              {s === "All" ? "All" : `${seasonEmoji[s]} ${s}`}
            </button>
          ))}
        </div>
      </div>

      <div className="universal-card">
        <strong>🌟 Universal gifts (work on almost everyone)</strong>
        <p>
          <span className="ug loved">Loved</span> {universalGifts.loved}
        </p>
        <p>
          <span className="ug liked">Liked</span> {universalGifts.liked}
        </p>
        <p>
          <span className="ug hated">Avoid</span> {universalGifts.hated}
        </p>
      </div>

      <div className="villagers">
        {list.map((v) => {
          const isToday = v.season === state.season && v.day === state.day;
          const soon = v.season === state.season && v.day > state.day && v.day - state.day <= 7;
          return (
            <article key={v.name} className={isToday ? "villager today" : soon ? "villager soon" : "villager"}>
              <div className="villager-head">
                <strong>{v.name}</strong>
                <span>
                  {seasonEmoji[v.season]} {v.season} {v.day}
                  {isToday ? " · today! 🎂" : soon ? ` · in ${v.day - state.day}d` : ""}
                </span>
              </div>
              <p className="gift-line">
                <span className="gift-tag loved">Loves</span> {v.loved}
              </p>
              {v.liked && (
                <p className="gift-line">
                  <span className="gift-tag liked">Likes</span> {v.liked}
                </p>
              )}
            </article>
          );
        })}
        {list.length === 0 && <p className="empty">No villager matches that.</p>}
      </div>
    </div>
  );
}

/* ============================ Board ============================ */

type TrackActions = {
  addTrack: (track: Omit<Track, "id">) => void;
  removeTrack: (id: string) => void;
  patchTrack: (id: string, patch: Partial<Track>) => void;
  addTrackItem: (id: string, label: string) => void;
  toggleTrackItem: (trackId: string, itemId: string) => void;
  removeTrackItem: (trackId: string, itemId: string) => void;
};

type BuildPlanActions = {
  addBuildPlan: (building: string) => void;
  removeBuildPlan: (id: string) => void;
  setBuildCount: (id: string, count: number) => void;
  setBuildBuilt: (id: string, built: number) => void;
};

const TRACK_GROUPS: TrackOwner[] = ["p1", "both", "p2"];

// Seed a romance track from the gift cadence + heart milestones.
function romanceItems(v: Villager): TrackItem[] {
  return [
    `This week: give 2 gifts (a loved gift = +80 friendship; resets Monday)`,
    `Birthday ${v.season} ${v.day} — give a loved gift (counts 8×)`,
    `Reach 8 ❤ → buy & give a Bouquet to start dating`,
    `Reach 10 ❤ → give the Mermaid's Pendant to propose`,
    `Watch their heart events as they unlock`,
  ].map((label) => ({ id: newId("itm"), label, done: false }));
}

// Loves + likes shown as reference context above a romance checklist.
function romanceNote(v: Villager): string {
  const likes = v.liked ?? "flowers, fruit, most cooked dishes, gems & artisan goods";
  return `❤ Loves: ${v.loved}\n♡ Likes: ${likes}`;
}

// Seed a tool track with the Clint upgrade ladder.
function toolItems(): TrackItem[] {
  return toolUpgrades.map((u) => ({
    id: newId("itm"),
    label: `Upgrade to ${u.tier} — ${u.gold.toLocaleString()}g + ${u.bar} at Clint's (2 days)`,
    done: false,
  }));
}

// Seed a goal track from a mission template.
function missionItems(m: MissionTemplate): TrackItem[] {
  return m.items.map((label) => ({ id: newId("itm"), label, done: false }));
}

// Seed a build track from the Carpenter materials + gold.
function buildItems(b: Building): TrackItem[] {
  const labels = [
    ...(b.requires ? [`Build ${b.requires} first`] : []),
    ...b.materials.split(",").map((m) => `Gather ${m.trim()}`),
    `Save ${b.gold.toLocaleString()}g`,
    `Order it from Robin — takes 2 days to finish`,
  ];
  return labels.map((label) => ({ id: newId("itm"), label, done: false }));
}

function ownerAvatar(o: TrackOwner, label: string) {
  if (o === "both") {
    return (
      <span className="avatar both" aria-hidden="true">
        👥
      </span>
    );
  }
  const initial = label.trim().charAt(0).toUpperCase() || (o === "p1" ? "1" : "2");
  return (
    <span className={`avatar ${o}`} aria-hidden="true">
      {initial}
    </span>
  );
}

function BoardView({
  state,
  actions,
  buildActions,
}: {
  state: FarmState;
  actions: TrackActions;
  buildActions: BuildPlanActions;
}) {
  const tracks = state.tracks;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleCollapse = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const ownerLabel = (o: TrackOwner) =>
    o === "p1"
      ? state.players[0] || "Player 1"
      : o === "p2"
        ? state.players[1] || "Player 2"
        : "Shared";

  return (
    <div className="board">
      <TrackComposer state={state} addTrack={actions.addTrack} />
      <BuildablesPanel plans={state.buildPlans} actions={buildActions} />
      <RecipePlanPanel state={state} />
      <GiftCheatSheet />

      <div className="board-columns">
        {TRACK_GROUPS.map((o) => {
          const list = tracks.filter((t) => t.owner === o);
          return (
            <section key={o} className={`board-col owner-${o}`}>
              <header className="col-head">
                {ownerAvatar(o, ownerLabel(o))}
                <span className="col-name">{ownerLabel(o)}</span>
                <span className="col-count">{list.length}</span>
              </header>
              <div className="col-body">
                {list.length === 0 ? (
                  <p className="col-empty">No goals yet — add one above.</p>
                ) : (
                  list.map((t) => (
                    <TrackCard
                      key={t.id}
                      track={t}
                      ownerLabel={ownerLabel}
                      actions={actions}
                      season={state.season}
                      day={state.day}
                      collapsed={!!collapsed[t.id]}
                      onToggle={() => toggleCollapse(t.id)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function GiftCheatSheet() {
  const [open, setOpen] = useState(true);
  return (
    <div className="cheat">
      <button type="button" className="cheat-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="track-caret" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        🌟 Gift cheat sheet — universal gifts that work on almost everyone
      </button>
      {open && (
        <div className="cheat-body">
          <p>
            <span className="ug loved">Loved</span> {universalGifts.loved}
          </p>
          <p>
            <span className="ug liked">Liked</span> {universalGifts.liked}
          </p>
          <p>
            <span className="ug hated">Avoid</span> {universalGifts.hated}
          </p>
        </div>
      )}
    </div>
  );
}

function BuildablesPanel({ plans, actions }: { plans: BuildPlan[]; actions: BuildPlanActions }) {
  const [pick, setPick] = useState(buildings[0].name);
  const [open, setOpen] = useState(true);

  const goldFor = (name: string) => buildings.find((b) => b.name === name)?.gold ?? 0;

  const totalGold = plans.reduce((sum, p) => sum + goldFor(p.building) * p.count, 0);
  const remainingGold = plans.reduce((sum, p) => sum + goldFor(p.building) * (p.count - p.built), 0);
  const totalToBuild = plans.reduce((sum, p) => sum + p.count, 0);
  const totalBuilt = plans.reduce((sum, p) => sum + p.built, 0);

  return (
    <div className="buildables">
      <button
        type="button"
        className="buildables-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="track-caret" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        🔨 Buildables — plan how many to build &amp; what it costs
        {plans.length > 0 && (
          <span className="buildables-tally">
            {totalBuilt}/{totalToBuild} built · {totalGold.toLocaleString()}g
          </span>
        )}
      </button>
      {open && (
        <div className="buildables-body">
          <div className="buildables-add">
            <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Building to plan">
              {buildings.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} · {b.gold.toLocaleString()}g
                </option>
              ))}
            </select>
            <button type="button" className="composer-add" onClick={() => actions.addBuildPlan(pick)}>
              ＋ Add
            </button>
          </div>

          {plans.length === 0 ? (
            <p className="buildables-empty">
              Nothing planned yet — pick a building above to start a cost plan.
            </p>
          ) : (
            <>
              <ul className="buildable-list">
                {plans.map((p) => {
                  const gold = goldFor(p.building);
                  const done = p.built >= p.count;
                  return (
                    <li key={p.id} className={done ? "buildable done" : "buildable"}>
                      <div className="buildable-main">
                        <strong>{p.building}</strong>
                        <small>
                          {gold.toLocaleString()}g each · {(gold * p.count).toLocaleString()}g total
                        </small>
                      </div>
                      <div className="buildable-controls">
                        <div className="qty" role="group" aria-label={`How many ${p.building} to build`}>
                          <button
                            type="button"
                            onClick={() => actions.setBuildCount(p.id, p.count - 1)}
                            aria-label="Build one fewer"
                          >
                            −
                          </button>
                          <span className="qty-num">{p.count}×</span>
                          <button
                            type="button"
                            onClick={() => actions.setBuildCount(p.id, p.count + 1)}
                            aria-label="Build one more"
                          >
                            ＋
                          </button>
                        </div>
                        <div className="built" role="group" aria-label={`How many ${p.building} built`}>
                          <button
                            type="button"
                            onClick={() => actions.setBuildBuilt(p.id, p.built - 1)}
                            aria-label="Mark one un-built"
                          >
                            −
                          </button>
                          <span className="built-num">{p.built}/{p.count} built</span>
                          <button
                            type="button"
                            onClick={() => actions.setBuildBuilt(p.id, p.built + 1)}
                            aria-label="Mark one built"
                          >
                            ＋
                          </button>
                        </div>
                        <button
                          type="button"
                          className="buildable-remove"
                          onClick={() => actions.removeBuildPlan(p.id)}
                          aria-label={`Remove ${p.building}`}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="buildables-foot">
                <span>🔨 {totalBuilt}/{totalToBuild} built</span>
                <span>
                  💰 {totalGold.toLocaleString()}g total · {remainingGold.toLocaleString()}g to go
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Read-only reflection of the Recipes tab plan: picked recipes + the ingredients
// to save for them. Managed on the Recipes tab; mirrored here for the co-op board.
function RecipePlanPanel({ state }: { state: FarmState }) {
  const [open, setOpen] = useState(true);

  const picked = recipes.filter((r) => state.recipesUnlocked[r.name] && state.recipesPicked[r.name]);
  const shopping = useMemo(() => {
    const totals = new Map<string, number>();
    for (const r of picked) {
      for (const { item, qty } of r.ingredients) {
        totals.set(item, (totals.get(item) ?? 0) + qty);
      }
    }
    return [...totals.entries()]
      .map(([item, qty]) => ({ item, qty }))
      .sort((a, b) => a.item.localeCompare(b.item));
  }, [picked]);

  return (
    <div className="buildables recipe-plan">
      <button
        type="button"
        className="buildables-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="track-caret" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        🍳 Recipe plan — ingredients to save
        {picked.length > 0 && (
          <span className="buildables-tally">
            {picked.length} recipe{picked.length === 1 ? "" : "s"} · {shopping.length} to save
          </span>
        )}
      </button>
      {open && (
        <div className="buildables-body">
          {picked.length === 0 ? (
            <p className="buildables-empty">
              Nothing picked yet — choose recipes on the Recipes tab to plan ingredients to save.
            </p>
          ) : (
            <>
              <div className="recipe-plan-makes">
                {picked.map((r) => (
                  <span key={r.name} className="recipe-chip">
                    {r.name}
                  </span>
                ))}
              </div>
              <ul className="shopping-list">
                {shopping.map(({ item, qty }) => (
                  <li key={item} className="shopping-row">
                    <span className="shopping-item">🧺 {item}</span>
                    <span className="shopping-qty">×{qty}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TrackComposer({
  state,
  addTrack,
}: {
  state: FarmState;
  addTrack: TrackActions["addTrack"];
}) {
  const [kind, setKind] = useState<"romance" | "build" | "tool" | "mission" | "custom">("romance");
  const [villager, setVillager] = useState(villagers[0].name);
  const [building, setBuilding] = useState(buildings[0].name);
  const [tool, setTool] = useState(tools[0].name);
  const [mission, setMission] = useState(missionTemplates[0].name);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState<TrackOwner>("p1");

  const submit = () => {
    if (kind === "romance") {
      const v = villagers.find((x) => x.name === villager);
      if (!v) return;
      addTrack({ title: `Romance ${v.name}`, icon: "💕", owner, note: romanceNote(v), items: romanceItems(v) });
    } else if (kind === "build") {
      const b = buildings.find((x) => x.name === building);
      if (!b) return;
      addTrack({ title: b.name, icon: "🔨", owner, note: b.note, items: buildItems(b) });
    } else if (kind === "tool") {
      const t = tools.find((x) => x.name === tool);
      if (!t) return;
      addTrack({ title: `Upgrade ${t.name}`, icon: "🛠️", owner, note: t.note, items: toolItems() });
    } else if (kind === "mission") {
      const m = missionTemplates.find((x) => x.name === mission);
      if (!m) return;
      addTrack({ title: m.name, icon: m.icon, owner, items: missionItems(m) });
    } else {
      const clean = title.trim();
      if (!clean) return;
      addTrack({ title: clean, icon: "✏️", owner, items: [] });
      setTitle("");
    }
  };

  const kinds: [typeof kind, string][] = [
    ["romance", "💕 Romance"],
    ["build", "🔨 Build"],
    ["tool", "🛠️ Tool"],
    ["mission", "🎯 Goal"],
    ["custom", "✏️ Custom"],
  ];
  const owners: [TrackOwner, string][] = [
    ["p1", state.players[0] || "P1"],
    ["both", "Both"],
    ["p2", state.players[1] || "P2"],
  ];

  return (
    <div className="composer">
      <div className="composer-kinds">
        {kinds.map(([k, label]) => (
          <button key={k} type="button" className={kind === k ? "ck active" : "ck"} onClick={() => setKind(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="composer-row">
        {kind === "romance" && (
          <select value={villager} onChange={(e) => setVillager(e.target.value)} aria-label="Villager to romance">
            {villagers.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} · {v.season} {v.day}
              </option>
            ))}
          </select>
        )}
        {kind === "build" && (
          <select value={building} onChange={(e) => setBuilding(e.target.value)} aria-label="Building to plan">
            {buildings.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name} · {b.gold.toLocaleString()}g
              </option>
            ))}
          </select>
        )}
        {kind === "tool" && (
          <select value={tool} onChange={(e) => setTool(e.target.value)} aria-label="Tool to upgrade">
            {tools.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        {kind === "mission" && (
          <select value={mission} onChange={(e) => setMission(e.target.value)} aria-label="Goal to track">
            {missionTemplates.map((m) => (
              <option key={m.name} value={m.name}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>
        )}
        {kind === "custom" && (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Goal name — e.g. Reach the bottom of the mines"
          />
        )}
        <div className="owner-pick">
          {owners.map(([o, label]) => (
            <button
              key={o}
              type="button"
              className={`op ${o}${owner === o ? " active" : ""}`}
              onClick={() => setOwner(o)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="composer-add" onClick={submit}>
          ＋ Add track
        </button>
      </div>
    </div>
  );
}

function TrackCard({
  track,
  ownerLabel,
  actions,
  season,
  day,
  collapsed,
  onToggle,
}: {
  track: Track;
  ownerLabel: (o: TrackOwner) => string;
  actions: TrackActions;
  season: Season;
  day: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [draft, setDraft] = useState("");
  const done = track.items.filter((i) => i.done).length;
  const total = track.items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  // Romance goals show where to find the villager on the day you're on.
  const romanceName = track.title.startsWith("Romance ") ? track.title.slice("Romance ".length) : null;
  const routine = romanceName ? villagerRoutines[romanceName] : undefined;
  const romanceVillager = romanceName ? villagers.find((v) => v.name === romanceName) : undefined;
  const isBirthday = romanceVillager?.season === season && romanceVillager?.day === day;

  const addItem = () => {
    actions.addTrackItem(track.id, draft);
    setDraft("");
  };

  return (
    <article className={`track owner-${track.owner}${complete ? " complete" : ""}`}>
      <header className="track-head">
        <button type="button" className="track-toggle" onClick={onToggle} aria-expanded={!collapsed}>
          <span className="track-caret" aria-hidden="true">
            {collapsed ? "▸" : "▾"}
          </span>
          <span className="track-icon" aria-hidden="true">
            {track.icon}
          </span>
          <span className="track-title">{track.title}</span>
        </button>
        <span className={`track-count${complete ? " done" : ""}`}>{total ? `${done}/${total}` : "—"}</span>
      </header>

      <div className="track-bar">
        <div className="track-fill" style={{ width: `${pct}%` }} />
      </div>

      {!collapsed && (
        <>
          {track.note && <p className="track-note">{track.note}</p>}
          {romanceName && (
            <div className="track-routine">
              <span className="rt-day">
                📅 {weekdayFor(day)}, {season} {day}
                {isBirthday ? " · 🎂 their birthday today!" : ""}
              </span>
              {routine && <span className="rt-where">📍 {routine}</span>}
            </div>
          )}
          <div className="track-body">
            {track.items.length > 0 && (
              <ul className="track-items">
                {track.items.map((i) => (
                  <li key={i.id} className={i.done ? "track-item done" : "track-item"}>
                    <label>
                      <input type="checkbox" checked={i.done} onChange={() => actions.toggleTrackItem(track.id, i.id)} />
                      <span className="track-box" aria-hidden="true" />
                      <span className="track-item-label">{i.label}</span>
                    </label>
                    <button
                      type="button"
                      className="track-remove"
                      onClick={() => actions.removeTrackItem(track.id, i.id)}
                      aria-label="Remove task"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="track-add">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                }}
                placeholder="Add a task…"
              />
              <button type="button" onClick={addItem} aria-label="Add task">
                ＋
              </button>
            </div>

            <div className="track-foot">
              <div className="owner-pick small">
                {(["p1", "both", "p2"] as TrackOwner[]).map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={`op ${o}${track.owner === o ? " active" : ""}`}
                    onClick={() => actions.patchTrack(track.id, { owner: o })}
                  >
                    {ownerLabel(o)}
                  </button>
                ))}
              </div>
              <button type="button" className="track-delete" onClick={() => actions.removeTrack(track.id)}>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}

/* ============================ Builds ============================ */

function BuildsView() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const list = buildings.filter(
    (b) =>
      !query ||
      b.name.toLowerCase().includes(query) ||
      b.materials.toLowerCase().includes(query) ||
      b.note.toLowerCase().includes(query),
  );

  const categories: [Building["category"], string][] = [
    ["Animal", "🐔 Animal buildings"],
    ["Utility", "🛠️ Farm & utility"],
  ];

  return (
    <div className="builds-view">
      <div className="villager-controls">
        <label className="search">
          <span aria-hidden="true">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a building or a material — coop, stone, hardwood…"
          />
        </label>
      </div>

      {list.length === 0 && <p className="empty">No building matches that.</p>}

      {categories.map(([cat, label]) => {
        const items = list.filter((b) => b.category === cat);
        if (items.length === 0) return null;
        return (
          <Card key={cat} title={label} accent="#9c7b4d">
            <ul className="build-list">
              {items.map((b) => (
                <li key={b.name} className="build">
                  <div className="build-main">
                    <div className="build-name-row">
                      <strong>{b.name}</strong>
                      {b.requires && <span className="build-req">needs {b.requires}</span>}
                    </div>
                    <small className="build-mats">{b.materials}</small>
                    <small className="build-note">{b.note}</small>
                  </div>
                  <div className="build-meta">
                    <span className="build-gold">{b.gold.toLocaleString()}g</span>
                    <span className="build-size">{b.size}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================ Recipes ============================ */

function RecipesView({
  state,
  toggleUnlocked,
  togglePicked,
}: {
  state: FarmState;
  toggleUnlocked: (name: string) => void;
  togglePicked: (name: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const matches = (r: (typeof recipes)[number]) =>
    !query ||
    r.name.toLowerCase().includes(query) ||
    r.ingredients.some((i) => i.item.toLowerCase().includes(query));

  const allList = recipes.filter(matches);
  const unlocked = recipes.filter((r) => state.recipesUnlocked[r.name]);
  const unlockedList = unlocked.filter(matches);
  const unlockedCount = unlocked.length;

  // Aggregate the ingredients of every picked recipe into one save list.
  const picked = unlocked.filter((r) => state.recipesPicked[r.name]);
  const shopping = useMemo(() => {
    const totals = new Map<string, number>();
    for (const r of picked) {
      for (const { item, qty } of r.ingredients) {
        totals.set(item, (totals.get(item) ?? 0) + qty);
      }
    }
    return [...totals.entries()]
      .map(([item, qty]) => ({ item, qty }))
      .sort((a, b) => a.item.localeCompare(b.item));
  }, [picked]);

  return (
    <div className="recipes-view">
      <div className="villager-controls">
        <label className="search">
          <span aria-hidden="true">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a recipe or an ingredient — pizza, sugar, egg…"
          />
        </label>
        <span className="recipe-count">
          {unlockedCount}/{recipes.length} unlocked
        </span>
      </div>

      <div className="recipes-grid">
        {/* 1 — full list, toggle what you've learned */}
        <Card title="📖 All recipes" subtitle="Tap one you've learned" accent="#9c7b4d">
          {allList.length === 0 && <p className="empty">No recipe matches that.</p>}
          <ul className="recipe-list">
            {allList.map((r) => {
              const on = !!state.recipesUnlocked[r.name];
              return (
                <li key={r.name} className={`recipe-row${on ? " unlocked" : ""}`}>
                  <button
                    type="button"
                    className={`recipe-toggle${on ? " on" : ""}`}
                    onClick={() => toggleUnlocked(r.name)}
                    aria-pressed={on}
                    title={on ? "Learned — tap to remove" : "Mark as learned"}
                  >
                    {on ? "✓" : ""}
                  </button>
                  <div className="recipe-main">
                    <strong>{r.name}</strong>
                    <small>{r.source}</small>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 2 — what you can make right now + pick for the plan */}
        <Card
          title="🍳 You can make"
          subtitle={picked.length ? `${picked.length} picked` : "Tick ones to plan ingredients"}
          accent="#c2693a"
        >
          {unlockedCount === 0 ? (
            <p className="empty">Mark recipes you&apos;ve learned to see them here.</p>
          ) : unlockedList.length === 0 ? (
            <p className="empty">No learned recipe matches that.</p>
          ) : (
            <ul className="recipe-list">
              {unlockedList.map((r) => {
                const on = !!state.recipesPicked[r.name];
                return (
                  <li key={r.name} className={`makeable${on ? " picked" : ""}`}>
                    <button
                      type="button"
                      className={`recipe-toggle pick${on ? " on" : ""}`}
                      onClick={() => togglePicked(r.name)}
                      aria-pressed={on}
                      title={on ? "On the save list" : "Add to the save list"}
                    >
                      {on ? "✓" : ""}
                    </button>
                    <div className="recipe-main">
                      <strong>{r.name}</strong>
                      <small className="recipe-ings">
                        {r.ingredients.map((i) => (i.qty > 1 ? `${i.item} ×${i.qty}` : i.item)).join(" · ")}
                      </small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* 3 — aggregated ingredients to save */}
        <Card title="🧺 Save these" subtitle="From every picked recipe" accent="#5aa85f">
          {shopping.length === 0 ? (
            <p className="empty">Pick a recipe to build your save list.</p>
          ) : (
            <ul className="shopping-list">
              {shopping.map(({ item, qty }) => (
                <li key={item} className="shopping-row">
                  <span className="shopping-item">{item}</span>
                  <span className="shopping-qty">×{qty}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================ Layout (farm plan) ============================ */

// The farm layout we're building toward — a reference image saved at
// public/farm-layout.png. Shows a friendly hint until the file is added.
function LayoutView() {
  const [missing, setMissing] = useState(false);

  return (
    <div className="layout-view">
      <Card
        title="🗺️ Our farm plan"
        subtitle="The layout we're building toward"
        accent="#5aa85f"
      >
        {missing ? (
          <p className="empty">
            Add your farm screenshot at <code>public/farm-layout.png</code> to show it here.
          </p>
        ) : (
          <img
            className="layout-image"
            src="/farm-layout.png"
            alt="Our planned farm layout"
            onError={() => setMissing(true)}
          />
        )}
      </Card>
    </div>
  );
}

/* ============================ Where (schedules) ============================ */

// Minutes since midnight → "9:00 am". Stardew runs past midnight (e.g. 25:00 → 1:00 am).
function fmtTime(mins: number): string {
  const m = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  const mm = (m % 60).toString().padStart(2, "0");
  const ap = h < 12 ? "am" : "pm";
  h = h % 12 || 12;
  return `${h}:${mm} ${ap}`;
}

function scheduleFor(c: CharacterSchedule, weekday: Weekday): ScheduleStop[] {
  return c.byDay?.[weekday] ?? c.base;
}

function ScheduleView({ state }: { state: FarmState }) {
  const [q, setQ] = useState("");
  // The in-game clock starts at 6am; noon is a sensible default for "where now".
  const [time, setTime] = useState(12 * 60);
  const weekday = weekdayFor(state.day) as Weekday;
  const query = q.trim().toLowerCase();

  const list = characterSchedules.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.home.toLowerCase().includes(query) ||
      scheduleFor(c, weekday).some((s) => s.place.toLowerCase().includes(query)),
  );

  return (
    <div className="schedule-view">
      <div className="schedule-controls">
        <label className="search">
          <span aria-hidden="true">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a villager or a place — Abigail, Saloon, beach…"
          />
        </label>
        <div className="time-control">
          <div className="time-head">
            <span className="time-day">
              {weekday} · {seasonEmoji[state.season]} {state.season} {state.day}
            </span>
            <span className="time-now">🕐 {fmtTime(time)}</span>
          </div>
          <input
            type="range"
            min={360}
            max={1560}
            step={30}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            aria-label="Time of day"
          />
        </div>
      </div>

      <p className="schedule-caveat">
        Approximate sunny-day routines — real paths also shift with weather, season, hearts, and festivals.
      </p>

      {list.length === 0 && <p className="empty">Nobody matches that.</p>}

      <div className="schedule-grid">
        {list.map((c) => {
          const stops = scheduleFor(c, weekday);
          // Where they are at the chosen time = the last stop already begun.
          let activeIdx = -1;
          for (let i = 0; i < stops.length; i += 1) {
            if (stops[i].t <= time) activeIdx = i;
          }
          const nowPlace = activeIdx >= 0 ? stops[activeIdx].place : null;
          const allDay = stops.length === 1 && stops[0].t === 0;
          return (
            <section key={c.name} className="sched-card">
              <header className="sched-head">
                <strong>{c.name}</strong>
                <span className="sched-now">
                  {allDay ? `📍 ${stops[0].place}` : nowPlace ? `📍 ${nowPlace}` : "😴 Asleep at home"}
                </span>
              </header>
              {c.note && <p className="sched-note">{c.note}</p>}
              {!allDay && (
                <ol className="sched-timeline">
                  {stops.map((s, i) => (
                    <li key={s.t} className={`sched-stop${i === activeIdx ? " active" : ""}`}>
                      <span className="sched-time">{fmtTime(s.t)}</span>
                      <span className="sched-place">{s.place}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Search ============================ */

function SearchResults({
  query,
  state,
  toggle,
  toggleStar,
  addCustom,
  setDate,
  clear,
}: {
  query: string;
  state: FarmState;
  toggle: (id: string, field: keyof Progress) => void;
  toggleStar: (id: string) => void;
  addCustom: (name: string) => void;
  setDate: (p: Partial<Pick<FarmState, "season" | "day" | "year">>) => void;
  clear: () => void;
}) {
  const q = query.trim().toLowerCase();
  const items = bundleItems.filter((i) =>
    `${i.name} ${i.bundle} ${i.room} ${i.source}`.toLowerCase().includes(q),
  );
  const people = villagers.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.loved.toLowerCase().includes(q) ||
      (v.liked ?? "").toLowerCase().includes(q),
  );

  return (
    <div className="search-results">
      <Card
        title={`📦 Items (${items.length})`}
        accent="#c98a2b"
        subtitle="Tick who has it, mark turned-in, or ★ star as important"
      >
        {items.length === 0 ? (
          <p className="muted">No bundle item matches “{query}”.</p>
        ) : (
          <ul className="items">
            {items.slice(0, 40).map((i) => (
              <ItemRow key={i.id} item={i} state={state} toggle={toggle} toggleStar={toggleStar} />
            ))}
          </ul>
        )}
        <button
          type="button"
          className="add-custom-btn"
          onClick={() => {
            addCustom(query.trim());
            clear();
          }}
        >
          ➕ Add “{query.trim()}” to my ⭐ watchlist
        </button>
      </Card>

      {people.length > 0 && (
        <Card title={`🎁 Villagers (${people.length})`} accent="#8a6bb0">
          <div className="villagers">
            {people.map((v) => (
              <article key={v.name} className="villager">
                <div className="villager-head">
                  <strong>{v.name}</strong>
                  <button type="button" className="link-btn" onClick={() => setDate({ season: v.season, day: v.day })}>
                    {seasonEmoji[v.season]} {v.season} {v.day} →
                  </button>
                </div>
                <p className="gift-line">
                  <span className="gift-tag loved">Loves</span> {v.loved}
                </p>
                {v.liked && (
                  <p className="gift-line">
                    <span className="gift-tag liked">Likes</span> {v.liked}
                  </p>
                )}
              </article>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================ Watchlist ============================ */

function WatchlistView({
  state,
  toggle,
  toggleStar,
  addCustom,
  toggleCustom,
  removeCustom,
  goBundles,
}: {
  state: FarmState;
  toggle: (id: string, field: keyof Progress) => void;
  toggleStar: (id: string) => void;
  addCustom: (name: string) => void;
  toggleCustom: (id: string) => void;
  removeCustom: (id: string) => void;
  goBundles: () => void;
}) {
  const [draft, setDraft] = useState("");
  const starred = bundleItems.filter((i) => state.starred[i.id]);

  const submit = () => {
    addCustom(draft);
    setDraft("");
  };

  return (
    <div className="watchlist">
      <Card title="⭐ Starred bundle items" accent="#b8962e" subtitle="Items you flagged as important — don't sell these">
        {starred.length === 0 ? (
          <p className="muted">
            Nothing starred yet. Tap the ☆ on any item in{" "}
            <button type="button" className="link-btn" onClick={goBundles}>
              Bundles
            </button>{" "}
            or in search to pin it here.
          </p>
        ) : (
          <ul className="items">
            {starred.map((i) => (
              <ItemRow key={i.id} item={i} state={state} toggle={toggle} toggleStar={toggleStar} />
            ))}
          </ul>
        )}
      </Card>

      <Card title="📝 Your own important items" accent="#4f9d4f" subtitle="Anything else you want to keep — gifts, tools, custom goals">
        <div className="custom-add">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="e.g. Keep a Prismatic Shard for Sword…"
          />
          <button type="button" onClick={submit}>
            Add
          </button>
        </div>
        {state.customItems.length === 0 ? (
          <p className="muted">No custom items yet.</p>
        ) : (
          <ul className="custom-list">
            {state.customItems.map((c) => (
              <li key={c.id} className={c.done ? "custom done" : "custom"}>
                <label>
                  <input type="checkbox" checked={c.done} onChange={() => toggleCustom(c.id)} />
                  <span className="custom-box" aria-hidden="true" />
                  <span className="custom-name">{c.name}</span>
                </label>
                <button type="button" className="remove" onClick={() => removeCustom(c.id)} aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ============================ Shared bits ============================ */

function Card({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card" style={accent ? { ["--accent" as string]: accent } : undefined}>
      <div className="card-head">
        <h2>{title}</h2>
        {subtitle && <p className="card-sub">{subtitle}</p>}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
