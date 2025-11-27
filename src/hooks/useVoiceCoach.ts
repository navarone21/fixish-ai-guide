import { useEffect } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useVoiceCoach() {
  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.0;
      u.volume = 1.0;
      speechSynthesis.speak(u);
    } catch(e) {
      console.warn("Voice error:", e);
    }
  };

  useEffect(() => {
    const client = FixishClient.getInstance();

    const unsubData = client.subscribe("data", (data) => {
      // Handle errors
      if (data?.errors?.length) {
        speak(data.errors[data.errors.length - 1]);
      }

      // Handle step completion
      if (data?.step_completed) {
        speak("Step completed. Great job. Moving to the next step.");
      }
    });

    const unsubWorld = client.subscribe("world", (data) => {
      // Handle hazards
      if (data?.hazards?.length) {
        speak(data.hazards[data.hazards.length - 1]);
      }

      // Handle active step changes
      if (data?.task_state?.active_step?.description) {
        speak(`Next step: ${data.task_state.active_step.description}`);
      }
    });

    const unsubState = client.subscribe("state", (data) => {
      if (data?.state === "paused") speak("Pausing the task.");
      if (data?.state === "instructing") speak("Resuming.");
    });

    return () => {
      unsubData();
      unsubWorld();
      unsubState();
    };
  }, []);
}
