import { useState, useMemo } from "react";
import { Download, Trash2, Eye, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";

// Reserved field names that are always available
const RESERVED_FIELDS = ["timestamp", "recordedAt", "label", "raw"] as const;

export function ExportPanel() {
  const { t } = useTranslation();
  const {
    config,
    updateConfig,
    recordedSamples,
    exportData,
    previewExport,
    clearRecordedSamples,
  } = useApp();
  const [showPreview, setShowPreview] = useState(false);

  const preview = previewExport();
  const validation = validateTemplate(config.export.template, config.fields, t);

  // Combine reserved fields with user-defined fields, avoiding duplicates
  const availableFields = useMemo(() => {
    const userFields = config.fields.filter(f => !RESERVED_FIELDS.includes(f as typeof RESERVED_FIELDS[number]));
    return [...RESERVED_FIELDS, ...userFields];
  }, [config.fields]);

  return (
    <div className="space-y-4">
      {/* Template Editor */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {t("export.template")}
          <span className="text-gray-400 dark:text-gray-500 ml-2 font-normal">
            {t("export.templateHint")}
          </span>
        </label>
        <input
          type="text"
          value={config.export.template}
          onChange={(e) =>
            updateConfig({
              export: { ...config.export, template: e.target.value },
            })
          }
          className="w-full bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="${timestamp},${value1},${label}"
        />

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <div className="mt-2 text-yellow-600 dark:text-yellow-400 text-xs space-y-1">
            {validation.warnings.map((w, i) => (
              <p key={i}>⚠️ {w}</p>
            ))}
          </div>
        )}
        {validation.errors.length > 0 && (
          <div className="mt-2 text-red-600 dark:text-red-400 text-xs space-y-1">
            {validation.errors.map((e, i) => (
              <p key={i}>❌ {e}</p>
            ))}
          </div>
        )}

        {/* Available fields */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{t("export.available")}:</span>
          {availableFields.map(
            (field) => (
              <button
                key={field}
                onClick={() =>
                  updateConfig({
                    export: {
                      ...config.export,
                      template: config.export.template + `\${${field}}`,
                    },
                  })
                }
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                ${"{"}
                {field}
                {"}"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Filename Template */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {t("export.filename")}
        </label>
        <input
          type="text"
          value={config.export.filename}
          onChange={(e) =>
            updateConfig({
              export: { ...config.export, filename: e.target.value },
            })
          }
          className="w-full bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="data_export_${timestamp}"
        />
      </div>

      {/* Include Header */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="includeHeader"
          checked={config.export.includeHeader}
          onChange={(e) =>
            updateConfig({
              export: { ...config.export, includeHeader: e.target.checked },
            })
          }
          className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
        />
        <label
          htmlFor="includeHeader"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("export.includeHeader")}
        </label>
      </div>

      {/* Preview */}
      <div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          disabled={recordedSamples.length === 0}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? t("export.hidePreview") : t("export.showPreview")}
        </button>

        {showPreview && recordedSamples.length > 0 && (
          <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700 font-mono text-xs overflow-x-auto">
            {preview.map((line, i) => (
              <div
                key={i}
                className={
                  i === 0 && config.export.includeHeader
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-400"
                }
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample count */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <FileText className="w-4 h-4" />
        <span>{t("export.samplesReady", { count: recordedSamples.length })}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={exportData}
          disabled={recordedSamples.length === 0}
          className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          {t("export.exportCsv")}
        </button>
        <button
          onClick={() => {
            if (confirm(t("export.clearData"))) {
              clearRecordedSamples();
            }
          }}
          disabled={recordedSamples.length === 0}
          className="p-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("liveStream.clear")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function validateTemplate(
  template: string,
  fields: string[],
  t: (key: string, options?: Record<string, string>) => string
): { warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Extract placeholders
  const placeholders = template.match(/\$\{([^}]+)\}/g) || [];
  const placeholderNames = placeholders.map((p) => p.slice(2, -1));

  // Known fields
  const knownFields = ["timestamp", "recordedAt", "label", "raw", ...fields];

  // Check for unknown fields
  for (const name of placeholderNames) {
    if (!knownFields.includes(name)) {
      warnings.push(t("export.validation.unknownField", { name }));
    }
  }

  // Check for empty template
  if (!template.trim()) {
    errors.push(t("export.validation.emptyTemplate"));
  }

  // Check for unclosed placeholders
  if (template.match(/\$\{[^}]*$/)) {
    errors.push(t("export.validation.unclosedPlaceholder"));
  }

  return { warnings, errors };
}

export default ExportPanel;
