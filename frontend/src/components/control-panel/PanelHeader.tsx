import type { FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

type PanelHeaderProps = {
  title: string;
  subtitle?: string;
  powerOn: boolean;
  disabled: boolean;
  onTogglePower: () => void;
};

export const PanelHeader: FC<PanelHeaderProps> = ({
  title,
  subtitle,
  powerOn,
  disabled,
  onTogglePower,
}) => {
  const powerLabel = powerOn ? "Apagar climatizador" : "Encender climatizador";

  return (
    <header className="panel-header">
      <div className="headline">
        <span className="panel-title">{title}</span>
        {subtitle ? <span className="panel-subtitle">{subtitle}</span> : null}
      </div>

      <button
        type="button"
        className={`power-toggle${powerOn ? " is-on" : ""}`}
        aria-pressed={powerOn}
        aria-label={powerLabel}
        title={powerLabel}
        onClick={onTogglePower}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faPowerOff} className="power-icon" />
      </button>
    </header>
  );
};
