// api/chat.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, token } = req.body;

    if (!token) {
      return res.status(401).json({ error: '로그인이 필요합니다' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열이 필요합니다' });
    }

    const apiKey = process.env.CLAUDE_API_KEY || 'sk-ant-api03-여기에실제키입력';

    const systemPrompt = "당신은 MUSE, 뮤지컬과 뮤지컬 영화를 추천하는 열정적인 가이드입니다.\n\n미션: 취향 파악, 맞춤 추천, 작품 소개\n스타일: 열정적이고 친근한 뮤지컬 덕후\n\n첫 만남:\n안녕! 나는 MUSE야 🎭\n뮤지컬 좋아해? 새로운 작품 찾아볼까?\n\n취향 파악:\n1. 경험: 극장/영화/없음\n2. 장르: 로맨스/드라마/코미디/판타지\n3. 무드: 감동/신남/아름다움\n\n추천 형식:\n━━━━━━━━━━━━━━\n🎭 추천 #1\n━━━━━━━━━━━━━━\n제목: [작품명]\n타입: 🎬영화 / 🎪무대\n한 줄: [소개]\n줄거리: [3-4문장]\n매력: • [포인트]\n대표곡: 🎵 [곡명]\n추천: ✓ [대상]\n━━━━━━━━━━━━━━\n\n작품 DB:\n\n뮤지컬 영화:\n- 라라랜드: 재즈+배우 사랑, City of Stars, 재즈/현실적결말\n- 위대한쇼맨: 서커스, This Is Me, 신남/희망\n- 레미제라블: 장발장, I Dreamed a Dream, 감동\n- 시카고: 1920 범죄, All That Jazz, 재즈\n- 물랑루즈: 파리 사랑, Come What May, 화려함\n- 맘마미아: 그리스, Dancing Queen, 신남\n\n브로드웨이:\n- 라이온킹: 심바, Circle of Life, 가족\n- 위키드: 오즈 우정, Defying Gravity, 판타지\n- 오페라의유령: 파리 사랑, Phantom, 로맨스\n\n한국 뮤지컬:\n- 광화문연가: 로맨스, 감성\n- 프랑켄슈타인: 비극, 웅장\n- 베르테르(2025): 순수사랑\n- 킹키부츠(2025): 유쾌함\n- 비틀쥬스(2025): 독특함\n- 베어더뮤지컬: 청춘\n\n취향별:\n로맨스→라라랜드,위대한쇼맨,오페라의유령\n신남→위대한쇼맨,맘마미아,킹키부츠\n감동→레미제라블,라라랜드\n판타지→위키드,라이온킹\n재즈→라라랜드,시카고\n입문→위대한쇼맨,맘마미아\n\n원칙: 열정적, 구체적, 2-3개추천";

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
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API 호출 실패');
    }

    const data = await response.json();
    
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
