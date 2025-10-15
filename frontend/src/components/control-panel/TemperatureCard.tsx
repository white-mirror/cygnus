import type { ChangeEvent, CSSProperties, FC } from "react";

import {
  DEGREE_SYMBOL,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_STEP,
} from "../../features/control-panel/constants";

type TemperatureCardProps = {
  currentLabel: string;
  targetLabel: string;
  temperatureValue: number | null;
  controlsDisabled: boolean;
  temperatureTrend: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange: (value: number) => void;
};

export const TemperatureCard: FC<TemperatureCardProps> = ({
  currentLabel,
  targetLabel,
  temperatureValue,
  controlsDisabled,
  temperatureTrend,
  onIncrease,
  onDecrease,
  onChange,
}) => {
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    onChange(nextValue);
  };

  const sliderValue = temperatureValue ?? TEMPERATURE_MIN;

  const sliderStyle = {
    accentColor: `rgb(var(--accent-color))`,
  } as CSSProperties;

  return (
    <section className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface)]/85 p-4 backdrop-blur-md sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
            Temperatura actual
          </span>
          <span className="text-3xl font-semibold text-[color:var(--text-primary)]">
            {currentLabel}
          </span>
        </div>

        <div className="rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-soft)]/80 px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)]">
          {temperatureTrend}
        </div>
      </div>

      <div
        className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--accent-color),0.2)] bg-[rgba(var(--accent-color),0.08)] px-4 py-3 text-[color:var(--text-primary)]"
        role="group"
        aria-label="Ajuste de temperatura deseada"
      >
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(var(--accent-color),0.3)] bg-white text-lg font-semibold text-[rgb(var(--accent-color))] transition hover:bg-[rgba(var(--accent-color),0.12)] disabled:opacity-40"
          onClick={onDecrease}
          aria-label="Disminuir temperatura"
          disabled={controlsDisabled}
        >
          &minus;
        </button>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
            Temp. Deseada
          </span>

          <div className="flex items-baseline gap-1 text-[color:var(--text-primary)]">
            <span className="text-4xl font-semibold leading-none">
              {targetLabel}
            </span>
            <span className="text-base font-medium">
              {DEGREE_SYMBOL}C
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(var(--accent-color),0.3)] bg-white text-lg font-semibold text-[rgb(var(--accent-color))] transition hover:bg-[rgba(var(--accent-color),0.12)] disabled:opacity-40"
          onClick={onIncrease}
          aria-label="Aumentar temperatura"
          disabled={controlsDisabled}
        >
          +
        </button>
      </div>

      <input
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(var(--accent-color),0.18)]"
        min={TEMPERATURE_MIN}
        max={TEMPERATURE_MAX}
        step={TEMPERATURE_STEP}
        value={sliderValue}
        onChange={handleInput}
        aria-label="Temperatura deseada"
        disabled={controlsDisabled}
        style={sliderStyle}
      />
    </section>
  );
};
