import type { FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type PanelFooterProps = {
  powerOn: boolean;
  hasPendingChanges: boolean;
  controlsDisabled: boolean;
  onSubmit: () => void;
};

export const PanelFooter: FC<PanelFooterProps> = ({
  powerOn,
  hasPendingChanges,
  controlsDisabled,
  onSubmit,
}) => {
  const sendButtonClassName = hasPendingChanges
    ? "send-command has-pending"
    : "send-command";

  const footerClassName = hasPendingChanges
    ? "panel-footer has-pending"
    : "panel-footer";

  return (
    <footer className={footerClassName}>
      <div className={`indicator-chip${powerOn ? "" : " is-idle"}`}>
        <span className="chip-dot" />
        <span>{powerOn ? "Climatizando" : "En espera"}</span>
      </div>

      <div
        className={`confirm-action${hasPendingChanges ? " has-pending" : ""}`}
      >
        {hasPendingChanges && (
          <button
            type="button"
            className={sendButtonClassName}
            onClick={onSubmit}
            disabled={controlsDisabled || !hasPendingChanges}
          >
            <FontAwesomeIcon icon={faCheck} className="send-icon" />

            <span className="send-label">Confirmar</span>
          </button>
        )}
      </div>
    </footer>
  );
};
