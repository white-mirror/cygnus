import type { CSSProperties, FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type PanelFooterProps = {
  hasPendingChanges: boolean;
  controlsDisabled: boolean;
  confirmAccent: string;
  onSubmit: () => void;
};

export const PanelFooter: FC<PanelFooterProps> = ({
  hasPendingChanges,
  controlsDisabled,
  confirmAccent,
  onSubmit,
}) => {
  const footerClassName = hasPendingChanges
    ? "panel-footer has-pending"
    : "panel-footer";

  const sendButtonClassName = hasPendingChanges
    ? "send-command has-pending"
    : "send-command";

  const accentStyle = {
    "--confirm-accent": confirmAccent,
  } as CSSProperties;

  return (
    <footer
      className={footerClassName}
      data-state={hasPendingChanges ? "visible" : "hidden"}
      style={accentStyle}
    >
      <div
        className={`confirm-action${hasPendingChanges ? " has-pending" : ""}`}
      >
        <button
          type="button"
          className={sendButtonClassName}
          onClick={onSubmit}
          disabled={controlsDisabled || !hasPendingChanges}
          tabIndex={hasPendingChanges ? 0 : -1}
          aria-hidden={!hasPendingChanges}
        >
          <FontAwesomeIcon icon={faCheck} className="send-icon" />

          <span className="send-label">Confirmar</span>
        </button>
      </div>
    </footer>
  );
};
