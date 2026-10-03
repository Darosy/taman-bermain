let ac: AudioContext | undefined;
export function beep(vol: number, f = 600, d = 0.12) {
  try { ac = ac ?? new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); g.gain.value = 0.15 * vol; o.frequency.value = f; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch {}
}
export function say(vol: number, t: string) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; u.volume = vol; speechSynthesis.speak(u); } catch {}
}
