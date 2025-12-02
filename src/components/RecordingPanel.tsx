import { Circle, StopCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";

export function RecordingPanel() {
  const { t } = useTranslation();
  const {
    config,
    connectionStatus,
    isRecording,
    currentClass,
    startRecording,
    stopRecording,
    stats,
  } = useApp();

  const isConnected = connectionStatus === "connected";
  const enableLabeling = config.recording.enableLabeling;
  const classes = config.classes;
  const autoStopSeconds = config.recording.autoStopSeconds;

  // No labeling mode - simple record button
  if (!enableLabeling) {
    return (
      <div>
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ {t("recording.connectFirst")}
            </p>
          </div>
        )}

        <button
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          disabled={!isConnected}
          className={`w-full p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
            isRecording
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 animate-pulse"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500`}
        >
          {isRecording ? (
            <StopCircle className="w-12 h-12" />
          ) : (
            <Circle className="w-12 h-12" />
          )}
          <span className="font-bold text-lg">
            {isRecording ? t("recording.stop") : t("recording.start")}
          </span>
          <span className="text-sm opacity-80">
            {isRecording
              ? `${t("recording.recording")} ${t("recording.samples", { count: stats.totalSamples })}`
              : t("recording.samplesCollected", { count: stats.totalSamples })}
          </span>
        </button>

        {isRecording && autoStopSeconds > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {t("recording.autoStop", { seconds: autoStopSeconds })}
          </p>
        )}
      </div>
    );
  }

  // Labeling mode - class buttons
  return (
    <div>
      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ {t("recording.connectFirst")}
          </p>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t("recording.noClasses")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {classes.map((cls) => {
            const isActive = isRecording && currentClass === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => {
                  if (isRecording && currentClass === cls.id) {
                    stopRecording();
                  } else {
                    startRecording(cls.id);
                  }
                }}
                disabled={!isConnected}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                  isActive
                    ? `${cls.color} text-white border-transparent shadow-md scale-105`
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <span className="font-bold text-lg">{cls.name}</span>
                {isActive && (
                  <span className="text-xs animate-pulse">{t("recording.recording")}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isRecording && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => stopRecording()}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors font-bold"
          >
            <StopCircle className="w-5 h-5" />
            {t("recording.stop")} ({t("recording.samples", { count: stats.totalSamples })})
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordingPanel;
