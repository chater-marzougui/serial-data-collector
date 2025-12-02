import { useState } from "react";
import { Download, Trash2, Eye, FileText } from "lucide-react";
import { useApp } from "../context";

export function ExportPanel() {
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
  const validation = validateTemplate(config.export.template, config.fields);

  return (
    <div className="space-y-4">
      {/* Template Editor */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Export Template
          <span className="text-gray-400 ml-2 font-normal">
            Use ${"{"}field{"}"} syntax
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
          className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="${timestamp},${value1},${label}"
        />

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <div className="mt-2 text-yellow-600 text-xs space-y-1">
            {validation.warnings.map((w, i) => (
              <p key={i}>⚠️ {w}</p>
            ))}
          </div>
        )}
        {validation.errors.length > 0 && (
          <div className="mt-2 text-red-600 text-xs space-y-1">
            {validation.errors.map((e, i) => (
              <p key={i}>❌ {e}</p>
            ))}
          </div>
        )}

        {/* Available fields */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Available:</span>
          {["timestamp", "recordedAt", "label", "raw", ...config.fields].map(
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
                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-100"
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
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Filename Template
        </label>
        <input
          type="text"
          value={config.export.filename}
          onChange={(e) =>
            updateConfig({
              export: { ...config.export, filename: e.target.value },
            })
          }
          className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label
          htmlFor="includeHeader"
          className="text-sm font-medium text-gray-700"
        >
          Include header row
        </label>
      </div>

      {/* Preview */}
      <div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          disabled={recordedSamples.length === 0}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>

        {showPreview && recordedSamples.length > 0 && (
          <div className="mt-2 bg-gray-50 rounded-md p-3 border border-gray-200 font-mono text-xs overflow-x-auto">
            {preview.map((line, i) => (
              <div
                key={i}
                className={
                  i === 0 && config.export.includeHeader
                    ? "text-blue-600 font-bold"
                    : "text-gray-600"
                }
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample count */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FileText className="w-4 h-4" />
        <span>{recordedSamples.length} samples ready for export</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={exportData}
          disabled={recordedSamples.length === 0}
          className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
          onClick={() => {
            if (confirm("Clear all recorded data?")) {
              clearRecordedSamples();
            }
          }}
          disabled={recordedSamples.length === 0}
          className="p-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear Data"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function validateTemplate(
  template: string,
  fields: string[]
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
      warnings.push(`Unknown field: ${name}`);
    }
  }

  // Check for empty template
  if (!template.trim()) {
    errors.push("Template is empty");
  }

  // Check for unclosed placeholders
  if (template.match(/\$\{[^}]*$/)) {
    errors.push("Unclosed placeholder");
  }

  return { warnings, errors };
}

export default ExportPanel;
