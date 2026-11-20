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

프런트엔드는 빌드 도구·프레임워크 없는 정적 HTML이다. CSS와 JS가 `index.html` 안에 인라인되어 있다.

| 위치 | 내용 |
|---|---|
| `index.html` | 사이트 본문 + 인라인 CSS + 인라인 JS (스크롤 리빌 / 서울 시계 / 헤더 숨김 / 신청 폼 전송) |
| `privacy.html` | 개인정보처리방침 (별도 페이지) |
| `api/apply.js` | Vercel 서버리스 함수 — 신청 접수 |
| `apps-script/` | 구글 Apps Script 코드와 설치 안내서 (배포와 무관한 참고 파일) |
| `assets/` | 이미지 10개, 약 14MB |
| `screenshots/`, `index.html.srcmap.json` | 작업 잔재 — 배포에 불필요 |

섹션: Hero → `#services`(4대 고민) → `#approach`(4단계 프로세스) → `#why`(차별점 4가지) → `#consultation`(신청 폼 + 푸터)

## 신청 폼

Tally를 걷어내고 사이트에 직접 만든 폼을 쓴다. 폼은 **사이트 안에서 열리는 팝업(모달)** 이다.
`<dialog id="applyModal">` 하나를 본문 끝에 두고, `data-apply-open` 이 붙은 버튼 3개
(헤더 `신청서 작성` · 히어로 · 하단 CTA)가 모두 그 모달을 연다.

```
브라우저 폼  →  POST /api/apply  →  Apps Script 웹앱  →  구글 시트 + 알림 메일
```

- `api/apply.js` 가 필수값 검증·허니팟·전송 횟수 제한을 처리한 뒤 Apps Script로 넘긴다.
  Apps Script 주소와 비밀키는 서버 환경변수에만 있고 브라우저로 내려가지 않는다.
- 필요한 Vercel 환경변수 **`APPS_SCRIPT_URL`**, **`APPLY_SECRET`**.
  둘 중 하나라도 없으면 폼이 "접수 설정이 완료되지 않았습니다"를 띄운다.
- 설치·재설정 절차는 `apps-script/README.md` 참고.
- 전화 `1533-5967` 은 폼 옆 보조 CTA로 유지.

## 작업 규칙

1. **실행 전 반드시 확인받는다.** 특히 푸시는 라이브 배포로 직결되므로 예외 없이 승인받는다.
2. `/fix` 실행 시에만 예외적으로 "계획 제시 → 승인 1회 → 푸시까지 일괄 진행" 방식을 쓴다.
3. 항목별로 커밋을 나눈다. 한 커밋에 여러 항목을 섞지 않는다 — 되돌리기 위해서다.
4. 푸시 후에는 실제 사이트에 접속해 반영을 확인하고 보고한다.

## 주의사항

- **`.gitattributes` 를 되살리지 말 것.** 이미지 전체를 Git LFS로 처리하는 설정인데, 저장소의 기존 이미지는 일반 blob으로 올라가 있다. 되살리면 이미지 교체 시 LFS 포인터로 커밋되어 Vercel에서 이미지가 깨진다. `.gitattributes.bak`으로 비활성화해 둔 상태다.
- **`/cdn-cgi/` 경로를 쓰지 말 것.** Vercel에는 존재하지 않아 404다. Cloudflare 편집기를 거친 코드를 붙여넣으면 이 경로가 딸려 들어온다.
- 이메일 정확한 주소는 **`hijaein82@gmail.com`** 이다. (`hjjaein82@`는 2026-08-27에 고친 옛 오타)
- **저장소 루트에 `package.json` 을 만들지 말 것.** `api/apply.js` 는 CommonJS(`module.exports`)로 작성돼 있고,
  Vercel은 `package.json` 이 없으면 이를 CommonJS로 해석한다. `"type": "module"` 이 들어가면 함수가 깨진다.
- 로컬에서 `node` 로 이 프로젝트의 `.js` 를 직접 실행하면 `C:\package.json`(무관한 다른 프로젝트)의
  `"type": "module"` 때문에 ES 모듈로 잘못 해석된다. 로컬 테스트용 파일은 `.cjs` 확장자를 쓸 것. 배포에는 영향 없다.
