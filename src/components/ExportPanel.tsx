import { useState, useMemo } from "react";
import { Download, Trash2, Eye, FileText, Github } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";

// Reserved field names that are always available
const RESERVED_FIELDS = ["recordedAt", "label", "raw"] as const;

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

  function generateTemplate() {
    const fieldPlaceholders = config.fields.map((f) => `\${${f}}`).join(",");
    return `\${recordedAt},${fieldPlaceholders},\${label}`;
  }

  function resetTemplate() {
    const autoTemplate = generateTemplate();
    updateConfig({
      export: { ...config.export, template: autoTemplate },
    });
  }

  // Combine reserved fields with user-defined fields, avoiding duplicates
  const availableFields = useMemo(() => {
    const userFields = config.fields.filter(
      (f) => !RESERVED_FIELDS.includes(f as (typeof RESERVED_FIELDS)[number])
    );
    const allFields = [...RESERVED_FIELDS, ...userFields];

    // Extract fields already used in template
    const usedFields = new Set(
      (config.export.template.match(/\$\{([^}]+)\}/g) || []).map((p) =>
        p.slice(2, -1)
      )
    );

    // Return only unused fields
    return allFields.filter((field) => !usedFields.has(field));
  }, [config.fields, config.export.template]);

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
          onChange={(e) => {
            updateConfig({
              export: { ...config.export, template: e.target.value },
            });
          }}
          className="w-full bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="${timestamp},${value1},${label}"
        />

        {config.export.template !== generateTemplate() && (
  <button
    onClick={() => resetTemplate()}
    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
  >
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    {t("export.resetToAuto")}
  </button>
)}

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

        {/* Duplicate placeholders warning */}
        {(() => {
          const placeholders =
            config.export.template.match(/\$\{([^}]+)\}/g) || [];
          const placeholderNames = placeholders.map((p) => p.slice(2, -1));
          const counts = new Map();
          placeholderNames.forEach((name) => {
            counts.set(name, (counts.get(name) || 0) + 1);
          });
          const duplicates = Array.from(counts.entries())
            .filter(([_, count]) => count > 1)
            .map(([name, _]) => name);

          if (duplicates.length > 0) {
            return (
              <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    {t("export.validation.duplicateFields")}
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {duplicates.map((field, i) => (
                      <span key={field}>
                        <strong>${"{" + field + "}"}</strong>{" "}
                        {t("export.validation.isDuplicated")}
                        {i < duplicates.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Available fields */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("export.available")}:
          </span>
          {availableFields.map((field) => (
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
          ))}
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
        <span>
          {t("export.samplesReady", { count: recordedSamples.length })}
        </span>
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
  const knownFields = ["recordedAt", "label", "raw", ...fields];

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
