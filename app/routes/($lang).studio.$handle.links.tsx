import { useOutletContext } from "react-router";
import ProfileImageUploader from "@/components/page/profile-image-uploader";
import type { StudioOutletContext } from "types/studio.types";
import PageDetailsEditor from "@/components/page/page-details-editor";
import AddItemFlow from "@/components/page/add-item-flow";
import {
  handleLinkSave,
  handlePageDetails,
  handleRemoveImage,
  handleUpdateImage,
  type PageProfileActionData,
} from "@/service/pages/page-profile.action";
import type { Route } from "./+types/($lang).studio.$handle.links";
import { getSupabaseServerClient } from "@/lib/supabase";

export type ActionData = PageProfileActionData;

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData();
  const intent = formData.get("intent");
  const supabase = await getSupabaseServerClient(args);

  // Intent 타입 검증
  const validIntents = [
    "page-details",
    "update-image",
    "remove-image",
    "link-save",
  ] as const;

  if (!intent || typeof intent !== "string") {
    return {
      formError: "Action intent is required",
      success: false,
    } satisfies ActionData;
  }

  if (!validIntents.includes(intent as any)) {
    return {
      formError: "Invalid action intent",
      success: false,
    } satisfies ActionData;
  }

  switch (intent) {
    case "update-image":
      return handleUpdateImage({ formData, supabase });
    case "remove-image":
      return handleRemoveImage({ formData, supabase });
    case "link-save":
      return handleLinkSave({ formData, supabase });
    case "page-details":
      return handlePageDetails({ formData, supabase });
    default:
      // 타입 시스템에서 도달 불가능한 코드
      return {
        formError: "Unhandled action intent",
        success: false,
      } satisfies ActionData;
  }
}

// TODO: AddItemFlow 사용 흐름, UI, UX 변경
export default function StudioLinksRoute() {
  const {
    page: { id, owner_id, title, description, image_url },
    handle,
  } = useOutletContext<StudioOutletContext>();

  return (
    <section className="flex flex-col gap-6 p-2 grow pb-6 px-4">
      <header className="font-extrabold text-3xl md:text-5xl py-4 flex items-center">
        <h1>Link</h1>
      </header>
      <article className="flex flex-row gap-6 grow">
        <div className="basis-full flex flex-col gap-4 xl:basis-3/5">
          <aside className="bg-surface rounded-2xl p-5 h-fit flex items-center shadow-float">
            <div className="flex gap-2 items-center">
              <ProfileImageUploader
                pageId={id}
                userId={owner_id}
                imageUrl={image_url}
                alt={title ?? handle ?? "Profile image"}
              />
              <PageDetailsEditor
                pageId={id}
                title={title}
                description={description}
              />
            </div>
          </aside>
          <main className="bg-surface rounded-2xl p-3 basis-7/8 shadow-float">
            <AddItemFlow pageId={id} />
          </main>
        </div>
        <aside className="hidden xl:block basis-2/5 bg-surface rounded-2xl p-3 h-full shadow-float">
          Preview
        </aside>
      </article>
    </section>
  );
}
