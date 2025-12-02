import type { RuleConfig, RuleContext, RuleResult, ParsedData } from "../types";
import { logger } from "./Logger";

class RulesEngine {
  private rules: RuleConfig[] = [];

  setRules(rules: RuleConfig[]): void {
    this.rules = rules.filter((r) => r.enabled);
    logger.info(`Rules engine updated with ${this.rules.length} active rules`);
  }

  addRule(rule: RuleConfig): void {
    this.rules.push(rule);
    if (rule.enabled) {
      logger.info("Rule added", { ruleId: rule.id });
    }
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
    logger.info("Rule removed", { ruleId });
  }

  updateRule(ruleId: string, updates: Partial<RuleConfig>): void {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      logger.info("Rule updated", { ruleId });
    }
  }

  evaluate(data: ParsedData): RuleResult {
    const context: RuleContext = {
      fields: data.fields,
      raw: data.raw,
      timestamp: data.timestamp,
    };

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const matches = this.evaluateCondition(rule.condition, context);

        if (matches) {
          logger.debug("Rule matched", {
            ruleId: rule.id,
            condition: rule.condition,
          });

          return {
            action: rule.action,
            value: rule.value,
            ruleId: rule.id,
          };
        }
      } catch (error) {
        logger.warn("Rule evaluation error", { ruleId: rule.id, error });
      }
    }

    return { action: "pass" };
  }

  private evaluateCondition(condition: string, context: RuleContext): boolean {
    // Parse different condition types

    // Simple comparison: "fieldX > 300"
    const comparisonMatch = condition.match(
      /^(\w+)\s*(>|<|>=|<=|==|!=)\s*(.+)$/
    );
    if (comparisonMatch) {
      const [, field, operator, valueStr] = comparisonMatch;
      const fieldValue = context.fields[field];
      const compareValue = this.parseCompareValue(valueStr.trim());
      return this.compare(fieldValue, operator, compareValue);
    }

    // Contains check: "line contains 'ERR'"
    const containsMatch = condition.match(/^line\s+contains\s+['"](.+)['"]$/i);
    if (containsMatch) {
      return context.raw.includes(containsMatch[1]);
    }

    // Regex match: "regex matches /^SYS:/"
    const regexMatch = condition.match(
      /^regex\s+matches\s+\/(.+)\/([gimsu]*)$/i
    );
    if (regexMatch) {
      const regex = new RegExp(regexMatch[1], regexMatch[2]);
      return regex.test(context.raw);
    }

    // Field exists: "field exists fieldName"
    const existsMatch = condition.match(/^field\s+exists\s+(\w+)$/i);
    if (existsMatch) {
      return existsMatch[1] in context.fields;
    }

    // Field equals string: "fieldX equals 'value'"
    const equalsMatch = condition.match(/^(\w+)\s+equals\s+['"](.+)['"]$/i);
    if (equalsMatch) {
      const fieldValue = context.fields[equalsMatch[1]];
      return String(fieldValue) === equalsMatch[2];
    }

    // Starts with: "line startsWith 'PREFIX'"
    const startsWithMatch = condition.match(
      /^line\s+startsWith\s+['"](.+)['"]$/i
    );
    if (startsWithMatch) {
      return context.raw.startsWith(startsWithMatch[1]);
    }

    // Ends with: "line endsWith 'SUFFIX'"
    const endsWithMatch = condition.match(/^line\s+endsWith\s+['"](.+)['"]$/i);
    if (endsWithMatch) {
      return context.raw.endsWith(endsWithMatch[1]);
    }

    // Boolean field check: "fieldX is true" or "fieldX is false"
    const boolMatch = condition.match(/^(\w+)\s+is\s+(true|false)$/i);
    if (boolMatch) {
      const fieldValue = context.fields[boolMatch[1]];
      const expectedBool = boolMatch[2].toLowerCase() === "true";
      return fieldValue === expectedBool;
    }

    logger.warn("Unknown condition format", { condition });
    return false;
  }

  private parseCompareValue(valueStr: string): string | number | boolean {
    // Number
    const num = parseFloat(valueStr);
    if (!isNaN(num)) return num;

    // Boolean
    if (valueStr.toLowerCase() === "true") return true;
    if (valueStr.toLowerCase() === "false") return false;

    // String (strip quotes if present)
    if (
      (valueStr.startsWith("'") && valueStr.endsWith("'")) ||
      (valueStr.startsWith('"') && valueStr.endsWith('"'))
    ) {
      return valueStr.slice(1, -1);
    }

    return valueStr;
  }

  private compare(
    fieldValue: string | number | boolean | undefined,
    operator: string,
    compareValue: string | number | boolean
  ): boolean {
    if (fieldValue === undefined) return false;

    const numField =
      typeof fieldValue === "number"
        ? fieldValue
        : parseFloat(String(fieldValue));
    const numCompare =
      typeof compareValue === "number"
        ? compareValue
        : parseFloat(String(compareValue));

    // Use numeric comparison if both values are numbers
    if (!isNaN(numField) && !isNaN(numCompare)) {
      switch (operator) {
        case ">":
          return numField > numCompare;
        case "<":
          return numField < numCompare;
        case ">=":
          return numField >= numCompare;
        case "<=":
          return numField <= numCompare;
        case "==":
          return numField === numCompare;
        case "!=":
          return numField !== numCompare;
        default:
          return false;
      }
    }

    // String comparison
    const strField = String(fieldValue);
    const strCompare = String(compareValue);

    switch (operator) {
      case "==":
        return strField === strCompare;
      case "!=":
        return strField !== strCompare;
      case ">":
        return strField > strCompare;
      case "<":
        return strField < strCompare;
      case ">=":
        return strField >= strCompare;
      case "<=":
        return strField <= strCompare;
      default:
        return false;
    }
  }

  getRules(): RuleConfig[] {
    return [...this.rules];
  }

  getActiveRules(): RuleConfig[] {
    return this.rules.filter((r) => r.enabled);
  }

  validateRule(condition: string): { valid: boolean; error?: string } {
    // Try to parse the condition
    const patterns = [
      /^(\w+)\s*(>|<|>=|<=|==|!=)\s*(.+)$/,
      /^line\s+contains\s+['"](.+)['"]$/i,
      /^regex\s+matches\s+\/(.+)\/([gimsu]*)$/i,
      /^field\s+exists\s+(\w+)$/i,
      /^(\w+)\s+equals\s+['"](.+)['"]$/i,
      /^line\s+startsWith\s+['"](.+)['"]$/i,
      /^line\s+endsWith\s+['"](.+)['"]$/i,
      /^(\w+)\s+is\s+(true|false)$/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(condition)) {
        return { valid: true };
      }
    }

    return {
      valid: false,
      error:
        'Invalid condition format. Examples: "value > 100", "line contains \'ERR\'"',
    };
  }
}

export const rulesEngine = new RulesEngine();
export default RulesEngine;
