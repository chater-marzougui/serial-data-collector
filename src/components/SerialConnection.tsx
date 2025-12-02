import { Plug, Unplug } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context";

export function SerialConnection() {
  const { t } = useTranslation();
  const { connectionStatus, connect, disconnect, isSerialSupported, config } =
    useApp();

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  if (!isSerialSupported) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2 text-red-800 dark:text-red-200">
          {t("connection.notSupported.title")}
        </h2>
        <p className="text-sm text-red-600 dark:text-red-300">
          {t("connection.notSupported.message")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
            <span className="font-semibold block text-gray-900 dark:text-white">
              {isConnected
                ? t("connection.status.connected")
                : isConnecting
                ? t("connection.status.connecting")
                : t("connection.status.disconnected")}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("connection.baud", { rate: config.serial.baudRate })}
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
              {t("connection.disconnect")}
            </>
          ) : (
            <>
              <Plug className="w-4 h-4" />
              {isConnecting ? t("connection.status.connecting") : t("connection.connect")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SerialConnection;
