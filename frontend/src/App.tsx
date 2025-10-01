import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
  type KeyboardEvent,
  type CSSProperties,
  type JSX,
} from "react";
import "./App.css";

type FanSpeed = "auto" | "low" | "medium" | "high";

type Mode = "cool" | "dry" | "fan";

interface AirUnit {
  id: string;
  name: string;
  room: string;
  temperature: number;
  fanSpeed: FanSpeed;
  power: boolean;
  mode: Mode;
}

interface ControlState {
  temperature: number;
  fanSpeed: FanSpeed;
  power: boolean;
}

const TEMPERATURE_MIN = 16;
const TEMPERATURE_MAX = 30;
const MIN_KNOB_ANGLE = -135;
const MAX_KNOB_ANGLE = 135;

const FAN_SPEED_LABELS: Record<FanSpeed, string> = {
  auto: "Auto",
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const FAN_ANIMATION_DURATION: Record<FanSpeed, number> = {
  auto: 1.1,
  low: 1.8,
  medium: 1.2,
  high: 0.8,
};

const initialUnits: AirUnit[] = [
  {
    id: "living-1",
    name: "Living Principal",
    room: "Living",
    temperature: 23,
    fanSpeed: "auto",
    power: true,
    mode: "cool",
  },
  {
    id: "studio-1",
    name: "Estudio",
    room: "Oficina",
    temperature: 24,
    fanSpeed: "medium",
    power: false,
    mode: "cool",
  },
  {
    id: "bedroom-1",
    name: "Dormitorio Norte",
    room: "Dormitorio",
    temperature: 22,
    fanSpeed: "low",
    power: true,
    mode: "dry",
  },
  {
    id: "bedroom-2",
    name: "Dormitorio Sur",
    room: "Dormitorio",
    temperature: 25,
    fanSpeed: "high",
    power: true,
    mode: "cool",
  },
];

function clampTemperature(value: number): number {
  return Math.min(
    Math.max(Math.round(value), TEMPERATURE_MIN),
    TEMPERATURE_MAX,
  );
}

function deriveControlState(units: AirUnit[]): ControlState {
  if (units.length === 0) {
    return { temperature: 24, fanSpeed: "auto", power: false };
  }

  const averageTemperature =
    units.reduce((total, unit) => total + unit.temperature, 0) / units.length;

  return {
    temperature: clampTemperature(averageTemperature),
    fanSpeed: units[0].fanSpeed,
    power: units.every((unit) => unit.power),
  };
}

function getKnobAngle(temperature: number): number {
  const ratio =
    (clampTemperature(temperature) - TEMPERATURE_MIN) /
    (TEMPERATURE_MAX - TEMPERATURE_MIN);
  return MIN_KNOB_ANGLE + ratio * (MAX_KNOB_ANGLE - MIN_KNOB_ANGLE);
}

function getMixedFlags(units: AirUnit[]) {
  if (units.length === 0) {
    return { temperatureMixed: false, fanSpeedMixed: false, powerMixed: false };
  }

  const [first, ...rest] = units;

  const temperatureMixed = rest.some(
    (unit) => unit.temperature !== first.temperature,
  );
  const fanSpeedMixed = rest.some((unit) => unit.fanSpeed !== first.fanSpeed);
  const powerMixed = !units.every((unit) => unit.power === first.power);

  return { temperatureMixed, fanSpeedMixed, powerMixed };
}

function angleToTemperature(angle: number): number {
  const clampedAngle = Math.min(
    Math.max(angle, MIN_KNOB_ANGLE),
    MAX_KNOB_ANGLE,
  );
  const ratio =
    (clampedAngle - MIN_KNOB_ANGLE) / (MAX_KNOB_ANGLE - MIN_KNOB_ANGLE);
  const temperature =
    TEMPERATURE_MIN + ratio * (TEMPERATURE_MAX - TEMPERATURE_MIN);
  return clampTemperature(temperature);
}

function App(): JSX.Element {
  const [units, setUnits] = useState<AirUnit[]>(initialUnits);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialUnits.map((unit) => unit.id),
  );
  const [controlState, setControlState] = useState<ControlState>(() =>
    deriveControlState(initialUnits),
  );
  const [lastCommand, setLastCommand] = useState<string>("");
  const [isKnobActive, setIsKnobActive] = useState(false);
  const knobRef = useRef<HTMLDivElement | null>(null);

  const selectedUnits = useMemo(
    () => units.filter((unit) => selectedIds.includes(unit.id)),
    [units, selectedIds],
  );

  const { temperatureMixed, fanSpeedMixed, powerMixed } = useMemo(
    () => getMixedFlags(selectedUnits),
    [selectedUnits],
  );

  useEffect(() => {
    setControlState(deriveControlState(selectedUnits));
  }, [selectedUnits]);

  const toggleUnitSelection = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((unitId) => unitId !== id);
      }

      return [...current, id];
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === units.length ? [] : units.map((unit) => unit.id),
    );
  };

  const handleTemperatureChange = (value: number) => {
    setControlState((current) => ({
      ...current,
      temperature: clampTemperature(value),
    }));
  };

  const handleTemperatureInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleTemperatureChange(Number(event.target.value));
  };

  const handleArrowAdjust = (delta: number) => {
    handleTemperatureChange(controlState.temperature + delta);
  };

  const handleKnobPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!isKnobActive || !knobRef.current) {
      return;
    }

    const { left, top, width, height } =
      knobRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const radians = Math.atan2(
      centerY - event.clientY,
      event.clientX - centerX,
    );
    const degrees = (radians * 180) / Math.PI;
    const constrainedDegrees = Math.max(
      Math.min(degrees, MAX_KNOB_ANGLE),
      MIN_KNOB_ANGLE,
    );
    handleTemperatureChange(angleToTemperature(constrainedDegrees));
  };

  const handleKnobPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!selectedUnits.length) {
      return;
    }

    setIsKnobActive(true);
    knobRef.current?.setPointerCapture(event.pointerId);
    handleKnobPointer(event);
  };

  const handleKnobPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setIsKnobActive(false);
    knobRef.current?.releasePointerCapture(event.pointerId);
  };

  const handleKnobKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedUnits.length) {
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      handleArrowAdjust(-1);
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      handleArrowAdjust(1);
    }
  };

  const handlePowerToggle = () => {
    if (!selectedUnits.length) {
      return;
    }

    setControlState((current) => ({
      ...current,
      power: !current.power,
    }));
  };

  const handleFanChange = (fanSpeed: FanSpeed) => {
    if (!selectedUnits.length) {
      return;
    }

    setControlState((current) => ({
      ...current,
      fanSpeed,
    }));
  };

  const handleSendCommand = () => {
    if (!selectedUnits.length) {
      setLastCommand("Seleccioná al menos un equipo para enviar la señal.");
      return;
    }

    setUnits((current) =>
      current.map((unit) =>
        selectedIds.includes(unit.id)
          ? {
              ...unit,
              temperature: controlState.temperature,
              fanSpeed: controlState.fanSpeed,
              power: controlState.power,
            }
          : unit,
      ),
    );

    const timestamp = new Date().toLocaleTimeString();
    setLastCommand(
      `Señal enviada a ${selectedIds.length} aire(s) a las ${timestamp}.`,
    );
  };

  const knobAngle = getKnobAngle(controlState.temperature);
  const knobStyle = {
    "--rotation-angle": `${knobAngle}deg`,
  } as CSSProperties;

  const fanAnimationDuration = `${FAN_ANIMATION_DURATION[controlState.fanSpeed]}s`;

  const selectionSummary = selectedUnits.map((unit) => unit.name).join(" · ");

  const controlsDisabled = selectedUnits.length === 0;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Panel Multizona</p>
          <h1>Controlá tus aires BGH en simultáneo</h1>
          <p className="subtitle">
            Agrupá cualquier combinación de equipos y enviá la misma señal una
            única vez.
          </p>
        </div>
        <button className="select-all" onClick={toggleSelectAll} type="button">
          {selectedIds.length === units.length
            ? "Quitar selección"
            : "Seleccionar todos"}
        </button>
      </header>

      <section className="content">
        <aside className="unit-list">
          <h2>Tus equipos</h2>
          <ul>
            {units.map((unit) => {
              const isSelected = selectedIds.includes(unit.id);

              return (
                <li key={unit.id}>
                  <label className={isSelected ? "selected" : undefined}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUnitSelection(unit.id)}
                    />
                    <span>
                      <strong>{unit.name}</strong>
                      <small>{unit.room}</small>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="control-panel">
          <div className="control-card">
            <div className="control-card-header">
              <div>
                <h2>Señal unificada</h2>
                <p className="selection-summary">
                  {selectedUnits.length
                    ? selectionSummary || "Seleccionaste múltiples equipos"
                    : "Seleccioná uno o más equipos"}
                </p>
              </div>
              {lastCommand && (
                <span className="command-status">{lastCommand}</span>
              )}
            </div>

            <div className="temperature-control">
              <div
                className={`temperature-knob${controlsDisabled ? " is-disabled" : ""}`}
                ref={knobRef}
                role="slider"
                aria-valuemin={TEMPERATURE_MIN}
                aria-valuemax={TEMPERATURE_MAX}
                aria-valuenow={controlState.temperature}
                aria-label="Temperatura objetivo"
                tabIndex={0}
                onPointerDown={handleKnobPointerDown}
                onPointerMove={handleKnobPointer}
                onPointerUp={handleKnobPointerUp}
                onPointerCancel={handleKnobPointerUp}
                style={knobStyle}
                onKeyDown={handleKnobKeyDown}
              >
                <button
                  type="button"
                  className={`power-toggle${controlState.power ? " is-on" : ""}`}
                  onClick={handlePowerToggle}
                  disabled={controlsDisabled}
                >
                  {controlState.power ? "ENCENDIDO" : "APAGADO"}
                </button>
                <div className="temperature-readout">
                  <span className="temperature-value">
                    {controlState.temperature.toString().padStart(2, "0")}
                  </span>
                  <span className="temperature-unit">°C</span>
                </div>
              </div>

              <div className="temperature-actions">
                <button
                  type="button"
                  className="temperature-arrow decrease"
                  onClick={() => handleArrowAdjust(-1)}
                  disabled={controlsDisabled}
                  aria-label="Bajar temperatura"
                />

                <input
                  type="range"
                  min={TEMPERATURE_MIN}
                  max={TEMPERATURE_MAX}
                  value={controlState.temperature}
                  onChange={handleTemperatureInput}
                  disabled={controlsDisabled}
                  className="temperature-slider"
                />

                <button
                  type="button"
                  className="temperature-arrow increase"
                  onClick={() => handleArrowAdjust(1)}
                  disabled={controlsDisabled}
                  aria-label="Subir temperatura"
                />
              </div>

              <div className="control-hints">
                {temperatureMixed && (
                  <span>
                    Temperaturas originales distintas. Se usó el promedio.
                  </span>
                )}
                {powerMixed && (
                  <span>Los estados de encendido eran mixtos.</span>
                )}
                {fanSpeedMixed && (
                  <span>Los ventiladores tenían velocidades distintas.</span>
                )}
              </div>
            </div>

            <div className="fan-control">
              <div
                className="fan-visual"
                style={{ animationDuration: fanAnimationDuration }}
              >
                <span className="blade blade-a" />
                <span className="blade blade-b" />
                <span className="blade blade-c" />
              </div>

              <div className="fan-options">
                <p>Velocidad del ventilador</p>
                <div className="fan-buttons">
                  {Object.entries(FAN_SPEED_LABELS).map(([speed, label]) => (
                    <button
                      key={speed}
                      type="button"
                      className={
                        controlState.fanSpeed === speed
                          ? "fan-option is-selected"
                          : "fan-option"
                      }
                      onClick={() => handleFanChange(speed as FanSpeed)}
                      disabled={controlsDisabled}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="command-actions">
              <button
                type="button"
                className="send-command"
                onClick={handleSendCommand}
                disabled={controlsDisabled}
              >
                {controlsDisabled
                  ? "Seleccioná equipos"
                  : `Enviar señal a ${selectedIds.length} aire(s)`}
              </button>
            </div>
          </div>

          <div className="unit-overview">
            {units.map((unit) => {
              const isSelected = selectedIds.includes(unit.id);

              return (
                <article
                  key={unit.id}
                  className={isSelected ? "unit-card is-selected" : "unit-card"}
                >
                  <header>
                    <h3>{unit.name}</h3>
                    <span
                      className={`status-dot ${unit.power ? "on" : "off"}`}
                    />
                  </header>
                  <p className="room-label">{unit.room}</p>
                  <dl>
                    <div>
                      <dt>Temperatura</dt>
                      <dd>{unit.temperature}°C</dd>
                    </div>
                    <div>
                      <dt>Ventilador</dt>
                      <dd>{FAN_SPEED_LABELS[unit.fanSpeed]}</dd>
                    </div>
                    <div>
                      <dt>Modo</dt>
                      <dd>
                        {unit.mode === "cool"
                          ? "Frío"
                          : unit.mode === "dry"
                            ? "Deshumidificación"
                            : "Ventilación"}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
