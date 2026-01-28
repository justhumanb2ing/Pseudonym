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

    // Hyperdrive connectionString을 사용하여 모든 요청 처리
    return runWithConnectionString(env.HYPERDRIVE.connectionString, () =>
      requestHandler(request, provider)
    );
  },
} satisfies ExportedHandler<Env>;
