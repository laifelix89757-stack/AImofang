
export enum ModelType {
  GEMINI_3_PRO = 'gemini-3-pro-preview', // Text & Reasoning
  GEMINI_3_PRO_IMAGE = 'gemini-3-pro-image-preview', // High Fidelity Rendering (Nano Banana Pro)
  GEMINI_2_5_FLASH_IMAGE = 'gemini-2.5-flash-image' // Fast Editing/Generation (Banana Flash Image)
}

export enum AppMode {
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD', // New: Admin only
  USER_WORKSPACE = 'USER_WORKSPACE'
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  model: ModelType;
  systemInstruction: string; // The "GEM" definition
  inputCount: 1 | 2; // How many image slots
  inputLabels: string[]; // Labels for image slots
  defaultPrompt?: string; // Optional default prompt
}

export interface UserProfile {
  username: string;
  role: 'admin' | 'user';
}
