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
    <section className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-soft)]/80 p-4 shadow-[0_10px_26px_rgba(31,48,94,0.12)] backdrop-blur-sm">
      <div className="mb-2 text-sm font-medium text-[color:var(--text-secondary)]">
        Seleccionar hogar
      </div>

      <div className="relative">
        <select
          id="home-select"
          className="w-full appearance-none rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-base font-medium text-[color:var(--text-primary)] shadow-[0_6px_16px_rgba(31,48,94,0.08)] outline-none transition focus:border-[rgb(var(--accent-color))] focus:ring-2 focus:ring-[rgba(var(--accent-color),0.2)]"
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

        <span
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg text-[color:var(--text-muted)]"
          aria-hidden="true"
        >
          &#9662;
        </span>
      </div>
    </section>
  );
};
