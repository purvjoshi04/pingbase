import { Hono } from "hono";
import { cors } from "hono/cors";
import router from "./routes";

const app = new Hono();

app.use("*", cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.route("/api", router);

if (process.env.NODE_ENV !== "test") {
    Bun.serve({
        port: Number(Bun.env.PORT) || 3001,
        fetch: app.fetch,
    });
    console.log(`Started server on port ${Bun.env.PORT || 3001}`);
}

export { app };