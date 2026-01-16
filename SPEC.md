# beyondthewave - 기술 사양서 (Technical Specification)

## 1. 목적 및 범위

### 1.1 목적 (What/Why)
사용자가 하나의 프로필 페이지에서 여러 링크와 콘텐츠를 관리하고 공유할 수 있도록 한다.

### 1.2 범위 (In/Out)

#### In Scope (v1.0)
- 사용자 인증 및 온보딩 (Clerk 기반)
- 프로필 페이지 생성/편집 (사용자당 1개)
- 콘텐츠 블록 관리 (text, link, map, image, video)
- 그리드 레이아웃 (데스크톱 4열, 모바일 2열 고정)
- 드래그/리사이즈 기능
- 공개/비공개 설정
- 핸들 기반 URL (/@username 형식)
- 핸들 변경 (현재 무제한)
- 자동 저장 (800ms debounce)
- 다국어 UI 지원 (한국어/영어, 페이지 콘텐츠는 단일 언어)
- 기본 SEO (메타 태그, OG, JSON-LD, sitemap, robots.txt)
- 기본 분석 (Umami, 내부 ID 수집, PII 제외)
- 미디어 업로드/관리 (Cloudflare R2, 블록 삭제 시 즉시 삭제)

#### Out of Scope (v1.0)
- 커스텀 도메인
- 모바일 네이티브 앱
- 다중 페이지 기능 (is_primary 구조만 준비됨)
- 그리드 커스터마이징 (컬럼 수 조정)
- section 블록 (타입 정의 완료, 현재 비활성화)
- 콘텐츠 다국어 (UI 언어만 지원)
- 자동화 테스트 (현재 수동 테스트만)

#### Future Plans
- 유료 플랜 (다중 페이지, 핸들 변경 횟수 제한, 고급 분석)
- section 블록 활성화
- 커스텀 도메인
- 콘텐츠 다국어 지원
- 그리드 커스터마이징
- 자동화 테스트 도입 (E2E, Unit)
- 에러 모니터링 (Sentry 등)

---

## 2. 핵심 사용자 플로우 (Happy Path)

1) 로그인 후 온보딩에서 핸들을 설정한다.
2) 에디터에서 블록을 추가/편집하고 자동 저장된다.
3) 공개로 전환하면 `/:lang/:handle` 경로로 외부 공유가 가능하다.

### 주요 예외/실패 케이스
- 핸들 중복: 실시간 중복 검증 후 입력 불가.
- 핸들 형식 오류: 영문 소문자/숫자만 허용 (정규식: `^[a-z0-9]+$`).
- 저장 실패: 에러 메시지 표시 ("Save failed"), 자동 재시도 없음.
  - 사용자가 다시 편집하면 자동 저장 재시도.
- 업로드 실패:
  - 파일 크기 제한 (이미지/비디오: 2MB)
  - 지원 형식: jpg, jpeg, png, gif, webp, avif (이미지), mp4, mov, webm, ogg, ogv, m4v (비디오)
  - 실패 시 플레이스홀더 블록 제거, 에러 토스트 표시.
- 업로드 중단: 페이지 이탈 시 진행 중인 업로드 취소, 플레이스홀더 블록 삭제.
- URL 저장: 크롤링 선행, 실패 시 저장 차단.
  - 자동 재시도: 3회 (지수 백오프, 짧은 초기 지연).
  - 실패 메시지: "Crawl failed. Please try again."
- 링크 메타데이터 가져오기: 로딩 상태로 표시, 비동기로 가져온 후 블록 업데이트.
- 비공개 페이지 접근: 소유자 외에는 404 반환 (RLS 기반).

---

## 3. 아키텍처 및 책임 경계

### 3.1 레이어 구조
- UI: `app/` (컴포넌트, 라우트, 화면 로직)
- Service: `service/` (비즈니스 로직, 데이터 처리)
- Lib: `app/lib/` (범용 유틸리티)

### 3.2 의존성 방향
- UI → Service → Lib
- Service는 UI에 의존하지 않음

### 3.3 Action 분리 기준
React Router의 action 함수는 복잡도에 따라 위치를 결정합니다:

