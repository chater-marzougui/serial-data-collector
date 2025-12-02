import type { ParserConfig, ParsedData } from "../types";
import { logger } from "./Logger";

export type CustomParserFunction = (
  line: string
) => Record<string, string | number | boolean> | null;

class DataParser {
  private config: ParserConfig;
  private fields: string[];
  private customParser?: CustomParserFunction;

  constructor(config: ParserConfig, fields: string[]) {
    this.config = config;
    this.fields = fields;
  }

  updateConfig(config: ParserConfig, fields: string[]): void {
    this.config = config;
    this.fields = fields;
  }

  setCustomParser(parser: CustomParserFunction): void {
    this.customParser = parser;
  }

  parse(line: string): ParsedData | null {
    const trimmedLine = line.trim();

    // Check skip patterns
    if (this.shouldSkip(trimmedLine)) {
      logger.debug("Line skipped by skip pattern", { line: trimmedLine });
      return null;
    }

    try {
      let fields: Record<string, string | number | boolean> | null = null;

      switch (this.config.type) {
        case "split":
          fields = this.parseSplit(trimmedLine);
          break;
        case "regex":
          fields = this.parseRegex(trimmedLine);
          break;
        case "json":
          fields = this.parseJson(trimmedLine);
          break;
        case "custom":
          fields = this.parseCustom(trimmedLine);
          break;
        default:
          fields = this.parseSplit(trimmedLine);
      }

      if (!fields) {
        return null;
      }

      return {
        timestamp: Date.now(),
        raw: trimmedLine,
        fields,
      };
    } catch (error) {
      logger.warn("Failed to parse line", { line: trimmedLine, error });
      return null;
    }
  }

  private shouldSkip(line: string): boolean {
    if (!this.config.skipLines || this.config.skipLines.length === 0) {
      return false;
    }

    return this.config.skipLines.some((pattern) => {
      if (pattern.startsWith("/") && pattern.endsWith("/")) {
        // Regex pattern
        const regex = new RegExp(pattern.slice(1, -1));
        return regex.test(line);
      }
      // String prefix
      return line.startsWith(pattern);
    });
  }

  private parseSplit(
    line: string
  ): Record<string, string | number | boolean> | null {
    const delimiter = this.config.splitDelimiter || ",";
    const parts = line.split(delimiter).map((p) => p.trim());

    if (parts.length < this.fields.length) {
      logger.debug("Not enough fields in line", {
        expected: this.fields.length,
        got: parts.length,
        line,
      });
      return null;
    }

    const result: Record<string, string | number | boolean> = {};
    this.fields.forEach((field, index) => {
      const value = parts[index];
      result[field] = this.parseValue(value);
    });

    return result;
  }

  private parseRegex(
    line: string
  ): Record<string, string | number | boolean> | null {
    if (!this.config.regex) {
      logger.warn("No regex pattern configured");
      return null;
    }

    try {
      const regex = new RegExp(this.config.regex);
      const match = line.match(regex);

      if (!match) {
        return null;
      }

      const groups = this.config.regexGroups || this.fields;
      const result: Record<string, string | number | boolean> = {};

      groups.forEach((field, index) => {
        const value = match[index + 1] || "";
        result[field] = this.parseValue(value);
      });

      return result;
    } catch (error) {
      logger.error("Invalid regex pattern", {
        regex: this.config.regex,
        error,
      });
      return null;
    }
  }

  private parseJson(
    line: string
  ): Record<string, string | number | boolean> | null {
    try {
      const parsed = JSON.parse(line);
      const result: Record<string, string | number | boolean> = {};

      this.fields.forEach((field) => {
        if (field in parsed) {
          const value = parsed[field];
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            result[field] = value;
          } else {
            result[field] = JSON.stringify(value);
          }
        }
      });

      return result;
    } catch {
      logger.debug("Failed to parse as JSON", { line });
      return null;
    }
  }

  private parseCustom(
    line: string
  ): Record<string, string | number | boolean> | null {
    if (!this.customParser) {
      // Try to evaluate the custom parser string if provided
      if (this.config.customParser) {
        try {
          // Create a sandboxed parser function
          // Note: This is for demonstration; in production you'd want more security
          const parserFn = new Function(
            "line",
            this.config.customParser
          ) as CustomParserFunction;
          return parserFn(line);
        } catch (error) {
          logger.error("Failed to execute custom parser", { error });
          return null;
        }
      }
      logger.warn("No custom parser configured");
      return null;
    }

    return this.customParser(line);
  }

  private parseValue(value: string): string | number | boolean {
    // Try to parse as number
    const num = parseFloat(value);
    if (!isNaN(num) && isFinite(num)) {
      return Number.isInteger(num) ? parseInt(value, 10) : num;
    }

    // Try to parse as boolean
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // Return as string
    return value;
  }

  validateLine(line: string): { valid: boolean; error?: string } {
    const result = this.parse(line);
    if (!result) {
      return { valid: false, error: "Failed to parse line" };
    }

    const missingFields = this.fields.filter((f) => !(f in result.fields));
    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Missing fields: ${missingFields.join(", ")}`,
      };
    }

    return { valid: true };
  }
}

export const createParser = (
  config: ParserConfig,
  fields: string[]
): DataParser => {
  return new DataParser(config, fields);
};

export default DataParser;
