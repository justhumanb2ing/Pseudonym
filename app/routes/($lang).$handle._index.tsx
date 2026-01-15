import type { Route } from "./+types/($lang).$handle._index";
import { getAuth } from "@clerk/react-router/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "react-router";
import { z } from "zod";
import {
  fetchUmamiVisits,
  getTodayRange,
  resolveUmamiConfig,
  UMAMI_TIMEZONE,
  UMAMI_UNIT,
  type UmamiResponse,
} from "../service/umami";
import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { profile } from "@forge42/seo-tools/structured-data/profile";
import { metadataConfig } from "@/config/metadata";
import { useUserProfilePageView } from "@/hooks/use-user-profile-pageview";
import { buildUrl, defaultImageUrl } from "@/lib/url";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import PageDetailsEditor from "@/components/page/page-details-editor";
import {
  normalizePageDetails,
  pageDetailsSchema,
} from "@/service/pages/page-details";
import { getLocalizedPath } from "@/utils/localized-path";

export const meta = ({ loaderData, params }: Route.MetaArgs) => {
  const handle = params.handle ?? "user";
  const url = buildUrl(params.lang, `/${handle}`, metadataConfig.url);
  const title = loaderData?.page?.title ?? handle;
  const description =
    loaderData?.page?.description ?? "Personal profile page on beyondthewave.";
  const imageUrl = loaderData?.page?.image_url ?? defaultImageUrl;

  return generateMeta(
    {
      title,
      description,
      url,
      image: imageUrl,
      siteName: metadataConfig.title,
      twitterCard: metadataConfig.twitterCard,
    },
    [
      {
        "script:ld+json": breadcrumbs(url, ["Home", title]),
      },
      {
        "script:ld+json": profile({
          "@type": "ProfilePage",
          name: title,
          description,
          image: imageUrl,
          url,
        }),
      },
    ]
  );
};

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  const { handle } = args.params;

  if (!handle) {
    throw new Response("Not Found", { status: 404 });
  }

  const supabase = await getSupabaseServerClient(args);
  const pageSelectQuery =
    "id, owner_id, handle, title, description, image_url, is_public, is_primary";

  const { data: page, error } = await supabase
    .from("pages")
    .select(pageSelectQuery)
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    throw new Response(error.message, { status: 500 });
  }

  if (!page) {
    throw new Response("Not Found", { status: 404 });
  }

  const isOwner = page.owner_id === userId;
  if (!page.is_public && !isOwner)
    throw new Response("Not Found", { status: 404 });

  let umamiResult: UmamiResponse | null = null;

  const umamiConfig = resolveUmamiConfig();

  if (!umamiConfig) {
    umamiResult = {
      ok: false,
      status: 500,
      error: "Missing Umami environment configuration.",
    };
  } else {
    try {
      const { startAt, endAt } = getTodayRange(UMAMI_TIMEZONE);
      umamiResult = await fetchUmamiVisits({
        ...umamiConfig,
        websiteId: umamiConfig.websiteId,
        startAt,
        endAt,
        unit: UMAMI_UNIT,
        timezone: UMAMI_TIMEZONE,
        pageId: page.id,
      });
    } catch (error) {
      umamiResult = {
        ok: false,
        status: 500,
        error: error instanceof Error ? error.message : error,
      };
    }
  }

  return {
    page,
    handle,
    isOwner,
    umamiResult,
  };
}

export type ActionData = {
  formError?: string;
  fieldErrors?: {
    title?: string;
    description?: string;
  };
  success?: boolean;
};

export async function action(args: Route.ActionArgs) {
  const auth = await getAuth(args);
  if (!auth.userId) {
    throw redirect(getLocalizedPath(args.params.lang, "/sign-in"));
  }

  const formData = await args.request.formData();
  const parsed = pageDetailsSchema.safeParse({
    pageId: formData.get("pageId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    return {
      fieldErrors: {
        title: tree.properties?.title?.errors[0],
        description: tree.properties?.description?.errors[0],
      },
      formError: tree.properties?.pageId?.errors[0],
    } satisfies ActionData;
  }

  const { pageId } = parsed.data;
  const normalized = normalizePageDetails(parsed.data);
  const supabase = await getSupabaseServerClient(args);
  const { error: updateError } = await supabase
    .from("pages")
    .update({
      title: normalized.title,
      description: normalized.description,
    })
    .eq("id", pageId);

  if (updateError) {
    return { formError: updateError.message } satisfies ActionData;
  }

  return { success: true } satisfies ActionData;
}

export default function UserProfileRoute({ loaderData }: Route.ComponentProps) {
  const {
    page: { id, owner_id, title, description, image_url, is_public },
    handle,
    isOwner,
  } = loaderData;

  useUserProfilePageView({ id, isOwner });

  return (
    <main className="container max-w-7xl mx-auto h-full">
      <div className="flex flex-col items-center gap-4">
        <PageDetailsEditor
          pageId={id}
          title={title}
          description={description}
          isOwner={isOwner}
        />
        <Cropper
          zoom={1}
          className="h-80"
          image="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/cropper-06_dduwky.jpg"
        >
          <CropperDescription />
          <CropperImage />
          <CropperCropArea className="rounded-full" />
        </Cropper>
      </div>
    </main>
  );
}