#### 단순 CRUD (< 50줄)
- **위치**: 해당 라우트 파일 내 (app/routes/xxx.tsx)
- **기준**:
  - 단순한 데이터 조작
  - 단일 API 호출
  - 최소한의 검증 로직
  - 외부 라이브러리 의존성 최소
- **예시**:
  - `app/routes/api.delete-account.tsx` (47줄): 라우트 파일 내에 action 정의
  - 인증 확인 + 단일 API 호출 + 기본 에러 처리

#### 복잡한 비즈니스 로직 (≥ 50줄)
- **위치**: service/ 디렉토리 (flat 구조)
- **명명 규칙**: `service/{feature}.action.ts`
- **기준**:
  - 복잡한 검증 로직 (Zod 스키마 등)
  - 여러 단계의 데이터 처리
  - 외부 API 통합 (Resend, Stripe 등)
  - 다양한 에러 케이스 처리
  - 타입 정의가 다른 파일에서도 재사용됨
- **예시**:
  - `service/feedback.action.ts` (77줄): service/ 디렉토리에 분리
  - Zod 검증 + Resend API 호출 + 3가지 에러 케이스
  - ActionData, FieldErrors 타입을 훅과 컴포넌트에서 재사용

#### 장점
- **테스트 용이성**: Service 레이어를 독립적으로 테스트 가능
- **재사용성**: 다른 라우트에서 동일한 action import 가능
- **타입 안전성**: 타입을 중앙에서 관리하여 일관성 확보
- **의존성 격리**: 외부 라이브러리를 Service 레이어에만 의존
- **가독성**: 라우트 파일이 과도하게 비대해지는 것을 방지

---

## 4. 핵심 기능 요구사항

### 4.1 인증/온보딩
- Clerk 기반 인증 (OAuth, 이메일/비밀번호)
- 온보딩 플로우: 핸들 설정 (필수)
- 핸들 중복 실시간 검증
- 온보딩 완료 전 제한된 접근만 허용

### 4.2 프로필 페이지
- URL 형식: `/:lang/:handle` (예: `/ko/@john`, `/en/@mary`)
- 핸들 규칙:
  - 영문 소문자/숫자만 허용 (정규식: `^[a-z0-9]+$`)
  - 하이픈(-) 불허 (코드 구현 기준)
  - 중복 불가 (Supabase Unique Constraint)
  - 변경 정책:
    - 현재: 언제든 변경 가능 (무제한)
    - 향후: 유료 플랜에서 횟수 제한 예정 (예: 무료 월 1회)
- 공개/비공개 토글 (is_public 필드)
- 메타데이터: title (필수), description (선택), image_url (선택)
- is_primary 플래그:
  - 목적: 다중 페이지 지원 대비 (향후 유료 플랜)
  - 현재: 사용자당 1개 페이지만 허용

### 4.3 콘텐츠 블록
- 블록 타입:
  - **활성화:** text, link, map, image, video
  - **비활성화:** section (타입 정의 완료, UI 준비됨, 향후 활성화 예정)
- 그리드 레이아웃:
  - 데스크톱: 4열 고정 (GRID_COLS.desktop = 4)
  - 모바일: 2열 고정 (GRID_COLS.mobile = 2)
  - 사용자 커스터마이징: 불가 (Out of Scope)
  - 행 높이: 동적 (블록 타입별 제약)
- 드래그/리사이즈:
  - 라이브러리: react-grid-layout
  - 제약 (GRID_RULES):
    - text: 전체 너비 (w=cols), 높이 조정 불가
    - link: 1-2열 (minW=1, maxW=2), 1-4행 (minH=1, maxH=4)
    - image/video/map: 1-2열, 2-4행 (minW=1, maxW=2, minH=2, maxH=4)
- 미디어 파일:
  - 업로드: Cloudflare R2
  - 최대 크기: 2MB
  - 지원 형식:
    - 이미지: jpg, jpeg, png, gif, webp, avif
    - 비디오: mp4, mov, webm, ogg, ogv, m4v
  - 삭제 정책: 블록 삭제 시 R2에서도 즉시 삭제
