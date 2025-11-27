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
  toggleFeature: (feature: keyof FeatureState['features']) => void;
  setFeature: (feature: keyof FeatureState['features'], enabled: boolean) => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  features: {
    depth: true,
    mesh: true,
    ghostReplay: true,
    troubleshooting: true,
    stepClips: true,
    sceneGraph: true,
    gestureControl: true,
  },
  toggleFeature: (feature) =>
    set((state) => ({
      features: {
        ...state.features,
        [feature]: !state.features[feature],
      },
    })),
  setFeature: (feature, enabled) =>
    set((state) => ({
      features: {
        ...state.features,
        [feature]: enabled,
      },
    })),
}));
