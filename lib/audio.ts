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
type VoiceManifest = Record<string, string>;
let voiceManifest: Promise<VoiceManifest> | undefined;
let narrationClip: HTMLAudioElement | null = null;
let narrationId = 0;
const normalizeSpeech = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');

function loadVoiceManifest(): Promise<VoiceManifest> {
  voiceManifest ??= fetch('/sounds/voice/manifest.json')
    .then((response) => response.ok ? response.json() : {})
    .then((value: unknown) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] =>
        typeof entry[1] === 'string' && /^[a-z0-9][a-z0-9_.-]*\.(mp3|m4a|ogg|wav)$/i.test(entry[1]))
        .map(([phrase, file]) => [normalizeSpeech(phrase), file]));
    }).catch(() => ({}));
  return voiceManifest;
}

export function prepareNarration() {
  void loadVoiceManifest();
  try { window.speechSynthesis.getVoices(); } catch {}
}

function preferredIndonesianVoice(voices: SpeechSynthesisVoice[]) {
  const indonesian = voices.filter((voice) => /^id(?:[-_]|$)/i.test(voice.lang));
  const female = (voice: SpeechSynthesisVoice) => /gadis|sari|ayu|female|woman|wanita|perempuan/i.test(voice.name);
  return indonesian.find((voice) => female(voice) && voice.localService)
    ?? indonesian.find(female)
    ?? indonesian.find((voice) => voice.localService)
    ?? indonesian[0];
}

function speakWithBrowser(vol: number, phrase: string, id: number) {
  try {
    const synth = window.speechSynthesis;
    const speak = () => {
      if (id !== narrationId) return;
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'id-ID';
      utterance.volume = Math.max(0, Math.min(1, vol));
      utterance.rate = .95;
      utterance.pitch = 1;
      utterance.voice = preferredIndonesianVoice(synth.getVoices()) ?? null;
      synth.speak(utterance);
    };
    if (synth.getVoices().length) { speak(); return; }
    const ready = () => { clearTimeout(timeout); synth.removeEventListener('voiceschanged', ready); speak(); };
    synth.addEventListener('voiceschanged', ready);
    const timeout = setTimeout(ready, 800);
  } catch {}
}

export function stopNarration() {
  narrationId++;
  narrationClip?.pause(); narrationClip = null;
  try { window.speechSynthesis.cancel(); } catch {}
}

export function say(vol: number, phrase: string) {
  stopNarration();
  if (vol <= 0) return;
  const id = narrationId;
  void loadVoiceManifest().then(async (manifest) => {
    if (id !== narrationId) return;
    const file = manifest[normalizeSpeech(phrase)];
    if (file) {
      try {
        const clip = new Audio(`/sounds/voice/${file}`);
        clip.volume = Math.max(0, Math.min(1, vol));
        narrationClip = clip;
        clip.addEventListener('ended', () => { if (narrationClip === clip) narrationClip = null; }, { once: true });
        await clip.play();
        return;
      } catch { narrationClip = null; }
    }
    if (id === narrationId) speakWithBrowser(vol, phrase, id);
  });
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
  stopNarration();
  stopAnswer();
  const clip = playClip(correct ? '/sounds/correct.mp3' : '/sounds/wrong.mp3', vol);
  answerClip = clip;
  clip?.addEventListener('ended', () => { if (answerClip === clip) answerClip = null; }, { once: true });
}
export function playWin(vol: number) {
  stopNarration();
  stopAnswer();
  return playClip('/sounds/win-success.mp3', vol);
}

export type EverydaySound = 'bell' | 'rain' | 'clock' | 'horn';
export function playEverydaySound(kind: EverydaySound, vol: number) {
  if (vol <= 0) return () => {};
  stopNarration();
  try {
    ac = ac ?? new AudioContext();
    if (ac.state === 'suspended') void ac.resume().catch(() => {});
    const context = ac, now = context.currentTime;
    const sources: AudioScheduledSourceNode[] = [];
    const tone = (frequency: number, offset: number, duration: number, gain: number, type: OscillatorType = 'sine') => {
      const oscillator = context.createOscillator(), volume = context.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(Math.max(.0001, gain * vol), now + offset);
      volume.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
      oscillator.connect(volume); volume.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
      oscillator.start(now + offset); oscillator.stop(now + offset + duration);
      sources.push(oscillator);
    };
    if (kind === 'bell') {
      tone(880, 0, 1, .18); tone(1320, 0, .8, .08); tone(1760, 0, .55, .04);
    } else if (kind === 'clock') {
      for (const offset of [0, .4, .8]) tone(1100, offset, .06, .13, 'square');
    } else if (kind === 'horn') {
      tone(260, 0, .6, .11, 'sawtooth'); tone(330, 0, .6, .08, 'sawtooth');
    } else {
      const duration = 1.4, buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      const noise = context.createBufferSource(), filter = context.createBiquadFilter(), volume = context.createGain();
      noise.buffer = buffer; filter.type = 'highpass'; filter.frequency.value = 1200;
      volume.gain.setValueAtTime(.0001, now);
      volume.gain.exponentialRampToValueAtTime(.09 * vol, now + .12);
      volume.gain.exponentialRampToValueAtTime(.0001, now + duration);
      noise.connect(filter); filter.connect(volume); volume.connect(context.destination);
      noise.onended = () => { noise.disconnect(); filter.disconnect(); volume.disconnect(); };
      noise.start(now); noise.stop(now + duration); sources.push(noise);
    }
    return () => { for (const source of sources) { try { source.stop(); } catch {} } };
  } catch { return () => {}; }
}
