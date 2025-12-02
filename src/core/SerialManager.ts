import type { SerialConfig, ConnectionStatus } from "../types";
import { logger } from "./Logger";

type DataCallback = (line: string) => void;
type StatusCallback = (status: ConnectionStatus, error?: string) => void;

declare global {
  interface Navigator {
    serial?: {
      requestPort: () => Promise<SerialPort>;
      getPorts: () => Promise<SerialPort[]>;
    };
  }
}

interface SerialPort {
  open: (options: SerialOptions) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo: () => SerialPortInfo;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: ParityType;
  bufferSize?: number;
  flowControl?: FlowControlType;
}

type ParityType = "none" | "even" | "odd";
type FlowControlType = "none" | "hardware";

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

class SerialManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private config: SerialConfig;
  private status: ConnectionStatus = "disconnected";
  private buffer: string = "";
  private dataCallbacks: DataCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectDelay: number = 1000;
  private isReading: boolean = false;

  constructor(config: SerialConfig) {
    this.config = config;
  }

  static isSupported(): boolean {
    return "serial" in navigator;
  }

  updateConfig(config: Partial<SerialConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("Serial config updated", this.config);
  }

  onData(callback: DataCallback): () => void {
    this.dataCallbacks.push(callback);
    return () => {
      this.dataCallbacks = this.dataCallbacks.filter((cb) => cb !== callback);
    };
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private setStatus(status: ConnectionStatus, error?: string): void {
    this.status = status;
    logger.info("Serial status changed", { status, error });
    this.statusCallbacks.forEach((cb) => cb(status, error));
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async connect(): Promise<boolean> {
    if (!SerialManager.isSupported()) {
      logger.error("Web Serial API is not supported in this browser");
      this.setStatus("error", "Web Serial API not supported");
      return false;
    }

    try {
      this.setStatus("connecting");
      logger.info("Requesting serial port...");

      const selectedPort = await navigator.serial!.requestPort();

      await selectedPort.open({
        baudRate: this.config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        bufferSize: 255,
        flowControl: "none",
      });

      this.port = selectedPort;
      this.setStatus("connected");
      this.reconnectAttempts = 0;

      const portInfo = selectedPort.getInfo();
      logger.info("Connected to serial port", {
        baudRate: this.config.baudRate,
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId,
      });

      this.startReading();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to connect to serial port", { error: message });
      this.setStatus("error", message);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    logger.info("Disconnecting from serial port...");
    this.isReading = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        logger.warn("Error canceling reader", error);
      }
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (error) {
        logger.warn("Error closing port", error);
      }
      this.port = null;
    }

    this.buffer = "";
    this.setStatus("disconnected");
  }

  private async startReading(): Promise<void> {
    if (!this.port?.readable) {
      logger.error("Port is not readable");
      return;
    }

    this.isReading = true;
    const decoder = new TextDecoder(this.config.encoding || "utf-8");

    try {
      this.reader = this.port.readable.getReader();

      while (this.isReading) {
        const { value, done } = await this.reader.read();

        if (done) {
          logger.info("Serial port stream ended");
          break;
        }

        if (value) {
          this.processData(decoder.decode(value, { stream: true }));
        }
      }
    } catch (error) {
      if (this.isReading) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error reading from serial port", { error: message });
        this.handleReadError();
      }
    } finally {
      if (this.reader) {
        try {
          this.reader.releaseLock();
        } catch {
          // Ignore release lock errors
        }
        this.reader = null;
      }
    }
  }

  private processData(chunk: string): void {
    this.buffer += chunk;
    const delimiter = this.config.delimiter || "\n";
    const lines = this.buffer.split(delimiter);

    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        this.dataCallbacks.forEach((cb) => cb(trimmedLine));
      }
    }
  }

  private async handleReadError(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      await this.disconnect();

      setTimeout(async () => {
        if (this.port) {
          try {
            await this.port.open({ baudRate: this.config.baudRate });
            this.setStatus("connected");
            this.startReading();
          } catch (error) {
            logger.error("Reconnection failed", error);
            this.handleReadError();
          }
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      logger.error("Max reconnection attempts reached");
      this.setStatus("error", "Connection lost");
      await this.disconnect();
    }
  }

  async write(data: string): Promise<boolean> {
    if (!this.port?.writable) {
      logger.error("Port is not writable");
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      await writer.write(encoder.encode(data));
      writer.releaseLock();
      logger.debug("Data written to serial port", { data });
      return true;
    } catch (error) {
      logger.error("Error writing to serial port", error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.status === "connected" && this.port !== null;
  }

  getPortInfo(): SerialPortInfo | null {
    return this.port?.getInfo() || null;
  }
}

export const createSerialManager = (config: SerialConfig): SerialManager => {
  return new SerialManager(config);
};

export default SerialManager;
