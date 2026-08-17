import { createRequestHandler } from "@react-router/express";
import express from "express";
import { createContext, RouterContextProvider } from "react-router";

export const valueFromExpressContext = createContext<string>();

export const app = express();

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      const context = new RouterContextProvider();
      context.set(valueFromExpressContext, "Hello from Express");
      return context;
    },
  }),
);
