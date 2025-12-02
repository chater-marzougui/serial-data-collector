import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { Eye, EyeOff, Settings2 } from "lucide-react";
import { useApp, useTheme } from "../context";
import { useTranslation } from "react-i18next";
import type { RecordedSample } from "../types";

// Color palette for lines
const LINE_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// Class colors for reference areas
const CLASS_COLORS: Record<string, string> = {
  "bg-blue-500": "rgba(59, 130, 246, 0.2)",
  "bg-green-500": "rgba(16, 185, 129, 0.2)",
  "bg-purple-500": "rgba(139, 92, 246, 0.2)",
  "bg-orange-500": "rgba(249, 115, 22, 0.2)",
  "bg-pink-500": "rgba(236, 72, 153, 0.2)",
  "bg-cyan-500": "rgba(6, 182, 212, 0.2)",
  "bg-yellow-500": "rgba(234, 179, 8, 0.2)",
  "bg-red-500": "rgba(239, 68, 68, 0.2)",
};

interface LabelInterval {
  startIndex: number;
  endIndex: number;
  label: string;
  color: string;
}

/**
 * Calculates the optimal sampling step size to limit the number of displayed points.
 * This prevents performance issues when visualizing large datasets.
 * @param totalSamples - Total number of samples in the dataset
 * @param maxPoints - Maximum number of points to display (default: 1000)
 * @returns The step size to use for sampling (1 means show all points)
 */
function calculateSmartStep(
  totalSamples: number,
  maxPoints: number = 100
): number {
  if (totalSamples <= maxPoints) return 1;
  return Math.ceil(totalSamples / maxPoints);
}

/**
 * Samples data by selecting every nth element based on the step size.
 * Always includes the first and last points for complete visualization.
 * @param data - Array of recorded samples to sample from
 * @param step - Number of samples to skip between selected points
 * @returns Sampled array with original indices preserved
 */
function sampleData(
  data: RecordedSample[],
  step: number
): (RecordedSample & { originalIndex: number })[] {
  if (step <= 1) {
    return data.map((d, i) => ({ ...d, originalIndex: i }));
  }
  const sampled: (RecordedSample & { originalIndex: number })[] = [];
  for (let i = 0; i < data.length; i += step) {
    sampled.push({ ...data[i], originalIndex: i });
  }
  // Always include the last point
  if (
    data.length > 0 &&
    sampled[sampled.length - 1]?.originalIndex !== data.length - 1
  ) {
    sampled.push({ ...data[data.length - 1], originalIndex: data.length - 1 });
  }
  return sampled;
}

/**
 * Extracts continuous intervals of labeled data for visualization overlays.
 * Groups consecutive samples with the same label into intervals.
 * @param data - Array of recorded samples
 * @param classes - Array of class configurations with id and color
 * @returns Array of label intervals with start/end indices and colors
 */
function extractLabelIntervals(
  data: RecordedSample[],
  classes: { id: string; color: string }[]
): LabelInterval[] {
  const intervals: LabelInterval[] = [];
  let currentLabel: string | undefined;
  let startIndex = 0;

  for (let i = 0; i < data.length; i++) {
    const label = data[i].label;
    if (label !== currentLabel) {
      if (currentLabel) {
        const classConfig = classes.find((c) => c.id === currentLabel);
        intervals.push({
          startIndex,
          endIndex: i - 1,
          label: currentLabel,
          color: classConfig?.color || "bg-gray-500",
        });
      }
      currentLabel = label;
      startIndex = i;
    }
  }

  // Add the last interval
  if (currentLabel && data.length > 0) {
    const classConfig = classes.find((c) => c.id === currentLabel);
    intervals.push({
      startIndex,
      endIndex: data.length - 1,
      label: currentLabel,
      color: classConfig?.color || "bg-gray-500",
    });
  }

  return intervals;
}

