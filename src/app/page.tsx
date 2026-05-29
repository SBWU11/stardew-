"use client";

import { useMemo, useState } from "react";
import {
  bundleGroups,
  bundleItems,
  bundleRewards,
  calendarData,
  clampDay,
  crops,
  isAvailableInSeason,
  roomAccent,
  roomOrder,
  seasonFocus,
  seasons,
  universalGifts,
  villagers,
  type BundleGroup,
  type BundleItem,
  type Season,
} from "./data";
import {
  progressFor,
  useFarm,
  type FarmState,
  type Progress,
  type SyncStatus,
} from "@/lib/store";

type Tab = "today" | "bundles" | "watchlist" | "season" | "calendar" | "crops" | "villagers";

const TABS: [Tab, string, string][] = [
  ["today", "Today", "🌅"],
  ["bundles", "Bundles", "📦"],
  ["watchlist", "Starred", "⭐"],
  ["season", "Season", "🌱"],
  ["calendar", "Calendar", "📅"],
  ["crops", "Crops", "🌾"],
  ["villagers", "Villagers", "🎁"],
];

let customIdSeq = 0;

const seasonEmoji: Record<Season, string> = {
  Spring: "🌸",
  Summer: "🌞",
  Fall: "🍂",
  Winter: "❄️",
};

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
  const [seasonOnly, setSeasonOnly] = useState(false);
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
          if (hideDone && p.turnedIn) return false;
          return true;
        });
        return { ...g, items };
      })
      .filter((g) => g.items.length > 0);
  }, [q, seasonOnly, hideDone, state]);

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
  return (
    <div className="crops">
      {seasons.map((s) => (
        <Card key={s} title={`${seasonEmoji[s]} ${s}`} accent="#6aa84f">
          <ul className="crop-list">
            {crops
              .filter((c) => c.season === s)
              .map((c) => {
                const last = 28 - c.grow;
                const tooLate = state.season === s && state.day > last;
                return (
                  <li key={c.name} className={tooLate ? "crop too-late" : "crop"}>
                    <div className="crop-main">
                      <strong>{c.name}</strong>
                      {c.note && <small>{c.note}</small>}
                    </div>
                    <span className="crop-grow">
                      {c.grow}d{c.regrow ? ` +${c.regrow}d` : ""}
                    </span>
                    <span className="crop-last">
                      {tooLate ? "too late" : `plant by ${last}`}
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>
      ))}
    </div>
  );
}

/* ============================ Villagers ============================ */

function VillagersView({ state }: { state: FarmState }) {
  const [q, setQ] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<Season | "All">("All");

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
