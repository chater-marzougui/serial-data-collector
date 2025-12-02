// Configuration types
export interface SerialConfig {
  baudRate: number;
  delimiter: string;
  encoding: string;
}

export interface FieldConfig {
  name: string;
  type: 'string' | 'number' | 'boolean';
}

export interface ParserConfig {
  type: 'split' | 'regex' | 'json' | 'custom';
  splitDelimiter?: string;
  regex?: string;
  regexGroups?: string[];
  customParser?: string;
  skipLines?: string[];
}

export interface ClassConfig {
  id: string;
  name: string;
  color: string;
}

export interface RuleConfig {
  id: string;
  condition: string;
  action: 'label' | 'ignore' | 'log';
  value?: string;
  enabled: boolean;
}

export interface ExportConfig {
  template: string;
  filename: string;
  includeHeader: boolean;
}

export interface AppConfig {
  serial: SerialConfig;
  parser: ParserConfig;
  fields: string[];
  classes: ClassConfig[];
  rules: RuleConfig[];
  export: ExportConfig;
  recording: {
    autoStopSeconds: number;
    enableLabeling: boolean;
  };
  logging: {
    level: LogLevel;
    persistToFile: boolean;
    maxEntries: number;
  };
}

// Data types
export interface ParsedData {
  timestamp: number;
  raw: string;
  fields: Record<string, string | number | boolean>;
  label?: string;
  ignored?: boolean;
}

export interface RecordedSample extends ParsedData {
  recordedAt: number;
}

// Logger types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
}

// Serial types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SerialState {
  status: ConnectionStatus;
  error?: string;
}

// Rule engine types
export interface RuleContext {
  fields: Record<string, string | number | boolean>;
  raw: string;
  timestamp: number;
}

export interface RuleResult {
  action: 'label' | 'ignore' | 'log' | 'pass';
  value?: string;
  ruleId?: string;
}

// Stats types
export interface CollectionStats {
  totalSamples: number;
  classCounts: Record<string, number>;
  startTime?: number;
  lastSampleTime?: number;
}
