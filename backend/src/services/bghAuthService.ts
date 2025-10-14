import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { Logger } from "pino";
import logger from "../logger";
import {
  BGHApiError,
  BGHAuthenticationError,
  DEFAULT_TIMEOUT_MS,
  LOGIN_ENDPOINT,
} from "integrations/bgh";

type AuthCredentials = {
  email: string;
  password: string;
};

type TokenPayload = {
  Token: string;
} & Record<string, unknown>;

type LoginResponseData = {
  d?: unknown;
} & Record<string, unknown>;

export type BghAuthServiceErrorCode =
  | "INVALID_CREDENTIALS"
  | "UPSTREAM_ERROR"
  | "UNEXPECTED_ERROR";

export class BGHAuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: BghAuthServiceErrorCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BGHAuthServiceError";
  }
}

export interface AuthenticationOptions {
  timeoutMs?: number;
  httpClient?: AxiosInstance;
}

export interface AuthenticationResult {
  token: string;
  payload: TokenPayload;
}

const maskEmail = (email: string): string => {
  const [localPart, domainPart] = email.split("@");
  if (!domainPart) {
    return "***";
  }
  const visiblePrefix = localPart.slice(0, 1);
  const visibleSuffix = localPart.slice(-1);
  return `${visiblePrefix || ""}***${visibleSuffix || ""}@${domainPart}`;
};

export async function authenticate(
  credentials: AuthCredentials,
  log?: Logger,
  options: AuthenticationOptions = {},
): Promise<AuthenticationResult> {
  const svcLog = (log ?? logger).child({
    service: "bghAuthService",
    operation: "authenticate",
    email: maskEmail(credentials.email),
  });

  svcLog.info("Attempting BGH authentication");

  try {
    const result = await performLogin(credentials, options);
    svcLog.info("BGH authentication succeeded");
    return result;
  } catch (error) {
    throw normaliseError(error, svcLog);
  }
}

async function performLogin(
  credentials: AuthCredentials,
  options: AuthenticationOptions,
): Promise<AuthenticationResult> {
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const http =
    options.httpClient ?? axios.create({ timeout });

  try {
    const response = await http.post(
      LOGIN_ENDPOINT,
      {
        user: credentials.email,
        password: credentials.password,
      },
      options.httpClient ? { timeout } : undefined,
    );
    const payload = extractPayload(response);
    return { token: payload.Token, payload };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new BGHApiError(
        `Authentication request failed with status ${error.response.status}`,
        error.response,
      );
    }
    throw error;
  }
}

const extractPayload = (response: AxiosResponse): TokenPayload => {
  const data = ensureJson(response);
  const tokenPayload = data.d;

  if (!tokenPayload) {
    throw new BGHAuthenticationError("Missing authentication token", response);
  }

  if (typeof tokenPayload === "string") {
    return { Token: tokenPayload };
  }

  if (
    typeof tokenPayload === "object" &&
    tokenPayload !== null &&
    "Token" in tokenPayload &&
    typeof (tokenPayload as Record<string, unknown>).Token === "string"
  ) {
    return tokenPayload as TokenPayload;
  }

  throw new BGHAuthenticationError(
    "Unexpected authentication token format",
    response,
  );
};

const ensureJson = (response: AxiosResponse): LoginResponseData => {
  if (
    response.data === null ||
    typeof response.data !== "object" ||
    Array.isArray(response.data)
  ) {
    throw new BGHApiError("Unable to parse authentication response", response);
  }
  return response.data as LoginResponseData;
};

const normaliseError = (
  error: unknown,
  log: Logger,
): BGHAuthServiceError => {
  if (error instanceof BGHAuthServiceError) {
    log.error({ err: error }, "BGH auth service error");
    return error;
  }
  if (error instanceof BGHAuthenticationError) {
    const serviceError = new BGHAuthServiceError(
      "Las credenciales de BGH no son válidas.",
      "INVALID_CREDENTIALS",
      error,
    );
    log.warn({ err: serviceError }, "BGH authentication rejected");
    return serviceError;
  }
  if (error instanceof BGHApiError) {
    const serviceError = new BGHAuthServiceError(
      `Error al contactar el servicio de BGH. ${error.message}`,
      "UPSTREAM_ERROR",
      error,
    );
    log.error({ err: serviceError }, "BGH authentication upstream error");
    return serviceError;
  }
  const serviceError = new BGHAuthServiceError(
    "Error inesperado durante la autenticación con BGH.",
    "UNEXPECTED_ERROR",
    error,
  );
  log.error({ err: serviceError }, "Unexpected BGH authentication error");
  return serviceError;
};

