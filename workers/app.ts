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
    // 1. runWithConnectionString 앞뒤에 로그 넣기
    console.log("before runWithConnectionString");

    const response = await runWithConnectionString(
      env.HYPERDRIVE.connectionString,
      env,
      () => {
        console.log("inside runWithConnectionString callback - before requestHandler");
        return requestHandler(request, provider);
      }
    );

    console.log("after runWithConnectionString");

    return response;

  },
} satisfies ExportedHandler<Env>;
