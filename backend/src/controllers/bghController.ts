import { type NextFunction, type Request, type Response } from "express";
import {
  BGHServiceError,
  getDeviceStatus as getDeviceStatusService,
  listDevices as listDevicesService,
  listHomes as listHomesService,
  setDeviceMode as setDeviceModeService,
  type BghServiceErrorCode,
} from "../services/bghService";

type Controller = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const sendServiceError = (error: BGHServiceError, res: Response): void => {
  res.status(mapStatus(error.code)).json({
    code: error.code,
    message: error.message,
  });
};

const mapStatus = (code: BghServiceErrorCode): number => {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "AUTHENTICATION_ERROR":
      return 401;
    case "UPSTREAM_ERROR":
      return 502;
    case "CONFIGURATION_ERROR":
      return 500;
    default:
      return 500;
  }
};

const handleError = (
  error: unknown,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof BGHServiceError) {
    sendServiceError(error, res);
    return;
  }
  next(error);
};

const parseNumericParam = (
  value: string | undefined,
  name: string,
  res: Response,
): number | null => {
  if (!value) {
    res.status(400).json({
      code: "INVALID_PARAMETER",
      message: `Missing required parameter '${name}'.`,
    });
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    res.status(400).json({
      code: "INVALID_PARAMETER",
      message: `Parameter '${name}' must be a valid number. Received '${value}'.`,
    });
    return null;
  }
  return parsed;
};

export const listHomes: Controller = async (_req, res, next) => {
  try {
    const homes = await listHomesService();
    res.json({ homes });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const listDevices: Controller = async (req, res, next) => {
  const homeId = parseNumericParam(req.params.homeId, "homeId", res);
  if (homeId === null) {
    return;
  }

  try {
    const devices = await listDevicesService(homeId);
    res.json({ devices });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const getDeviceStatus: Controller = async (req, res, next) => {
  const homeId = parseNumericParam(req.params.homeId, "homeId", res);
  if (homeId === null) {
    return;
  }

  const deviceId = parseNumericParam(req.params.deviceId, "deviceId", res);
  if (deviceId === null) {
    return;
  }

  try {
    const device = await getDeviceStatusService(homeId, deviceId);
    res.json({ device });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const setDeviceMode: Controller = async (req, res, next) => {
  const deviceId = parseNumericParam(req.params.deviceId, "deviceId", res);
  if (deviceId === null) {
    return;
  }

  const { mode, targetTemperature, fan, flags } = req.body ?? {};

  if (typeof mode !== "string" || mode.length === 0) {
    res.status(400).json({
      code: "INVALID_BODY",
      message: "Body must include a non-empty 'mode' field.",
    });
    return;
  }

  if (
    typeof targetTemperature !== "number" ||
    !Number.isFinite(targetTemperature)
  ) {
    res.status(400).json({
      code: "INVALID_BODY",
      message: "Body must include a numeric 'targetTemperature' field.",
    });
    return;
  }

  try {
    const result = await setDeviceModeService(deviceId, {
      mode,
      targetTemperature,
      fan,
      flags,
    });
    res.json({ result });
  } catch (error) {
    handleError(error, res, next);
  }
};
