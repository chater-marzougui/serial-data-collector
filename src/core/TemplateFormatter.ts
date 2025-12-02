import type { RecordedSample, ExportConfig } from '../types';
import { logger } from './Logger';

class TemplateFormatter {
  private template: string;
  private fields: string[];

  constructor(template: string, fields: string[]) {
    this.template = template;
    this.fields = fields;
  }

  updateTemplate(template: string): void {
    this.template = template;
  }

  updateFields(fields: string[]): void {
    this.fields = fields;
  }

  formatSample(sample: RecordedSample): string {
    let result = this.template;

    // Replace timestamp placeholder
    result = result.replace(/\$\{timestamp\}/g, sample.timestamp.toString());
    result = result.replace(/\$\{recordedAt\}/g, sample.recordedAt.toString());
    result = result.replace(/\$\{label\}/g, sample.label || '');
    result = result.replace(/\$\{raw\}/g, this.escapeCSV(sample.raw));

    // Replace field placeholders
    for (const field of this.fields) {
      const regex = new RegExp(`\\$\\{${this.escapeRegex(field)}\\}`, 'g');
      const value = sample.fields[field];
      const stringValue = value !== undefined ? String(value) : '';
      result = result.replace(regex, this.escapeCSV(stringValue));
    }

    return result;
  }

  formatHeader(): string {
    // Extract field names from template
    const placeholders = this.template.match(/\$\{([^}]+)\}/g) || [];
    return placeholders
      .map(p => p.slice(2, -1))
      .join(',');
  }

  generateCSV(samples: RecordedSample[], config: ExportConfig): string {
    const lines: string[] = [];

    if (config.includeHeader) {
      lines.push(this.formatHeader());
    }

    for (const sample of samples) {
      lines.push(this.formatSample(sample));
    }

    return lines.join('\n');
  }

  validateTemplate(): { valid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Extract placeholders from template
    const placeholders = this.template.match(/\$\{([^}]+)\}/g) || [];
    const placeholderNames = placeholders.map(p => p.slice(2, -1));

    // Check for unknown placeholders
    const knownFields = ['timestamp', 'recordedAt', 'label', 'raw', ...this.fields];
    for (const name of placeholderNames) {
      if (!knownFields.includes(name)) {
        warnings.push(`Unknown field in template: ${name}`);
      }
    }

    // Check if template is empty
    if (!this.template.trim()) {
      errors.push('Template is empty');
    }

    // Check for unclosed placeholders
    const unclosed = this.template.match(/\$\{[^}]*$/);
    if (unclosed) {
      errors.push('Unclosed placeholder in template');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  previewExport(samples: RecordedSample[], maxLines: number = 5): string[] {
    const preview: string[] = [];
    preview.push(this.formatHeader());

    const linesToShow = Math.min(samples.length, maxLines);
    for (let i = 0; i < linesToShow; i++) {
      preview.push(this.formatSample(samples[i]));
    }

    if (samples.length > maxLines) {
      preview.push(`... and ${samples.length - maxLines} more rows`);
    }

    return preview;
  }

  generateFilename(template: string): string {
    let result = template;
    result = result.replace(/\$\{timestamp\}/g, Date.now().toString());
    result = result.replace(/\$\{date\}/g, new Date().toISOString().split('T')[0]);
    result = result.replace(/\$\{datetime\}/g, new Date().toISOString().replace(/[:.]/g, '-'));
    return result;
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const createFormatter = (template: string, fields: string[]): TemplateFormatter => {
  return new TemplateFormatter(template, fields);
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  logger.info(`Exported CSV: ${filename}`);
};

export default TemplateFormatter;
