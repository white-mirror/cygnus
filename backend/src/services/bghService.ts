import {
  BGHApiError,
  BGHAuthenticationError,
  BGHClient,
  type BGHClientOptions,
  type DeviceStatus,
  type DeviceStatusMap,
  type HomeSummary,
} from "integrations/bgh";

export type BghServiceErrorCode =
  | "CONFIGURATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "UPSTREAM_ERROR"
  | "NOT_FOUND"
  | "UNEXPECTED_ERROR";

export class BGHServiceError extends Error {
  constructor(
    message: string,
    public readonly code: BghServiceErrorCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BGHServiceError";
  }
}

type Credentials = {
  email: string;
  password: string;
};

const EMAIL_ENV_KEY = "BGH_EMAIL";
const PASSWORD_ENV_KEY = "BGH_PASSWORD";
const TIMEOUT_ENV_KEY = "BGH_TIMEOUT_MS";

let clientPromise: Promise<BGHClient> | undefined;

export async function listHomes(): Promise<HomeSummary[]> {
  try {
    const client = await getClient();
    return await client.listHomes();
  } catch (error) {
    throw normaliseError("listing homes", error);
  }
}

export async function listDevices(homeId: number): Promise<DeviceStatusMap> {
  try {
    const client = await getClient();
    return await client.getDevices(homeId);
  } catch (error) {
    throw normaliseError(`retrieving devices for home ${homeId}`, error);
  }
}

export async function getDeviceStatus(
  homeId: number,
  deviceId: number,
): Promise<DeviceStatus> {
  try {
    const client = await getClient();
    return await client.getDeviceStatus(homeId, deviceId);
  } catch (error) {
    throw normaliseError(
      `retrieving device ${deviceId} status for home ${homeId}`,
      error,
    );
  }
}

export async function setDeviceMode(
  deviceId: number,
  options: Parameters<BGHClient["setMode"]>[1],
): Promise<Record<string, unknown>> {
  try {
    const client = await getClient();
    return await client.setMode(deviceId, options);
  } catch (error) {
    throw normaliseError(`updating mode for device ${deviceId}`, error);
  }
}

async function getClient(): Promise<BGHClient> {
  if (!clientPromise) {
    clientPromise = createClient();
  }
  return clientPromise;
}

async function createClient(): Promise<BGHClient> {
  const credentials = resolveCredentials();
  const options: BGHClientOptions = {};
  const timeout = parseTimeout();
  if (timeout !== undefined) {
    options.timeoutMs = timeout;
  }
  return new BGHClient(credentials.email, credentials.password, options);
}

function resolveCredentials(): Credentials {
  const email = process.env[EMAIL_ENV_KEY];
  const password = process.env[PASSWORD_ENV_KEY];

  if (!email || !password) {
    throw new BGHServiceError(
      `Missing BGH credentials. Ensure environment variables ${EMAIL_ENV_KEY} and ${PASSWORD_ENV_KEY} are set.`,
      "CONFIGURATION_ERROR",
    );
  }

  return { email, password };
}

function parseTimeout(): number | undefined {
  const rawTimeout = process.env[TIMEOUT_ENV_KEY];
  if (!rawTimeout) {
    return undefined;
  }
  const parsed = Number(rawTimeout);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new BGHServiceError(
      `Invalid ${TIMEOUT_ENV_KEY} value. Expected a positive number, received '${rawTimeout}'.`,
      "CONFIGURATION_ERROR",
    );
  }
  return parsed;
}

function normaliseError(context: string, error: unknown): BGHServiceError {
  if (error instanceof BGHServiceError) {
    return error;
  }
  if (error instanceof BGHAuthenticationError) {
    return new BGHServiceError(
      `BGH authentication failed while ${context}.`,
      "AUTHENTICATION_ERROR",
      error,
    );
  }
  if (error instanceof BGHApiError) {
    return new BGHServiceError(
      `BGH API request failed while ${context}. ${error.message}`,
      "UPSTREAM_ERROR",
      error,
    );
  }
  if (error instanceof Error && /not found/i.test(error.message)) {
    return new BGHServiceError(error.message, "NOT_FOUND", error);
  }
  return new BGHServiceError(
    `Unexpected error occurred while ${context}.`,
    "UNEXPECTED_ERROR",
    error,
  );
}
