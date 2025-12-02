import type { LogLevel, LogEntry } from '../types';

type LogCallback = (entry: LogEntry) => void;

class Logger {
  private level: LogLevel = 'info';
  private entries: LogEntry[] = [];
  private maxEntries: number = 1000;
  private persistToFile: boolean = false;
  private callbacks: LogCallback[] = [];

  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setMaxEntries(max: number): void {
    this.maxEntries = max;
    this.trimEntries();
  }

  setPersistToFile(persist: boolean): void {
    this.persistToFile = persist;
  }

  subscribe(callback: LogCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.level];
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.entries.push(entry);
    this.trimEntries();

    // Console output with styling
    const styles: Record<LogLevel, string> = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red; font-weight: bold',
    };

    const prefix = `[${level.toUpperCase()}]`;
    if (data !== undefined) {
      console.log(`%c${prefix} ${message}`, styles[level], data);
    } else {
      console.log(`%c${prefix} ${message}`, styles[level]);
    }

    // Notify subscribers
    this.callbacks.forEach(cb => cb(entry));
  }

  private trimEntries(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => e.level === level);
  }

  clear(): void {
    this.entries = [];
  }

  downloadLogs(): void {
    const logText = this.entries
      .map(e => {
        const date = new Date(e.timestamp).toISOString();
        const dataStr = e.data !== undefined ? ` | ${JSON.stringify(e.data)}` : '';
        return `[${date}] [${e.level.toUpperCase()}] ${e.message}${dataStr}`;
      })
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-data-collector-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getStorageKey(): string {
    return 'serial-data-collector-logs';
  }

  saveToStorage(): void {
    if (this.persistToFile) {
      try {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.entries));
      } catch (e) {
        console.warn('Failed to persist logs to localStorage', e);
      }
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load logs from localStorage', e);
    }
  }
}

// Singleton instance
export const logger = new Logger();
export default Logger;
