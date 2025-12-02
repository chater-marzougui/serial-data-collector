import { useApp } from "../context";

export function StatsPanel() {
  const { config, stats, recordedSamples } = useApp();
  const classes = config.classes;
  const enableLabeling = config.recording.enableLabeling;

  return (
    <div className="space-y-6">
      {enableLabeling && classes.length > 0 ? (
        <div className="space-y-3">
          {classes.map((cls) => (
            <div key={cls.id} className="flex justify-between items-center">
              <span className="font-medium truncate mr-2 text-gray-700">
                {cls.name}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap border border-gray-200">
                {stats.classCounts[cls.id] || 0}
              </span>
            </div>
          ))}

          {/* Show unlabeled count if any */}
          {stats.classCounts["unlabeled"] && (
            <div className="flex justify-between items-center text-gray-500">
              <span className="font-medium">Unlabeled</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
                {stats.classCounts["unlabeled"]}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Samples</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
              {stats.totalSamples}
            </span>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
        <span className="font-bold text-gray-900">Total Samples</span>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
          {recordedSamples.length}
        </span>
      </div>

      {stats.startTime && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Started: {new Date(stats.startTime).toLocaleTimeString()}</p>
          {stats.lastSampleTime && (
            <p>
              Last sample: {new Date(stats.lastSampleTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
