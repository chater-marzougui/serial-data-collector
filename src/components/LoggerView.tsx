import { useState, useEffect, useRef } from "react";
import { Trash2, Download, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";
import type { LogLevel } from "../types";

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "text-gray-500 dark:text-gray-400",
  info: "text-blue-600 dark:text-blue-400",
  warn: "text-yellow-600 dark:text-yellow-400",
  error: "text-red-600 dark:text-red-400",
};

export function LoggerView() {
  const { t } = useTranslation();
  const { logs, clearLogs, downloadLogs } = useApp();
  const [filterLevel, setFilterLevel] = useState<LogLevel | "all">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs =
    filterLevel === "all"
      ? logs
      : logs.filter((log) => log.level === filterLevel);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  return (
    <div className="flex flex-col h-64">
      {/* Controls */}
      <div className="flex gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel | "all")}
            className="bg-white dark:bg-gray-800 rounded-md px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t("logs.allLevels")}</option>
            <option value="debug">{t("logs.debug")}</option>
            <option value="info">{t("logs.info")}</option>
            <option value="warn">{t("logs.warn")}</option>
            <option value="error">{t("logs.error")}</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {t("logs.entries", { count: filteredLogs.length })}
          </span>
        </div>
        <button
          onClick={downloadLogs}
          disabled={logs.length === 0}
          className="p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          title={t("logs.download")}
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm(t("logs.clearConfirm"))) {
              clearLogs();
            }
          }}
          disabled={logs.length === 0}
          className="p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          title={t("logs.clear")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-gray-900 p-3 overflow-y-auto font-mono text-xs space-y-1"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 italic">{t("logs.noLogs")}</p>
        ) : (
          filteredLogs.map((entry, index) => (
            <div
              key={index}
              className="flex gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-0.5 rounded"
            >
              <span className="text-gray-400 dark:text-gray-500 shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`${
                  LEVEL_COLORS[entry.level]
                } shrink-0 font-bold w-16 uppercase text-[10px] pt-0.5`}
              >
                {entry.level}
              </span>
              <span className="text-gray-700 dark:text-gray-300 break-all">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LoggerView;
