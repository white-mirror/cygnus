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
    <article className="control-card mode-selector-card" style={selectorStyle}>
      <div className="control-card-header">
        <h2>Modo de Operacion</h2>
        <span>Selecciona la forma de climatizar</span>
      </div>

      <div className="control-options">
        {MODE_OPTIONS.map((option) => {
          const isActive = activeMode === option.id;
          const optionStyle = {
            "--option-accent": ACCENT_BY_MODE[option.id],
          } as CSSProperties;

          return (
            <button
              key={option.id}
              type="button"
              className={`mode-option${isActive ? " is-active" : ""}`}
              style={optionStyle}
              onClick={() => onSelect(option.id)}
              aria-pressed={isActive}
              disabled={controlsDisabled}
            >
              <span className="mode-icon">
                <FontAwesomeIcon icon={option.icon} className="control-icon" />
              </span>

              <span className="mode-copy">
                <span className="mode-label">{option.label}</span>
                <span className="mode-description">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
};
