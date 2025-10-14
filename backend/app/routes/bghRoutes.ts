import { Router } from "express";
import {
  authenticate,
  getDeviceStatus,
  listDevices,
  listHomes,
  setDeviceMode,
} from "../../src/controllers/bghController";

const router = Router();

router.post("/auth/login", authenticate);
router.get("/homes", listHomes);
router.get("/homes/:homeId/devices", listDevices);
router.get("/homes/:homeId/devices/:deviceId", getDeviceStatus);
router.post("/devices/:deviceId/mode", setDeviceMode);

export default router;
