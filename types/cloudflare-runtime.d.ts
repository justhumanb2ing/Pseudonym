interface ExecutionContext {
	waitUntil(promise: Promise<unknown>): void;
	passThroughOnException(): void;
}

type ExportedHandler<Env = unknown> = {
	fetch?: (request: Request, env: Env, ctx: ExecutionContext) => Response | Promise<Response>;
};
