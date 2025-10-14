import type { CSSProperties, JSX } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsRotate,
  faFire,
  faSnowflake,
} from "@fortawesome/free-solid-svg-icons";
import { ACCENT_BY_MODE } from "../../features/control-panel/constants";
import type { Mode } from "../../features/control-panel/types";
import { cn } from "../../lib/cn";

const MODE_OPTIONS: Array<{
  id: Exclude<Mode, "off">;
  label: string;
  description: string;
  icon: IconDefinition;
}> = [
  {
    id: "cool",
    label: "Frio",
    description: "Reduce la temperatura con flujo fresco",
    icon: faSnowflake,
  },
  {
    id: "heat",
    label: "Calor",
    description: "Aumenta la temperatura de forma gradual",
    icon: faFire,
  },
  {
    id: "auto",
    label: "Auto",
    description: "El equipo mantiene el clima automaticamente",
    icon: faArrowsRotate,
  },
];

type ModeSelectorProps = {
  activeMode: Mode | null;
  controlsDisabled: boolean;
  accentPreview: string;
  onSelect: (mode: Exclude<Mode, "off">) => void;
};

export const ModeSelector = ({
  activeMode,
  controlsDisabled,
  accentPreview,
  onSelect,
}: ModeSelectorProps): JSX.Element => {
  const selectorStyle = {
    "--selector-accent": accentPreview,
  } as CSSProperties;

  return (
    <article
      className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface)]/90 p-4 shadow-[0_16px_36px_rgba(31,48,94,0.12)] backdrop-blur-md sm:p-6"
      style={selectorStyle}
    >
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Modo de Operacion
        </h2>
        <span className="text-sm text-[color:var(--text-muted)]">
          Selecciona la forma de climatizar
        </span>
      </div>

      <div className="grid gap-3">
        {MODE_OPTIONS.map((option) => {
          const isActive = activeMode === option.id;
          const optionStyle = {
            "--mode-accent": ACCENT_BY_MODE[option.id],
          } as CSSProperties;

          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-soft)]/80 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(31,48,94,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--mode-accent),0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
                isActive &&
                  "border-[rgba(var(--mode-accent),0.45)] bg-[rgba(var(--mode-accent),0.14)] shadow-[0_24px_56px_rgba(var(--mode-accent),0.26)]",
              )}
              style={optionStyle}
              onClick={() => onSelect(option.id)}
              aria-pressed={isActive}
              disabled={controlsDisabled}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--mode-accent),0.18)] text-[rgb(var(--mode-accent))]">
                <FontAwesomeIcon icon={option.icon} className="h-5 w-5" />
              </span>

              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">
                  {option.label}
                </span>
                <span className="text-sm text-[color:var(--text-muted)]">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}

        <p className="rounded-2xl border border-dashed border-[color:var(--border-soft)] bg-[rgba(var(--selector-accent),0.06)] px-4 py-3 text-sm text-[color:var(--text-muted)]">
          Cambiar a “Apagado” se mantiene en los controles principales.
        </p>
      </div>
    </article>
  );
};
