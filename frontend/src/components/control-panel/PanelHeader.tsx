import type { FC } from "react";

import { PowerIcon } from "../icons/ClimateIcons";

type PanelHeaderProps = {
  title: string;
  subtitle: string;
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
}) => (
  <header className="panel-header">
    <div className="headline">
      <span className="panel-title">{title}</span>
      <span className="panel-subtitle">{subtitle}</span>
    </div>

    <button
      type="button"
      className={`power-toggle${powerOn ? " is-on" : ""}`}
      aria-pressed={powerOn}
      onClick={onTogglePower}
      disabled={disabled}
    >
      <PowerIcon className="power-icon" />
      <span className="power-state">{powerOn ? "Encendido" : "Apagado"}</span>
    </button>
  </header>
);
