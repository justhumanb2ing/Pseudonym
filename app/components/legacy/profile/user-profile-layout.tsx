import BottomActionBar from "@/components/legacy/layout/bottom-action-bar";
import ProfileHeaderEditor from "@/components/legacy/profile/profile-header-editor";
import { cn } from "@/lib/utils";
import LayoutToggle from "@/components/legacy/layout/layout-toggle";
import AppToolbar from "@/components/legacy/layout/app-toolbar";
import { OwnerGate } from "@/components/legacy/auth/owner-gate";
import { Separator } from "@/components/ui/separator";
import UserProfileBrickSection from "@/components/legacy/profile/user-profile-brick-section";

type UserProfileLayoutProps = {
  pageId: string;
  ownerId: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  handle: string;
  isOwner: boolean;
  isPublic: boolean;
  isMobilePreview: boolean;
  onTogglePreview: (layout: "desktop" | "mobile") => void;
  isEmpty: boolean;
};

export default function UserProfileLayout({
  pageId,
  ownerId,
  title,
  description,
  imageUrl,
  handle,
  isOwner,
  isPublic,
  isMobilePreview,
  onTogglePreview,
  isEmpty,
}: UserProfileLayoutProps) {
  return (
    <div
      className={cn(
        `flex flex-col gap-4 transition-all ease-in-out duration-700 bg-background relative`,
        "max-w-full w-full h-full my-0 min-h-dvh",
        // !isMobilePreview && "xl:h-dvh xl:overflow-hidden",
        // isMobilePreview && "rounded-3xl"
        isMobilePreview
          ? "self-start border rounded-[36px] shadow-lg max-w-lg mx-auto container h-[calc(100dvh-12rem)] overflow-hidden"
          : "max-w-full w-full h-full my-0 min-h-dvh xl:h-dvh xl:overflow-hidden"
      )}
    >
      <div
        className={cn(
          "relative flex flex-col gap-4 grow min-h-0",
          isMobilePreview
            ? "overflow-y-auto overscroll-contain scrollbar-hide"
            : "mx-auto container max-w-lg xl:max-w-full"
        )}
      >
        {/* Desktop Badge View */}
        {/* <DesktopBadgeView
          isOwner={isOwner}
          umamiResult={umamiResult}
          isMobilePreview={isMobilePreview}
        /> */}

        <div
          className={cn(
            "flex flex-col gap-4 grow relative",
            !isMobilePreview &&
              "mx-auto container xl:mx-0 xl:flex-row xl:min-h-0 max-w-full xl:justify-between"
          )}
        >
          {/* Mobile Badge View */}
          {/* <MobileBadgeView
            isOwner={isOwner}
            umamiResult={umamiResult}
            isMobilePreview={isMobilePreview}
          /> */}

          {/* Page Information Section */}
          <section
            className={cn(
              "shrink sticky top-0 z-0 h-dvh",
              !isMobilePreview &&
                "xl:flex xl:w-1/3 xl:static xl:h-auto xl:py-0"
            )}
          >
            <ProfileHeaderEditor
              pageId={pageId}
              userId={ownerId}
              imageUrl={imageUrl}
              title={title}
              description={description}
              handle={handle}
              isOwner={isOwner}
              isMobilePreview={isMobilePreview}
              isPublic={isPublic}
            />
          </section>

          {/* Page Brick Section - Mobile App Style Bottom Sheet */}
          <div
            className={cn(
              isMobilePreview ? "" : "xl:grow xl:flex xl:justify-center"
            )}
          >
            <UserProfileBrickSection
              isMobilePreview={isMobilePreview}
              isEmpty={isEmpty}
            />
          </div>
        </div>

        <Separator
          className={cn(
            "block xl:hidden data-[orientation=horizontal]:bg-muted data-[orientation=horizontal]:h-2"
          )}
        />

        {/* TODO: xl 이상일 때 위치 변경 */}
        {/* Action bar */}
        <aside
          className={cn(
            "rounded bg-background static h-28 py-6 pb-10 flex items-center justify-center xl:fixed xl:bottom-10 xl:right-48 xl:px-2 xl:mb-0 xl:py-2 xl:h-fit xl:border"
          )}
        >
          <BottomActionBar isOwner={isOwner} isMobilePreview={isMobilePreview} />
        </aside>
      </div>

      <OwnerGate isOwner={isOwner}>
        <LayoutToggle isDesktop={!isMobilePreview} onToggle={onTogglePreview} />
        {/* <div className="flex items-center gap-1">
          <SavingStatusIndicator />
        </div> */}
      </OwnerGate>

      <aside
        className={cn(
          "fixed bottom-28 right-48",
          isMobilePreview ? "hidden" : "hidden xl:block"
        )}
      >
        <AppToolbar />
      </aside>
    </div>
  );
}
