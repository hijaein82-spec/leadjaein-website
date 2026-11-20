/**
 * POST /api/apply — 기업진단 신청 접수
 *
 * 브라우저는 이 함수만 호출한다. 구글 Apps Script 주소와 비밀키는
 * 서버 환경변수에만 있고 브라우저로 내려가지 않는다.
 *
 * 필요한 Vercel 환경변수
 *   APPS_SCRIPT_URL  구글 Apps Script 웹앱 URL (.../exec)
 *   APPLY_SECRET     Code.gs 의 SHARED_SECRET 과 동일한 값
 */

const INDUSTRIES = ['제조업', '서비스업', '도소매업', '정보통신업', '건설업', '기타'];
const REVENUES   = ['1억 미만', '1억 ~ 5억', '5억 ~ 10억', '10억 이상'];
const SERVICES   = ['정책자금', '기업인증', '법인전환', '사옥마련', '기타'];

const LIMITS = { company: 100, name: 50, phone: 40, message: 2000 };

// 콜드 스타트마다 비워지는 임시 제한. 완벽한 차단은 아니고 연속 폭주만 막는다.
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) { hits.set(ip, arr); return true; }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(b) {
  const errors = {};
  const out = {
    company:  str(b.company,  LIMITS.company),
    name:     str(b.name,     LIMITS.name),
    phone:    str(b.phone,    LIMITS.phone),
    industry: str(b.industry, 40),
    revenue:  str(b.revenue,  40),
    message:  str(b.message,  LIMITS.message),
    services: Array.isArray(b.services)
      ? b.services.filter((s) => SERVICES.includes(s)).slice(0, SERVICES.length)
      : [],
    consent:  b.consent === true || b.consent === 'true' || b.consent === 'on',
  };

  if (!out.company)  errors.company = '회사명을 입력해주세요.';
  if (!out.name)     errors.name    = '담당자명을 입력해주세요.';
  if (!out.phone)    errors.phone   = '연락처를 입력해주세요.';
  else if (!/[0-9]{8,}/.test(out.phone.replace(/[^0-9]/g, '')))
    errors.phone = '연락처를 다시 확인해주세요.';
  if (out.industry && !INDUSTRIES.includes(out.industry)) errors.industry = '업종을 다시 선택해주세요.';
  if (out.revenue  && !REVENUES.includes(out.revenue))    errors.revenue  = '연매출 구간을 다시 선택해주세요.';
  if (!out.consent)  errors.consent = '개인정보 수집·이용에 동의해주세요.';

  return { data: out, errors };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const url    = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPLY_SECRET;
  if (!url || !secret) {
    console.error('APPS_SCRIPT_URL 또는 APPLY_SECRET 환경변수가 없습니다.');
    return res.status(503).json({ ok: false, error: 'not_configured',
      message: '접수 설정이 완료되지 않았습니다. 전화로 문의해주세요.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  // 허니팟: 사람에게는 보이지 않는 칸. 채워져 있으면 봇이다.
  if (str(body.website, 200)) return res.status(200).json({ ok: true });

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'rate_limited',
      message: '잠시 후 다시 시도해주세요.' });
  }

  const { data, errors } = validate(body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, error: 'invalid', errors });
  }

  data.referer = str(req.headers.referer, 200);

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, data }),
      redirect: 'follow',
    });
    const text = await r.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch { /* HTML 오류 페이지일 수 있다 */ }

    if (!r.ok || !parsed || parsed.ok !== true) {
      console.error('apps_script_failed', r.status, text.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'upstream_failed',
        message: '접수 처리 중 문제가 발생했습니다. 전화로 문의해주세요.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('apps_script_error', err);
    return res.status(502).json({ ok: false, error: 'upstream_error',
      message: '접수 처리 중 문제가 발생했습니다. 전화로 문의해주세요.' });
  }
};