- 지도 블록:
  - 지도 제공: Mapbox
  - 링크: Google Maps (href 필드)
  - 기본값: Seoul (lat=37.5665, lng=126.9780, zoom=11)

### 4.4 자동 저장
- 디바운스: 800ms 통일 (모든 블록 타입)
  - 텍스트 블록: 800ms
  - 맵 뷰포트: 800ms
  - 링크 제목: 800ms
- 변경 감지 후 자동 저장:
  - 블록 추가/삭제/편집
  - 레이아웃 변경 (드래그/리사이즈)
  - 페이지 메타데이터 (title, description, image_url)
- 저장 상태 표시:
  - idle: 변경 없음
  - saving: 저장 중
  - synced: 최신 상태
  - error: 저장 실패
- 저장 실패 처리:
  - 에러 메시지: "Save failed"
  - 자동 재시도: 없음 (사용자가 다시 편집하면 재시도)
  - 에러 분석: Umami 이벤트 발송 (feature.pageSave.error)

### 4.5 다국어
- UI 언어: 한국어, 영어
  - URL에 언어 코드 포함 (/:lang)
  - Clerk 인증 UI, 버튼, 메시지 등
  - intlayer 라이브러리 사용
- 페이지 콘텐츠: 단일 언어만 지원 (Out of Scope)
  - title, description: 하나의 언어로만 작성
  - 블록 콘텐츠: 다국어 지원 없음
  - 향후: JSONB 구조로 다국어 지원 고려 (Future Plans)

### 4.6 분석/SEO

#### 분석 (Umami)
- 이벤트 추적:
  - 페이지 뷰 (자동)
  - 사용자 행동 (signup, pageSave, profileVisibility 등)
- 허용 데이터:
  - 내부 식별자: pageId, ownerId, attemptId
  - 이유: 사용자별/페이지별 분석을 위해 필수
- 금지 데이터 (PII):
  - 이메일, 이름, 전화번호
  - Clerk User ID 원본 (해싱된 ID는 허용)
  - 민감한 개인정보
- 타임존: Asia/Seoul

#### SEO
- 메타 태그: title, description, OG, Twitter Card
- JSON-LD:
  - 조직 정보 (홈페이지)
  - Breadcrumb (프로필 페이지)
- Sitemap:
  - 언어별 sitemap 생성 (/ko/sitemap.xml, /en/sitemap.xml)
  - 공개 페이지만 포함 (is_public=true)
  - 비공개 페이지: 자동 제외
  - 동적 페이지 (/:lang/:handle): 현재 제외, 향후 공개 페이지만 포함 고려
- robots.txt:
  - User-agent: *
  - Allow: /
  - Sitemap: 언어별 sitemap URL

---

## 5. 데이터 모델 (핵심)

### pages 테이블
- `id` (UUID, Primary Key)
- `owner_id` (Text, Clerk 사용자 ID, Foreign Key → users.id)
- `handle` (Text, Unique, @ 포함 - 예: @john)
- `title` (Text, Not Null)
- `description` (Text, Nullable)
- `image_url` (Text, Nullable)
- `is_primary` (Boolean, Default: false)
  - 목적: 다중 페이지 지원 대비 (향후 유료 플랜)
  - 현재: 사용자당 1개 페이지만 허용
- `is_public` (Boolean, Default: false)
- `created_at` (Timestamptz)
- `updated_at` (Timestamptz)

### page_layouts 테이블
- `page_id` (UUID, Primary Key, Foreign Key → pages.id)
- `layout` (JSONB)
  - 구조: `{ bricks: BrickRow[] }`
  - BrickRow: `{ id, type, data, position, style, created_at, updated_at }`
  - position: `{ mobile: {x, y}, desktop: {x, y} }`
  - style: `{ mobile: {grid: {w, h}}, desktop: {grid: {w, h}} }`
- `created_at` (Timestamptz)
- `updated_at` (Timestamptz)

