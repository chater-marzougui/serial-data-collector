import type { AppConfig, ClassConfig } from "../types";
import { logger } from "./Logger";

const DEFAULT_CONFIG: AppConfig = {
  serial: {
    baudRate: 115200,
    delimiter: "\n",
    encoding: "utf-8",
  },
  parser: {
    type: "split",
    splitDelimiter: ",",
    skipLines: [],
  },
  fields: ["timestamp", "value1", "value2", "value3"],
  classes: [
    { id: "class1", name: "Class 1", color: "bg-blue-500" },
    { id: "class2", name: "Class 2", color: "bg-green-500" },
    { id: "class3", name: "Class 3", color: "bg-purple-500" },
  ],
  rules: [],
  export: {
    template: "${timestamp},${value1},${value2},${value3},${label}",
    filename: "data_export_${timestamp}",
    includeHeader: true,
  },
  recording: {
    autoStopSeconds: 10,
    enableLabeling: true,
  },
  logging: {
    level: "info",
    persistToFile: false,
    maxEntries: 1000,
  },
};

const STORAGE_KEY = "serial-data-collector-config";

class ConfigLoader {
  private config: AppConfig = { ...DEFAULT_CONFIG };

  async loadFromFile(url: string): Promise<AppConfig> {
    try {
      logger.info(`Loading configuration from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }
      const json = await response.json();
      this.config = this.mergeConfig(DEFAULT_CONFIG, json);
      logger.info("Configuration loaded successfully", this.config);
      return this.config;
    } catch (error) {
      logger.warn("Failed to load config file, using defaults", error);
      return this.config;
    }
  }

  loadFromStorage(): AppConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = this.mergeConfig(DEFAULT_CONFIG, parsed);
        logger.info("Configuration loaded from storage", this.config);
      }
    } catch (error) {
      logger.warn("Failed to load config from storage", error);
    }
    return this.config;
  }

  saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      logger.info("Configuration saved to storage");
    } catch (error) {
      logger.error("Failed to save config to storage", error);
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<AppConfig>): AppConfig {
    this.config = this.mergeConfig(this.config, partial);
    this.saveToStorage();
    logger.info("Configuration updated", partial);
    return this.config;
  }

  updateSerial(serial: Partial<AppConfig["serial"]>): void {
    this.config.serial = { ...this.config.serial, ...serial };
    this.saveToStorage();
  }

  updateParser(parser: Partial<AppConfig["parser"]>): void {
    this.config.parser = { ...this.config.parser, ...parser };
    this.saveToStorage();
  }

  updateFields(fields: string[]): void {
    this.config.fields = fields;
    this.saveToStorage();
  }

  updateClasses(classes: ClassConfig[]): void {
    this.config.classes = classes;
    this.saveToStorage();
  }

  updateExport(exportConfig: Partial<AppConfig["export"]>): void {
    this.config.export = { ...this.config.export, ...exportConfig };
    this.saveToStorage();
  }

  updateLogging(logging: Partial<AppConfig["logging"]>): void {
    this.config.logging = { ...this.config.logging, ...logging };
    if (logging.level) {
      logger.setLevel(logging.level);
    }
    if (logging.maxEntries !== undefined) {
      logger.setMaxEntries(logging.maxEntries);
    }
    if (logging.persistToFile !== undefined) {
      logger.setPersistToFile(logging.persistToFile);
    }
    this.saveToStorage();
  }

  resetToDefaults(): AppConfig {
    this.config = { ...DEFAULT_CONFIG };
    localStorage.removeItem(STORAGE_KEY);
    logger.info("Configuration reset to defaults");
    return this.config;
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(json: string): AppConfig {
    try {
      const parsed = JSON.parse(json);
      this.config = this.mergeConfig(DEFAULT_CONFIG, parsed);
      this.saveToStorage();
      logger.info("Configuration imported successfully");
      return this.config;
    } catch (error) {
      logger.error("Failed to import configuration", error);
      throw new Error("Invalid configuration JSON");
    }
  }

  private mergeConfig<T extends object>(base: T, override: Partial<T>): T {
    const result = { ...base };
    for (const key in override) {
      if (Object.prototype.hasOwnProperty.call(override, key)) {
        const value = override[key];
        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          typeof result[key] === "object" &&
          !Array.isArray(result[key])
        ) {
          result[key] = this.mergeConfig(
            result[key] as object,
            value as object
          ) as T[Extract<keyof T, string>];
        } else if (value !== undefined) {
          result[key] = value as T[Extract<keyof T, string>];
        }
      }
    }
    return result;
  }
}

export const configLoader = new ConfigLoader();
export const getDefaultConfig = (): AppConfig => ({ ...DEFAULT_CONFIG });
export default ConfigLoader;
