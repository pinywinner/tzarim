import { registerPlugin } from "@capacitor/core";

export type SplashHandoffPlugin = {
  land(options: { x: number; y: number; width: number; height: number }): Promise<void>;
  skip(): Promise<void>;
};

export const SplashHandoff = registerPlugin<SplashHandoffPlugin>("SplashHandoff");
