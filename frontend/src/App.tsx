import { useEffect, useState } from "react";
import "./App.css";

type PingPayload =
  | string
  | {
      message?: unknown;
      ping?: unknown;
    };

const BACKEND_URL = "http://localhost:4000/api/ping";

function extractMessage(payload: PingPayload): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (typeof payload.ping === "string") {
      return payload.ping;
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  }

  return JSON.stringify(payload);
}

function App(): JSX.Element {
  const [ping, setPing] = useState<string>("");

  useEffect(() => {
    let active = true;

    const fetchPing = async (): Promise<void> => {
      try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const contentType = response.headers.get("content-type") ?? "";
        const payload: PingPayload = contentType.includes("application/json")
          ? await response.json()
          : await response.text();

        if (!active) {
          return;
        }

        setPing(extractMessage(payload));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(error);
        setPing("Error al contactar el backend");
      }
    };

    fetchPing();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app">
      <h1>Backend dice: {ping || "..."}</h1>
    </main>
  );
}

export default App;