**page_layouts 분리 이유:**
- **성능 최적화:**
  - 레이아웃 데이터는 크기가 크고 자주 변경됨 (수백 KB ~ 수 MB)
  - 페이지 메타데이터(title, description, is_public)만 조회할 때 레이아웃 데이터 불필요
  - SELECT pages WHERE handle='@john' → 레이아웃 데이터 제외, 빠른 응답
- **1:1 관계 유지:**
  - Foreign Key Constraint (page_id → pages.id)
  - 페이지 삭제 시 레이아웃 자동 삭제 (ON DELETE CASCADE)
- **향후 확장 가능성:**
  - 레이아웃 버전 관리 (undo/redo)
  - 레이아웃 히스토리 테이블 추가
  - 레이아웃 캐싱 최적화

### users 테이블
- `id` (Text, Primary Key, Clerk User ID)
- `email` (Text, Not Null)
- `name` (Text, Not Null)
- `avatar_url` (Text, Nullable)
- `created_at` (Timestamptz)
- `updated_at` (Timestamptz)

### 접근 제어 (RLS)
- 공개 페이지: 누구나 읽기 가능 (is_public=true)
- 비공개 페이지: 소유자만 읽기/수정 가능 (owner_id = auth.uid())
- 레이아웃: 페이지 접근 권한과 동일

---

## 6. 외부 서비스 통합 (역할만 명시)

- Supabase: DB, RLS
- Clerk: 인증/세션
- Cloudflare R2: 이미지/파일 저장
- Mapbox: 지도 블록
- Umami: 분석
- Resend: 이메일(피드백)
- Vercel: 배포/SSR

---

## 7. 보안 및 제약

### 7.1 보안
- **환경 변수:**
  - 비밀 값은 환경 변수로만 주입
  - 절대 코드에 하드코딩 금지
  - 클라이언트 노출 변수: VITE_ 프리픽스
- **XSS 방지:**
  - React 기본 보호 의존 (자동 이스케이프)
  - dangerouslySetInnerHTML 사용 금지
  - 링크 URL: target="_blank" + rel="noopener noreferrer"
  - 사용자 입력: HTML 태그 렌더링하지 않음
- **RLS (Row Level Security):**
  - Supabase 기반
  - 소유자만 자신의 페이지/레이아웃 수정 가능
  - 공개 페이지는 누구나 읽기 가능
  - 비공개 페이지는 소유자만 읽기 가능 (애플리케이션 레벨 검증)
- **파일 업로드:**
  - 파일 크기 제한: 2MB
  - 파일 타입 검증: MIME type + 확장자
  - R2 버킷: Private 설정
  - Public URL: 서명된 URL 또는 Public URL 생성
  - 삭제: 블록 삭제 시 R2에서도 즉시 삭제

### 7.2 제약
- **테스트:**
  - 현재: 수동 테스트만 수행
  - 향후: E2E 테스트 (Playwright), 단위 테스트 (Vitest) 도입 예정
- **네트워크 호출:**
  - 테스트에서 실제 네트워크 호출 금지
  - mock/stub/fake 사용 (Supabase, Clerk, R2)
- **데이터 보호:**
  - 사용자 데이터는 공개/비공개 설정 준수 필수
  - 비공개 페이지는 소유자 외 접근 불가 (404 반환)

---

## 8. 운영 및 관찰성

### 8.1 분석 (Umami)
- 이벤트 명명 규칙: `feature.featureName.action`
  - 예: `feature.pageSave.success`, `feature.profileVisibility.error`
- 허용 데이터: pageId, ownerId, attemptId (내부 식별자)
- 금지 데이터: 이메일, 이름, 민감한 개인정보 (PII)

### 8.2 에러 처리
- **저장 실패:**
  - 에러 메시지: "Save failed" (statusLabel)
  - 자동 재시도: 없음
  - 사용자 액션: 다시 편집하면 자동 저장 재시도
  - 분석: `feature.pageSave.error` 이벤트 발송
- **업로드 실패:**
  - 파일 크기 제한 초과: 에러 토스트 표시
  - 지원하지 않는 형식: 에러 토스트 표시
  - 네트워크 오류: 플레이스홀더 블록 제거, 에러 토스트 표시
