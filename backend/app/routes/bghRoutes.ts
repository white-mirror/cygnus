import { Router } from "express";
import {
  getDeviceStatus,
  listDevices,
  listHomes,
  setDeviceMode,
  streamDeviceEvents,
} from "../../src/controllers/bghController";

const router = Router();

router.get("/homes", listHomes);
router.get("/homes/:homeId/devices", listDevices);
router.get("/homes/:homeId/devices/:deviceId", getDeviceStatus);
router.post("/devices/:deviceId/mode", setDeviceMode);
router.get("/events", streamDeviceEvents);

export default router;