- **모달 안에는 `.reveal` 클래스를 쓰지 말 것.** `.reveal` 은 화면에 보일 때 나타나는 효과인데,
  닫힌 `<dialog>` 안의 요소는 관찰되지 않아 영영 투명한 상태로 남는다.
- **`.modal` 의 `margin: auto` 를 지우지 말 것.** 전역 `* { margin: 0 }` 이 `<dialog>` 의
  기본 `margin: auto` 를 덮어쓰기 때문에, 이 선언이 없으면 모달이 화면 좌상단에 붙는다.

## 수정 대기 항목

### P1 — 라이브 장애  ✅ 2026-08-27 완료 (커밋 e8be707)

- [x] **Cloudflare 잔재 제거** — `email-decode.min.js`(404), Cloudflare Insights 비콘 삭제. 난독화된 이메일을 `mailto:` 링크로 복구. 현재 푸터에 `[email protected]`로 표시되고 링크는 404이며, 방문자 데이터가 무관한 Cloudflare 계정으로 전송되고 있다.
- [x] **이메일 오타 수정** — `hjjaein82@gmail.com` → `hijaein82@gmail.com`

### P1.5 — 폼 자체 구축  ✅ 2026-11-20 완료

- [x] **Tally 제거 및 자체 신청 폼 도입** — 외부 폼 서비스 의존 제거. 구글 계정 하나로 시트 적재 + 메일 알림.
- [x] **개인정보처리방침 페이지 추가** — 동의 문구가 Tally 밖으로 나오면서 필수가 됐다. 보유기간 3년으로 작성 — 사업상 확인 필요.
- [x] **끊어진 앵커 해결** — `#apply`가 실제 폼을 가리키게 됐다. `#contact`도 `#apply`로 통일.

> 남은 확인: 폼의 **업종 선택지**는 기존 Tally 공개 페이지에서 읽어낸 것이라 원본과 다를 수 있다. 소유자 확인 필요.
> 문자·카카오 알림은 범위에서 제외(발신번호 등록·채널 심사·건당 과금 필요). 필요해지면 별도 진행.

### P2 — 품질

- [ ] **한글 웹폰트 추가** — 현재 Inter Tight / PT Mono만 로드해 한글은 OS 기본 폰트로 폴백된다.
      Pretendard 권장(Variable + 동적 서브셋). 2026-08-27에 비교 검토까지 마쳤고,
      **HERO 제목 자간을 -0.045em 유지할지 -0.02em로 완화할지만 결정하면 적용 가능.**
- [ ] `<html lang="en">` → `lang="ko"` (`privacy.html`은 이미 `ko`)
- [ ] **메타태그 추가** — `description`, `og:*`, `canonical`. 현재 전무해서 링크 공유 시 미리보기가 없다. 미사용 중인 `.thumbnail.jpg`를 `og:image`로 활용 가능.
- [ ] `.hero .sub` 의 `white-space: nowrap` — 좁은 화면에서 가로 넘침 위험

### P3 — 최적화 · 정리

- [ ] **이미지 최적화** — 개별 1.2~1.8MB JPG. `loading="lazy"`, `width`/`height`, WebP 모두 없음. (인코더 설치 여부 확인 필요)
- [ ] **미사용 에셋 6.5MB 삭제** — `assets/img/06-mori-work.jpg`, `assets/img/mori/fig-02~04.jpg`. 죽은 CSS에서만 참조된다.
- [ ] **죽은 CSS 제거** — `.fig` `.two-up` `.index-section` `.about` `.colophon` `.sect-head` `.footline` `.ix-*` `.hero .meta`. 원본 템플릿 잔재로 마크업에 없다.
- [ ] **태블릿 구간(641~1024px) 대응** — Page 2~5의 1열 전환이 `max-width: 640px`에만 걸려 있어 아이패드에서 데스크톱 레이아웃이 눌려 나온다. 1024px 미디어쿼리는 이미 삭제된 요소만 다루는 죽은 코드다.
- [ ] **저장소 정리** — `screenshots/`(1.2MB), `index.html.srcmap.json`(57KB) 제거
