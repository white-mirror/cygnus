import "dotenv/config";
import { randomUUID } from "crypto";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import type { Logger } from "pino";
import logger from "./logger";
import bghRoutes from "app/routes/bghRoutes";

type LoggedRequest = Request & { log: Logger };

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  pinoHttp({
    logger,
    genReqId: () => randomUUID(),
    autoLogging: {
      ignore: (req) => req.url === "/api/ping",
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
        };
      },
      res(response) {
        return {
          statusCode: response.statusCode,
        };
      },
      err(error: unknown) {
        return error;
      },
    },
  }),
);

app.use(cors());
app.use(express.json());

app.use("/api/bgh", bghRoutes);

app.get("/api/ping", (req: Request, res: Response) => {
  const request = req as LoggedRequest;
  request.log.debug("Received ping request");
  res.json({ message: "pong desde backend :)" });
});

app.use(
  (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const request = req as LoggedRequest;
    request.log.error({ err: error }, "Unhandled error");
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error.",
    });
  },
);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Servidor backend escuchando");
});
