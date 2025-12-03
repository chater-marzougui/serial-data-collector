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
import { useTranslation } from "react-i18next";
import { useApp } from "../context";
import type {
  ClassConfig,
  RuleConfig,
  QuickCommand,
  ClassCommandConfig,
} from "../types";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const { t } = useTranslation();
  const { config, updateConfig, resetConfig, importConfig, exportConfig } =
    useApp();
  const [activeTab, setActiveTab] = useState<
    | "serial"
    | "parser"
    | "classes"
    | "rules"
    | "recording"
    | "logging"
    | "serialTx"
    | "ui"
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
          alert(t("config.invalidFile"));
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

  const tabs = [
    { key: "serial" as const, label: t("config.tabs.serial") },
    { key: "serialTx" as const, label: t("config.tabs.serialTx") },
    { key: "parser" as const, label: t("config.tabs.parser") },
    { key: "classes" as const, label: t("config.tabs.classes") },
    { key: "rules" as const, label: t("config.tabs.rules") },
    { key: "recording" as const, label: t("config.tabs.recording") },
    { key: "logging" as const, label: t("config.tabs.logging") },
    { key: "ui" as const, label: t("config.tabs.ui") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("config.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Serial Tab */}
          {activeTab === "serial" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.serial.baudRate")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.serial.delimiter")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="\\n"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.serial.encoding")}
                </label>
                <select
                  value={config.serial.encoding}
                  onChange={(e) =>
                    updateConfig({
                      serial: { ...config.serial, encoding: e.target.value },
                    })
                  }
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.parser.type")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="split">
                    {t("config.parser.types.split")}
                  </option>
                  <option value="regex">
                    {t("config.parser.types.regex")}
                  </option>
                  <option value="json">{t("config.parser.types.json")}</option>
                  <option value="custom">
                    {t("config.parser.types.custom")}
                  </option>
                </select>
              </div>

              {config.parser.type === "split" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("config.parser.splitDelimiter")}
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
                    className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=","
                  />
                </div>
              )}

              {config.parser.type === "regex" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("config.parser.regexPattern")}
                  </label>
                  <input
                    type="text"
                    value={config.parser.regex || ""}
                    onChange={(e) =>
                      updateConfig({
                        parser: { ...config.parser, regex: e.target.value },
                      })
                    }
                    className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ^(\d+),(\d+),(\d+)$"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.parser.fields")}
                </label>

                {(() => {
                  // Find duplicate fields
                  const fieldCounts = new Map<string, number>();
                  config.fields.forEach((field) => {
                    fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
                  });
                  const duplicates = Array.from(fieldCounts.entries())
                    .filter(([, count]) => count > 1)
                    .map(([field]) => field);

                  if (duplicates.length > 0) {
                    return (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-2">
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
                            {
                              /* Duplicate Fields Detected */ t(
                                "config.parser.duplicateFields"
                              )
                            }
                          </h4>
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {duplicates.map((field, i) => (
                              <span key={field}>
                                <strong>{field}</strong>{" "}
                                {t("config.parser.isDuplicated")}
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

                <input
                  type="text"
                  value={config.fields.join(", ")}
                  onChange={(e) => {
                    // During typing, allow anything
                    const fields = e.target.value
                      .split(",")
                      .map((f) => f.trim());

                    updateConfig({
                      fields: fields,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      const fields = (e.target as HTMLInputElement).value
                        .split(",")
                        .map((f) => f.trim());
                      // Prevent removing fields if it would lead to empty field names
                      if (fields.some((f) => f === "")) {
                        e.preventDefault();
                        fields.pop();
                      }
                      updateConfig({
                        fields: fields,
                      });
                    }
                  }}
                  onBlur={(e) => {
                    // Clean up empty entries only when user leaves the field
                    const fields = e.target.value
                      .split(",")
                      .map((f) => f.trim())
                      .filter(Boolean);

                    updateConfig({
                      fields: fields,
                    });
                  }}
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="timestamp, value1, value2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.parser.skipLines")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="# Comments\n/^DEBUG:/"
                />
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="space-y-4">
              {config.classes.map((cls, index) => (
                <div key={index + 1} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={cls.id}
                    onChange={(e) => {
                      const newClasses = [...config.classes];
                      newClasses[index] = { ...cls, id: e.target.value };
                      updateConfig({ classes: newClasses });
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("config.classes.id")}
                  />
                  <input
                    type="text"
                    value={cls.name}
                    onChange={(e) => {
                      const newClasses = [...config.classes];
                      newClasses[index] = { ...cls, name: e.target.value };
                      updateConfig({ classes: newClasses });
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("config.classes.name")}
                  />
                  <select
                    value={cls.color}
                    onChange={(e) => {
                      const newClasses = [...config.classes];
                      newClasses[index] = { ...cls, color: e.target.value };
                      updateConfig({ classes: newClasses });
                    }}
                    className="bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bg-blue-500">
                      {t("config.classes.colors.blue")}
                    </option>
                    <option value="bg-green-500">
                      {t("config.classes.colors.green")}
                    </option>
                    <option value="bg-purple-500">
                      {t("config.classes.colors.purple")}
                    </option>
                    <option value="bg-orange-500">
                      {t("config.classes.colors.orange")}
                    </option>
                    <option value="bg-pink-500">
                      {t("config.classes.colors.pink")}
                    </option>
                    <option value="bg-cyan-500">
                      {t("config.classes.colors.cyan")}
                    </option>
                    <option value="bg-yellow-500">
                      {t("config.classes.colors.yellow")}
                    </option>
                    <option value="bg-red-500">
                      {t("config.classes.colors.red")}
                    </option>
                  </select>
                  <button
                    onClick={() => {
                      const newClasses = config.classes.filter(
                        (_, i) => i !== index
                      );
                      updateConfig({ classes: newClasses });
                    }}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  // Available colors
                  const availableColors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-orange-500",
                    "bg-pink-500",
                    "bg-cyan-500",
                    "bg-yellow-500",
                    "bg-red-500",
                  ];

                  // Get colors already in use
                  const usedColors = new Set(
                    config.classes.map((cls) => cls.color)
                  );

                  // Find first unused color, or default to blue
                  const newColor =
                    availableColors.find((color) => !usedColors.has(color)) ||
                    "bg-blue-500";

                  const newClass: ClassConfig = {
                    id: `class${config.classes.length + 1}`,
                    name: `Class ${config.classes.length + 1}`,
                    color: newColor,
                  };
                  updateConfig({ classes: [...config.classes, newClass] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("config.classes.addClass")}
              </button>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("config.rules.description")}
              </p>
              {config.rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-gray-600"
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
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
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
                      className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., value > 100"
                    />
                    <button
                      onClick={() => {
                        const newRules = config.rules.filter(
                          (_, i) => i !== index
                        );
                        updateConfig({ rules: newRules });
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 items-center ps-6">
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
                      className="bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="label">
                        {t("config.rules.actions.label")}
                      </option>
                      <option value="ignore">
                        {t("config.rules.actions.ignore")}
                      </option>
                      <option value="log">
                        {t("config.rules.actions.log")}
                      </option>
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
                        className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("config.rules.labelValue")}
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
                className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("config.rules.addRule")}
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{t("config.rules.examples.title")}</p>
                <p className="font-mono">• {t("config.rules.examples.ex1")}</p>
                <p className="font-mono">• {t("config.rules.examples.ex2")}</p>
                <p className="font-mono">• {t("config.rules.examples.ex3")}</p>
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
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="enableLabeling"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("config.recording.enableLabeling")}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.recording.autoStop")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Logging Tab */}
          {activeTab === "logging" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.logging.level")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="debug">{t("logs.debug")}</option>
                  <option value="info">{t("logs.info")}</option>
                  <option value="warn">{t("logs.warn")}</option>
                  <option value="error">{t("logs.error")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("config.logging.maxEntries")}
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
                  className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="persistLogs"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("config.logging.persistLogs")}
                </label>
              </div>
            </div>
          )}

          {/* Serial TX Tab */}
          {activeTab === "serialTx" && (
            <div className="space-y-6">
              {/* Enable TX */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableTx"
                  checked={config.serialTx.enabled}
                  onChange={(e) =>
                    updateConfig({
                      serialTx: {
                        ...config.serialTx,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="enableTx"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("config.serialTx.enableTx")}
                </label>
              </div>

              {config.serialTx.enabled && (
                <>
                  {/* TX Encoding */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("config.serialTx.encoding")}
                    </label>
                    <select
                      value={config.serialTx.encoding}
                      onChange={(e) =>
                        updateConfig({
                          serialTx: {
                            ...config.serialTx,
                            encoding: e.target.value as
                              | "utf-8"
                              | "ascii"
                              | "raw",
                          },
                        })
                      }
                      className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="utf-8">UTF-8</option>
                      <option value="ascii">ASCII</option>
                      <option value="raw">{t("config.serialTx.rawHex")}</option>
                    </select>
                  </div>

                  {/* Line Ending */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("config.serialTx.lineEnding")}
                    </label>
                    <select
                      value={config.serialTx.lineEnding}
                      onChange={(e) =>
                        updateConfig({
                          serialTx: {
                            ...config.serialTx,
                            lineEnding: e.target.value as
                              | ""
                              | "\n"
                              | "\r"
                              | "\r\n",
                          },
                        })
                      }
                      className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">
                        {t("config.serialTx.noLineEnding")}
                      </option>
                      <option value={"\n"}>LF (\n)</option>
                      <option value={"\r"}>CR (\r)</option>
                      <option value={"\r\n"}>CRLF (\r\n)</option>
                    </select>
                  </div>

                  {/* Command Delay */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("config.serialTx.commandDelay")}
                    </label>
                    <input
                      type="number"
                      value={
                        config.serialTx.automatedCommands.delayBetweenCommands
                      }
                      onChange={(e) =>
                        updateConfig({
                          serialTx: {
                            ...config.serialTx,
                            automatedCommands: {
                              ...config.serialTx.automatedCommands,
                              delayBetweenCommands:
                                parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="50"
                    />
                  </div>

                  {/* Quick Commands */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("config.serialTx.quickCommands")}
                    </h4>
                    {config.serialTx.quickCommands.map((cmd, index) => (
                      <div key={cmd.id} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={cmd.enabled}
                          onChange={(e) => {
                            const newCommands = [
                              ...config.serialTx.quickCommands,
                            ];
                            newCommands[index] = {
                              ...cmd,
                              enabled: e.target.checked,
                            };
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                quickCommands: newCommands,
                              },
                            });
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={cmd.label}
                          onChange={(e) => {
                            const newCommands = [
                              ...config.serialTx.quickCommands,
                            ];
                            newCommands[index] = {
                              ...cmd,
                              label: e.target.value,
                            };
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                quickCommands: newCommands,
                              },
                            });
                          }}
                          className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t("config.serialTx.buttonLabel")}
                        />
                        <input
                          type="text"
                          value={cmd.command}
                          onChange={(e) => {
                            const newCommands = [
                              ...config.serialTx.quickCommands,
                            ];
                            newCommands[index] = {
                              ...cmd,
                              command: e.target.value,
                            };
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                quickCommands: newCommands,
                              },
                            });
                          }}
                          className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t("config.serialTx.command")}
                        />
                        <button
                          onClick={() => {
                            const newCommands =
                              config.serialTx.quickCommands.filter(
                                (_, i) => i !== index
                              );
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                quickCommands: newCommands,
                              },
                            });
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newCommand: QuickCommand = {
                          id: `cmd${Date.now()}`,
                          label: `Button ${
                            config.serialTx.quickCommands.length + 1
                          }`,
                          command: "",
                          enabled: true,
                        };
                        updateConfig({
                          serialTx: {
                            ...config.serialTx,
                            quickCommands: [
                              ...config.serialTx.quickCommands,
                              newCommand,
                            ],
                          },
                        });
                      }}
                      className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t("config.serialTx.addQuickCommand")}
                    </button>
                  </div>

                  {/* Automated Commands */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("config.serialTx.automatedCommands")}
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("config.serialTx.onConnect")}
                      </label>
                      <input
                        type="text"
                        value={config.serialTx.automatedCommands.onConnect}
                        onChange={(e) =>
                          updateConfig({
                            serialTx: {
                              ...config.serialTx,
                              automatedCommands: {
                                ...config.serialTx.automatedCommands,
                                onConnect: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("config.serialTx.optionalCommand")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("config.serialTx.onDisconnect")}
                      </label>
                      <input
                        type="text"
                        value={config.serialTx.automatedCommands.onDisconnect}
                        onChange={(e) =>
                          updateConfig({
                            serialTx: {
                              ...config.serialTx,
                              automatedCommands: {
                                ...config.serialTx.automatedCommands,
                                onDisconnect: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("config.serialTx.optionalCommand")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("config.serialTx.onRecordingStart")}
                      </label>
                      <input
                        type="text"
                        value={
                          config.serialTx.automatedCommands.onRecordingStart
                        }
                        onChange={(e) =>
                          updateConfig({
                            serialTx: {
                              ...config.serialTx,
                              automatedCommands: {
                                ...config.serialTx.automatedCommands,
                                onRecordingStart: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("config.serialTx.optionalCommand")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("config.serialTx.onRecordingStop")}
                      </label>
                      <input
                        type="text"
                        value={
                          config.serialTx.automatedCommands.onRecordingStop
                        }
                        onChange={(e) =>
                          updateConfig({
                            serialTx: {
                              ...config.serialTx,
                              automatedCommands: {
                                ...config.serialTx.automatedCommands,
                                onRecordingStop: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("config.serialTx.optionalCommand")}
                      />
                    </div>
                  </div>

                  {/* Class Commands */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("config.serialTx.classCommands")}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("config.serialTx.classCommandsDescription")}
                    </p>
                    {config.serialTx.classCommands.map((cmd, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={cmd.enabled}
                          onChange={(e) => {
                            const newCommands = [
                              ...config.serialTx.classCommands,
                            ];
                            newCommands[index] = {
                              ...cmd,
                              enabled: e.target.checked,
                            };
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                classCommands: newCommands,
                              },
                            });
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                        />
                        <select
                          value={cmd.classId}
                          onChange={(e) => {
                            const newCommands = [
                              ...config.serialTx.classCommands,
                            ];
                            newCommands[index] = {
                              ...cmd,
                              classId: e.target.value,
                            };
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                classCommands: newCommands,
                              },
                            });
                          }}
                          className="bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">
                            {t("config.serialTx.selectClass")}
                          </option>
                          {config.classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={cmd.command}
                          onChange={(e) => {
                            const newCommands = [
                              ...config.serialTx.classCommands,
                            ];
                            newCommands[index] = {
                              ...cmd,
                              command: e.target.value,
                            };
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                classCommands: newCommands,
                              },
                            });
                          }}
                          className="flex-1 bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t("config.serialTx.command")}
                        />
                        <button
                          onClick={() => {
                            const newCommands =
                              config.serialTx.classCommands.filter(
                                (_, i) => i !== index
                              );
                            updateConfig({
                              serialTx: {
                                ...config.serialTx,
                                classCommands: newCommands,
                              },
                            });
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newCommand: ClassCommandConfig = {
                          classId: "",
                          command: "",
                          enabled: true,
                        };
                        updateConfig({
                          serialTx: {
                            ...config.serialTx,
                            classCommands: [
                              ...config.serialTx.classCommands,
                              newCommand,
                            ],
                          },
                        });
                      }}
                      className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t("config.serialTx.addClassCommand")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* UI Tab */}
          {activeTab === "ui" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showVisualization"
                  checked={config.ui.showVisualization}
                  onChange={(e) =>
                    updateConfig({
                      ui: {
                        ...config.ui,
                        showVisualization: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="showVisualization"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("config.ui.showVisualization")}
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("config.ui.visualizationHint")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t("config.import")}
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t("config.export")}
            </button>
            <button
              onClick={() => {
                if (confirm(t("config.resetConfirm"))) {
                  resetConfig();
                }
              }}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t("config.reset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigPanel;
