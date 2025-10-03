import type { ChangeEvent, FC } from "react";

import type { HomeSummary } from "../../api/bgh";
import { formatHomeName } from "../../features/control-panel/utils";

type HomeSelectorProps = {
  homes: HomeSummary[];
  selectedHomeId: number | null;
  disabled: boolean;
  onSelect: (homeId: number | null) => void;
};

export const HomeSelector: FC<HomeSelectorProps> = ({
  homes,
  selectedHomeId,
  disabled,
  onSelect,
}) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const nextHomeId = value === "" ? null : Number(value);
    onSelect(Number.isFinite(nextHomeId ?? NaN) ? nextHomeId : null);
  };

  return (
    <section className="home-frame">
      <span className="home-frame-label">Home</span>

      <div className="selector-wrapper">
        <select
          id="home-select"
          className="selector-control"
          value={selectedHomeId ?? ""}
          onChange={handleChange}
          disabled={disabled || homes.length === 0}
        >
          {homes.map((home) => (
            <option key={home.HomeID} value={home.HomeID}>
              {formatHomeName(home)}
            </option>
          ))}
        </select>

        <span className="selector-icon" aria-hidden="true">
          &#9662;
        </span>
      </div>
    </section>
  );
};
