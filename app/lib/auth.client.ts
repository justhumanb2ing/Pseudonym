import { createAuthClient } from "better-auth/react";

// baseURL은 같은 도메인에서 실행 시 생략 가능
// Better Auth는 기본적으로 /api/auth 경로 사용
export const authClient = createAuthClient({
	plugins: [],
});
