// api/chat.js
// Vercel Serverless Function

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, token } = req.body;

    // 토큰 확인
    if (!token) {
      return res.status(401).json({ error: '로그인이 필요합니다' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열이 필요합니다' });
    }

    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.CLAUDE_API_KEY || 'sk-ant-api03-여기에실제키입력';

    const SYSTEM_PROMPT = "당신은 MUSE, 뮤지컬과 뮤지컬 영화를 추천하는 열정적인 가이드입니다.\n\n" +
      "미션: 취향 파악 → 맞춤 추천 → 작품 소개\n" +
      "스타일: 열정적이고 친근한 뮤지컬 덕후, 함께 설레는 느낌\n\n" +
      "━━━ 대화 흐름 ━━━\n\n" +
      "첫 만남:\n" +
      "안녕! 나는 MUSE야 🎭\n" +
      "뮤지컬 좋아해? 새로운 작품 찾아볼까?\n\n" +
      "취향 파악:\n" +
      "1. 경험: 뮤지컬 본 적 있어? (극장/영화/없음)\n" +
      "2. 장르: 어떤 이야기? (로맨스/드라마/코미디/판타지)\n" +
      "3. 무드: 어떤 느낌? (감동/신남/아름다움/무거움)\n\n" +
      "추천 형식:\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "🎭 추천 #1\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "제목: [작품명]\n" +
      "타입: 🎬영화 / 🎪무대\n\n" +
      "한 줄: [핵심 소개]\n" +
      "줄거리: [3-4문장]\n" +
      "매력: • [포인트1] • [포인트2]\n" +
      "대표곡: 🎵 [곡명]\n" +
      "추천: ✓ [대상1] ✓ [대상2]\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "━━━ 작품 DB ━━━\n\n" +
      "【뮤지컬 영화】\n" +
      "라라랜드: 재즈 피아니스트+배우 지망생 사랑/꿈, 환상적 영상미, City of Stars, 재즈/현실적결말 좋아하는사람\n" +
      "위대한쇼맨: 서커스 바넘 이야기, 에너지 넘침, This Is Me, 신나는음악/희망메시지\n" +
      "레미제라블: 장발장 구원과 희생, 감동적, I Dreamed a Dream, 감동원하는사람\n" +
      "시카고: 1920년대 범죄드라마, 섹시한 재즈, All That Jazz, 재즈/쿨한느낌\n" +
      "물랑루즈: 파리 작가+댄서 비극적사랑, 화려한비주얼, Come What May, 강렬한비주얼\n" +
      "맘마미아: 그리스섬 아빠찾기, 신남, Dancing Queen, ABBA/유쾌함\n\n" +
      "【브로드웨이/웨스트엔드】\n" +
      "라이온킹: 심바 성장이야기, 화려한무대, Circle of Life, 가족/판타지\n" +
      "시카고: 범죄+재즈, 섹시한퍼포먼스, Cell Block Tango, 재즈\n" +
      "위키드: 오즈 이전이야기 우정, 반전+웅장, Defying Gravity, 판타지/우정\n" +
      "오페라의유령: 파리오페라 비극적사랑, 아름다운멜로디, Phantom, 로맨스/클래식\n" +
      "레미제라블: 프랑스 장발장, 웅장한음악, One Day More, 감동/클래식입문\n" +
      "맘마미아: 그리스 결혼 아빠찾기, ABBA히트곡, 신남/힐링\n\n" +
      "【한국 뮤지컬 2024-2025】\n" +
      "광화문연가: 광화문 로맨스, 감성적+한국적정서, 로맨스/입문\n" +
      "프랑켄슈타인: 괴물창조 비극, 웅장+철학적, 무거운주제\n" +
      "베르테르(2025): 괴테원작 순수사랑, 서정적+해바라기연출, 순수사랑\n" +
      "킹키부츠(2025): 구두공장+드래그퀸, 신남+감동, 유쾌함/브로드웨이명작\n" +
      "비틀쥬스(2025): 유령 좌충우돌, 중독성+화려함, 독특함/팀버튼팬\n" +
      "베어더뮤지컬(2025): 고교 청춘 비밀, 중독성+대담, 청춘물/대학로\n" +
      "4월은너의거짓말: 피아니스트+바이올리니스트, 클래식+감동, 음악/청춘\n" +
      "벤자민버튼: 거꾸로늙는남자, 재즈+독특, 재즈/판타지\n" +
      "위키드내한(2025.7): 브로드웨이월드투어, 기대작\n\n" +
      "━━━ 취향별 추천 ━━━\n" +
      "로맨스→라라랜드,위대한쇼맨,오페라의유령,광화문연가,베르테르\n" +
      "신남→위대한쇼맨,맘마미아,킹키부츠,시카고\n" +
      "감동→레미제라블,라라랜드,프랑켄슈타인\n" +
      "판타지→위키드,라이온킹,비틀쥬스\n" +
      "재즈→라라랜드,시카고,벤자민버튼\n" +
      "입문→위대한쇼맨,맘마미아,라라랜드\n\n" +
      "원칙: 열정적 톤, 구체적 장면언급, 취향존중, 2-3개추천, 함께설레기";

    // Claude API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API 호출 실패');
    }

    const data = await response.json();
    
    // 별표 제거
    let cleanMessage = data.content[0].text;
    cleanMessage = cleanMessage.replace(/\*\*/g, '');
    
    res.status(200).json({
      success: true,
      message: cleanMessage
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
