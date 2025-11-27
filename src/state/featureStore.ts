import { create } from 'zustand';

interface FeatureState {
  features: {
    depth: boolean;
    mesh: boolean;
    ghostReplay: boolean;
    troubleshooting: boolean;
    stepClips: boolean;
    sceneGraph: boolean;
    gestureControl: boolean;
  };
  currentMode: string;
  toggleFeature: (feature: keyof FeatureState['features']) => void;
  setFeature: (feature: keyof FeatureState['features'], enabled: boolean) => void;
  setMode: (mode: string) => void;
}

const modes = {
  beginner: {
    depth: true,
    mesh: false,
    ghostReplay: true,
    troubleshooting: true,
    stepClips: true,
    sceneGraph: true,
    gestureControl: true,
  },
  expert: {
    depth: false,
    mesh: false,
    ghostReplay: false,
    troubleshooting: false,
    stepClips: false,
    sceneGraph: false,
    gestureControl: true,
  },
  minimal: {
    depth: false,
    mesh: false,
    ghostReplay: false,
    troubleshooting: false,
    stepClips: false,
    sceneGraph: false,
    gestureControl: false,
  },
  developer: {
    depth: true,
    mesh: true,
    ghostReplay: true,
    troubleshooting: true,
    stepClips: true,
    sceneGraph: true,
    gestureControl: true,
  },
  ar_heavy: {
    depth: true,
    mesh: true,
    ghostReplay: true,
    troubleshooting: false,
    stepClips: true,
    sceneGraph: true,
    gestureControl: true,
  },
  safety_first: {
    depth: false,
    mesh: false,
    ghostReplay: false,
    troubleshooting: true,
    stepClips: false,
    sceneGraph: false,
    gestureControl: false,
  },
};

export const useFeatureStore = create<FeatureState>((set) => ({
  features: modes.beginner,
  currentMode: 'beginner',
  toggleFeature: (feature) =>
    set((state) => ({
      features: {
        ...state.features,
        [feature]: !state.features[feature],
      },
      currentMode: 'custom',
    })),
  setFeature: (feature, enabled) =>
    set((state) => ({
      features: {
        ...state.features,
        [feature]: enabled,
      },
      currentMode: 'custom',
    })),
  setMode: (mode) =>
    set(() => ({
      features: modes[mode as keyof typeof modes] || modes.beginner,
      currentMode: mode,
    })),
}));
