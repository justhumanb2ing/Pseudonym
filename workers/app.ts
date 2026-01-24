import { createContext, createRequestHandler, RouterContextProvider } from "react-router";

const cloudflareContext = createContext<{ env: Env; ctx: ExecutionContext }>();

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const provider = new RouterContextProvider(
      new Map([[cloudflareContext, { env, ctx }]])
    );
    return requestHandler(request, provider);
  },
} satisfies ExportedHandler<Env>;
