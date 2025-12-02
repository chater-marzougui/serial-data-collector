import { Trash2, Pause, Play } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";

export function LiveStream() {
  const { t } = useTranslation();
  const { liveData, clearLiveData, connectionStatus } = useApp();
  const [isPaused, setIsPaused] = useState(false);
  const [pausedData, setPausedData] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // When pausing, capture current data; when unpausing, clear captured data
  const handleTogglePause = () => {
    if (!isPaused) {
      setPausedData(liveData);
    }
    setIsPaused(!isPaused);
  };

  // Display either live data or paused snapshot
  const displayData = useMemo(() => {
    return isPaused ? pausedData : liveData;
  }, [isPaused, pausedData, liveData]);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayData, isPaused]);

  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex flex-col h-96">
      <div className="flex justify-end gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={handleTogglePause}
          className={`p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium ${
            isPaused
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
          }`}
          title={isPaused ? t("liveStream.resume") : t("liveStream.pause")}
        >
          {isPaused ? (
            <Play className="w-3 h-3" />
          ) : (
            <Pause className="w-3 h-3" />
          )}
          {isPaused ? t("liveStream.resume") : t("liveStream.pause")}
        </button>
        <button
          onClick={clearLiveData}
          className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 text-xs font-medium"
          title={t("liveStream.clear")}
        >
          <Trash2 className="w-3 h-3" />
          {t("liveStream.clear")}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 bg-gray-900 dark:bg-gray-950 p-4 overflow-y-auto font-mono text-xs"
      >
        {!isConnected ? (
          <p className="text-gray-500">{t("liveStream.connectPrompt")}</p>
        ) : displayData.length === 0 ? (
          <p className="text-gray-500">{t("liveStream.waitingData")}</p>
        ) : (
          <pre className="text-green-400 whitespace-pre-wrap break-all">
            {displayData.join("\n")}
          </pre>
        )}
      </div>

      {isPaused && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 border-t border-yellow-100 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-300 text-xs flex items-center gap-1">
            <Pause className="w-3 h-3" />
            {t("liveStream.pausedMessage")}
          </p>
        </div>
      )}
    </div>
  );
}

export default LiveStream;
