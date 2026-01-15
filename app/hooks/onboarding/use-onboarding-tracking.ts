import { useCallback, useRef } from "react";

import { createUmamiAttemptId, trackUmamiEvent } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

type Step = "handle" | "details" | "complete";

/**
 * 온보딩 프로세스의 분석 이벤트 추적을 위한 훅
 */
export function useOnboardingTracking() {
  const signupAttemptIdRef = useRef(createUmamiAttemptId("signup"));
  const signupStartedRef = useRef(false);
  const lastSubmitAttemptRef = useRef<string | null>(null);

  const trackSignupStart = useCallback((currentStep: Step) => {
    if (signupStartedRef.current) {
      return;
    }

    signupStartedRef.current = true;
    trackUmamiEvent(
      UMAMI_EVENTS.auth.signup.start,
      {
        [UMAMI_PROP_KEYS.ctx.attemptId]: signupAttemptIdRef.current,
        [UMAMI_PROP_KEYS.ctx.step]: currentStep,
      },
      {
        dedupeKey: `signup-start:${signupAttemptIdRef.current}`,
        once: true,
      }
    );
  }, []);

  const trackSignupSubmit = useCallback((currentStep: Step) => {
    const attemptId = createUmamiAttemptId("signup-submit");
    lastSubmitAttemptRef.current = attemptId;
    trackUmamiEvent(
      UMAMI_EVENTS.auth.signup.submit,
      {
        [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
        [UMAMI_PROP_KEYS.ctx.step]: currentStep,
      },
      {
        dedupeKey: `signup-submit:${attemptId}`,
        once: true,
      }
    );
  }, []);

  const trackSignupSuccess = useCallback(
    (handle: string) => {
      trackUmamiEvent(
        UMAMI_EVENTS.auth.signup.success,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]:
            lastSubmitAttemptRef.current ?? signupAttemptIdRef.current,
          [UMAMI_PROP_KEYS.ctx.step]: "complete",
        },
        {
          dedupeKey: `signup-success:${handle}`,
          once: true,
        }
      );
    },
    []
  );

  const trackSignupError = useCallback(
    (currentStep: Step, errorType: "server" | "validation") => {
      trackUmamiEvent(
        UMAMI_EVENTS.auth.signup.error,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]:
            lastSubmitAttemptRef.current ?? signupAttemptIdRef.current,
          [UMAMI_PROP_KEYS.ctx.step]: currentStep,
          [UMAMI_PROP_KEYS.ctx.errorCode]: errorType,
        },
        {
          dedupeKey: `signup-error:${lastSubmitAttemptRef.current ?? "unknown"}`,
          once: true,
        }
      );
    },
    []
  );

  return {
    trackSignupStart,
    trackSignupSubmit,
    trackSignupSuccess,
    trackSignupError,
  };
}
