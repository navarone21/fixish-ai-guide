// frontend/src/lib/stores/features.ts
// GLOBAL FEATURE TOGGLE STORE

import { create } from "zustand";

export type FixishFeatures = {
  detection: boolean;
  depth: boolean;
  pointCloud: boolean;
  mesh: boolean;
  multiObject: boolean;
  arOverlay: boolean;
  replay: boolean;
  timewarp: boolean;
  voice: boolean;
  beginnerMode: boolean;
  expertMode: boolean;
  autoRetry: boolean;
  chatOnly: boolean;

  toggle: (key: keyof FixishFeatures) => void;
};

export const useFeatureStore = create<FixishFeatures>((set) => ({
  detection: true,
  depth: true,
  pointCloud: true,
  mesh: true,
  multiObject: true,
  arOverlay: true,
  replay: true,
  timewarp: true,
  voice: true,
  beginnerMode: true,
  expertMode: false,
  autoRetry: true,
  chatOnly: false,

  toggle: (key) =>
    set((state) => ({
      ...state,
      [key]: !state[key],
    })),
}));
