import { IndustryType } from '../types';

type SfxKey =
  | 'buttonClick'
  | 'eventCrisis'
  | 'eventFortune'
  | 'eventRoutine'
  | 'eventChoice'
  | 'death'
  | 'victory'
  | 'retire'
  | 'moneyGain'
  | 'moneyLose'
  | 'levelUp'
  | 'buffApply'
  | 'debuffApply'
  | 'shopBuy'
  | 'weekStart';

type BgmKey = IndustryType;

// ── Web Audio API helpers ──────────────────────────────────────────────

function getAudioContext(): AudioContext | null {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  } catch {
    console.warn('[SoundManager] Web Audio API not available');
    return null;
  }
}

/**
 * Generate an AudioBuffer with a simple tone.
 */
function createToneBuffer(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channelData = buffer.getChannelData(0);
  const fadeLength = Math.min(Math.floor(sampleRate * 0.01), Math.floor(length * 0.1));

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, i / fadeLength) * Math.min(1, (length - i) / fadeLength);
    let sample = 0;

    switch (type) {
      case 'sine':
        sample = Math.sin(2 * Math.PI * frequency * t);
        break;
      case 'square':
        sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
        break;
      case 'triangle':
        sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
        break;
      case 'sawtooth':
        sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
        break;
    }

    channelData[i] = sample * envelope * volume;
  }

  return buffer;
}

function playBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  volume: number = 1,
  loop: boolean = false,
  offset: number = 0,
): { source: AudioBufferSourceNode; gain: GainNode; stop: () => void } {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.loop = loop;
  gain.gain.value = Math.max(0, Math.min(1, volume));
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0, offset);
  return {
    source,
    gain,
    stop: () => {
      try { source.stop(); } catch {}
    },
  };
}

// ── SoundManager ───────────────────────────────────────────────────────

class SoundManager {
  private _muted = false;
  private _volume = 0.5;
  private _bgmEnabled = false;
  private _ctx: AudioContext | null = null;
  private _currentBgm: { stop: () => void } | null = null;
  private _sfxCache: Partial<Record<SfxKey, AudioBuffer>> = {};
  private _bgmCache: Partial<Record<BgmKey, AudioBuffer>> = {};

  private getCtx(): AudioContext | null {
    if (!this._ctx) {
      this._ctx = getAudioContext();
    }
    // Resume if suspended (browser autoplay policy)
    if (this._ctx?.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  get muted() { return this._muted; }
  get volume() { return this._volume; }
  get bgmEnabled() { return this._bgmEnabled; }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this._muted && this._currentBgm) {
      this._currentBgm.stop();
      this._currentBgm = null;
    }
    return this._muted;
  }

