"use client";

import { useSyncExternalStore } from "react";

const storageKey = "grand-line-arcade-muted";

export type AudioMutePreference = Readonly<{
  muted: boolean;
  storageAvailable: boolean;
}>;

const serverSnapshot: AudioMutePreference = Object.freeze({
  muted: false,
  storageAvailable: true,
});
let snapshot: AudioMutePreference | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): AudioMutePreference {
  try {
    return Object.freeze({
      muted: window.localStorage.getItem(storageKey) === "true",
      storageAvailable: true,
    });
  } catch (error) {
    console.error("Could not load the saved audio preference.", error);
    return Object.freeze({ muted: false, storageAvailable: false });
  }
}

function getSnapshot(): AudioMutePreference {
  if (typeof window === "undefined") return serverSnapshot;
  snapshot ??= readSnapshot();
  return snapshot;
}

function getServerSnapshot(): AudioMutePreference {
  return serverSnapshot;
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

function handleStorage(event: StorageEvent) {
  if (event.key !== storageKey && event.key !== null) return;
  snapshot = readSnapshot();
  notifyListeners();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useAudioMutePreference() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setAudioMutePreference(muted: boolean): boolean {
  let storageAvailable = true;
  try {
    window.localStorage.setItem(storageKey, String(muted));
  } catch (error) {
    storageAvailable = false;
    console.error("Could not save the audio preference.", error);
  }

  snapshot = Object.freeze({ muted, storageAvailable });
  notifyListeners();
  return storageAvailable;
}
