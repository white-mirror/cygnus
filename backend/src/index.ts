import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong desde backend ??" });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
