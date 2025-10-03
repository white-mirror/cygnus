import type { FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type PanelFooterProps = {
  powerOn: boolean;
  hasPendingChanges: boolean;
  controlsDisabled: boolean;
  sendButtonSubtext: string;
  onSubmit: () => void;
};

export const PanelFooter: FC<PanelFooterProps> = ({
  powerOn,
  hasPendingChanges,
  controlsDisabled,
  sendButtonSubtext,
  onSubmit,
}) => {
  const sendButtonClassName = hasPendingChanges
    ? "send-command has-pending"
    : "send-command";

  return (
    <footer className="panel-footer">
      <div className={`indicator-chip${powerOn ? "" : " is-idle"}`}>
        <span className="chip-dot" />
        <span>{powerOn ? "Climatizando" : "En espera"}</span>
      </div>

      {hasPendingChanges && (
        <button
          type="button"
          className={sendButtonClassName}
          onClick={onSubmit}
          disabled={controlsDisabled || !hasPendingChanges}
        >
          <FontAwesomeIcon icon={faCheck} className="send-icon" />

          <span className="send-label-group">
            <span className="send-label">Enviar cambios</span>
            <span className="send-subtext">{sendButtonSubtext}</span>
          </span>
        </button>
      )}
    </footer>
  );
};
