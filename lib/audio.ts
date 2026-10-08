let ac: AudioContext | undefined;
export function beep(vol: number, f = 600, d = 0.12) {
  try { ac = ac ?? new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); g.gain.value = 0.15 * vol; o.frequency.value = f; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch {}
}
export function balloonPop(vol: number) {
  if (vol <= 0) return;
  try {
    ac = ac ?? new AudioContext();
    if (ac.state === 'suspended') void ac.resume().catch(() => {});
    const now = ac.currentTime, duration = 0.14, loudness = Math.min(1, vol);
    const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

    const noise = ac.createBufferSource(), filter = ac.createBiquadFilter(), noiseGain = ac.createGain();
    noise.buffer = buffer;
    filter.type = 'bandpass'; filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(550, now + duration);
    noiseGain.gain.setValueAtTime(0.28 * loudness, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(ac.destination);

    const tone = ac.createOscillator(), toneGain = ac.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(170, now);
    tone.frequency.exponentialRampToValueAtTime(65, now + duration);
    toneGain.gain.setValueAtTime(0.09 * loudness, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    tone.connect(toneGain); toneGain.connect(ac.destination);
    noise.onended = () => { noise.disconnect(); filter.disconnect(); noiseGain.disconnect(); tone.disconnect(); toneGain.disconnect(); };
    noise.start(now); noise.stop(now + duration);
    tone.start(now); tone.stop(now + duration);
  } catch {}
}
export function say(vol: number, t: string) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; u.volume = vol; speechSynthesis.speak(u); } catch {}
}
export function playClip(path: string, vol: number): HTMLAudioElement | null {
  if (vol <= 0) return null;
  try {
    const clip = new Audio(path);
    clip.volume = Math.min(1, Math.max(0, vol));
    void clip.play().catch(() => {});
    return clip;
  } catch { return null; }
}

let answerClip: HTMLAudioElement | null = null;
export function stopAnswer() {
  answerClip?.pause();
  answerClip = null;
}
export function playAnswer(correct: boolean, vol: number) {
  stopAnswer();
  const clip = playClip(correct ? '/sounds/correct.mp3' : '/sounds/wrong.mp3', vol);
  answerClip = clip;
  clip?.addEventListener('ended', () => { if (answerClip === clip) answerClip = null; }, { once: true });
}
export function playWin(vol: number) {
  stopAnswer();
  return playClip('/sounds/win-success.mp3', vol);
}
