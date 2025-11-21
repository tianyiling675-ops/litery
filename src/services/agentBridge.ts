export interface AnalysisReport {
  summary: string;
  traits: string[];
  writingStyle: string;
  riskSignals: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp?: Date | string;
}

export interface AvatarCore {
  name: string;
  personality: string;
}

const PSYCH_URL = import.meta.env.VITE_PSYCH_AGENT_URL as string | undefined;
const AVATAR_URL = import.meta.env.VITE_AVATAR_AGENT_URL as string | undefined;

async function safeFetch(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Agent call failed: ${res.status}`);
  return res.json();
}

export async function analyzeText(payload: { text: string; mode: 'direct' | 'diary'; name: string }): Promise<AnalysisReport> {
  if (PSYCH_URL) {
    const data = await safeFetch(PSYCH_URL, payload);
    return data as AnalysisReport;
  }
  const traitsPool = ['积极', '理性', '同理心', '创造力', '自省', '外向', '内向', '稳重', '好奇'];
  const traits = traitsPool.filter((_, i) => (payload.text.length + i) % 2 === 0).slice(0, 5);
  return {
    summary: '基于文字的初步性格分析（本地模拟）',
    traits,
    writingStyle: payload.mode === 'diary' ? '叙述细腻，情感表达稳定' : '简洁直接，信息密度较高',
    riskSignals: [],
  };
}

function similarity(a: string, b: string): number {
  const sa = new Set(a.split(/\s+/));
  const sb = new Set(b.split(/\s+/));
  const inter = [...sa].filter(x => sb.has(x)).length;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export async function chatWithPersona(params: {
  messages: ChatMessage[];
  avatar: AvatarCore;
  analysisReport?: AnalysisReport;
  avoidRepeat?: boolean;
  lastReply?: string;
  recentReplies?: string[];
}): Promise<{ reply: string }> {
  const { messages, avatar, analysisReport, avoidRepeat, lastReply, recentReplies = [] } = params;
  if (AVATAR_URL) {
    const data = await safeFetch(AVATAR_URL, { messages, avatar, analysisReport, avoidRepeat });
    return data as { reply: string };
  }
  const latest = messages[messages.length - 1]?.text || '';
  const userTurns = messages.filter(m => m.sender === 'user').length;
  const style = analysisReport?.writingStyle || '';
  const gentle = /细腻|温柔|稳定/.test(style);
  const openers = gentle
    ? ['我在想', '我们慢一点', '不急，先稳住', '试着换个温柔的切口', '先把心放松一下']
    : ['直接说结论', '换个视角看', '不如先定个小目标', '我更倾向于这样做', '从结果反推'];
  const actions = gentle
    ? ['先把可控的部分列出来', '把问题拆成两三步', '从最容易的一小步开始', '先做一件不费力的小事']
    : ['先明确目标', '把关键点列出来', '选一个今天能完成的动作', '把阻碍点逐一拆掉'];
  const coreFocusSyn = gentle
    ? ['真正在意的点', '背后的动因', '核心的心念', '你心里最重的那一处']
    : ['关键动因', '最核心的驱动', '真正的问题所在', '最关键的卡点'];
  const askings = gentle
    ? ['你觉得哪一步最轻松可做？', '我们从哪个点开始最安心？', '你更愿意先试哪一件小事？', '先做哪一步你会更踏实？']
    : ['哪个最现实？', '先做哪一个最有效？', '你想从哪个点开工？', '今天先推进哪一格？'];

  function ngramSim(a: string, b: string, n = 3): number {
    const grams = (s: string) => {
      const arr: string[] = [];
      for (let i = 0; i <= Math.max(0, s.length - n); i++) arr.push(s.slice(i, i + n));
      return new Set(arr);
    };
    const sa = grams(a);
    const sb = grams(b);
    let inter = 0;
    sa.forEach(g => { if (sb.has(g)) inter++; });
    const union = sa.size + sb.size - inter;
    return union === 0 ? 0 : inter / union;
  }

  function compose(): string {
    const opener = openers[Math.floor(Math.random() * openers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const core = coreFocusSyn[Math.floor(Math.random() * coreFocusSyn.length)];
    const ask = askings[Math.floor(Math.random() * askings.length)];
    const focus = latest.slice(0, 80);
    const s1 = userTurns <= 1
      ? `关于“${focus}”，先把思路收拢一下，${action}。`
      : `你刚刚提到“${focus}”，我更在意的是它的${core}。${action}。`;
    const useOpener = Math.random() < 0.6;
    const lead = useOpener ? `${opener}：` : '';
    const s2 = Math.random() < 0.5
      ? `先从最关键的一点开始。`
      : `不求一步到位，先迈出可执行的第一步。`;
    return `${lead}${s1}${s2}${ask}`;
  }

  let reply = compose();
  const recent = [lastReply, ...recentReplies].filter(Boolean);
  let attempts = 0;
  while (avoidRepeat && recent.some(r => ngramSim(reply, r) > 0.6) && attempts < 5) {
    reply = compose();
    attempts++;
  }
  if (avoidRepeat && recent.some(r => ngramSim(reply, r) > 0.6)) {
    reply = `就这件事，先定一个今天能完成的微目标：用10分钟写下“下一步”，并立即做起来。你愿意现在开始吗？`;
  }
  const banned = [
    '你的另一个我',
    `我是${avatar.name}`,
    '作为你的数字分身',
    '如果换个更温柔的角度',
    '我直说'
  ];
  banned.forEach(b => {
    reply = reply.replace(b, '');
  });
  reply = reply.replace(/^[，。；\s]+/, '');
  return { reply };
}
