import type { CSSProperties, FC } from "react";

import type { DeviceStatusDTO } from "../../api/bgh";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import {
  ACCENT_BY_MODE,
  ACCENT_OFF,
  DEGREE_SYMBOL,
  MODE_LABELS,
} from "../../features/control-panel/constants";
import type { Mode } from "../../features/control-panel/types";
import { formatTemperatureWithDegree, resolveMode } from "../../features/control-panel/utils";
import { cn } from "../../lib/cn";

type DeviceListProps = {
  devices: DeviceStatusDTO[];
  selectedDeviceId: number | null;
  isLoading: boolean;
  isBusy: boolean;
  onSelect: (deviceId: number) => void;
  onQuickToggle: (device: DeviceStatusDTO) => void;
};

const resolveAccent = (mode: Mode): string => {
  if (mode === "off") {
    return ACCENT_OFF;
  }

  return ACCENT_BY_MODE[mode as Exclude<Mode, "off">];
};

export const DeviceList: FC<DeviceListProps> = ({
  devices,
  selectedDeviceId,
  isLoading,
  isBusy,
  onSelect,
  onQuickToggle,
}) => (
  <section className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-soft)]/70 p-4 shadow-[0_16px_36px_rgba(31,48,94,0.1)] backdrop-blur-md sm:p-6">
    <div className="mb-4 flex items-baseline justify-between gap-2 text-sm">
      <span className="font-semibold text-[color:var(--text-primary)]">
        Equipos
      </span>
      <span className="text-[color:var(--text-muted)]">
        {devices.length} {devices.length === 1 ? "equipo" : "equipos"}
      </span>
    </div>

    <div className="grid gap-3">
      {isLoading && (
        <span className="rounded-2xl border border-dashed border-[color:var(--border-soft)] bg-[var(--surface)] py-6 text-center text-sm text-[color:var(--text-muted)]">
          Cargando equipos...
        </span>
      )}

      {!isLoading && devices.length === 0 && (
        <span className="rounded-2xl border border-dashed border-[color:var(--border-soft)] bg-[var(--surface)] py-6 text-center text-sm text-[color:var(--text-muted)]">
          Sin equipos disponibles
        </span>
      )}

      {devices.map((device) => {
        const deviceMode = resolveMode(device.modeId ?? null);
        const accent = resolveAccent(deviceMode);
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

        const buttonClasses = cn(
          "group relative flex w-full flex-col gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface)]/95 p-4 text-left shadow-[0_8px_22px_rgba(31,48,94,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(31,48,94,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--device-accent),0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-soft)]",
          isActive &&
            "border-[rgba(var(--device-accent),0.45)] bg-[rgba(var(--device-accent),0.12)] shadow-[0_22px_52px_rgba(var(--device-accent),0.28)]",
          deviceMode === "off" &&
            !isActive &&
            "bg-[rgba(84,101,128,0.08)] text-[color:var(--text-secondary)]",
        );

        const buttonStyle = {
          "--device-accent": accent,
        } as CSSProperties;

        return (
          <button
            key={device.deviceId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={buttonClasses}
            style={buttonStyle}
            onClick={() => onSelect(device.deviceId)}
            disabled={isBusy && device.deviceId !== selectedDeviceId}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                {device.deviceName}
              </span>

              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-[rgba(var(--device-accent),0.12)] text-[rgb(var(--device-accent))] transition",
                  deviceMode === "off" &&
                    "bg-[rgba(84,101,128,0.18)] text-[rgb(84,101,128)]",
                )}
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
                  className="h-4 w-4"
                />
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--device-accent),0.4)] bg-[rgba(var(--device-accent),0.14)] px-3 py-1 font-medium text-[rgb(var(--device-accent))]">
                {MODE_LABELS[deviceMode]}
              </span>

              <div className="flex flex-col items-end gap-1 text-xs text-[color:var(--text-muted)] sm:flex-row sm:items-center sm:gap-4">
                {deviceTarget !== null && (
                  <span className="font-medium text-[color:var(--text-secondary)]">
                    Temp. Deseada {deviceTarget}
                    {DEGREE_SYMBOL}C
                  </span>
                )}

                <span>
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
