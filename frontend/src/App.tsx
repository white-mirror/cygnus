import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type JSX,
} from "react";

import {
  fetchDeviceStatus,
  fetchDevices,
  fetchHomes,
  updateDeviceMode,
  type DeviceStatusDTO,
  type HomeSummary,
} from "./api/bgh";

import "./App.css";

type Mode = "cool" | "heat" | "auto" | "off";

type FanSpeed = "auto" | "low" | "medium" | "high";

type IconProps = {
  className?: string;
};

interface ModeOption {
  id: Exclude<Mode, "off">;

  label: string;

  description: string;

  icon: (props: IconProps) => JSX.Element;
}

interface FanOption {
  id: FanSpeed;

  label: string;

  description: string;
}

interface ControlState {
  temperature: number;

  mode: Mode;

  fanSpeed: FanSpeed;

  powerOn: boolean;
}

interface StoredSelection {
  homeId: number | null;

  deviceId: number | null;
}

const TEMPERATURE_MIN = 16;

const TEMPERATURE_MAX = 30;

const TEMPERATURE_STEP = 1;

const DEGREE = "\u00b0";

const STORAGE_KEY = "ac-control-selection";

const DEFAULT_TEMPERATURE = 24;

const FAN_ID_TO_SPEED: Record<number, FanSpeed> = {
  1: "low",

  2: "medium",

  3: "high",

  254: "auto",
};

const FAN_SPEED_TO_API: Record<FanSpeed, "auto" | "low" | "mid" | "high"> = {
  auto: "auto",

  low: "low",

  medium: "mid",

  high: "high",
};

const MODE_ID_TO_MODE: Record<number, Mode> = {
  0: "off",

  1: "cool",

  2: "heat",

  254: "auto",
};

const MODE_LABELS: Record<Mode, string> = {
  cool: "Frio",

  heat: "Calor",

  auto: "Auto",

  off: "Apagado",
};

const FAN_LABELS: Record<FanSpeed, string> = {
  auto: "Auto",

  low: "Baja",

  medium: "Media",

  high: "Alta",
};

const clampTemperature = (value: number): number =>
  Math.min(Math.max(value, TEMPERATURE_MIN), TEMPERATURE_MAX);

const readStoredSelection = (): StoredSelection | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as StoredSelection;

    if (
      parsed &&
      (parsed.homeId === null || Number.isFinite(parsed.homeId)) &&
      (parsed.deviceId === null || Number.isFinite(parsed.deviceId))
    ) {
      return parsed;
    }

    return null;
  } catch (_error) {
    return null;
  }
};

const resolveMode = (modeId: number | null): Mode => {
  if (modeId !== null && MODE_ID_TO_MODE[modeId]) {
    return MODE_ID_TO_MODE[modeId];
  }

  return "auto";
};

const resolveFanSpeed = (fanSpeed: number | null): FanSpeed => {
  if (fanSpeed !== null && FAN_ID_TO_SPEED[fanSpeed]) {
    return FAN_ID_TO_SPEED[fanSpeed];
  }

  return "auto";
};

const ACCENT_BY_MODE: Record<Exclude<Mode, "off">, string> = {
  cool: "43, 139, 255",

  heat: "255, 120, 71",

  auto: "60, 184, 120",
};

const CheckIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    stroke="currentColor"
    strokeWidth={1.8}
    fill="none"
  >
    <path d="M5 12.5 10 17l9-10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PowerIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="8.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    />

    <line
      x1="12"
      y1="6"
      x2="12"
      y2="12.5"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </svg>
);

const SnowflakeIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 2.5v19"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.2 7l15.6 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.2 17l15.6-10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M2.8 12h18.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
);

const SunIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    />

    <path
      d="M12 3v2.1"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M12 18.9V21"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.7 4.7l1.5 1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M17.8 17.8l1.5 1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M3 12h2.1"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M18.9 12H21"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.7 19.3l1.5-1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M17.8 6.2l1.5-1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
);

const AutoIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="4.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    />

    <path
      d="M4 12a8 8 0 0 1 13.5-5.6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M18 19.8V16h-3.8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FanIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />

    <path
      d="M12 5c1.8 0 3.3 1.4 3.3 3.2 0 1.5-1 2.8-2.5 3.1"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M8.4 7.4c-1.6 0.8-2.3 2.8-1.5 4.4 0.6 1.2 1.9 1.8 3.2 1.7"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M9.6 18.5c-1.5-0.9-2-3-0.9-4.5 0.8-1.1 2.1-1.6 3.3-1.2"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M15.5 15.2c0.9 1.5 0.2 3.5-1.4 4.3-1.3 0.6-2.7 0.2-3.6-0.8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MODE_OPTIONS: ModeOption[] = [
  {
    id: "cool",

    label: "Frio",

    description: "Reduce la temperatura con flujo fresco",

    icon: SnowflakeIcon,
  },

  {
    id: "heat",

    label: "Calor",

    description: "Aumenta la temperatura de forma gradual",

    icon: SunIcon,
  },

  {
    id: "auto",

    label: "Auto",

    description: "El equipo mantiene el clima automaticamente",

    icon: AutoIcon,
  },
];

const FAN_OPTIONS: FanOption[] = [
  {
    id: "auto",

    label: "Auto",

    description: "El equipo ajusta la velocidad",
  },

  {
    id: "low",

    label: "Baja",

    description: "Brisa suave y silenciosa",
  },

  {
    id: "medium",

    label: "Media",

    description: "Equilibrio entre confort y ruido",
  },

  {
    id: "high",

    label: "Alta",

    description: "Maximo caudal de aire",
  },
];

const formatHomeName = (home: HomeSummary): string => {
  const description =
    typeof (home as { Description?: string }).Description === "string" &&
    (home as { Description?: string }).Description?.trim().length
      ? (home as { Description?: string }).Description?.trim()
      : null;

  if (description) {
    return description;
  }

  if (typeof home.Name === "string" && home.Name.trim().length > 0) {
    return home.Name.trim();
  }

  return `Home ${home.HomeID}`;
};

const normaliseDevice = (
  device: DeviceStatusDTO,
): {
  control: ControlState;

  temperature: number | null;
} => {
  const mode = resolveMode(device.modeId ?? null);

  const fanSpeed = resolveFanSpeed(device.fanSpeed ?? null);

  const targetTemperature = clampTemperature(
    Math.round((device.targetTemperature ?? DEFAULT_TEMPERATURE) as number),
  );

  const temperature =
    typeof device.temperature === "number"
      ? Number(device.temperature.toFixed(1))
      : null;

  return {
    control: {
      temperature: targetTemperature,

      fanSpeed,

      mode,

      powerOn: mode !== "off",
    },

    temperature,
  };
};

