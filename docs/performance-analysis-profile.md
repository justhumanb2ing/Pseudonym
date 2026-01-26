# 성능 분석 리포트 - 프로필 페이지

**URL:** https://venus.zentechie7.workers.dev/ko/@justhumanb2ing
**측정일:** 2026-01-26
**환경:** CPU/Network 쓰로틀링 없음

---

## 측정 결과 요약

### Core Web Vitals

| 지표 | 1차 측정 | 2차 측정 | 평균 | 상태 |
|------|---------|---------|------|------|
| **LCP** (Largest Contentful Paint) | 732 ms | 736 ms | 734 ms | 🟢 우수 |
| **CLS** (Cumulative Layout Shift) | 0.00 | 0.00 | 0.00 | 🟢 완벽 |
| **TTFB** (Time to First Byte) | 360 ms | 343 ms | 352 ms | 🟢 양호 |

> 매우 안정적인 성능을 보여줍니다. 두 측정값이 거의 동일합니다.

### LCP 상세 분석 (2차 측정 기준)

| 단계 | 시간 | 비율 |
|------|------|------|
| TTFB (서버 응답) | 343 ms | 46.5% |
| Load Delay (로드 지연) | 286 ms | 38.9% |
| Load Duration (로드 시간) | 2 ms | 0.3% |
| Render Delay (렌더링 지연) | 105 ms | 14.3% |

### LCP 요소 정보

- **타입:** IMG (프로필 이미지)
- **소스:** Buy Me a Coffee CDN
- **URL:** `https://cdn.buymeacoffee.com/opengraph/images/...`
- **다운로드 시간:** 1ms (CDN 캐시 히트)
- **캐시 정책:** `max-age=31536000` (1년)

---

## 개선 가능 항목

### 1. LCP 이미지 발견 최적화

| 체크 항목 | 상태 |
|----------|------|
| `fetchpriority="high"` 적용 | ❌ 미적용 |
| lazy load 미적용 | ✅ 통과 |
| HTML에서 즉시 발견 가능 | ❌ 실패 |

**현재 상황:**
- 이미지 요청 시작: 629ms (HTML 로드 후 286ms 지연)
- 초기 우선순위: Low → 나중에 High로 변경됨

**개선 방안:**

```html
<!-- HTML <head>에 preload 추가 -->
<link
  rel="preload"
  as="image"
  href="LCP이미지URL"
  fetchpriority="high"
>
```

또는 이미지 태그에 직접 적용:

```html
<img
  src="이미지URL"
  fetchpriority="high"
  alt="프로필 이미지"
>
```

**예상 효과:** LCP -100~200ms 개선 가능

---

### 2. 렌더 블로킹 리소스

**예상 절감: FCP 195ms**

| 리소스 | 시간 | 설명 |
|--------|------|------|
| `root-Cedx3AnK.css` | 171 ms | 자체 CSS |
| `pretendardvariable-dynamic-subset.min.css` | 3 ms | 폰트 CSS |

**개선 방안:**

1. **Critical CSS 인라인 처리**
   ```html
   <style>
     /* Above-the-fold에 필요한 최소 CSS */
   </style>
   ```

2. **비핵심 CSS 비동기 로드**
   ```html
   <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
   ```

---

### 3. 서드파티 리소스

| 서드파티 | 전송 크기 | 메인스레드 시간 |
|----------|----------|----------------|
| **Supabase** | 1.5 MB | - |
| **Mapbox** | 794 KB | - |
| **Buy Me a Coffee** | 366 KB | - |
| **Clerk (accounts.dev)** | 261 KB | 25 ms |
| Cloudinary | 74 KB | - |
| JSDelivr CDN | 54 KB | - |
| umami.is | 3 KB | 1 ms |

**개선 방안:**

1. **Mapbox 지연 로드** (지도가 필요할 때만)
2. **이미지 최적화** (WebP/AVIF 포맷)
3. **불필요한 서드파티 제거 검토**

---

## Studio 페이지와 비교

| 항목 | Studio 페이지 | 프로필 페이지 | 비고 |
|------|--------------|--------------|------|
| **LCP** | 1,147~1,568 ms | 732~736 ms | 프로필이 **2배 빠름** |
| **TTFB** | 433~771 ms | 343~360 ms | 프로필이 **2배 빠름** |
| **CLS** | 0.00 | 0.00 | 동일 (완벽) |
| **Supabase 전송량** | 3.1 MB | 1.5 MB | 프로필이 **절반** |
| **Forced Reflow** | 228 ms | 없음 | 프로필이 더 좋음 |
| **LCP 이미지 발견** | ❌ 실패 | ❌ 실패 | 둘 다 개선 필요 |

### 프로필 페이지가 더 빠른 이유

1. **서버 응답이 더 빠름** - 데이터 양이 적음
2. **Supabase 이미지 전송량이 절반** - 1.5MB vs 3.1MB
3. **Forced Reflow 문제 없음** - Studio는 228ms 소요
4. **LCP 이미지가 CDN에서 캐시됨** - Buy Me a Coffee CDN

---

## 잘 되어 있는 부분

| 항목 | 상태 |
|------|------|
| CLS (레이아웃 시프트) | ✅ 0.00 (완벽) |
| HTTP/3 프로토콜 | ✅ 사용 중 |
| LCP 이미지 캐시 | ✅ 1년 캐시 적용 |
| lazy load 미적용 (LCP 이미지) | ✅ 올바름 |
| 안정적인 성능 | ✅ 측정값 변동 거의 없음 |

---

## 개선 우선순위

| 순위 | 항목 | 예상 개선 효과 | 난이도 |
|------|------|---------------|--------|
| 1 | LCP 이미지 preload + fetchpriority | LCP -100~200ms | 하 |
| 2 | 렌더 블로킹 CSS 최적화 | FCP -195ms | 중 |
| 3 | Mapbox 지연 로드 | 초기 로드 -794KB | 중 |
| 4 | 이미지 포맷 최적화 | 전송량 감소 | 하 |

---

## 종합 평가

이 페이지는 **매우 좋은 성능**을 보여줍니다:

- ✅ LCP 734ms는 "Good" 기준(2.5초) 대비 **3배 이상 여유**
- ✅ CLS 0.00 완벽
- ✅ 안정적인 성능 (변동 거의 없음)
- ✅ TTFB 352ms로 양호

추가 최적화를 통해 LCP를 500ms 이하로 개선할 수 있는 여지가 있습니다.

---

## 참고 자료

- [Web Vitals](https://web.dev/vitals/)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [LCP Discovery](https://developer.chrome.com/docs/performance/insights/lcp-discovery)
- [Render Blocking Resources](https://developer.chrome.com/docs/performance/insights/render-blocking)
