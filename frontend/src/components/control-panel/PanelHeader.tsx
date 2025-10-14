import type { FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faPowerOff, faSun } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../lib/cn";

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

  const actionBaseClasses =
    "inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-soft)] text-[color:var(--text-secondary)] shadow-[0_10px_22px_rgba(31,48,94,0.08)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-color))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:opacity-60";

  return (
    <header className="grid items-start gap-4 sm:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-1.5">
        <span className="text-2xl font-semibold leading-tight text-[color:var(--text-primary)] sm:text-[28px]">
          {title}
        </span>
        {subtitle ? (
          <span className="text-sm text-[color:var(--text-secondary)]">
            {subtitle}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className={cn(
            actionBaseClasses,
            "h-10 w-10 sm:h-11 sm:w-11",
            isDarkMode &&
              "border-[rgba(60,184,120,0.45)] bg-[rgba(60,184,120,0.18)] text-[rgb(60,184,120)] hover:bg-[rgba(60,184,120,0.24)]",
          )}
          aria-pressed={isDarkMode}
          aria-label={themeLabel}
          title={themeLabel}
          onClick={onToggleTheme}
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faSun : faMoon}
            className="h-5 w-5"
          />
        </button>

        <button
          type="button"
          className={cn(
            actionBaseClasses,
            "h-12 w-12 border-[color:var(--border-soft)] text-[color:var(--text-secondary)] shadow-[0_12px_28px_rgba(31,48,94,0.08)] sm:h-12 sm:w-12",
            powerOn &&
              "border-transparent bg-[rgb(var(--accent-color))] text-white shadow-[0_16px_36px_rgba(var(--accent-color),0.3)] hover:translate-y-[-1px]",
          )}
          aria-pressed={powerOn}
          aria-label={powerLabel}
          title={powerLabel}
          onClick={onTogglePower}
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faPowerOff} className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
