import type { JSX } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFan } from "@fortawesome/free-solid-svg-icons";
import type { FanSpeed } from "../../features/control-panel/types";

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
  <article className="control-card">
    <div className="control-card-header">
      <h2>Velocidad del Ventilador</h2>
      <span>Configura la velocidad del ventilador</span>
    </div>

    <div className="fan-buttons">
      {FAN_OPTIONS.map((option) => {
        const isActive = actualFanSpeed === option.id;
        const isPending =
          pendingFanSpeed !== null &&
          pendingFanSpeed === option.id &&
          pendingFanSpeed !== actualFanSpeed;
        const buttonClassName = `fan-option${isActive ? " is-active" : ""}${
          isPending ? " is-pending" : ""
        }`;

        return (
          <button
            key={option.id}
            type="button"
            className={buttonClassName}
            onClick={() => onSelect(option.id)}
            aria-pressed={isActive}
            disabled={controlsDisabled}
          >
            <span className="fan-icon">
              <FontAwesomeIcon icon={faFan} className="control-icon" />
            </span>

            <span className="fan-copy">
              <span className="fan-label">{option.label}</span>
              <span className="fan-description">{option.description}</span>
            </span>

            {isPending && <span className="fan-pending">Pendiente</span>}
          </button>
        );
      })}
    </div>
  </article>
);
