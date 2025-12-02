import { useState, useEffect, useRef } from "react";
import { Trash2, Download, Filter } from "lucide-react";
import { useApp } from "../context";
import type { LogLevel } from "../types";

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "text-gray-500",
  info: "text-blue-600",
  warn: "text-yellow-600",
  error: "text-red-600",
};

export function LoggerView() {
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
      <div className="flex gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel | "all")}
            className="bg-white rounded-md px-2 py-1 border border-gray-300 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
          <span className="text-xs text-gray-500 ml-2">
            {filteredLogs.length} entries
          </span>
        </div>
        <button
          onClick={downloadLogs}
          disabled={logs.length === 0}
          className="p-1.5 bg-white border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50"
          title="Download logs"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm("Clear all logs?")) {
              clearLogs();
            }
          }}
          disabled={logs.length === 0}
          className="p-1.5 bg-white border border-gray-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
          title="Clear logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="flex-1 bg-white p-3 overflow-y-auto font-mono text-xs space-y-1"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-gray-400 italic">No logs to display</p>
        ) : (
          filteredLogs.map((entry, index) => (
            <div
              key={index}
              className="flex gap-2 hover:bg-gray-50 p-0.5 rounded"
            >
              <span className="text-gray-400 shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`${
                  LEVEL_COLORS[entry.level]
                } shrink-0 font-bold w-16 uppercase text-[10px] pt-0.5`}
              >
                {entry.level}
              </span>
              <span className="text-gray-700 break-all">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LoggerView;
