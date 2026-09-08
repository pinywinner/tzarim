let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

function tone(frequency: number, duration: number, gainValue = 0.045, type: OscillatorType = "sine"): void {
  const ctx = getContext();
  if (!ctx) return;
  void ctx.resume();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  oscillator.start(now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.stop(now + duration + 0.02);
}

export function playStartSound(): void {
  tone(392, 0.12, 0.04);
}

export function playEndSound(): void {
  tone(494, 0.09, 0.035);
  window.setTimeout(() => tone(587, 0.14, 0.04), 90);
}
