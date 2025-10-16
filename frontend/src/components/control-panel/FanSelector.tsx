import type { JSX } from "react";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fa1, fa2, fa3, faA } from "@fortawesome/free-solid-svg-icons";
import type { FanSpeed } from "../../features/control-panel/types";
import { cn } from "../../lib/cn";

const FAN_OPTIONS: Array<{
  id: FanSpeed;
  label: string;
  // sublabel: string;
  icon: IconDefinition;
}> = [
  {
    id: "auto",
    label: "Auto",
    // sublabel: "Automatico",
    icon: faA,
  },
  {
    id: "low",
    label: "1",
    // sublabel: "Baja",
    icon: fa1,
  },
  {
    id: "medium",
    label: "2",
    // sublabel: "Media",
    icon: fa2,
  },
  {
    id: "high",
    label: "3",
    // sublabel: "Alta",
    icon: fa3,
  },
];

type FanSelectorProps = {
  actualFanSpeed: FanSpeed;
  pendingFanSpeed: FanSpeed | null;
  controlsDisabled: boolean;
  onSelect: (fan: FanSpeed) => void;
  variant?: "card" | "section";
  className?: string;
};

export const FanSelector = ({
  actualFanSpeed,
  // pendingFanSpeed,
  controlsDisabled,
  onSelect,
  variant = "card",
  className,
}: FanSelectorProps): JSX.Element => (
  <section
    className={cn(
      "flex h-full w-full flex-col",
      variant === "card" &&
        "rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface)]/90 p-4 backdrop-blur-md sm:p-6",
      variant === "section" &&
        "rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface)] px-5 py-4 sm:px-6 sm:py-5",
      className
    )}
  >
    <header className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-[color:var(--text-primary)] mb-2">
        Velocidad
      </h2>
      {/* <p className="text-xs text-[color:var(--text-muted)]">
        Ajusta la intensidad del flujo de aire
      </p> */}
    </header>

    {/* <div className="grid gap-1 grid-cols-4"> */}
    <div className="flex flex-row justify-between gap-3 w-min ml-auto">
      {FAN_OPTIONS.map((option) => {
        const isActive = actualFanSpeed === option.id;
        // const isPending =
        //   pendingFanSpeed !== null &&
        //   pendingFanSpeed === option.id &&
        //   pendingFanSpeed !== actualFanSpeed;

        const accessibilityLabel =
          option.id === "auto"
            ? "Ventilador automatico"
            : `Velocidad ${option.label}`;

        return (
          <button
            key={option.id}
            type="button"
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-soft)]/80 text-center transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-color),0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] transform-gpu will-change-transform",
              isActive &&
                "border-[rgba(var(--accent-color),0.4)] bg-[rgba(var(--accent-color),0.12)]"
            )}
            onClick={() => onSelect(option.id)}
            aria-pressed={isActive}
            aria-label={accessibilityLabel}
            title={accessibilityLabel}
            disabled={controlsDisabled}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--accent-color),0.16)] text-[rgb(var(--accent-color))]">
              <FontAwesomeIcon
                icon={option.icon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <span className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold tracking-wide text-[color:var(--text-primary)]">
                {option.label}
              </span>
              <span className="text-xs text-[color:var(--text-muted)]">
                {/* {option.sublabel} */}
              </span>
            </span>

            {/* {isPending && (
              <span className="mt-2 rounded-full border border-[rgba(var(--accent-color),0.35)] bg-[rgba(var(--accent-color),0.18)] px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-[rgb(var(--accent-color))]">
                Pendiente
              </span>
            )} */}
          </button>
        );
      })}
    </div>
  </section>
);