export function DataVisualization() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { recordedSamples, config } = useApp();
  const ModularNumber = 500;

  const [showSettings, setShowSettings] = useState(false);
  const [manualStep, setManualStep] = useState<number | null>(null);
  const [showClassLabels, setShowClassLabels] = useState(true);
  const [minSteps, setMinSteps] = useState(Math.floor(recordedSamples.length / ModularNumber));
  const [enabledColumns, setEnabledColumns] = useState<Set<string>>(() => {
    return new Set(config.fields);
  });


  // Get numeric fields from data
  const numericFields = useMemo(() => {
    if (recordedSamples.length === 0) return [];
    const sample = recordedSamples[0];
    return Object.entries(sample.fields)
      .filter(([, value]) => typeof value === "number")
      .map(([key]) => key);
  }, [recordedSamples]);

  // Calculate smart step
  const smartStep = useMemo(() => {
    return calculateSmartStep(recordedSamples.length);
  }, [recordedSamples.length]);

  const effectiveStep = manualStep ?? smartStep;

  // Sample the data
  const sampledData = useMemo(() => {
    return sampleData(recordedSamples, effectiveStep);
  }, [recordedSamples, effectiveStep]);

  // Extract label intervals for reference areas
  const labelIntervals = useMemo(() => {
    return extractLabelIntervals(recordedSamples, config.classes);
  }, [recordedSamples, config.classes]);

  useEffect(() => {
    if (effectiveStep < recordedSamples.length / ModularNumber) {
      setManualStep(Math.floor(recordedSamples.length / ModularNumber));
      setMinSteps(Math.floor(recordedSamples.length / ModularNumber));
    }
  }, [effectiveStep, recordedSamples.length]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return sampledData.map((sample, index) => {
      const dataPoint: Record<string, number | string> = {
        index,
        originalIndex: sample.originalIndex,
        time: new Date(sample.timestamp).toLocaleTimeString(),
      };
      numericFields.forEach((field) => {
        if (enabledColumns.has(field)) {
          dataPoint[field] = sample.fields[field] as number;
        }
      });
      return dataPoint;
    });
  }, [sampledData, numericFields, enabledColumns]);

  const toggleColumn = useCallback((field: string) => {
    setEnabledColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  const isDark = theme === "dark";

  if (recordedSamples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p>{t("visualization.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("visualization.sampling")}:
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("visualization.displayedSamples", {
              displayed: sampledData.length,
              total: recordedSamples.length,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("visualization.stepSize")}:
          </label>
          <input
            type="number"
            min={minSteps}
            max={Math.max(1, recordedSamples.length)}
            value={effectiveStep}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0) {
                setManualStep(val);
              }
            }}
            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
          {manualStep !== null && (
            <button
              onClick={() => setManualStep(null)}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Auto ({smartStep})
            </button>
          )}
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
            showSettings
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          {t("visualization.columns")}
        </button>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showClassLabels}
            onChange={(e) => setShowClassLabels(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-300">
            {t("visualization.showLabels")}
          </span>
        </label>
      </div>

      {/* Column selector */}
      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t("visualization.selectColumns")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {numericFields.map((field, index) => (
              <button
                key={field}
                onClick={() => toggleColumn(field)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  enabledColumns.has(field)
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {enabledColumns.has(field) ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: LINE_COLORS[index % LINE_COLORS.length],
                  }}
                />
                {field}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#374151" : "#e5e7eb"}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
              tickLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
            />
            <YAxis
              tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
              tickLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: "8px",
                color: isDark ? "#f3f4f6" : "#111827",
              }}
            />
            <Legend />

            {/* Class label reference areas */}
            {showClassLabels &&
              labelIntervals.map((interval, idx) => {
                // Find the indices in sampled data
                const startSampledIdx = chartData.findIndex(
                  (d) => (d.originalIndex as number) >= interval.startIndex
                );
                const endSampledIdx = chartData.findIndex(
                  (d) => (d.originalIndex as number) >= interval.endIndex
                );

                if (startSampledIdx === -1) return null;
                const endIdx =
                  endSampledIdx === -1 ? chartData.length - 1 : endSampledIdx;

                return (
                  <ReferenceArea
                    key={`${interval.label}-${idx}`}
                    x1={chartData[startSampledIdx]?.time}
                    x2={chartData[endIdx]?.time}
                    fill={
                      CLASS_COLORS[interval.color] || "rgba(156, 163, 175, 0.2)"
                    }
                    fillOpacity={0.5}
                    label={{
                      value: interval.label,
                      position: "insideTop",
                      fill: isDark ? "#e5e7eb" : "#374151",
                      fontSize: 11,
                    }}
                  />
                );
              })}

            {/* Data lines */}
            {numericFields
              .filter((field) => enabledColumns.has(field))
              .map((field, index) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={LINE_COLORS[index % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={sampledData.length < 50}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for class labels */}
      {showClassLabels && labelIntervals.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("visualization.classLabels")}:
          </span>
          {config.classes.map((cls) => {
            const hasData = labelIntervals.some((i) => i.label === cls.id);
            if (!hasData) return null;
            return (
              <div key={cls.id} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor:
                      CLASS_COLORS[cls.color] || "rgba(156, 163, 175, 0.5)",
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {cls.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DataVisualization;
