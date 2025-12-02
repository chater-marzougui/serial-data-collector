import { useState, useEffect, useRef } from "react";
import {
  Download,
  Circle,
  Square,
  PlayCircle,
  StopCircle
} from "lucide-react";

type SerialPort = any;

const MOVEMENT_CLASSES = [
  { id: "circle", name: "Circular Motion", icon: Circle, color: "bg-blue-500" },
  { id: "square", name: "Square Motion", icon: Square, color: "bg-green-500" },
  {
    id: "zigzag",
    name: "Zigzag Motion",
    icon: PlayCircle,
    color: "bg-purple-500",
  },
  { id: "static", name: "Static/Rest", icon: StopCircle, color: "bg-gray-500" },
];

interface SensorData {
  timestamp: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  label: string;
}

export default function DataCollectionApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [collectedData, setCollectedData] = useState<SensorData[]>([]);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [liveData, setLiveData] = useState<string>("");
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecordingRef = useRef(false);
  const currentClassRef = useRef("");

  // Check if Web Serial API is supported
  const isSerialSupported = "serial" in navigator;

  // Connect to serial port
  const connectSerial = async () => {
    try {
      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      setPort(selectedPort);
      setIsConnected(true);
      startReading(selectedPort);
    } catch (error) {
      console.error("[Recorder] Error connecting:", error);
      alert("Failed to connect to device");
    }
  };

  // Disconnect from serial port
  const disconnectSerial = async () => {
    if (readerRef.current) {
      await readerRef.current.cancel();
      readerRef.current = null;
    }
    if (port) {
      await port.close();
      setPort(null);
    }
    setIsConnected(false);
  };

  // Read data from serial port
  const startReading = async (serialPort: SerialPort) => {
    const reader = serialPort.readable?.getReader();
    if (!reader) return;

    readerRef.current = reader;
    const decoder = new TextDecoder();
    let buffer = "";
    let examplesToSend = 10;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          setLiveData((prev) => (prev + line + "\n").slice(-500));
          if (examplesToSend > 0) {
            examplesToSend--;
            console.log("[Recorder] Received line:", line);
          }

          if (line.startsWith("IMU") && isRecordingRef.current && currentClassRef.current) {
            console.log("[Recorder] Received line:", line);
            const parts = line.split(",");

            if (parts.length === 8) {
              // IMU + timestamp + 6 values
              const dataPoint: SensorData = {
                timestamp: parseInt(parts[1]),
                accel_x: parseInt(parts[2]),
                accel_y: parseInt(parts[3]),
                accel_z: parseInt(parts[4]),
                gyro_x: parseInt(parts[5]),
                gyro_y: parseInt(parts[6]),
                gyro_z: parseInt(parts[7]),
                label: currentClassRef.current,
              };

              setCollectedData((prev) => [...prev, dataPoint]);
              setClassCounts((prev) => ({
                ...prev,
                [currentClassRef.current]: (prev[currentClassRef.current] || 0) + 1,
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error("[Recorder] Reading error:", error);
    }
  };

  // Start recording for a specific class
  const startRecording = (classId: string) => {
    currentClassRef.current = classId;
    setIsRecording(true);
    isRecordingRef.current = true; // ADD THIS LINE

    // Auto-stop after 10 seconds
    recordingTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 10000);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false; // ADD THIS LINE
    currentClassRef.current = ""; // ADD THIS LINE
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  // Export data as CSV
  const exportData = () => {
    if (collectedData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers =
      "timestamp,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,label\n";
    const rows = collectedData
      .map(
        (d) =>
          `${d.timestamp},${d.accel_x},${d.accel_y},${d.accel_z},${d.gyro_x},${d.gyro_y},${d.gyro_z},${d.label}`
      )
      .join("\n");

    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movement_data_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all collected data
  const clearData = () => {
    if (confirm("Clear all collected data?")) {
      setCollectedData([]);
      setClassCounts({});
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
      disconnectSerial();
    };
  }, []);

  if (!isSerialSupported) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">
            Web Serial API Not Supported
          </h2>
          <p>
            Please use Chrome, Edge, or Opera browser to access this
            application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Movement Data Collection
          </h1>
          <p className="text-gray-300">
            Collect sensor data for gesture recognition ML model
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                } animate-pulse`}
              />
              <span className="font-semibold">
                {isConnected ? "Connected to SensorTile" : "Not Connected"}
              </span>
            </div>
            <button
              onClick={isConnected ? disconnectSerial : connectSerial}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isConnected ? "Disconnect" : "Connect Device"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Record Movement Data</h2>

              {!isConnected && (
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4">
                  <p className="text-yellow-200">
                    ⚠️ Connect device first to start recording
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {MOVEMENT_CLASSES.map((movement) => {
                  const Icon = movement.icon;
                  const isCurrentlyRecording =
                    isRecordingRef.current && currentClassRef.current === movement.id;
                  const count = classCounts[movement.id] || 0;

                  return (
                    <button
                      key={movement.id}
                      onClick={() =>
                        isCurrentlyRecording
                          ? stopRecording()
                          : startRecording(movement.id)
                      }
                      disabled={
                        !isConnected ||
                        (isRecordingRef.current && currentClassRef.current !== movement.id)
                      }
                      className={`
                        p-6 rounded-xl border-2 transition-all
                        ${
                          isCurrentlyRecording
                            ? "bg-red-500 border-red-400 animate-pulse"
                            : movement.color +
                              " border-transparent hover:scale-105"
                        }
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                      `}
                    >
                      <Icon className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-1">
                        {movement.name}
                      </h3>
                      <p className="text-sm opacity-80">
                        {isCurrentlyRecording
                          ? "Recording..."
                          : `${count} samples`}
                      </p>
                    </button>
                  );
                })}
              </div>

              {isRecording && (
                <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-4">
                  <p className="font-semibold">
                    🔴 Recording{" "}
                    {MOVEMENT_CLASSES.find((c) => c.id === currentClassRef.current)?.name}
                  </p>
                  <p className="text-sm mt-1">
                    Perform the movement now. Auto-stops in 10 seconds.
                  </p>
                  <button
                    onClick={stopRecording}
                    className="mt-3 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
                  >
                    Stop Recording
                  </button>
                </div>
              )}
            </div>

            {/* Live Data Stream */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold mb-4">Live Data Stream</h2>
              <div className="bg-black/30 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
                <pre className="text-green-400">
                  {liveData || "No data received yet..."}
                </pre>
              </div>
            </div>
          </div>

          {/* Statistics & Export */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold mb-4">Collection Statistics</h2>

              <div className="space-y-3 mb-6">
                {MOVEMENT_CLASSES.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{movement.name}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                      {classCounts[movement.id] || 0}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                  <span className="font-bold">Total Samples</span>
                  <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold">
                    {collectedData.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={exportData}
                  disabled={collectedData.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export as CSV
                </button>

                <button
                  onClick={clearData}
                  disabled={collectedData.length === 0}
                  className="w-full bg-red-500/50 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-lg font-semibold"
                >
                  Clear All Data
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold mb-3">Instructions</h2>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">1.</span>
                  <span>Connect your SensorTile device</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">2.</span>
                  <span>Click a movement button to start recording</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">3.</span>
                  <span>Perform the movement for 10 seconds</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">4.</span>
                  <span>Collect 50-100 samples per class</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">5.</span>
                  <span>Export data as CSV when done</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
