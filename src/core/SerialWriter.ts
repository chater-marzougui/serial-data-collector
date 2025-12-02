import type { SerialTxConfig, SerialLogEntry } from "../types";
import { logger } from "./Logger";

type TxLogCallback = (entry: SerialLogEntry) => void;

interface WriteCommand {
  data: string;
  resolve: (success: boolean) => void;
  reject: (error: Error) => void;
}

class SerialWriter {
  private config: SerialTxConfig;
  private writeQueue: WriteCommand[] = [];
  private isProcessing: boolean = false;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private txLogCallbacks: TxLogCallback[] = [];
  private commandHistory: string[] = [];
  private maxHistoryLength: number = 50;

  constructor(config: SerialTxConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<SerialTxConfig>): void {
    this.config = { ...this.config, ...config };
    logger.debug("SerialWriter config updated", this.config);
  }

  setWriter(writable: WritableStream<Uint8Array> | null): void {
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch {
        // Ignore release lock errors
      }
    }
    this.writer = writable ? writable.getWriter() : null;
  }

  onTxLog(callback: TxLogCallback): () => void {
    this.txLogCallbacks.push(callback);
    return () => {
      this.txLogCallbacks = this.txLogCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyTxLog(data: string): void {
    const entry: SerialLogEntry = {
      timestamp: Date.now(),
      direction: "TX",
      data,
      encoding: this.config.encoding,
    };
    this.txLogCallbacks.forEach((cb) => cb(entry));
  }

  private encodeData(data: string): Uint8Array {
    const dataWithLineEnding = data + this.config.lineEnding;
    
    switch (this.config.encoding) {
      case "ascii": {
        const bytes = new Uint8Array(dataWithLineEnding.length);
        for (let i = 0; i < dataWithLineEnding.length; i++) {
          bytes[i] = dataWithLineEnding.charCodeAt(i) & 0x7f;
        }
        return bytes;
      }
      case "raw": {
        // Parse hex string like "0A 0D FF" or "0A0DFF"
        const hexParts = dataWithLineEnding.replace(/\s+/g, "").match(/.{1,2}/g) || [];
        const bytes = new Uint8Array(hexParts.length);
        for (let i = 0; i < hexParts.length; i++) {
          bytes[i] = parseInt(hexParts[i], 16) || 0;
        }
        return bytes;
      }
      case "utf-8":
      default:
        return new TextEncoder().encode(dataWithLineEnding);
    }
  }

  async write(data: string): Promise<boolean> {
    if (!this.config.enabled) {
      logger.warn("Serial TX is disabled");
      return false;
    }

    return new Promise((resolve, reject) => {
      this.writeQueue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.writeQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.writeQueue.length > 0) {
      const command = this.writeQueue.shift();
      if (!command) continue;

      try {
        if (!this.writer) {
          throw new Error("Serial port is not writable");
        }

        const encoded = this.encodeData(command.data);
        await this.writer.write(encoded);
        
        // Add to history
        this.addToHistory(command.data);
        
        // Notify TX log
        this.notifyTxLog(command.data);
        
        logger.debug("TX", { data: command.data, encoding: this.config.encoding }, "TX");
        command.resolve(true);

        // Wait for delay between commands
        if (this.config.automatedCommands.delayBetweenCommands > 0) {
          await this.delay(this.config.automatedCommands.delayBetweenCommands);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Failed to write to serial port", { error: message });
        command.reject(new Error(message));
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private addToHistory(command: string): void {
    // Remove duplicate if exists
    const index = this.commandHistory.indexOf(command);
    if (index > -1) {
      this.commandHistory.splice(index, 1);
    }
    
    // Add to front
    this.commandHistory.unshift(command);
    
    // Trim to max length
    if (this.commandHistory.length > this.maxHistoryLength) {
      this.commandHistory = this.commandHistory.slice(0, this.maxHistoryLength);
    }
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  clearHistory(): void {
    this.commandHistory = [];
  }

  async sendQuickCommand(commandId: string): Promise<boolean> {
    const command = this.config.quickCommands.find((c) => c.id === commandId);
    if (!command || !command.enabled) {
      logger.warn("Quick command not found or disabled", { commandId });
      return false;
    }
    return this.write(command.command);
  }

  async sendAutomatedCommand(trigger: keyof SerialTxConfig["automatedCommands"]): Promise<boolean> {
    if (trigger === "delayBetweenCommands") return false;
    
    const command = this.config.automatedCommands[trigger];
    if (!command || command.trim() === "") {
      return true; // No command configured, not an error
    }
    
    logger.info(`Sending automated command for: ${trigger}`, { command });
    return this.write(command);
  }

  async sendClassCommand(classId: string): Promise<boolean> {
    const classCommand = this.config.classCommands.find(
      (c) => c.classId === classId && c.enabled
    );
    if (!classCommand || classCommand.command.trim() === "") {
      return true; // No command configured, not an error
    }
    
    logger.info(`Sending class command for: ${classId}`, { command: classCommand.command });
    return this.write(classCommand.command);
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): SerialTxConfig {
    return { ...this.config };
  }

  disconnect(): void {
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch {
        // Ignore release lock errors
      }
      this.writer = null;
    }
    this.writeQueue = [];
    this.isProcessing = false;
  }
}

export const createSerialWriter = (config: SerialTxConfig): SerialWriter => {
  return new SerialWriter(config);
};

export default SerialWriter;
