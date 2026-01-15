import type { BrickLinkRow } from "types/brick";

export type LinkBrickViewModel = {
  title: string;
  description: string | null;
  siteLabel: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  showIcon: boolean;
  showSiteLabel: boolean;
  showDescription: boolean;
  showImage: boolean;
  titleLines: number;
  descriptionLines: number;
};

export function buildLinkBrickViewModel(
  data: BrickLinkRow
): LinkBrickViewModel {
  const title = resolveTitle(data);
  const description = normalizeText(data.description);
  const siteLabel = resolveSiteLabel(data);
  const imageUrl = normalizeText(data.image_url);
  const iconUrl = normalizeText(data.icon_url);

  return {
    title,
    description,
    siteLabel,
    imageUrl,
    iconUrl,
    showIcon: true,
    showSiteLabel: !!siteLabel,
    showDescription: !!description,
    showImage: !!imageUrl,
    titleLines: 2,
    descriptionLines: 2,
  };
}

function resolveTitle(data: BrickLinkRow) {
  return (
    normalizeText(data.title) ?? normalizeText(data.url) ?? "Untitled link"
  );
}

function resolveSiteLabel(data: BrickLinkRow) {
  return normalizeText(data.site_name) ?? resolveLinkHost(data.url);
}

function resolveLinkHost(value: string) {
  const trimmed = normalizeText(value);
  if (!trimmed) {
    return null;
  }

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
