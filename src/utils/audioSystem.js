// Web Audio API & Speech Synthesis Engine for Audio Tours and Safety Alerts

class AudioSystem {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.audioCtx = null;
    this.currentUtterance = null;
    this.isPlayingSpeech = false;
    this.isSirenPlaying = false;
    this.sirenOscillator = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play Speech Synthesis for Audio Tours
  speak(text, onStart, onEnd, onError) {
    if (!this.synth) {
      if (onError) onError('Speech synthesis not supported on this browser');
      return;
    }

    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try to pick a natural sounding voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isPlayingSpeech = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isPlayingSpeech = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isPlayingSpeech = false;
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeech() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlayingSpeech = false;
    this.currentUtterance = null;
  }

  // UI Sound Effects using Web Audio API synthesized tones
  playTone(freq = 440, type = 'sine', duration = 0.15) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playSuccessSound() {
    this.playTone(587.33, 'triangle', 0.1); // D5
    setTimeout(() => this.playTone(880, 'triangle', 0.2), 100); // A5
  }

  playWarningSound() {
    this.playTone(330, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(261.63, 'sawtooth', 0.25), 180);
  }

  // Emergency Siren Sound Generator for SOS Guard
  toggleEmergencySiren(onStart, onStop) {
    if (this.isSirenPlaying) {
      this.stopEmergencySiren();
      if (onStop) onStop();
      return false;
    } else {
      this.startEmergencySiren();
      if (onStart) onStart();
      return true;
    }
  }

  startEmergencySiren() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      
      this.isSirenPlaying = true;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      // Modulate frequency between 600Hz and 1200Hz
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2.5, ctx.currentTime); // 2.5 oscillations per sec
      lfoGain.gain.setValueAtTime(300, ctx.currentTime);

      osc.frequency.setValueAtTime(800, ctx.currentTime);
      lfo.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc.start();

      this.sirenOscillator = { osc, lfo, gain };
    } catch (e) {
      console.warn('Siren initialization error:', e);
    }
  }

  stopEmergencySiren() {
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.osc.stop();
        this.sirenOscillator.lfo.stop();
      } catch {}
      this.sirenOscillator = null;
    }
    this.isSirenPlaying = false;
  }
}

export const audioSystem = new AudioSystem();
