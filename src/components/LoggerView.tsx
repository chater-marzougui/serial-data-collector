import { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Download, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useApp } from '../context';
import type { LogLevel } from '../types';

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: 'text-gray-400',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
};

const LEVEL_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

export function LoggerView() {
  const { logs, clearLogs, downloadLogs } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = filterLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === filterLevel);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, isExpanded]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5" />
          <h2 className="text-lg font-bold">Logs</h2>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {logs.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0">
          {/* Controls */}
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
                className="bg-black/30 rounded-lg px-2 py-1 border border-white/20 text-sm"
              >
                <option value="all">All levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </select>
            </div>
            <button
              onClick={downloadLogs}
              disabled={logs.length === 0}
              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50"
              title="Download logs"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all logs?')) {
                  clearLogs();
                }
              }}
              disabled={logs.length === 0}
              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Log entries */}
          <div 
            ref={scrollRef}
            className="bg-black/30 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs space-y-1"
          >
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500">No logs to display</p>
            ) : (
              filteredLogs.map((entry, index) => (
                <div key={index} className={`${LEVEL_COLORS[entry.level]} flex gap-2`}>
                  <span className="text-gray-500 shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="shrink-0">{LEVEL_ICONS[entry.level]}</span>
                  <span className="break-all">
                    {entry.message}
                    {entry.data !== undefined && (
                      <span className="text-gray-500 ml-2">
                        {typeof entry.data === 'object' 
                          ? JSON.stringify(entry.data) 
                          : String(entry.data)}
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoggerView;
