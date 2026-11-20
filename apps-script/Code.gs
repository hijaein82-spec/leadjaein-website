/**
 * LEADJAEIN — 기업진단 신청 수신 스크립트
 *
 * 하는 일: 신청이 들어오면 (1) 구글 시트에 한 줄 추가 (2) 이메일 알림 발송
 *
 * 설치 방법은 apps-script/README.md 를 보세요.
 * 아래 SHARED_SECRET 값은 Vercel 환경변수 APPLY_SECRET 과 반드시 동일해야 합니다.
 */

/* ────────────────────────────────────────────────────────────
   여기 한 줄만 고치면 됩니다. 아래 다른 줄은 지우지 마세요.
   ──────────────────────────────────────────────────────────── */
var SHARED_SECRET = 'PASTE_YOUR_SECRET_HERE';
/* ──────────────── 여기까지. 아래는 그대로 둡니다 ──────────────── */

var NOTIFY_TO  = 'hijaein82@gmail.com';   // 알림 받을 주소
var SHEET_NAME = '신청';                   // 시트 탭 이름 (자동 생성됨)

// 신청이 쌓일 스프레드시트 ID — 시트 주소창의 /d/ 와 /edit 사이 문자열.
//   https://docs.google.com/spreadsheets/d/<<여기>>/edit
// 비워두면 스크립트가 붙어 있는 시트를 사용한다.
// (저장소가 공개이므로 실제 ID는 여기 적지 않는다. 배포된 스크립트에는 입력돼 있다.)
var SPREADSHEET_ID = '';

var HEADERS = ['접수시각', '회사명', '담당자명', '연락처', '업종',
               '연매출', '관심서비스', '문의내용', '개인정보동의', '유입경로'];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply_({ ok: false, error: 'empty_body' });
    }
    var body = JSON.parse(e.postData.contents);

    if (!SHARED_SECRET || SHARED_SECRET === 'PASTE_YOUR_SECRET_HERE') {
      return reply_({ ok: false, error: 'secret_not_configured' });
    }
    if (body.secret !== SHARED_SECRET) {
      return reply_({ ok: false, error: 'unauthorized' });
    }

    var d = body.data || {};
    appendRow_(d);

    // 메일 발송이 실패해도 시트 기록은 남도록 분리
    try { sendMail_(d); } catch (mailErr) {
      console.error('mail_failed: ' + mailErr);
      return reply_({ ok: true, warn: 'saved_but_mail_failed' });
    }

    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return reply_({ ok: true, alive: true });
}

/* ---------- 내부 ---------- */

function getBook_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('SPREADSHEET_ID 가 비어 있고 연결된 시트도 없습니다. 상단의 SPREADSHEET_ID 를 채워주세요.');
  }
  return active;
}

function getSheet_() {
  var ss = getBook_();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function appendRow_(d) {
  var sh = getSheet_();
  sh.appendRow([
    new Date(),
    d.company  || '',
    d.name     || '',
    d.phone    || '',
    d.industry || '',
    d.revenue  || '',
    (d.services && d.services.length) ? d.services.join(', ') : '',
    d.message  || '',
    d.consent ? 'Y' : 'N',
    d.referer  || ''
  ]);
}

function sendMail_(d) {
  var subject = '[리드재인] 기업진단 신청 — ' + (d.company || '회사명 미입력');
  var lines = [
    '새 기업진단 신청이 접수되었습니다.',
    '',
    '회사명      : ' + (d.company  || '-'),
    '담당자명    : ' + (d.name     || '-'),
    '연락처      : ' + (d.phone    || '-'),
    '업종        : ' + (d.industry || '-'),
    '연매출      : ' + (d.revenue  || '-'),
    '관심 서비스 : ' + ((d.services && d.services.length) ? d.services.join(', ') : '-'),
    '',
    '문의 내용',
    '----------------------------------------',
    (d.message || '(없음)'),
    '----------------------------------------',
    '',
    '개인정보 수집·이용 동의 : ' + (d.consent ? '동의' : '미동의'),
    '접수 시각 : ' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    '',
    '전체 목록: ' + getBook_().getUrl()
  ];
  MailApp.sendEmail({
    to: NOTIFY_TO,
    subject: subject,
    body: lines.join('\n'),
    name: '리드재인 홈페이지'
  });
}

function reply_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 설치 후 이 함수를 한 번 실행하면 시트 헤더가 만들어지고 메일 권한이 승인됩니다. */
function setupTest() {
  appendRow_({
    company: '(테스트) 리드재인', name: '테스트', phone: '010-0000-0000',
    industry: '서비스업', revenue: '1억 ~ 5억', services: ['정책자금'],
    message: '설치 확인용 테스트입니다. 이 행은 지워도 됩니다.',
    consent: true, referer: 'setupTest'
  });
  sendMail_({ company: '(테스트) 리드재인', name: '테스트', consent: true,
              message: '설치 확인용 테스트 메일입니다.' });
}
