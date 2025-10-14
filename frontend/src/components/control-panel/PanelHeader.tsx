import type { FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faPowerOff, faSun } from "@fortawesome/free-solid-svg-icons";

type PanelHeaderProps = {
  title: string;
  subtitle?: string;
  powerOn: boolean;
  disabled: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onTogglePower: () => void;
};

export const PanelHeader: FC<PanelHeaderProps> = ({
  title,
  subtitle,
  powerOn,
  disabled,
  theme,
  onToggleTheme,
  onTogglePower,
}) => {
  const powerLabel = powerOn ? "Apagar climatizador" : "Encender climatizador";
  const isDarkMode = theme === "dark";
  const themeLabel = isDarkMode
    ? "Activar modo claro"
    : "Activar modo oscuro";

  return (
    <header className="panel-header">
      <div className="headline">
        <span className="panel-title">{title}</span>
        {subtitle ? <span className="panel-subtitle">{subtitle}</span> : null}
      </div>

      <div className="header-actions">
        <button
          type="button"
          className={`theme-toggle${isDarkMode ? " is-dark" : ""}`}
          aria-pressed={isDarkMode}
          aria-label={themeLabel}
          title={themeLabel}
          onClick={onToggleTheme}
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faSun : faMoon}
            className="theme-icon"
          />
        </button>

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
      </div>
    </header>
  );
};
