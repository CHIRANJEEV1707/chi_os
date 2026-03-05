'use client';

import { Howl } from 'howler';

export type SoundName = 'boot' | 'click' | 'windowOpen' | 'windowClose' | 'error' | 'success';

const soundFiles: Record<SoundName, string> = {
  boot: '/sounds/boot.mp3',
  click: '/sounds/click.mp3',
  windowOpen: '/sounds/window-open.mp3',
  windowClose: '/sounds/window-close.mp3',
  error: '/sounds/error.mp3',
  success: '/sounds/success.mp3',
};

const sounds: Partial<Record<SoundName, Howl>> = {};
let isInitialized = false;

const initializeSounds = () => {
  if (isInitialized) return;

  Object.keys(soundFiles).forEach(key => {
    const soundName = key as SoundName;
    sounds[soundName] = new Howl({
      src: [soundFiles[soundName]],
      volume: 0.3,
    });
  });

  isInitialized = true;
};

// This needs to be called on first user interaction to comply with autoplay policies
export const initSoundSystem = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    const init = () => {
      initializeSounds();
      // These listeners are removed after the first interaction
    };
    window.addEventListener('click', init, { once: true });
    window.addEventListener('keydown', init, { once: true });
    window.addEventListener('scroll', init, { once: true });
  }
};

export const playSound = (name: SoundName) => {
  if (!isInitialized) {
    // If a sound is played before any interaction, try to initialize.
    // This might be blocked by the browser but is a safe fallback.
    initializeSounds();
  }
  
  if (sounds[name]) {
    sounds[name]?.play();
  } else {
    console.warn(`Sound '${name}' not found or not loaded.`);
  }
};
