import type { FC } from "react";

import type { FanSpeed } from "../../features/control-panel/types";
import { FanIcon } from "../icons/ClimateIcons";

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
  activeFanSpeed: FanSpeed | null;
  controlsDisabled: boolean;
  onSelect: (fan: FanSpeed) => void;
};

export const FanSelector: FC<FanSelectorProps> = ({
  activeFanSpeed,
  controlsDisabled,
  onSelect,
}) => (
  <article className="control-card">
    <div className="control-card-header">
      <h2>Velocidad del Ventilador</h2>
      <span>Configura la velocidad del ventilador</span>
    </div>

    <div className="fan-buttons">
      {FAN_OPTIONS.map((option) => {
        const isActive = activeFanSpeed === option.id;

        return (
          <button
            key={option.id}
            type="button"
            className={`fan-option${isActive ? " is-active" : ""}`}
            onClick={() => onSelect(option.id)}
            aria-pressed={isActive}
            disabled={controlsDisabled}
          >
            <span className="fan-icon">
              <FanIcon className="control-icon" />
            </span>

            <span className="fan-copy">
              <span className="fan-label">{option.label}</span>
              <span className="fan-description">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  </article>
);
