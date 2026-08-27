# LEADJAEIN 홈페이지

기업 성장전략 컨설팅 회사 리드재인(LEADJAEIN)의 단일 페이지 랜딩 사이트.

## 저장소 · 배포

- 저장소: https://github.com/hijaein82-spec/leadjaein-website (public, `main` 단일 브랜치)
- 배포: **Vercel** — https://leadjaein-website.vercel.app
- `main`에 푸시하면 Vercel이 자동 배포된다 (약 1분).
- 커밋 계정: `hijaein82-spec <hijaein82@gmail.com>` — 이 저장소 전용 `--local` 설정.
  전역 git 계정은 비어 있으므로 `--local` 설정을 지우지 말 것.
- `cjenix`, `hijaein82-spec` 모두 소유자 본인 계정이다. 외부 기여자가 아니다.

## 구조

빌드 도구·프레임워크 없음. `index.html` 한 파일이 사이트 전부다.

| 위치 | 내용 |
|---|---|
| `index.html` 12~803행 | CSS 전체 (인라인 `<style>`) |
| `index.html` 805~1095행 | 마크업 |
| `index.html` 1096~1170행 | JS (스크롤 리빌 / 서울 시계 / 헤더 숨김) |
| `assets/` | 이미지 10개, 약 14MB |
| `screenshots/`, `index.html.srcmap.json` | 작업 잔재 — 배포에 불필요 |

섹션: Hero → `#services`(4대 고민) → `#approach`(4단계 프로세스) → `#why`(차별점 4가지) → `#consultation`(CTA + 푸터)

문의 CTA는 Tally 모달(폼 ID `q4qkOk`)과 전화 `1533-5967`.

## 작업 규칙

1. **실행 전 반드시 확인받는다.** 특히 푸시는 라이브 배포로 직결되므로 예외 없이 승인받는다.
2. `/fix` 실행 시에만 예외적으로 "계획 제시 → 승인 1회 → 푸시까지 일괄 진행" 방식을 쓴다.
3. 항목별로 커밋을 나눈다. 한 커밋에 여러 항목을 섞지 않는다 — 되돌리기 위해서다.
4. 푸시 후에는 실제 사이트에 접속해 반영을 확인하고 보고한다.

## 주의사항

- **`.gitattributes` 를 되살리지 말 것.** 이미지 전체를 Git LFS로 처리하는 설정인데, 저장소의 기존 이미지는 일반 blob으로 올라가 있다. 되살리면 이미지 교체 시 LFS 포인터로 커밋되어 Vercel에서 이미지가 깨진다. `.gitattributes.bak`으로 비활성화해 둔 상태다.
- **`/cdn-cgi/` 경로를 쓰지 말 것.** Vercel에는 존재하지 않아 404다. Cloudflare 편집기를 거친 코드를 붙여넣으면 이 경로가 딸려 들어온다.
- 이메일 정확한 주소는 **`hijaein82@gmail.com`**. 사이트에 있는 `hjjaein82@gmail.com`은 오타다.

## 수정 대기 항목

### P1 — 라이브 장애 (긴급)

- [ ] **Cloudflare 잔재 제거** — `email-decode.min.js`(404), Cloudflare Insights 비콘 삭제. 난독화된 이메일을 `mailto:` 링크로 복구. 현재 푸터에 `[email protected]`로 표시되고 링크는 404이며, 방문자 데이터가 무관한 Cloudflare 계정으로 전송되고 있다.
- [ ] **이메일 오타 수정** — `hjjaein82@gmail.com` → `hijaein82@gmail.com`

### P2 — 품질

- [ ] **한글 웹폰트 추가** — 현재 Inter Tight / PT Mono만 로드해 한글은 OS 기본 폰트로 폴백된다. Pretendard 등 추가 필요.
- [ ] `<html lang="en">` → `lang="ko"`
- [ ] **메타태그 추가** — `description`, `og:*`, `canonical`. 현재 전무해서 링크 공유 시 미리보기가 없다. 미사용 중인 `.thumbnail.jpg`를 `og:image`로 활용 가능.
- [ ] **끊어진 앵커** — `href="#contact"`, `href="#apply"` 대상 ID 없음. 반대로 `#approach`/`#why`/`#consultation`은 내비게이션 링크가 없다.
- [ ] `.hero .sub` 의 `white-space: nowrap` — 좁은 화면에서 가로 넘침 위험

### P3 — 최적화 · 정리

- [ ] **이미지 최적화** — 개별 1.2~1.8MB JPG. `loading="lazy"`, `width`/`height`, WebP 모두 없음. (인코더 설치 여부 확인 필요)
- [ ] **미사용 에셋 6.5MB 삭제** — `assets/img/06-mori-work.jpg`, `assets/img/mori/fig-02~04.jpg`. 죽은 CSS에서만 참조된다.
- [ ] **죽은 CSS 제거** — `.fig` `.two-up` `.index-section` `.about` `.colophon` `.sect-head` `.footline` `.ix-*` `.hero .meta`. 원본 템플릿 잔재로 마크업에 없다.
- [ ] **태블릿 구간(641~1024px) 대응** — Page 2~5의 1열 전환이 `max-width: 640px`에만 걸려 있어 아이패드에서 데스크톱 레이아웃이 눌려 나온다. 1024px 미디어쿼리는 이미 삭제된 요소만 다루는 죽은 코드다.
- [ ] **저장소 정리** — `screenshots/`(1.2MB), `index.html.srcmap.json`(57KB) 제거
