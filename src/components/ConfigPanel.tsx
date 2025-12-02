import { useState } from "react";
import {
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Upload,
  Download,
  X,
} from "lucide-react";
import { useApp } from "../context";
import type { ClassConfig, RuleConfig } from "../types";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const { config, updateConfig, resetConfig, importConfig, exportConfig } =
    useApp();
  const [activeTab, setActiveTab] = useState<
    "serial" | "parser" | "classes" | "rules" | "recording" | "logging"
  >("serial");

  if (!isOpen) return null;

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          importConfig(text);
        } catch {
          alert("Invalid configuration file");
        }
      }
    };
    input.click();
  };

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "serial-data-collector-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-6">
            {(
              [
                "serial",
                "parser",
                "classes",
                "rules",
                "recording",
                "logging",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Serial Tab */}
          {activeTab === "serial" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Baud Rate
                </label>
                <select
                  value={config.serial.baudRate}
                  onChange={(e) =>
                    updateConfig({
                      serial: {
                        ...config.serial,
                        baudRate: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[
                    9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600,
                  ].map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <input
                  type="text"
                  value={
                    config.serial.delimiter === "\n"
                      ? "\\n"
                      : config.serial.delimiter
                  }
                  onChange={(e) =>
                    updateConfig({
                      serial: {
                        ...config.serial,
                        delimiter:
                          e.target.value === "\\n" ? "\n" : e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="\\n"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encoding
                </label>
                <select
                  value={config.serial.encoding}
                  onChange={(e) =>
                    updateConfig({
                      serial: { ...config.serial, encoding: e.target.value },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="ascii">ASCII</option>
                  <option value="iso-8859-1">ISO-8859-1</option>
                </select>
              </div>
            </div>
          )}

          {/* Parser Tab */}
          {activeTab === "parser" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parser Type
                </label>
                <select
                  value={config.parser.type}
                  onChange={(e) =>
                    updateConfig({
                      parser: {
                        ...config.parser,
                        type: e.target.value as
                          | "split"
                          | "regex"
                          | "json"
                          | "custom",
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="split">Split by delimiter</option>
                  <option value="regex">Regular expression</option>
                  <option value="json">JSON</option>
                  <option value="custom">Custom parser</option>
                </select>
              </div>

              {config.parser.type === "split" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split Delimiter
                  </label>
                  <input
                    type="text"
                    value={config.parser.splitDelimiter || ","}
                    onChange={(e) =>
                      updateConfig({
                        parser: {
                          ...config.parser,
                          splitDelimiter: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=","
                  />
                </div>
              )}

              {config.parser.type === "regex" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regex Pattern
                  </label>
                  <input
                    type="text"
                    value={config.parser.regex || ""}
                    onChange={(e) =>
                      updateConfig({
                        parser: { ...config.parser, regex: e.target.value },
                      })
                    }
                    className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ^(\d+),(\d+),(\d+)$"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fields (comma-separated)
                </label>
                <input
                  type="text"
                  value={config.fields.join(", ")}
                  onChange={(e) =>
                    updateConfig({
                      fields: e.target.value
                        .split(",")
                        .map((f) => f.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="timestamp, value1, value2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skip Lines (patterns, one per line)
                </label>
                <textarea
                  value={(config.parser.skipLines || []).join("\\n")}
                  onChange={(e) =>
                    updateConfig({
                      parser: {
                        ...config.parser,
                        skipLines: e.target.value.split("\\n").filter(Boolean),
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 font-mono text-sm h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="# Comments\n/^DEBUG:/"
                />
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="space-y-4">
              {config.classes.map((cls, index) => (
                <div key={cls.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={cls.id}
                    onChange={(e) => {
                      const newClasses = [...config.classes];
                      newClasses[index] = { ...cls, id: e.target.value };
                      updateConfig({ classes: newClasses });
                    }}
                    className="flex-1 bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ID"
                  />
                  <input
                    type="text"
                    value={cls.name}
                    onChange={(e) => {
                      const newClasses = [...config.classes];
                      newClasses[index] = { ...cls, name: e.target.value };
                      updateConfig({ classes: newClasses });
                    }}
                    className="flex-1 bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Name"
                  />
                  <select
                    value={cls.color}
                    onChange={(e) => {
                      const newClasses = [...config.classes];
                      newClasses[index] = { ...cls, color: e.target.value };
                      updateConfig({ classes: newClasses });
                    }}
                    className="bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-orange-500">Orange</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-cyan-500">Cyan</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-red-500">Red</option>
                  </select>
                  <button
                    onClick={() => {
                      const newClasses = config.classes.filter(
                        (_, i) => i !== index
                      );
                      updateConfig({ classes: newClasses });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newClass: ClassConfig = {
                    id: `class${config.classes.length + 1}`,
                    name: `Class ${config.classes.length + 1}`,
                    color: "bg-blue-500",
                  };
                  updateConfig({ classes: [...config.classes, newClass] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Class
              </button>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Define rules to automatically label, ignore, or log data based
                on conditions.
              </p>
              {config.rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200"
                >
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => {
                        const newRules = [...config.rules];
                        newRules[index] = {
                          ...rule,
                          enabled: e.target.checked,
                        };
                        updateConfig({ rules: newRules });
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={rule.condition}
                      onChange={(e) => {
                        const newRules = [...config.rules];
                        newRules[index] = {
                          ...rule,
                          condition: e.target.value,
                        };
                        updateConfig({ rules: newRules });
                      }}
                      className="flex-1 bg-white rounded-md p-2 border border-gray-300 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., value > 100"
                    />
                    <button
                      onClick={() => {
                        const newRules = config.rules.filter(
                          (_, i) => i !== index
                        );
                        updateConfig({ rules: newRules });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 items-center pl-6">
                    <select
                      value={rule.action}
                      onChange={(e) => {
                        const newRules = [...config.rules];
                        newRules[index] = {
                          ...rule,
                          action: e.target.value as "label" | "ignore" | "log",
                        };
                        updateConfig({ rules: newRules });
                      }}
                      className="bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="label">Set label</option>
                      <option value="ignore">Ignore</option>
                      <option value="log">Log only</option>
                    </select>
                    {rule.action === "label" && (
                      <input
                        type="text"
                        value={rule.value || ""}
                        onChange={(e) => {
                          const newRules = [...config.rules];
                          newRules[index] = { ...rule, value: e.target.value };
                          updateConfig({ rules: newRules });
                        }}
                        className="flex-1 bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Label value"
                      />
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newRule: RuleConfig = {
                    id: `rule${Date.now()}`,
                    condition: "",
                    action: "label",
                    value: "",
                    enabled: true,
                  };
                  updateConfig({ rules: [...config.rules, newRule] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Example conditions:</p>
                <p className="font-mono">• value &gt; 100</p>
                <p className="font-mono">• line contains 'ERR'</p>
                <p className="font-mono">• regex matches /^SYS:/</p>
              </div>
            </div>
          )}

          {/* Recording Tab */}
          {activeTab === "recording" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableLabeling"
                  checked={config.recording.enableLabeling}
                  onChange={(e) =>
                    updateConfig({
                      recording: {
                        ...config.recording,
                        enableLabeling: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="enableLabeling"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable class labeling
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-stop after (seconds, 0 = disabled)
                </label>
                <input
                  type="number"
                  value={config.recording.autoStopSeconds}
                  onChange={(e) =>
                    updateConfig({
                      recording: {
                        ...config.recording,
                        autoStopSeconds: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Logging Tab */}
          {activeTab === "logging" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Log Level
                </label>
                <select
                  value={config.logging.level}
                  onChange={(e) =>
                    updateConfig({
                      logging: {
                        ...config.logging,
                        level: e.target.value as
                          | "debug"
                          | "info"
                          | "warn"
                          | "error",
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Log Entries
                </label>
                <input
                  type="number"
                  value={config.logging.maxEntries}
                  onChange={(e) =>
                    updateConfig({
                      logging: {
                        ...config.logging,
                        maxEntries: parseInt(e.target.value) || 1000,
                      },
                    })
                  }
                  className="w-full bg-white rounded-md p-2 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                  max="10000"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="persistLogs"
                  checked={config.logging.persistToFile}
                  onChange={(e) =>
                    updateConfig({
                      logging: {
                        ...config.logging,
                        persistToFile: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="persistLogs"
                  className="text-sm font-medium text-gray-700"
                >
                  Persist logs to browser storage
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                if (confirm("Reset all settings to defaults?")) {
                  resetConfig();
                }
              }}
              className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigPanel;
