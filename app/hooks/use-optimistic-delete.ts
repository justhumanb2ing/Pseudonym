import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

/**
 * 액션 응답이 link-remove 성공 응답인지 확인하는 타입 가드
 */
export function isLinkRemoveSuccess(
	data: PageProfileActionData | undefined,
	itemId: string,
): boolean {
	return !!(data?.success && data?.intent === "link-remove" && data?.itemId === itemId);
}

/**
 * 낙관적 삭제를 관리하는 커스텀 훅
 *
 * React Router v7의 베스트 프랙티스를 적용하여:
 * - fetcher.formData를 통해 삭제 중인 아이템 추적
 * - 삭제 실패시 자동 롤백
 * - 명확한 상태 관리와 타입 안정성
 * - initialItems 변경 시 자동 동기화 (추가된 아이템 반영)
 *
 * @param initialItems 초기 아이템 목록
 * @returns 낙관적 업데이트가 적용된 아이템 목록과 삭제 함수
 */
export function useOptimisticDelete<T extends { id: string }>(initialItems: T[]) {
	const deleteFetcher = useFetcher<PageProfileActionData>();
	const [items, setItems] = useState(initialItems);
	const previousItemsRef = useRef<T[]>(initialItems);

	// fetcher.formData를 사용하여 현재 삭제 중인 아이템 ID 추출
	const deletingItemId = useMemo(() => {
		if (deleteFetcher.state === "idle" || !deleteFetcher.formData) {
			return null;
		}
		const intent = deleteFetcher.formData.get("intent");
		if (intent !== "link-remove") {
			return null;
		}
		return deleteFetcher.formData.get("itemId")?.toString() ?? null;
	}, [deleteFetcher.state, deleteFetcher.formData]);

	const isDeleting = deleteFetcher.state !== "idle";

	/**
	 * initialItems 변경 시 items 동기화
	 * - 삭제 작업 중이 아닐 때만 동기화 (낙관적 삭제 유지)
	 * - 새 아이템이 추가되면 자동으로 반영됨
	 */
	useEffect(() => {
		if (!isDeleting && !deletingItemId) {
			setItems(initialItems);
			previousItemsRef.current = initialItems;
		}
	}, [initialItems, isDeleting, deletingItemId]);

	/**
	 * 아이템 삭제 핸들러 (낙관적 UI 업데이트)
	 */
	const deleteItem = (item: T) => {
		// 삭제 전 현재 상태 저장 (롤백용)
		previousItemsRef.current = items;

		// 낙관적 UI 업데이트: 즉시 아이템 제거
		setItems((prev) => prev.filter((entry) => entry.id !== item.id));

		// 서버에 삭제 요청
		const formData = new FormData();
		formData.set("intent", "link-remove");
		formData.set("itemId", item.id);
		deleteFetcher.submit(formData, { method: "post" });
	};

	/**
	 * 삭제 결과 처리 및 실패시 롤백
	 */
	useEffect(() => {
		// 요청이 완료되지 않았거나 삭제 중인 아이템이 없으면 무시
		if (deleteFetcher.state !== "idle" || !deletingItemId) {
			return;
		}

		// 삭제 성공 여부 확인
		const isSuccess = isLinkRemoveSuccess(deleteFetcher.data, deletingItemId);

		// 삭제 실패시 이전 상태로 롤백
		if (!isSuccess) {
			setItems(previousItemsRef.current);
		}
	}, [deleteFetcher.state, deleteFetcher.data, deletingItemId]);

	return {
		items,
		deleteItem,
		isDeleting,
		deletingItemId,
	};
}
