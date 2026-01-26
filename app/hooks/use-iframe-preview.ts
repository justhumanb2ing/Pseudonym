import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useFetchers } from "react-router";
import { PREVIEW_MESSAGE_TYPE } from "@/lib/preview";

interface UseIframePreviewOptions<TActionData extends { success?: boolean }> {
	/** iframe 요소에 대한 ref */
	iframeRef: RefObject<HTMLIFrameElement | null>;
	/** 현재 라우트의 actionData (선택적) */
	actionData?: TActionData;
	/** 메시지 타입 (기본값: PREVIEW_MESSAGE_TYPE) */
	messageType?: string;
	/** 수동으로 refresh를 비활성화할지 여부 (기본값: false) */
	disabled?: boolean;
}

interface UseIframePreviewReturn {
	/** iframe onLoad 이벤트 핸들러 */
	handleIframeLoad: () => void;
	/** 수동으로 preview refresh 트리거 */
	notifyRefresh: () => void;
	/** iframe이 준비되었는지 여부 */
	isReady: boolean;
}

/**
 * iframe preview와의 통신을 관리하는 custom hook
 *
 * actionData 또는 fetchers가 성공하면 자동으로 preview를 refresh합니다.
 * 중복 신호를 방지하기 위해 fetcher key별로 마지막 payload를 추적합니다.
 *
 * @example
 * ```tsx
 * const previewFrameRef = useRef<HTMLIFrameElement>(null);
 * const actionData = useActionData<ActionData>();
 * const { handleIframeLoad } = useIframePreview({
 *   iframeRef: previewFrameRef,
 *   actionData,
 * });
 *
 * return <ProfilePreviewFrame iframeRef={previewFrameRef} onLoad={handleIframeLoad} />
 * ```
 */
export function useIframePreview<TActionData extends { success?: boolean } = { success?: boolean }>(
	options: UseIframePreviewOptions<TActionData>,
): UseIframePreviewReturn {
	const { iframeRef, actionData, messageType = PREVIEW_MESSAGE_TYPE, disabled = false } = options;

	const [isReady, setIsReady] = useState(false);
	const lastSignalRef = useRef(new Map<string, unknown>());
	const fetchers = useFetchers();

	const handleIframeLoad = useCallback(() => {
		if (!disabled) {
			setIsReady(true);
		}
	}, [disabled]);

	const notifyRefresh = useCallback(() => {
		if (disabled || !isReady) {
			return;
		}

		const previewWindow = iframeRef.current?.contentWindow;

		if (!previewWindow) {
			return;
		}

		previewWindow.postMessage({ type: messageType }, "*");
	}, [disabled, isReady, iframeRef, messageType]);

	// actionData 성공 시 preview refresh
	useEffect(() => {
		if (actionData?.success) {
			notifyRefresh();
		}
	}, [actionData?.success, notifyRefresh]);

	// fetchers 성공 시 preview refresh (중복 제거)
	useEffect(() => {
		for (const fetcher of fetchers) {
			const data = fetcher.data as TActionData | undefined;

			if (!data?.success) {
				continue;
			}

			const key = fetcher.key;
			const lastPayload = lastSignalRef.current.get(key);

			// 중복 감지: 동일한 데이터 객체이면 skip
			if (lastPayload === data) {
				continue;
			}

			lastSignalRef.current.set(key, data);
			notifyRefresh();
		}
	}, [fetchers, notifyRefresh]);

	return {
		handleIframeLoad,
		notifyRefresh,
		isReady,
	};
}