function App(): JSX.Element {
  const selectionRef = useRef<StoredSelection | null>(readStoredSelection());

  const [homes, setHomes] = useState<HomeSummary[]>([]);

  const [devices, setDevices] = useState<DeviceStatusDTO[]>([]);

  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(
    selectionRef.current?.homeId ?? null,
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(
    selectionRef.current?.deviceId ?? null,
  );

  const [controlState, setControlState] = useState<ControlState | null>(null);

  const [baselineState, setBaselineState] = useState<ControlState | null>(null);

  const [liveTemperature, setLiveTemperature] = useState<number | null>(null);

  const [lastActiveMode, setLastActiveMode] =
    useState<Exclude<Mode, "off">>("cool");

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isFetchingHomes, setIsFetchingHomes] = useState<boolean>(false);

  const [isFetchingDevices, setIsFetchingDevices] = useState<boolean>(false);

  const [isUpdatingDevice, setIsUpdatingDevice] = useState<boolean>(false);

  const persistSelection = useCallback(
    (homeId: number | null, deviceId: number | null): void => {
      if (typeof window === "undefined") {
        return;
      }

      const payload: StoredSelection = {
        homeId,

        deviceId,
      };

      selectionRef.current = payload;

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },
    [],
  );

  const actualPowerOn = baselineState?.powerOn ?? false;

  const actualMode = baselineState?.mode ?? "auto";

  const actualTargetTemperature =
    baselineState?.temperature ?? DEFAULT_TEMPERATURE;

  const accentStyle = useMemo(() => {
    const activeMode = controlState?.mode ?? actualMode ?? "auto";

    const accent =
      activeMode === "off"
        ? ACCENT_BY_MODE[lastActiveMode]
        : ACCENT_BY_MODE[activeMode as Exclude<Mode, "off">];

    return {
      "--accent-color": accent,
    } as CSSProperties;
  }, [actualMode, controlState?.mode, lastActiveMode]);

  const updateDeviceState = useCallback(
    async (
      homeId: number,
      deviceId: number,
      updatePanel: boolean,
    ): Promise<void> => {
      const device = await fetchDeviceStatus(homeId, deviceId);

      if (!device) {
        return;
      }

      setDevices((prev) =>
        prev.map((item) => (item.deviceId === device.deviceId ? device : item)),
      );

      if (updatePanel) {
        const { control, temperature } = normaliseDevice(device);

        setControlState(control);

        setBaselineState(control);

        setLiveTemperature(temperature);

        if (control.mode !== "off") {
          setLastActiveMode(control.mode);
        }
      }
    },

    [],
  );

  useEffect(() => {
    let isActive = true;

    setIsFetchingHomes(true);

    fetchHomes()
      .then((result) => {
        if (!isActive) {
          return;
        }

        setHomes(result);

        if (result.length === 0) {
          setSelectedHomeId(null);

          setSelectedDeviceId(null);

          persistSelection(null, null);

          return;
        }

        const storedHomeId = selectionRef.current?.homeId ?? null;

        if (
          storedHomeId &&
          result.some((home) => home.HomeID === storedHomeId)
        ) {
          setSelectedHomeId(storedHomeId);
        } else {
          const fallbackHomeId = result[0].HomeID;

          setSelectedHomeId(fallbackHomeId);

          persistSelection(fallbackHomeId, null);
        }
      })

      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las casas";

        setErrorMessage(message);
      })

      .finally(() => {
        if (isActive) {
          setIsFetchingHomes(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [persistSelection]);

  useEffect(() => {
    if (selectedHomeId === null) {
      setDevices([]);

      setSelectedDeviceId(null);

      setControlState(null);

      setBaselineState(null);

      setLiveTemperature(null);

      return;
    }

    let isActive = true;

    setIsFetchingDevices(true);

    setErrorMessage(null);

    setStatusMessage(null);

    setControlState(null);

    setBaselineState(null);

    setLiveTemperature(null);

    fetchDevices(selectedHomeId)
      .then((result) => {
        if (!isActive) {
          return;
        }

        const sorted = [...result].sort((a, b) =>
          a.deviceName.localeCompare(b.deviceName, "es", {
            sensitivity: "base",
          }),
        );

        setDevices(sorted);

        const storedSelection = selectionRef.current;

        const storedDeviceId =
          storedSelection && storedSelection.homeId === selectedHomeId
            ? storedSelection.deviceId
            : null;

        const nextDeviceId =
          storedDeviceId !== null &&
          sorted.some((device) => device.deviceId === storedDeviceId)
            ? storedDeviceId
            : (sorted[0]?.deviceId ?? null);

        setSelectedDeviceId(nextDeviceId);

        persistSelection(selectedHomeId, nextDeviceId ?? null);
      })

      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los equipos";

        setErrorMessage(message);

        setDevices([]);

        setSelectedDeviceId(null);

        persistSelection(selectedHomeId, null);
      })

      .finally(() => {
        if (isActive) {
          setIsFetchingDevices(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [persistSelection, selectedHomeId]);

  const selectedHome = useMemo(
    () => homes.find((home) => home.HomeID === selectedHomeId) ?? null,

    [homes, selectedHomeId],
  );

  const selectedDevice = useMemo(
    () =>
      devices.find((device) => device.deviceId === selectedDeviceId) ?? null,

    [devices, selectedDeviceId],
  );

  useEffect(() => {
    if (!selectedDevice) {
      setControlState(null);

      setBaselineState(null);

      setLiveTemperature(null);

      return;
    }

    const { control, temperature } = normaliseDevice(selectedDevice);

    setControlState(control);

    setBaselineState(control);

    setLiveTemperature(temperature);

    if (control.mode !== "off") {
      setLastActiveMode(control.mode);
    }
  }, [selectedDevice]);

  const controlsDisabled = controlState === null || isUpdatingDevice;

  const hasPendingChanges = useMemo(() => {
    if (!controlState || !baselineState) {
      return false;
    }

    return (
      controlState.powerOn !== baselineState.powerOn ||
      controlState.mode !== baselineState.mode ||
      controlState.fanSpeed !== baselineState.fanSpeed ||
      controlState.temperature !== baselineState.temperature
    );
  }, [baselineState, controlState]);

  const panelClassName = hasPendingChanges
    ? "ac-panel has-pending"
    : "ac-panel";

  const temperatureTrend = useMemo(() => {
    if (!baselineState) {
      return "Selecciona un equipo";
    }

    if (!actualPowerOn || actualMode === "off") {
      return "Apagado";
    }

    if (liveTemperature === null) {
      return "Sensor no disponible";
    }

    const diff = Number(
      (baselineState.temperature - liveTemperature).toFixed(1),
    );

    if (Math.abs(diff) < 0.2) {
      return "Temperatura estable";
    }

    const action = diff > 0 ? "Calentando" : "Enfriando";

    return `${action} ${Math.abs(diff).toFixed(1)}${DEGREE}`;
  }, [actualMode, actualPowerOn, baselineState, liveTemperature]);

  const sendButtonSubtext = statusMessage ?? "Cambios pendientes";

  const handleHomeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;

    const nextHomeId = value === "" ? null : Number(value);

    setSelectedHomeId(Number.isFinite(nextHomeId ?? NaN) ? nextHomeId : null);

    setSelectedDeviceId(null);

    setControlState(null);

    setBaselineState(null);

    setLiveTemperature(null);

    persistSelection(
      Number.isFinite(nextHomeId ?? NaN) ? nextHomeId : null,
      null,
    );
  };

  const handleDeviceSelect = (deviceId: number): void => {
    setSelectedDeviceId(deviceId);

    setStatusMessage(null);

    if (selectedHomeId !== null) {
      persistSelection(selectedHomeId, deviceId);
    }
  };

  const applyPowerCommand = useCallback(
    async (
      deviceId: number | null,

      powerOn: boolean,

      contextDevice?: DeviceStatusDTO,

      updatePanel: boolean = true,
    ): Promise<void> => {
      if (selectedHomeId === null || deviceId === null) {
        return;
      }

      const fallbackTemperature =
        contextDevice?.targetTemperature ?? actualTargetTemperature;

      const targetTemperature = clampTemperature(
        Math.round(
          typeof fallbackTemperature === "number"
            ? fallbackTemperature
            : DEFAULT_TEMPERATURE,
        ),
      );

      const commandMode: Mode = powerOn ? "auto" : "off";

      setIsUpdatingDevice(true);

      setErrorMessage(null);

      setStatusMessage(powerOn ? "Encendiendo..." : "Apagando...");

      try {
        await updateDeviceMode(deviceId, {
          mode: commandMode,

          targetTemperature,

          fan: "auto",
        });

        await updateDeviceState(selectedHomeId, deviceId, updatePanel);

        setStatusMessage(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado";

        setErrorMessage(message);

        setStatusMessage(null);
      } finally {
        setIsUpdatingDevice(false);
      }
    },

    [actualTargetTemperature, selectedHomeId, updateDeviceState],
  );

  const handlePowerToggleClick = useCallback((): void => {
    if (selectedDeviceId === null) {
      return;
    }

    void applyPowerCommand(
      selectedDeviceId,
      !actualPowerOn,
      selectedDevice ?? undefined,
      true,
    );
  }, [actualPowerOn, applyPowerCommand, selectedDevice, selectedDeviceId]);

  const handleQuickPowerToggle = useCallback(
    (device: DeviceStatusDTO): void => {
      if (selectedHomeId === null || isUpdatingDevice) {
        return;
      }

      const deviceMode = resolveMode(device.modeId ?? null);

      const nextPowerOn = deviceMode === "off";

      if (selectedDeviceId !== device.deviceId) {
        setSelectedDeviceId(device.deviceId);

        persistSelection(selectedHomeId, device.deviceId);
      }

      void applyPowerCommand(device.deviceId, nextPowerOn, device, true);
    },

    [
      applyPowerCommand,
      isUpdatingDevice,
      persistSelection,
      selectedDeviceId,
      selectedHomeId,
    ],
  );

  const handleModeSelect = (mode: Exclude<Mode, "off">): void => {
    setControlState((prev) => {
      if (!prev) {
        return prev;
      }

      setLastActiveMode(mode);

      return { ...prev, mode, powerOn: true };
    });
  };

  const handleFanSelect = (fan: FanSpeed): void => {
    setControlState((prev) => (prev ? { ...prev, fanSpeed: fan } : prev));
  };

  const handleTemperatureAdjust = (step: number): void => {
    setControlState((prev) => {
      if (!prev) {
        return prev;
      }

      const nextValue = clampTemperature(prev.temperature + step);

      return { ...prev, temperature: nextValue };
    });
  };

  const handleTemperatureInput = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const nextValue = Number(event.target.value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    setControlState((prev) =>
      prev
        ? { ...prev, temperature: clampTemperature(Math.round(nextValue)) }
        : prev,
    );
  };

  const handleSendCommand = async (): Promise<void> => {
    if (
      !controlState ||
      selectedDeviceId === null ||
      selectedHomeId === null ||
      !hasPendingChanges
    ) {
      return;
    }

    setIsUpdatingDevice(true);

    setErrorMessage(null);

    setStatusMessage("Enviando...");

    try {
      const payloadMode = controlState.mode;

      const fanSetting = FAN_SPEED_TO_API[controlState.fanSpeed];

      await updateDeviceMode(selectedDeviceId, {
        mode: payloadMode,

        targetTemperature: controlState.temperature,

        fan: fanSetting,
      });

      await updateDeviceState(selectedHomeId, selectedDeviceId, true);

      setStatusMessage(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar el comando";

      setErrorMessage(message);

      setStatusMessage(null);
    } finally {
      setIsUpdatingDevice(false);
    }
  };

  const currentTemperatureLabel =
    liveTemperature === null ? "--" : `${liveTemperature.toFixed(1)}${DEGREE}C`;

  const targetTemperatureLabel = controlState
    ? controlState.temperature.toString().padStart(2, "0")
    : "--";

  const sendButtonClassName = hasPendingChanges
    ? "send-command has-pending"
    : "send-command";

  return (
    <main className={panelClassName} style={accentStyle}>
      <header className="panel-header">
        <div className="headline">
          <span className="panel-title">Control de clima</span>

          <span className="panel-subtitle">
            {selectedHome
              ? formatHomeName(selectedHome)
              : "Selecciona un hogar"}
          </span>
        </div>

        <button
          type="button"
          className={`power-toggle${actualPowerOn ? " is-on" : ""}`}
          aria-pressed={actualPowerOn}
          onClick={handlePowerToggleClick}
          disabled={controlState === null || isUpdatingDevice}
        >
          <PowerIcon className="power-icon" />

          <span className="power-state">
            {actualPowerOn ? "Encendido" : "Apagado"}
          </span>
        </button>
      </header>

      <section className="home-frame">
        <span className="home-frame-label">Home</span>

        <div className="selector-wrapper">
          <select
            id="home-select"
            className="selector-control"
            value={selectedHomeId ?? ""}
            onChange={handleHomeChange}
            disabled={isFetchingHomes || homes.length === 0}
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

      <section className="device-panel">
        <div className="device-panel-header">
          <span>Equipos</span>

          <span className="device-count">
            {devices.length} {devices.length === 1 ? "equipo" : "equipos"}
          </span>
        </div>

        <div
          className="device-selector"
          role="tablist"
          aria-label="Seleccion de equipos"
        >
          {isFetchingDevices && (
            <span className="device-hint">Cargando equipos...</span>
          )}

          {!isFetchingDevices && devices.length === 0 && (
            <span className="device-hint">Sin equipos disponibles</span>
          )}

          {devices.map((device) => {
            const deviceMode = resolveMode(device.modeId ?? null);

            const isActive = device.deviceId === selectedDeviceId;

            const deviceTarget =
              device.targetTemperature !== null &&
              device.targetTemperature !== undefined
                ? Math.round(Number(device.targetTemperature))
                : null;

            const deviceCurrent =
              typeof device.temperature === "number"
                ? Number(device.temperature.toFixed(1))
                : null;

            const buttonClassName = `device-button mode-${deviceMode}${
              isActive ? " is-active" : ""
            }${deviceMode === "off" ? " is-off" : ""}`;

            return (
              <button
                key={device.deviceId}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={buttonClassName}
                onClick={() => handleDeviceSelect(device.deviceId)}
                disabled={
                  isUpdatingDevice && device.deviceId !== selectedDeviceId
                }
              >
                <div className="device-header">
                  <span className="device-name">{device.deviceName}</span>

                  <span
                    className={`device-power-toggle${deviceMode === "off" ? " is-off" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      deviceMode === "off" ? "Encender equipo" : "Apagar equipo"
                    }
                    onClick={(event) => {
                      event.stopPropagation();

                      handleQuickPowerToggle(device);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        event.stopPropagation();

                        handleQuickPowerToggle(device);
                      }
                    }}
                  >
                    <PowerIcon className="device-power-icon" />
                  </span>
                </div>

                <div className="device-status-row">
                  <span className="device-badge">
                    {MODE_LABELS[deviceMode]}
                  </span>

                  {deviceTarget !== null && (
                    <span className="device-meta">
                      Temp. Deseada {deviceTarget}
                      {DEGREE}C
                    </span>
                  )}
                </div>

                <div className="device-status-row">
                  <span className="device-meta">
                    Temp. Actual{" "}
                    {deviceCurrent !== null
                      ? `${deviceCurrent}${DEGREE}C`
                      : "--"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {errorMessage && <div className="panel-error">{errorMessage}</div>}

      <section className="temperature-card">
        <div className="temperature-meta">
          <div className="temperature-current">
            <span className="temperature-label">Temperatura actual</span>

            <span className="temperature-value">{currentTemperatureLabel}</span>
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
            onClick={() => handleTemperatureAdjust(-TEMPERATURE_STEP)}
            aria-label="Disminuir temperatura"
            disabled={controlsDisabled}
          >
            &minus;
          </button>

          <div className="setpoint-display">
            <span className="setpoint-label">Temp. Deseada</span>

            <div className="setpoint-value">
              <span className="setpoint-number">{targetTemperatureLabel}</span>

              <span className="setpoint-degree">{DEGREE}C</span>
            </div>
          </div>

          <button
            type="button"
            className="temp-step"
            onClick={() => handleTemperatureAdjust(TEMPERATURE_STEP)}
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
          value={controlState ? controlState.temperature : TEMPERATURE_MIN}
          onChange={handleTemperatureInput}
          aria-label="Temperatura deseada"
          disabled={controlsDisabled}
        />
      </section>

      <section className="controls-grid">
        <article className="control-card">
          <div className="control-card-header">
            <h2>Modo de Operacion</h2>

            <span>Selecciona la forma de climatizar</span>
          </div>

          <div className="control-options">
            {MODE_OPTIONS.map((option) => {
              const Icon = option.icon;

              const isActive = controlState?.mode === option.id;

              const optionStyle = {
                "--option-accent": ACCENT_BY_MODE[option.id],
              } as CSSProperties;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`mode-option${isActive ? " is-active" : ""}`}
                  style={optionStyle}
                  onClick={() => handleModeSelect(option.id)}
                  aria-pressed={isActive}
                  disabled={controlsDisabled}
                >
                  <span className="mode-icon">
                    <Icon className="control-icon" />
                  </span>

                  <span className="mode-copy">
                    <span className="mode-label">{option.label}</span>

                    <span className="mode-description">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="control-card">
          <div className="control-card-header">
            <h2>Velocidad del Ventilador</h2>

            <span>Configura la velocidad del ventilador</span>
          </div>

          <div className="fan-buttons">
            {FAN_OPTIONS.map((option) => {
              const isActive = controlState?.fanSpeed === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`fan-option${isActive ? " is-active" : ""}`}
                  onClick={() => handleFanSelect(option.id)}
                  aria-pressed={isActive}
                  disabled={controlsDisabled}
                >
                  <span className="fan-icon">
                    <FanIcon className="control-icon" />
                  </span>

                  <span className="fan-copy">
                    <span className="fan-label">{option.label}</span>

                    <span className="fan-description">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <footer className="panel-footer">
        <div className={`indicator-chip${actualPowerOn ? "" : " is-idle"}`}>
          <span className="chip-dot" />

          <span>{actualPowerOn ? "Climatizando" : "En espera"}</span>
        </div>

        {hasPendingChanges && (
          <button
            type="button"
            className={sendButtonClassName}
            onClick={handleSendCommand}
            disabled={controlsDisabled || !hasPendingChanges}
          >
            <CheckIcon className="send-icon" />

            <span className="send-label-group">
              <span className="send-label">Enviar cambios</span>

              <span className="send-subtext">{sendButtonSubtext}</span>
            </span>
          </button>
        )}
      </footer>
    </main>
  );
}

export default App;
