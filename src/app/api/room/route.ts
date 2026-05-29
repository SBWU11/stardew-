// Co-op room sync. Stores one JSON document per room code.
//
// Storage backend:
//   - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (e.g. an
//     Upstash Redis from the Vercel Marketplace), state is shared across devices.
//   - Otherwise it falls back to an in-memory map, which works for a single
//     `next dev` process (great for trying it locally in two browser tabs) but
//     resets on restart and is NOT shared across serverless instances.

export const dynamic = "force-dynamic";

type StoredState = { rev?: number; [k: string]: unknown };

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const usingRedis = Boolean(REST_URL && REST_TOKEN);

// In-memory fallback (per server process).
const memory = new Map<string, StoredState>();

function keyFor(code: string) {
  return `farm:${code.toUpperCase()}`;
}

async function readState(code: string): Promise<StoredState | null> {
  if (!usingRedis) return memory.get(keyFor(code)) ?? null;
  const res = await fetch(`${REST_URL}/get/${encodeURIComponent(keyFor(code))}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("redis get failed");
  const data = (await res.json()) as { result: string | null };
  return data.result ? (JSON.parse(data.result) as StoredState) : null;
}

async function writeState(code: string, state: StoredState): Promise<void> {
  if (!usingRedis) {
    memory.set(keyFor(code), state);
    return;
  }
  const res = await fetch(`${REST_URL}/set/${encodeURIComponent(keyFor(code))}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error("redis set failed");
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return Response.json({ error: "missing code" }, { status: 400 });
  try {
    const state = await readState(code);
    return Response.json({ state });
  } catch {
    return Response.json({ error: "storage unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: { code?: string; state?: StoredState };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }
  const { code, state } = body;
  if (!code || !state) return Response.json({ error: "missing code or state" }, { status: 400 });

  try {
    const current = await readState(code);
    const incomingRev = typeof state.rev === "number" ? state.rev : 0;
    const currentRev = typeof current?.rev === "number" ? current.rev : -1;

    // Last-write-wins: accept the incoming state when its rev is at least the
    // stored rev. Otherwise the caller is behind, so echo back the canonical copy.
    if (!current || incomingRev >= currentRev) {
      await writeState(code, state);
      return Response.json({ state });
    }
    return Response.json({ state: current });
  } catch {
    return Response.json({ error: "storage unavailable" }, { status: 503 });
  }
}
