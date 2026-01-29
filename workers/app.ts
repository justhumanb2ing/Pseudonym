import { createContext, createRequestHandler, RouterContextProvider } from "react-router";
import { runWithConnectionString } from "../app/lib/auth.server";

export const cloudflareContext = createContext<{ env: Env; ctx: ExecutionContext }>();

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const provider = new RouterContextProvider(
      new Map([[cloudflareContext, { env, ctx }]])
    );

    const response = await runWithConnectionString(
      env.HYPERDRIVE.connectionString,
      env,
      () => {
        return requestHandler(request, provider);
      }
    );

    return response;

  },
} satisfies ExportedHandler<Env>;
