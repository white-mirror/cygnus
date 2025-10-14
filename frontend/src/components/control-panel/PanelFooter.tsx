import type { CSSProperties, FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../lib/cn";

type PanelFooterProps = {
  hasPendingChanges: boolean;
  controlsDisabled: boolean;
  confirmAccent: string;
  accentColor: string;
  onSubmit: () => void;
};

export const PanelFooter: FC<PanelFooterProps> = ({
  hasPendingChanges,
  controlsDisabled,
  confirmAccent,
  accentColor,
  onSubmit,
}) => {
  const accentStyle = {
    "--confirm-accent": confirmAccent,
    "--accent-color": accentColor,
  } as CSSProperties;

  return (
    <footer
      className={cn(
        "relative mt-auto flex justify-end border-t border-[color:var(--border-soft)] bg-[var(--surface-soft)]/80 px-6 py-5 backdrop-blur-sm transition-all duration-300 md:px-8",
        hasPendingChanges
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
      style={accentStyle}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(var(--confirm-accent))] focus-visible:ring-offset-[var(--surface-soft)]",
            hasPendingChanges
              ? "bg-[rgb(var(--confirm-accent))] shadow-[0_14px_32px_rgba(var(--confirm-accent),0.35)] hover:brightness-105"
              : "bg-[rgba(var(--confirm-accent),0.45)] shadow-none",
          )}
          onClick={onSubmit}
          disabled={controlsDisabled || !hasPendingChanges}
          tabIndex={hasPendingChanges ? 0 : -1}
          aria-hidden={!hasPendingChanges}
        >
          <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
          <span>Confirmar</span>
        </button>
      </div>
    </footer>
  );
};
