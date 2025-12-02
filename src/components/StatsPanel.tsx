import { useTranslation } from "react-i18next";
import { useApp } from "../context";

export function StatsPanel() {
  const { t } = useTranslation();
  const { config, stats, recordedSamples } = useApp();
  const classes = config.classes;
  const enableLabeling = config.recording.enableLabeling;

  return (
    <div className="space-y-6">
      {enableLabeling && classes.length > 0 ? (
        <div className="space-y-3">
          {classes.map((cls) => (
            <div key={cls.id} className="flex justify-between items-center">
              <span className="font-medium truncate mr-2 text-gray-700 dark:text-gray-300">
                {cls.name}
              </span>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap border border-gray-200 dark:border-gray-600">
                {stats.classCounts[cls.id] || 0}
              </span>
            </div>
          ))}

          {/* Show unlabeled count if any */}
          {stats.classCounts["unlabeled"] && (
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
              <span className="font-medium">{t("stats.unlabeled")}</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-600">
                {stats.classCounts["unlabeled"]}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t("stats.samples")}</span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-600">
              {stats.totalSamples}
            </span>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="font-bold text-gray-900 dark:text-white">{t("stats.totalSamples")}</span>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-bold">
          {recordedSamples.length}
        </span>
      </div>

      {stats.startTime && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>{t("stats.started")}: {new Date(stats.startTime).toLocaleTimeString()}</p>
          {stats.lastSampleTime && (
            <p>
              {t("stats.lastSample")}: {new Date(stats.lastSampleTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
