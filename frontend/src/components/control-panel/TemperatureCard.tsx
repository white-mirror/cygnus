import type { ChangeEvent, FC } from "react";

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

  return (
    <section className="temperature-card">
      <div className="temperature-meta">
        <div className="temperature-current">
          <span className="temperature-label">Temperatura actual</span>
          <span className="temperature-value">{currentLabel}</span>
        </div>

        <div className="temperature-trend">{temperatureTrend}</div>
      </div>

      <div
        className="setpoint-control"
        role="group"
        aria-label="Ajuste de temperatura deseada"
      >
        <button
          type="button"
          className="temp-step"
          onClick={onDecrease}
          aria-label="Disminuir temperatura"
          disabled={controlsDisabled}
        >
          &minus;
        </button>

        <div className="setpoint-display">
          <span className="setpoint-label">Temp. Deseada</span>

          <div className="setpoint-value">
            <span className="setpoint-number">{targetLabel}</span>
            <span className="setpoint-degree">{DEGREE_SYMBOL}C</span>
          </div>
        </div>

        <button
          type="button"
          className="temp-step"
          onClick={onIncrease}
          aria-label="Aumentar temperatura"
          disabled={controlsDisabled}
        >
          +
        </button>
      </div>

      <input
        type="range"
        className="temperature-slider"
        min={TEMPERATURE_MIN}
        max={TEMPERATURE_MAX}
        step={TEMPERATURE_STEP}
        value={sliderValue}
        onChange={handleInput}
        aria-label="Temperatura deseada"
        disabled={controlsDisabled}
      />
    </section>
  );
};
