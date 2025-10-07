import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchDeviceStatus,
  fetchDevices,
  fetchHomes,
  updateDeviceMode,
  type DeviceStatusDTO,
  type HomeSummary,
} from "../../api/bgh";
import {
  ACCENT_BY_MODE,
  ACCENT_OFF,
  DEFAULT_TEMPERATURE,
  DEGREE_SYMBOL,
  FAN_SPEED_TO_API,
} from "./constants";
import type { ControlState, FanSpeed, Mode, StoredSelection } from "./types";
import {
  clampTemperature,
  formatTemperatureWithDegree,
  normaliseDevice,
  readStoredSelection,
  resolveMode,
  writeStoredSelection,
} from "./utils";

export interface ControlPanelHandlers {
  selectHome: (homeId: number | null) => void;
  selectDevice: (deviceId: number) => void;
  togglePanelPower: () => void;
  quickToggleDevicePower: (device: DeviceStatusDTO) => void;
  selectMode: (mode: Exclude<Mode, "off">) => void;
  selectFanSpeed: (fanSpeed: FanSpeed) => void;
  adjustTemperature: (step: number) => void;
  setTemperature: (value: number) => void;
  submitChanges: () => Promise<void>;
}

export interface ControlPanelState {
  homes: HomeSummary[];
  devices: DeviceStatusDTO[];
  selectedHomeId: number | null;
  selectedDeviceId: number | null;
  selectedHome: HomeSummary | null;
  selectedDevice: DeviceStatusDTO | null;
  controlState: ControlState | null;
  baselineState: ControlState | null;
  liveTemperature: number | null;
  isFetchingHomes: boolean;
  isFetchingDevices: boolean;
  isUpdatingDevice: boolean;
  errorMessage: string | null;
  statusMessage: string | null;
  actualPowerOn: boolean;
  actualMode: Mode;
  actualFanSpeed: FanSpeed;
  actualTargetTemperature: number;
  accentColor: string;
  modePreviewColor: string;
  temperatureTrend: string;
  currentTemperatureLabel: string;
  targetTemperatureLabel: string;
  hasPendingChanges: boolean;
  controlsDisabled: boolean;
}

export interface UseControlPanelResult {
  state: ControlPanelState;
  handlers: ControlPanelHandlers;
}

