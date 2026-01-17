export interface BrickLinkRow {
	title: string | null;
	description: string | null;
	url: string;
	site_name: string | null;
	icon_url: string | null;
	image_url: string | null;
}

export interface BrickTextRow {
	text: string;
}

/**
 * brick.type → 실제 Row 타입 매핑
 * 신규 brick 추가 시 여기만 수정
 */
export interface BrickRowMap {
	link: BrickLinkRow;
	text: BrickTextRow;
}

export type BrickType = keyof BrickRowMap;

/**
 * type-safe brick row
 */
export type BrickRow<T extends BrickType = BrickType> = {
	id: string;
	type: T;
	data: BrickRowMap[T];
};