  setVolume(vol: number) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this._currentBgm) {
      // Restart BGM with new volume
      this._currentBgm.stop();
      this._currentBgm = null;
    }
  }

  toggleBgm(): boolean {
    this._bgmEnabled = !this._bgmEnabled;
    if (!this._bgmEnabled && this._currentBgm) {
      this._currentBgm.stop();
      this._currentBgm = null;
    }
    return this._bgmEnabled;
  }

  private getSfx(key: SfxKey): AudioBuffer | null {
    if (this._sfxCache[key]) return this._sfxCache[key]!;
    const ctx = this.getCtx();
    if (!ctx) return null;

    let buffer: AudioBuffer;
    switch (key) {
      case 'buttonClick':
        buffer = createToneBuffer(ctx, 800, 0.06, 'sine', 0.08);
        break;
      case 'eventCrisis':
        buffer = createToneBuffer(ctx, 110, 0.8, 'square', 0.12);
        break;
      case 'eventFortune':
        buffer = createToneBuffer(ctx, 1047, 0.5, 'sine', 0.1);
        break;
      case 'eventRoutine':
        buffer = createToneBuffer(ctx, 523, 0.15, 'sine', 0.06);
        break;
      case 'eventChoice':
        buffer = createToneBuffer(ctx, 659, 0.1, 'triangle', 0.08);
        break;
      case 'death':
        buffer = createToneBuffer(ctx, 165, 0.6, 'triangle', 0.12);
        break;
      case 'victory':
        buffer = createToneBuffer(ctx, 784, 0.8, 'triangle', 0.12);
        break;
      case 'retire':
        buffer = createToneBuffer(ctx, 440, 0.5, 'sine', 0.08);
        break;
      case 'moneyGain':
        buffer = createToneBuffer(ctx, 1175, 0.15, 'sine', 0.1);
        break;
      case 'moneyLose':
        buffer = createToneBuffer(ctx, 294, 0.2, 'sawtooth', 0.07);
        break;
      case 'levelUp':
        buffer = createToneBuffer(ctx, 880, 0.3, 'triangle', 0.1);
        break;
      case 'buffApply':
        buffer = createToneBuffer(ctx, 660, 0.25, 'sine', 0.08);
        break;
      case 'debuffApply':
        buffer = createToneBuffer(ctx, 196, 0.3, 'square', 0.07);
        break;
      case 'shopBuy':
        buffer = createToneBuffer(ctx, 523, 0.15, 'triangle', 0.08);
        break;
      case 'weekStart':
        buffer = createToneBuffer(ctx, 440, 0.1, 'sine', 0.05);
        break;
    }

    this._sfxCache[key] = buffer;
    return buffer;
  }

  private getBgm(key: BgmKey): AudioBuffer | null {
    if (this._bgmCache[key]) return this._bgmCache[key]!;
    const ctx = this.getCtx();
    if (!ctx) return null;

    const config: Record<BgmKey, { freq: number; type: OscillatorType }> = {
      [IndustryType.INTERNET]: { freq: 261.63, type: 'triangle' },
      [IndustryType.REAL_ESTATE]: { freq: 293.66, type: 'sine' },
      [IndustryType.PHARMA]: { freq: 329.63, type: 'triangle' },
      [IndustryType.POLICE]: { freq: 349.23, type: 'square' },
      [IndustryType.DESIGN]: { freq: 392.00, type: 'sine' },
      [IndustryType.METRO]: { freq: 440.00, type: 'triangle' },
    };

    const { freq, type } = config[key];
    const buffer = createToneBuffer(ctx, freq, 4.0, type, 0.03);
    this._bgmCache[key] = buffer;
    return buffer;
  }

  playSfx(key: SfxKey) {
    if (this._muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const buffer = this.getSfx(key);
    if (!buffer) return;
    playBuffer(ctx, buffer, this._volume);
  }

  playBgm(industry: IndustryType) {
    if (!this._bgmEnabled || this._muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const buffer = this.getBgm(industry);
    if (!buffer) return;

    if (this._currentBgm) {
      this._currentBgm.stop();
    }

    const player = playBuffer(ctx, buffer, this._volume * 0.6, true);
    this._currentBgm = player;
  }

  stopBgm() {
    if (this._currentBgm) {
      this._currentBgm.stop();
    }
    this._bgmCache = {};
    this._currentBgm = null;
  }

  // Haptic feedback
  vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Convenience methods
  onButtonClick() {
    this.playSfx('buttonClick');
    this.vibrate(10);
  }

  onCrisis() {
    this.playSfx('eventCrisis');
    this.vibrate([50, 30, 50, 30, 100]);
  }

  onFortune() {
    this.playSfx('eventFortune');
    this.vibrate(20);
  }

  onMoneyChange(delta: number) {
    if (delta > 0) {
      this.playSfx('moneyGain');
      this.vibrate(5);
    } else if (delta < 0) {
      this.playSfx('moneyLose');
      this.vibrate(15);
    }
  }

  onGameOver(isVictory: boolean) {
    if (isVictory) {
      this.playSfx('victory');
    } else {
      this.playSfx('death');
    }
    this.stopBgm();
  }

  onLevelUp() {
    this.playSfx('levelUp');
    this.vibrate([10, 20, 10]);
  }
}

export const soundManager = new SoundManager();
export default SoundManager;
