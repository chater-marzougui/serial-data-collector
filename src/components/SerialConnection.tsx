import { Plug, Unplug } from "lucide-react";
import { useApp } from "../context";

export function SerialConnection() {
  const { connectionStatus, connect, disconnect, isSerialSupported, config } =
    useApp();

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  if (!isSerialSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2 text-red-800">
          Web Serial API Not Supported
        </h2>
        <p className="text-sm text-red-600">
          Please use Chrome, Edge, or Opera browser to access serial port
          features.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected
                ? "bg-green-500"
                : isConnecting
                ? "bg-yellow-500"
                : "bg-red-500"
            } animate-pulse`}
          />
          <div>
            <span className="font-semibold block text-gray-900">
              {isConnected
                ? "Connected"
                : isConnecting
                ? "Connecting..."
                : "Disconnected"}
            </span>
            <span className="text-sm text-gray-500">
              {config.serial.baudRate} baud
            </span>
          </div>
        </div>
        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-white ${
            isConnected
              ? "bg-red-600 hover:bg-red-700"
              : isConnecting
              ? "bg-yellow-500 cursor-wait"
              : "bg-green-600 hover:bg-green-700"
          } disabled:opacity-50 shadow-sm`}
        >
          {isConnected ? (
            <>
              <Unplug className="w-4 h-4" />
              Disconnect
            </>
          ) : (
            <>
              <Plug className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Connect Device"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SerialConnection;
