## 디렉터리 규칙 (프로젝트 구조)

이 프로젝트는 “역할별 폴더”가 아니라 “관심사/레이어 기준”으로 코드를 배치한다.
파일을 생성/이동할 때 아래 규칙을 따른다.

### 1) UI / Components
- UI 컴포넌트: `components/`
- 디자인 시스템/공용 UI(shadcn/ui 등): `components/ui/`
- 페이지/라우팅 단(프레임워크 종속): `app/` (프레임워크가 Next.js가 아닐 경우 해당 프레임워크의 라우팅 폴더)

### 2) Hooks
- 공용 훅: `hooks/`
- 특정 도메인 전용 훅이 많아지면: `hooks/<domain>`

### 3) Services (비즈니스/데이터 로직)
- 서비스 함수(서버/데이터/비즈니스 로직): `service/`
- 도메인별로 폴더를 나눈다: `service/<domain>/...`
- UI 컴포넌트는 service를 호출하되, service가 UI를 의존하면 안 된다.

### 4) Lib / Utils
- 범용 유틸/헬퍼: `lib/`
- 순수 유틸 함수는 프레임워크 의존성이 없어야 한다.
- 특정 도메인 전용 유틸은 `service/<domain>/utils/`로 둔다(전역 lib로 올리지 않는다).

### 5) Types / Schemas
- 공용 타입: `types/`
- 스키마/계약(JSON Schema 등): `types/schemas/` (또는 `schemas/` 중 하나로 고정)
- DB/외부 계약에서 생성되는 타입은 한 위치로 고정한다. (예: `types/database.types.ts`)

### 6) Config
- 설정 및 자동화/파이프라인 관련: `config/`
- 환경 변수 예시는 `.env.example`, 실제 로컬은 `.env.local` (항상 동기화)

### 7) Tests
- 단위 테스트: `test/unit/` 또는 “코로케이션(파일 옆)” 중 하나를 선택해 통일한다.
- E2E 테스트: `test/e2e/`
- 테스트 파일 명명/구조는 기능 단위로 예측 가능해야 한다.
