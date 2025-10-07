import type { FC } from "react";

import type { DeviceStatusDTO } from "../../api/bgh";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import {
  DEGREE_SYMBOL,
  MODE_LABELS,
} from "../../features/control-panel/constants";
import {
  formatTemperatureWithDegree,
  resolveMode,
} from "../../features/control-panel/utils";

type DeviceListProps = {
  devices: DeviceStatusDTO[];
  selectedDeviceId: number | null;
  isLoading: boolean;
  isBusy: boolean;
  onSelect: (deviceId: number) => void;
  onQuickToggle: (device: DeviceStatusDTO) => void;
};

export const DeviceList: FC<DeviceListProps> = ({
  devices,
  selectedDeviceId,
  isLoading,
  isBusy,
  onSelect,
  onQuickToggle,
}) => (
  <section className="device-panel">
    <div className="device-panel-header">
      <span>Equipos</span>
      <span className="device-count">
        {devices.length} {devices.length === 1 ? "equipo" : "equipos"}
      </span>
    </div>

    <div
      className="device-selector"
      role="tablist"
      aria-label="Seleccion de equipos"
    >
      {isLoading && <span className="device-hint">Cargando equipos...</span>}
      {!isLoading && devices.length === 0 && (
        <span className="device-hint">Sin equipos disponibles</span>
      )}

      {devices.map((device) => {
        const deviceMode = resolveMode(device.modeId ?? null);
        const isActive = device.deviceId === selectedDeviceId;
        const deviceTarget =
          device.targetTemperature !== null &&
          device.targetTemperature !== undefined
            ? Math.round(Number(device.targetTemperature))
            : null;
        const deviceCurrent =
          typeof device.temperature === "number"
            ? Number(device.temperature.toFixed(1))
            : null;

        const buttonClassName = `device-button mode-${deviceMode}${
          isActive ? " is-active" : ""
        }${deviceMode === "off" ? " is-off" : ""}`;

        return (
          <button
            key={device.deviceId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={buttonClassName}
            onClick={() => onSelect(device.deviceId)}
            disabled={isBusy && device.deviceId !== selectedDeviceId}
          >
            <div className="device-header">
              <span className="device-name">{device.deviceName}</span>

              <span
                className={`device-power-toggle${
                  deviceMode === "off" ? " is-off" : ""
                }`}
                role="button"
                tabIndex={0}
                aria-label={
                  deviceMode === "off" ? "Encender equipo" : "Apagar equipo"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onQuickToggle(device);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onQuickToggle(device);
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={faPowerOff}
                  className="device-power-icon"
                />
              </span>
            </div>

            <div className="device-status-row">
              <span className="device-badge">{MODE_LABELS[deviceMode]}</span>

              <div className="device-temperatures">
                {deviceTarget !== null && (
                  <span className="device-meta device-meta-target">
                    Temp. Deseada {deviceTarget}
                    {DEGREE_SYMBOL}C
                  </span>
                )}

                <span className="device-meta device-meta-current">
                  Temp. Actual {formatTemperatureWithDegree(deviceCurrent)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);
