import type { JSX } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFan } from "@fortawesome/free-solid-svg-icons";
import type { FanSpeed } from "../../features/control-panel/types";
import { cn } from "../../lib/cn";

const FAN_OPTIONS: Array<{
  id: FanSpeed;
  label: string;
  description: string;
}> = [
  {
    id: "auto",
    label: "Auto",
    description: "El equipo ajusta la velocidad",
  },
  {
    id: "low",
    label: "Baja",
    description: "Brisa suave y silenciosa",
  },
  {
    id: "medium",
    label: "Media",
    description: "Equilibrio entre silencio y flujo",
  },
  {
    id: "high",
    label: "Alta",
    description: "Flujo maximo para cambios rapidos",
  },
];

type FanSelectorProps = {
  actualFanSpeed: FanSpeed;
  pendingFanSpeed: FanSpeed | null;
  controlsDisabled: boolean;
  onSelect: (fan: FanSpeed) => void;
};

export const FanSelector = ({
  actualFanSpeed,
  pendingFanSpeed,
  controlsDisabled,
  onSelect,
}: FanSelectorProps): JSX.Element => (
  <article className="flex h-full w-full flex-col rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface)]/90 p-4 backdrop-blur-md sm:p-6">
    <div className="mb-4 flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
        Velocidad del Ventilador
      </h2>
      <span className="text-sm text-[color:var(--text-muted)]">
        Configura la velocidad del ventilador
      </span>
    </div>

    <div className="grid gap-3">
      {FAN_OPTIONS.map((option) => {
        const isActive = actualFanSpeed === option.id;
        const isPending =
          pendingFanSpeed !== null &&
          pendingFanSpeed === option.id &&
          pendingFanSpeed !== actualFanSpeed;

        return (
          <button
            key={option.id}
            type="button"
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-soft)]/80 p-4 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-color),0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] transform-gpu will-change-transform",
              isActive &&
                "border-[rgba(var(--accent-color),0.4)] bg-[rgba(var(--accent-color),0.12)]",
            )}
            onClick={() => onSelect(option.id)}
            aria-pressed={isActive}
            disabled={controlsDisabled}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--accent-color),0.16)] text-[rgb(var(--accent-color))]">
              <FontAwesomeIcon icon={faFan} className="h-5 w-5" />
            </span>

            <span className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-semibold text-[color:var(--text-primary)]">
                {option.label}
              </span>
              <span className="text-sm text-[color:var(--text-muted)]">
                {option.description}
              </span>
            </span>

            {isPending && (
              <span className="rounded-full border border-[rgba(var(--accent-color),0.35)] bg-[rgba(var(--accent-color),0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent-color))]">
                Pendiente
              </span>
            )}
          </button>
        );
      })}
    </div>
  </article>
);
