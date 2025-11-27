export type FixishState =
  | "idle"
  | "scanning"
  | "analyzing"
  | "generating_steps"
  | "instructing"
  | "awaiting_user_action"
  | "paused"
  | "completed"
  | "error"
  | "stopped";
