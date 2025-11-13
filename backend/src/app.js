import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  const allowedOrigins =
    env.CORS_ORIGIN === "*"
      ? undefined
      : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

  app.use(
    cors({
      origin: allowedOrigins
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