- **업로드 중단:**
  - 페이지 이탈: 진행 중인 업로드 취소
  - 브라우저 닫기: 업로드 중단 (beforeunload 경고 없음)
- **링크 메타데이터 실패:**
  - 타임아웃: 없음 (무한 대기)
  - 실패: 로딩 상태 유지, 사용자가 수동으로 수정 가능

### 8.3 배포
- **배포 전략:**
  - main 브랜치 = production (직접 배포)
  - staging 환경 없음
  - feature 브랜치: Vercel preview URL 자동 생성
- **플랫폼:** Vercel
- **SSR:** React Router v7 (Vite 기반)
- **런타임:** Node.js (Vercel Functions)

### 8.4 모니터링
- **오류 모니터링:** 향후 도입 가능 (Sentry 고려 중, 현재 필수 아님)
- **성능 모니터링:** Vercel Analytics 고려 중

---

## 9. 환경 변수 (필수 키만 명시)

- `VITE_SB_URL`, `VITE_SB_PUBLISHABLE_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_PUBLIC_BASE_URL`
- `VITE_MAPBOX_ACCESS_TOKEN`
- `VITE_UMAMI_WEBSITE_ID`, `VITE_UMAMI_HOST_URL`
- `UMAMI_API_KEY`, `UMAMI_API_ENDPOINT`
- `RESEND_API_KEY`

---

## 10. 향후 계획 (Roadmap)

### 10.1 우선순위

#### 1. 현재 기능 안정화 (최우선)
- 버그 수정 및 성능 최적화
- 사용자 피드백 반영
- 자동 저장 디바운스 통일 (800ms)
- 에러 처리 개선

#### 2. section 블록 활성화
- 타입 정의 완료: `types/brick.ts` (BrickSectionRow)
- UI 컴포넌트 구현 완료: `app/components/page/page-brick-section.tsx`
- 필요 작업:
  - `service/pages/page-grid.ts`의 PageGridBrickType에 "section" 추가
  - 그리드 규칙 정의 (GRID_RULES[section])
  - 에디터 UI에 추가 버튼 추가

#### 3. 유료 플랜 도입
- **다중 페이지:**
  - is_primary 활용
  - 무료: 1개 페이지
  - 유료: 3~5개 페이지
  - 페이지 전환 UI 구현 필요
- **핸들 변경 횟수 제한:**
  - 무료: 월 1회
  - 유료: 무제한
  - DB 필드: handle_change_count, last_handle_change_at
- **고급 분석:**
  - 페이지 방문 통계 상세
  - 블록별 클릭 통계
  - 기간별 트렌드
- **우선 지원:**
  - 이메일 지원
  - 버그 우선 수정

#### 4. 기능 확장
- **커스텀 도메인:**
  - Vercel 도메인 연결
  - SSL 인증서 자동 발급
  - DNS 설정 가이드
- **콘텐츠 다국어:**
  - title, description JSONB 구조로 변경
  - 블록 데이터 다국어 지원
  - 언어별 레이아웃 분리 고려
- **그리드 커스터마이징:**
  - 컬럼 수 조정 (2/4/6열)
  - 블록 간격 조정
  - 배경색/테마 설정
- **테마 커스터마이징:**
  - 색상 팔레트
  - 폰트 선택
  - 레이아웃 스타일

#### 5. 품질 개선
- **자동화 테스트:**
  - E2E 테스트 (Playwright): 온보딩, 페이지 편집, 공개/비공개 전환
  - 단위 테스트 (Vitest): service 레이어 (page-grid.ts, save-page.ts)
  - 통합 테스트: Supabase/Clerk mock 환경
- **에러 모니터링:**
  - Sentry 도입
  - 에러 로그 수집
  - 알림 설정
- **성능 모니터링:**
  - Vercel Analytics
  - Core Web Vitals
  - 페이지 로드 속도 최적화

### 10.2 기술 부채
- 자동 저장 디바운스 통일 완료 필요 (일부 650ms → 800ms)
- section 블록 활성화
- 테스트 커버리지 부족 (0% → 목표: 80%)
- 링크 메타데이터 타임아웃 없음 (무한 대기 → 5초 타임아웃 추가 고려)