export const useControlPanel = (): UseControlPanelResult => {
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFetchingHomes, setIsFetchingHomes] = useState<boolean>(false);
  const [isFetchingDevices, setIsFetchingDevices] = useState<boolean>(false);
  const [isUpdatingDevice, setIsUpdatingDevice] = useState<boolean>(false);

  const persistSelection = useCallback(
    (homeId: number | null, deviceId: number | null): void => {
      const payload: StoredSelection = { homeId, deviceId };
      selectionRef.current = payload;
      writeStoredSelection(payload);
    },
    [],
  );

  const actualPowerOn = baselineState?.powerOn ?? false;
  const actualMode = baselineState?.mode ?? "auto";
  const actualFanSpeed = baselineState?.fanSpeed ?? "auto";
  const actualTargetTemperature =
    baselineState?.temperature ?? DEFAULT_TEMPERATURE;

  const accentColor = useMemo(() => {
    if (actualMode === "off") {
      return ACCENT_OFF;
    }

    return ACCENT_BY_MODE[actualMode as Exclude<Mode, "off">];
  }, [actualMode]);

  const modePreviewColor = useMemo(() => {
    const previewMode = controlState?.mode ?? actualMode;

    if (previewMode === "off") {
      return ACCENT_OFF;
    }

    return ACCENT_BY_MODE[previewMode as Exclude<Mode, "off">];
  }, [actualMode, controlState?.mode]);

  const updateDeviceState = useCallback(
    async (
      homeId: number,
      deviceId: number,
    ): Promise<DeviceStatusDTO | null> => {
      const device = await fetchDeviceStatus(homeId, deviceId);

      if (!device) {
        return null;
      }

      setDevices((prev) => {
        const exists = prev.some((item) => item.deviceId === device.deviceId);

        if (exists) {
          return prev.map((item) =>
            item.deviceId === device.deviceId ? device : item,
          );
        }

        return [...prev, device];
      });

      const { control, temperature } = normaliseDevice(device);

      setControlState(control);
      setBaselineState(control);
      setLiveTemperature(temperature);

      return device;
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
          return;
        }

        const fallbackHomeId = result[0].HomeID;
        setSelectedHomeId(fallbackHomeId);
        persistSelection(fallbackHomeId, null);
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
    return `${action} ${Math.abs(diff).toFixed(1)}${DEGREE_SYMBOL}`;
  }, [actualMode, actualPowerOn, baselineState, liveTemperature]);

  const currentTemperatureLabel = formatTemperatureWithDegree(
    liveTemperature === null ? null : Number(liveTemperature.toFixed(1)),
  );

  const targetTemperatureLabel = controlState
    ? controlState.temperature.toString().padStart(2, "0")
    : "--";

  const applyPowerCommand = useCallback(
    async (
      deviceId: number | null,
      powerOn: boolean,
      contextDevice?: DeviceStatusDTO,
    ) => {
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

        const refreshedDevice = await updateDeviceState(
          selectedHomeId,
          deviceId,
        );

        if (!refreshedDevice) {
          setErrorMessage("No se pudo obtener el estado actualizado");
        } else {
          setStatusMessage(null);
        }
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

  const selectHome = useCallback(
    (homeId: number | null) => {
      const nextId = Number.isFinite(homeId ?? NaN) ? homeId : null;

      setSelectedHomeId(nextId);
      setSelectedDeviceId(null);
      setControlState(null);
      setBaselineState(null);
      setLiveTemperature(null);
      persistSelection(nextId, null);
    },
    [persistSelection],
  );

  const selectDevice = useCallback(
    (deviceId: number) => {
      setSelectedDeviceId(deviceId);
      setStatusMessage(null);

      if (selectedHomeId !== null) {
        persistSelection(selectedHomeId, deviceId);
      }
    },
    [persistSelection, selectedHomeId],
  );

  const togglePanelPower = useCallback(() => {
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

  const quickToggleDevicePower = useCallback(
    (device: DeviceStatusDTO) => {
      if (selectedHomeId === null || isUpdatingDevice) {
        return;
      }

      const deviceMode = resolveMode(device.modeId ?? null);
      const nextPowerOn = deviceMode === "off";

      if (selectedDeviceId !== device.deviceId) {
        setSelectedDeviceId(device.deviceId);
        persistSelection(selectedHomeId, device.deviceId);
      }

      void applyPowerCommand(device.deviceId, nextPowerOn, device);
    },
    [
      applyPowerCommand,
      isUpdatingDevice,
      persistSelection,
      selectedDeviceId,
      selectedHomeId,
    ],
  );

  const selectMode = useCallback((mode: Exclude<Mode, "off">) => {
    setControlState((prev) => {
      if (!prev) {
        return prev;
      }

      return { ...prev, mode, powerOn: true };
    });
  }, []);

  const selectFanSpeed = useCallback((fan: FanSpeed) => {
    setControlState((prev) => (prev ? { ...prev, fanSpeed: fan } : prev));
  }, []);

  const adjustTemperature = useCallback((step: number) => {
    setControlState((prev) => {
      if (!prev) {
        return prev;
      }

      const nextValue = clampTemperature(prev.temperature + step);
      return { ...prev, temperature: nextValue };
    });
  }, []);

  const setTemperature = useCallback((value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }

    setControlState((prev) =>
      prev
        ? { ...prev, temperature: clampTemperature(Math.round(value)) }
        : prev,
    );
  }, []);

  const submitChanges = useCallback(async () => {
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

      const refreshedDevice = await updateDeviceState(
        selectedHomeId,
        selectedDeviceId,
      );

      if (!refreshedDevice) {
        setErrorMessage("No se pudo obtener el estado actualizado");
      } else {
        setStatusMessage(null);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar el comando";

      setErrorMessage(message);
      setStatusMessage(null);
    } finally {
      setIsUpdatingDevice(false);
    }
  }, [
    controlState,
    hasPendingChanges,
    selectedDeviceId,
    selectedHomeId,
    updateDeviceState,
  ]);

  const state: ControlPanelState = {
    homes,
    devices,
    selectedHomeId,
    selectedDeviceId,
    selectedHome,
    selectedDevice,
    controlState,
    baselineState,
    liveTemperature,
    isFetchingHomes,
    isFetchingDevices,
    isUpdatingDevice,
    errorMessage,
    statusMessage,
    actualPowerOn,
    actualMode,
    actualFanSpeed,
    actualTargetTemperature,
    accentColor,
    modePreviewColor,
    temperatureTrend,
    currentTemperatureLabel,
    targetTemperatureLabel,
    hasPendingChanges,
    controlsDisabled,
  };

  const handlers: ControlPanelHandlers = {
    selectHome,
    selectDevice,
    togglePanelPower,
    quickToggleDevicePower,
    selectMode,
    selectFanSpeed,
    adjustTemperature,
    setTemperature,
    submitChanges,
  };

  return { state, handlers };
};
