import { useState } from 'react';
import { Download, Trash2, Eye, FileText } from 'lucide-react';
import { useApp } from '../context';

export function ExportPanel() {
  const { config, updateConfig, recordedSamples, exportData, previewExport, clearRecordedSamples } = useApp();
  const [showPreview, setShowPreview] = useState(false);

  const preview = previewExport();
  const validation = validateTemplate(config.export.template, config.fields);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-bold mb-4">Export Data</h2>

      {/* Template Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Export Template
          <span className="text-gray-400 ml-2 font-normal">
            Use ${'{'}field{'}'} syntax
          </span>
        </label>
        <input
          type="text"
          value={config.export.template}
          onChange={(e) => updateConfig({ export: { ...config.export, template: e.target.value } })}
          className="w-full bg-black/30 rounded-lg p-2 border border-white/20 font-mono text-sm"
          placeholder="${timestamp},${value1},${label}"
        />
        
        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <div className="mt-2 text-yellow-400 text-xs space-y-1">
            {validation.warnings.map((w, i) => (
              <p key={i}>⚠️ {w}</p>
            ))}
          </div>
        )}
        {validation.errors.length > 0 && (
          <div className="mt-2 text-red-400 text-xs space-y-1">
            {validation.errors.map((e, i) => (
              <p key={i}>❌ {e}</p>
            ))}
          </div>
        )}

        {/* Available fields */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-400">Available:</span>
          {['timestamp', 'recordedAt', 'label', 'raw', ...config.fields].map((field) => (
            <button
              key={field}
              onClick={() => updateConfig({ 
                export: { ...config.export, template: config.export.template + `\${${field}}` } 
              })}
              className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/30"
            >
              ${'{'}
              {field}
              {'}'}
            </button>
          ))}
        </div>
      </div>

      {/* Filename Template */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Filename Template</label>
        <input
          type="text"
          value={config.export.filename}
          onChange={(e) => updateConfig({ export: { ...config.export, filename: e.target.value } })}
          className="w-full bg-black/30 rounded-lg p-2 border border-white/20"
          placeholder="data_export_${timestamp}"
        />
      </div>

      {/* Include Header */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          id="includeHeader"
          checked={config.export.includeHeader}
          onChange={(e) => updateConfig({ export: { ...config.export, includeHeader: e.target.checked } })}
          className="w-4 h-4"
        />
        <label htmlFor="includeHeader" className="text-sm font-medium">
          Include header row
        </label>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          disabled={recordedSamples.length === 0}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        
        {showPreview && recordedSamples.length > 0 && (
          <div className="mt-2 bg-black/30 rounded-lg p-3 font-mono text-xs overflow-x-auto">
            {preview.map((line, i) => (
              <div key={i} className={i === 0 && config.export.includeHeader ? 'text-blue-400' : 'text-gray-300'}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <FileText className="w-4 h-4" />
        <span>{recordedSamples.length} samples ready for export</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={exportData}
          disabled={recordedSamples.length === 0}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export as CSV
        </button>

        <button
          onClick={() => {
            if (confirm('Clear all collected data?')) {
              clearRecordedSamples();
            }
          }}
          disabled={recordedSamples.length === 0}
          className="w-full bg-red-500/50 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Clear All Data
        </button>
      </div>
    </div>
  );
}

function validateTemplate(template: string, fields: string[]): { warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Extract placeholders
  const placeholders = template.match(/\$\{([^}]+)\}/g) || [];
  const placeholderNames = placeholders.map(p => p.slice(2, -1));

  // Known fields
  const knownFields = ['timestamp', 'recordedAt', 'label', 'raw', ...fields];

  // Check for unknown fields
  for (const name of placeholderNames) {
    if (!knownFields.includes(name)) {
      warnings.push(`Unknown field: ${name}`);
    }
  }

  // Check for empty template
  if (!template.trim()) {
    errors.push('Template is empty');
  }

  // Check for unclosed placeholders
  if (template.match(/\$\{[^}]*$/)) {
    errors.push('Unclosed placeholder');
  }

  return { warnings, errors };
}

export default ExportPanel;
