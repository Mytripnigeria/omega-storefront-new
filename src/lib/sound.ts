import { getPreference } from "@/hooks/usePreferences";

// Lightweight UI sound effects via the Web Audio API (no asset files needed).
// Gated on the user's "sound_effects" preference from Settings.
let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

type Tone = "tap" | "success" | "error";

const TONES: Record<Tone, { freq: number; duration: number; type: OscillatorType }> = {
  tap: { freq: 660, duration: 0.06, type: "sine" },
  success: { freq: 880, duration: 0.12, type: "triangle" },
  error: { freq: 220, duration: 0.18, type: "sawtooth" },
};

/** Play a short UI sound, respecting the user's sound-effects preference. */
export function playSound(tone: Tone = "tap") {
  if (!getPreference("sound_effects")) return;
  const ac = audioCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    const { freq, duration, type } = TONES[tone];
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration);
  } catch {
    // Audio not allowed yet (no user gesture) — ignore.
  }
}
