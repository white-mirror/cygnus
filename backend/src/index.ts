import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import bghRoutes from "app/routes/bghRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/bgh", bghRoutes);

app.get("/api/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong desde backend :)" });
});

app.use(
  (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("Unhandled error", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error.",
    });
  },
);

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
