import { create } from 'zustand';

interface Features {
  depth: boolean;
  mesh: boolean;
  ghostReplay: boolean;
  troubleshooting: boolean;
  stepClips: boolean;
  sceneGraph: boolean;
  gestureControl: boolean;
  arOverlay: boolean;
  voice: boolean;
  pointCloud: boolean;
  multiObject: boolean;
  replay: boolean;
  timewarp: boolean;
}

interface FeatureState {
  features: Features;
  currentMode: string;
  toggleFeature: (feature: keyof Features) => void;
  setFeature: (feature: keyof Features, enabled: boolean) => void;
  setMode: (mode: string) => void;
}

const defaultFeatures: Features = {
  depth: true,
  mesh: false,
  ghostReplay: true,
  troubleshooting: true,
  stepClips: true,
  sceneGraph: true,
  gestureControl: true,
  arOverlay: true,
  voice: true,
  pointCloud: true,
  multiObject: true,
  replay: true,
  timewarp: true,
};

const modes: Record<string, Features> = {
  beginner: {
    ...defaultFeatures,
    mesh: false,
  },
  expert: {
    depth: false,
    mesh: false,
    ghostReplay: false,
    troubleshooting: false,
    stepClips: false,
    sceneGraph: false,
    gestureControl: true,
    arOverlay: true,
    voice: false,
    pointCloud: false,
    multiObject: true,
    replay: false,
    timewarp: false,
  },
  minimal: {
    depth: false,
    mesh: false,
    ghostReplay: false,
    troubleshooting: false,
    stepClips: false,
    sceneGraph: false,
    gestureControl: false,
    arOverlay: false,
    voice: false,
    pointCloud: false,
    multiObject: false,
    replay: false,
    timewarp: false,
  },
  developer: {
    depth: true,
    mesh: true,
    ghostReplay: true,
    troubleshooting: true,
    stepClips: true,
    sceneGraph: true,
    gestureControl: true,
    arOverlay: true,
    voice: true,
    pointCloud: true,
    multiObject: true,
    replay: true,
    timewarp: true,
  },
  ar_heavy: {
    depth: true,
    mesh: true,
    ghostReplay: true,
    troubleshooting: false,
    stepClips: true,
    sceneGraph: true,
    gestureControl: true,
    arOverlay: true,
    voice: true,
    pointCloud: true,
    multiObject: true,
    replay: true,
    timewarp: true,
  },
  safety_first: {
    depth: false,
    mesh: false,
    ghostReplay: false,
    troubleshooting: true,
    stepClips: false,
    sceneGraph: false,
    gestureControl: false,
    arOverlay: false,
    voice: true,
    pointCloud: false,
    multiObject: false,
    replay: false,
    timewarp: false,
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
