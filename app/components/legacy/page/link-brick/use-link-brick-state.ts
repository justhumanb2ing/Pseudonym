import { useMemo } from "react";

import { useEditableField } from "@/hooks/use-editable-field";
import { usePageGridActions } from "@/components/legacy/page/page-grid-context";
import type { PageGridBrick } from "service/pages/page-grid";
import { buildLinkBrickViewModel } from "@/utils/link-brick-view-model";

type UseLinkBrickStateParams = {
  brick: PageGridBrick<"link">;
};

export function useLinkBrickState({ brick }: UseLinkBrickStateParams) {
  const { updateLinkBrick, isEditable } = usePageGridActions();
  const viewModel = useMemo(
    () => buildLinkBrickViewModel(brick.data),
    [brick.data]
  );
  const titleClampClass = resolveTitleClampClass(viewModel.titleLines);
  const isUploading = brick.status === "loading";

  const {
    value: title,
    handleChange: handleTitleChange,
    handleBlur: handleTitleBlur,
    handleFocus: handleTitleFocus,
  } = useEditableField({
    initialValue: viewModel.title,
    onCommit: (nextValue) => {
      const normalizedTitle = normalizeLinkTitle(nextValue);
      updateLinkBrick({
        id: brick.id,
        data: { ...brick.data, title: normalizedTitle },
      });
    },
    normalize: normalizeLinkTitle,
    isEditable,
  });

  return {
    viewModel,
    title,
    titleClampClass,
    isUploading,
    isEditable,
    handleTitleChange,
    handleTitleBlur,
    handleTitleFocus,
  };
}

function resolveTitleClampClass(lines: number) {
  switch (lines) {
    case 1:
      return "line-clamp-1 truncate";
    case 2:
      return "line-clamp-2";
    case 3:
      return "line-clamp-3";
    default:
      return "";
  }
}

function normalizeLinkTitle(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
