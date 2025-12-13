import { create } from "zustand";

interface ProcessResult {
  instructions?: string;
  steps?: string[];
  warnings?: string[];
  overlays?: any[];
  timeline?: {
    past?: any[];
    future?: any[];
  };
  emotion?: {
    label: string;
    confidence: number;
  };
  predicted_tools?: string[];
  agent_messages?: string[];
}

interface ImageResult {
  analysis?: string;
  detections?: any[];
  objects?: string[];
  damage_assessment?: any;
}

interface AudioResult {
  transcription?: string;
  emotion?: {
    label: string;
    confidence: number;
  };
}

interface ToolResult {
  tools?: string[];
  recommendations?: any[];
}

interface FutureResult {
  predictions?: any[];
  continuity?: string;
  next_steps?: string[];
}

interface FixishConsoleState {
  // Loading states
  isProcessing: boolean;
  isUploadingImage: boolean;
  isUploadingAudio: boolean;
  isPredictingTools: boolean;
  isPredictingFuture: boolean;
  
  // Results
  processResult: ProcessResult | null;
  imageResult: ImageResult | null;
  audioResult: AudioResult | null;
  toolResult: ToolResult | null;
  futureResult: FutureResult | null;
  
  // Errors
  error: string | null;
  
  // Uploaded files preview
  uploadedImage: string | null;
  uploadedAudio: string | null;
  
  // Actions
  setProcessing: (loading: boolean) => void;
  setUploadingImage: (loading: boolean) => void;
  setUploadingAudio: (loading: boolean) => void;
  setPredictingTools: (loading: boolean) => void;
  setPredictingFuture: (loading: boolean) => void;
  
  setProcessResult: (result: ProcessResult | null) => void;
  setImageResult: (result: ImageResult | null) => void;
  setAudioResult: (result: AudioResult | null) => void;
  setToolResult: (result: ToolResult | null) => void;
  setFutureResult: (result: FutureResult | null) => void;
  
  setError: (error: string | null) => void;
  setUploadedImage: (url: string | null) => void;
  setUploadedAudio: (url: string | null) => void;
  
  clearAll: () => void;
}

export const useFixishConsoleStore = create<FixishConsoleState>((set) => ({
  // Loading states
  isProcessing: false,
  isUploadingImage: false,
  isUploadingAudio: false,
  isPredictingTools: false,
  isPredictingFuture: false,
  
  // Results
  processResult: null,
  imageResult: null,
  audioResult: null,
  toolResult: null,
  futureResult: null,
  
  // Errors
  error: null,
  
  // Uploaded files
  uploadedImage: null,
  uploadedAudio: null,
  
  // Actions
  setProcessing: (loading) => set({ isProcessing: loading }),
  setUploadingImage: (loading) => set({ isUploadingImage: loading }),
  setUploadingAudio: (loading) => set({ isUploadingAudio: loading }),
  setPredictingTools: (loading) => set({ isPredictingTools: loading }),
  setPredictingFuture: (loading) => set({ isPredictingFuture: loading }),
  
  setProcessResult: (result) => set({ processResult: result }),
  setImageResult: (result) => set({ imageResult: result }),
  setAudioResult: (result) => set({ audioResult: result }),
  setToolResult: (result) => set({ toolResult: result }),
  setFutureResult: (result) => set({ futureResult: result }),
  
  setError: (error) => set({ error }),
  setUploadedImage: (url) => set({ uploadedImage: url }),
  setUploadedAudio: (url) => set({ uploadedAudio: url }),
  
  clearAll: () => set({
    processResult: null,
    imageResult: null,
    audioResult: null,
    toolResult: null,
    futureResult: null,
    error: null,
    uploadedImage: null,
    uploadedAudio: null,
  }),
}));
