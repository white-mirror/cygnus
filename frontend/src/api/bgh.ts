const API_BASE = "/api/bgh";

export interface HomeSummary {
  HomeID: number;
  Name?: string | null;
  [key: string]: unknown;
}

export interface DeviceStatusDTO {
  deviceId: number;
  deviceName: string;
  model: string | null;
  serialNumber: string | null;
  temperature: number | null;
  targetTemperature: number | null;
  fanSpeed: number | null;
  modeId: number | null;
}

interface HomesResponse {
  homes?: HomeSummary[];
}

interface DevicesResponse {
  devices?: Record<string, DeviceStatusDTO>;
}

interface DeviceResponse {
  device?: DeviceStatusDTO;
}

interface UpdateModeResponse {
  result?: Record<string, unknown>;
}

export type FanSetting = "auto" | "low" | "mid" | "high";
export type ModeSetting = "off" | "cool" | "heat" | "dry" | "fan_only" | "auto";

export interface UpdateModePayload {
  mode: ModeSetting;
  targetTemperature: number;
  fan?: FanSetting;
  flags?: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const errorBody = (await response.json()) as { message?: string };
      const message =
        errorBody?.message ?? "Solicitud rechazada por el servidor";
      throw new Error(message);
    }
    throw new Error(`Solicitud fallida con estado ${response.status}`);
  }

  if (!isJson) {
    throw new Error("Respuesta inesperada del servidor");
  }

  return (await response.json()) as T;
}

export async function fetchHomes(): Promise<HomeSummary[]> {
  const response = await fetch(`${API_BASE}/homes`, {
    method: "GET",
  });
  const data = await handleResponse<HomesResponse>(response);
  return Array.isArray(data.homes) ? data.homes : [];
}

export async function fetchDevices(homeId: number): Promise<DeviceStatusDTO[]> {
  const response = await fetch(`${API_BASE}/homes/${homeId}/devices`, {
    method: "GET",
  });
  const data = await handleResponse<DevicesResponse>(response);
  const devicesMap = data.devices ?? {};
  return Object.values(devicesMap);
}

export async function fetchDeviceStatus(
  homeId: number,
  deviceId: number,
): Promise<DeviceStatusDTO | null> {
  const response = await fetch(
    `${API_BASE}/homes/${homeId}/devices/${deviceId}`,
    {
      method: "GET",
    },
  );
  const data = await handleResponse<DeviceResponse>(response);
  return data.device ?? null;
}

export async function updateDeviceMode(
  deviceId: number,
  payload: UpdateModePayload,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/devices/${deviceId}/mode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<UpdateModeResponse>(response);
  return data.result ?? {};
}
