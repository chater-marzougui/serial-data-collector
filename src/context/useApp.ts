import { useContext } from "react";
import type {
  AppConfig,
  RecordedSample,
  ConnectionStatus,
  CollectionStats,
  LogEntry,
  SerialLogEntry,
} from "../types";
import { AppContext } from "./context";

export interface AppContextType {
  // Configuration
  config: AppConfig;
  updateConfig: (partial: Partial<AppConfig>) => void;
  resetConfig: () => void;
  importConfig: (json: string) => void;
  exportConfig: () => string;

  // Serial connection
  connectionStatus: ConnectionStatus;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  isSerialSupported: boolean;

  // Live data
  liveData: string[];
  clearLiveData: () => void;

  // Recording
  isRecording: boolean;
  currentClass: string | null;
  startRecording: (classId?: string) => void;
  stopRecording: () => void;
  recordedSamples: RecordedSample[];
  clearRecordedSamples: () => void;

  // Statistics
  stats: CollectionStats;

  // Export
  exportData: () => void;
  previewExport: () => string[];

  // Logging
  logs: LogEntry[];
  clearLogs: () => void;
  downloadLogs: () => void;

  // Serial TX (bidirectional)
  sendCommand: (command: string) => Promise<boolean>;
  sendQuickCommand: (commandId: string) => Promise<boolean>;
  commandHistory: string[];
  clearCommandHistory: () => void;
  txLog: SerialLogEntry[];
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
