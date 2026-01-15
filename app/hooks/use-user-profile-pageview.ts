import { useMemo } from "react";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

type UseUserProfilePageViewInput = {
  id: string;
  isOwner: boolean;
};

export function useUserProfilePageView({
  id,
  isOwner,
}: UseUserProfilePageViewInput) {
  const pageViewProps = useMemo(
    () => ({
      [UMAMI_PROP_KEYS.ctx.pageId]: id,
      [UMAMI_PROP_KEYS.ctx.pageKind]: "user_profile",
      [UMAMI_PROP_KEYS.ctx.role]: isOwner ? "owner" : "viewer",
    }),
    [id, isOwner]
  );

  useUmamiPageView({
    url: id ? `/user/${id}` : undefined,
    title: "User Page",
    props: pageViewProps,
    eventName: UMAMI_EVENTS.page.userProfileView,
    dedupeKey: id ? `user:${id}` : undefined,
  });
}
