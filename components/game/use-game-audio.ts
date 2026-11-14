"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tracks, type MusicTrack } from "./model";

const effectFiles = [
  ...["luffy", "zoro", "nami", "usopp", "sanji", "chopper", "robin", "franky", "brook", "jinbe", "win", "lose"]
    .map((name) => `/audio/sound-effects/${name}.mp3`),
];

export type AudioPreferences = {
  enabled: boolean;
  musicOn: boolean;
  musicReady: boolean;
  effectsOn: boolean;
  musicVolume: number;
  effectsVolume: number;
  track: MusicTrack;
};

function play(
  audio: HTMLAudioElement,
  description: string,
  onError: () => void,
  onBlocked: () => void = () => {},
  onStarted: () => void = () => {},
  onSettled: () => void = () => {},
) {
  void audio.play().then(onStarted).catch((error: unknown) => {
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "NotAllowedError") {
        onBlocked();
        return;
      }
      if (error.name === "AbortError") return;
    }
    console.error(`${description} could not be played.`, error);
    onError();
  }).finally(onSettled);
}

export function useGameAudio(preferences: AudioPreferences) {
  const [unlocked, setUnlocked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicPlayPending = useRef(false);
  const unlockedRef = useRef(false);
  const preferencesRef = useRef(preferences);
  const queuedEffects = useRef(new Set<string>());
  const activeEffects = useRef(new Set<HTMLAudioElement>());

  const playMusic = useCallback((audio: HTMLAudioElement) => {
    if (!audio.paused || musicPlayPending.current) return;
    musicPlayPending.current = true;
    play(
      audio,
      "Background music",
      () => setAudioError(true),
      undefined,
      undefined,
      () => {
        musicPlayPending.current = false;
      },
    );
  }, []);

  useEffect(() => {
    if (preferences.enabled && preferences.effectsOn) return;
    for (const effect of activeEffects.current) effect.pause();
    activeEffects.current.clear();
  }, [preferences.enabled, preferences.effectsOn]);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    const music = new Audio();
    music.loop = true;
    music.preload = "metadata";
    music.src = tracks[0].file;
    music.load();
    musicRef.current = music;

    const preload = effectFiles.map((source) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = source;
      audio.load();
      return audio;
    });

    return () => {
      music.pause();
      for (const audio of preload) audio.pause();
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = musicRef.current;
    if (!audio) return;
    if (audio.src !== new URL(preferences.track.file, window.location.href).href) {
      audio.src = preferences.track.file;
      audio.load();
    }
    audio.volume = preferences.musicVolume / 100;
    if (preferences.enabled && preferences.musicOn && preferences.musicReady) {
      playMusic(audio);
    } else {
      audio.pause();
    }
    if (!preferences.enabled) {
      for (const effect of activeEffects.current) effect.pause();
      activeEffects.current.clear();
      queuedEffects.current.clear();
    }
  }, [playMusic, preferences.enabled, preferences.musicOn, preferences.musicReady, preferences.musicVolume, preferences.track.file]);

  const playEffectAudio = useCallback((
    source: string,
    volume: number,
    onBlocked?: () => void,
    onStarted?: () => void,
  ) => {
    const audio = new Audio(source);
    audio.preload = "auto";
    audio.volume = volume / 100;
    activeEffects.current.add(audio);
    const cleanUp = () => activeEffects.current.delete(audio);
    audio.addEventListener("ended", cleanUp, { once: true });
    audio.addEventListener("error", cleanUp, { once: true });
    play(audio, "Sound effect", () => {
      cleanUp();
      setAudioError(true);
    }, () => {
      cleanUp();
      onBlocked?.();
    }, onStarted);
  }, []);

  const unlockAudio = useCallback((enableAudio = false) => {
    if (!unlockedRef.current) {
      unlockedRef.current = true;
      setUnlocked(true);
    }
    const current = preferencesRef.current;
    const music = musicRef.current;
    if (
      music
      && music.paused
      && (current.enabled || enableAudio)
      && current.musicOn
      && current.musicReady
    ) {
      music.volume = current.musicVolume / 100;
      playMusic(music);
    }

    const queued = Array.from(queuedEffects.current);
    queuedEffects.current.clear();
    for (const source of queued) {
      if ((current.enabled || enableAudio) && current.effectsOn) {
        playEffectAudio(source, current.effectsVolume);
      }
    }
  }, [playEffectAudio, playMusic]);

  const playEffect = useCallback((source: string) => {
    const current = preferencesRef.current;
    if (!current.enabled || !current.effectsOn) return;
    if (!unlockedRef.current) {
      queuedEffects.current.add(source);
      return;
    }
    playEffectAudio(source, current.effectsVolume);
  }, [playEffectAudio]);

  return { audioUnlocked: unlocked, audioError, unlockAudio, playEffect };
}
