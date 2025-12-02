import { useState, useRef, useEffect } from "react";
import { Send, History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";

export function SerialCommandPanel() {
  const { t } = useTranslation();
  const {
    config,
    connectionStatus,
    sendCommand,
    sendQuickCommand,
    commandHistory,
    clearCommandHistory,
  } = useApp();

  const [command, setCommand] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const isConnected = connectionStatus === "connected";
  const txEnabled = config.serialTx.enabled;
  const quickCommands = config.serialTx.quickCommands.filter((c) => c.enabled);

  // Reset history index when command history changes
  useEffect(() => {
    setHistoryIndex(-1);
  }, [commandHistory]);

  const handleSend = async () => {
    if (!command.trim() || !isConnected || !txEnabled || isSending) return;

    setIsSending(true);
    try {
      await sendCommand(command.trim());
      setCommand("");
      setHistoryIndex(-1);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  const handleQuickCommand = async (commandId: string) => {
    if (!isConnected || !txEnabled || isSending) return;

    setIsSending(true);
    try {
      await sendQuickCommand(commandId);
    } finally {
      setIsSending(false);
    }
  };

  const handleHistorySelect = (cmd: string) => {
    setCommand(cmd);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  if (!txEnabled) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("serialTx.disabled")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Commands */}
      {quickCommands.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("serialTx.quickCommands")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleQuickCommand(cmd.id)}
                disabled={!isConnected || isSending}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={cmd.command}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Command Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected || isSending}
              placeholder={
                isConnected
                  ? t("serialTx.commandPlaceholder")
                  : t("serialTx.connectFirst")
              }
              className="w-full bg-white dark:bg-gray-700 rounded-md p-2 pe-10 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {commandHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={t("serialTx.history")}
              >
                {showHistory ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!isConnected || !command.trim() || isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            {t("serialTx.send")}
          </button>
        </div>

        {/* Command History Dropdown */}
        {showHistory && commandHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <History className="w-3 h-3" />
                {t("serialTx.history")}
              </span>
              <button
                onClick={clearCommandHistory}
                className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t("serialTx.clear")}
              </button>
            </div>
            {commandHistory.map((cmd, index) => (
              <button
                key={index}
                onClick={() => handleHistorySelect(cmd)}
                className="w-full text-start px-3 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
              >
                {cmd}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Encoding Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>
          {t("serialTx.encoding")}: {config.serialTx.encoding.toUpperCase()}
        </span>
        <span>
          {t("serialTx.lineEnding")}:{" "}
          {config.serialTx.lineEnding === "\n"
            ? "LF (\\n)"
            : config.serialTx.lineEnding === "\r"
            ? "CR (\\r)"
            : config.serialTx.lineEnding === "\r\n"
            ? "CRLF (\\r\\n)"
            : t("serialTx.none")}
        </span>
      </div>
    </div>
  );
}

export default SerialCommandPanel;
