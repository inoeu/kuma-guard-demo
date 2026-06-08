import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Crosshair,
  Database,
  Download,
  FileCheck2,
  FileClock,
  Gauge,
  History,
  LineChart,
  Mail,
  Map,
  MapPin,
  Megaphone,
  Minus,
  Plane,
  Plus,
  Radio,
  Route,
  Satellite,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  Siren,
  Smartphone,
  Target,
  Users,
  Video,
  ScanSearch,
  X,
} from 'lucide-react';

const alerts = [
  {
    id: 'YK-260605-01',
    level: 5,
    title: '市街地接近の疑い',
    place: '林道北口付近',
    area: '山北町モデル / 玄倉地区',
    time: '10:18:32',
    score: 0.92,
    status: 'review',
    source: 'AIカメラ A-12',
    type: '大型四足歩行・明瞭',
    weather: '曇り / 18.6℃ / 湿度78%',
    note: '住宅地から約850mの林道で検知。過去出没地点と重なり、通知前の人間承認が必要です。',
    recommended: '住民向け注意喚起とパトロール出動を同時に実施',
    distance: '住宅地まで850m',
    eta: '初動目標まで18分',
    owner: '危機管理課',
    channelPlan: 'LINE・防災無線・職員SMS',
    evidence: '連続3フレームで大型四足歩行を確認',
    thumbnail: 'photo',
    x: 61,
    y: 33,
    tone: 'red',
  },
  {
    id: 'YK-260605-02',
    level: 4,
    title: '観光施設周辺で検知',
    place: 'キャンプ場西側',
    area: '山北町モデル / 中川地区',
    time: '09:47:08',
    score: 0.78,
    status: 'ready',
    source: '固定カメラ B-07',
    type: '熱源・中型以上',
    weather: '曇り / 18.2℃ / 風弱い',
    note: '遊歩道に近い斜面で熱源を検知。施設管理者と観光課への共有を推奨します。',
    recommended: '観光施設へ先行連絡、SNS掲載は現地確認後',
    distance: 'キャンプ場まで420m',
    eta: '施設連絡まで12分',
    owner: '観光課連絡班',
    channelPlan: '施設メール・観光課SMS',
    evidence: '熱源輪郭が斜面を移動、静止物ではない可能性',
    thumbnail: 'thermal',
    x: 74,
    y: 51,
    tone: 'amber',
  },
  {
    id: 'YK-260605-03',
    level: 4,
    title: '早朝の移動体検知',
    place: '集落境界の沢沿い',
    area: '山北町モデル / 共和地区',
    time: '09:22:41',
    score: 0.76,
    status: 'watch',
    source: 'ドローン D-02',
    type: '移動体・大型',
    weather: '薄曇り / 視程良好',
    note: 'ドローン巡回で木立の間を移動する影を検知。確度は高いが再確認待ちです。',
    recommended: '次回巡回ルートを沢沿いへ寄せる',
    distance: '集落境界まで1.2km',
    eta: '再巡回まで46分',
    owner: 'ドローン運用班',
    channelPlan: '職員アプリ・巡回隊共有',
    evidence: '樹影と重なるため追加確認待ち',
    thumbnail: 'drone',
    x: 29,
    y: 48,
    tone: 'red-soft',
  },
  {
    id: 'YK-260605-04',
    level: 2,
    title: '足跡センサー反応',
    place: '深沢入口',
    area: '山北町モデル / 深沢地区',
    time: '08:15:04',
    score: 0.48,
    status: 'low',
    source: '環境センサー S-25',
    type: '足跡候補・輪郭不明',
    weather: '路面湿潤 / 枝揺れあり',
    note: '前夜の雨で誤検知の可能性あり。学習データとして残し、通知は保留します。',
    recommended: '現地写真のみ追加取得',
    distance: '深沢入口ゲート付近',
    eta: '現地写真取得待ち',
    owner: '農林課',
    channelPlan: '庁内共有のみ',
    evidence: '足跡候補は不明瞭、雨滴反応の可能性',
    thumbnail: 'track',
    x: 43,
    y: 70,
    tone: 'blue',
  },
];

const recipientsSeed = [
  { id: 'risk', name: '危機管理課', channel: '職員アプリ・SMS', checked: true, icon: ShieldCheck },
  { id: 'forest', name: '農林課', channel: 'メール・庁内共有', checked: true, icon: Building2 },
  { id: 'fire', name: '消防本部', channel: 'メール・FAX', checked: true, icon: Radio },
  { id: 'hunters', name: '猟友会', channel: 'アプリ・SMS', checked: true, icon: Users },
  { id: 'tourism', name: '学校・観光施設', channel: '防災無線・メール', checked: false, icon: Megaphone },
  { id: 'residents', name: '住民向け一斉配信', channel: 'LINE・防災アプリ', checked: false, icon: Smartphone },
];

const deviceRows = [
  { name: 'AIカメラ', count: '48 / 50', state: '正常', rate: '96%', level: 'ok' },
  { name: '環境センサー', count: '132 / 140', state: '正常', rate: '94%', level: 'ok' },
  { name: 'ドローン', count: '3 / 4', state: '巡回中', rate: '75%', level: 'warn' },
  { name: '通知ゲートウェイ', count: '8 / 8', state: '正常', rate: '100%', level: 'ok' },
];

const patrolRows = [
  { name: '北部巡回隊', area: '玄倉・深沢', state: '出動可能', eta: '12分', load: '2名 / 車両1', channel: '職員アプリ' },
  { name: '観光施設連絡班', area: '中川・キャンプ場', state: '待機中', eta: '即時', load: '施設3件へ連絡可', channel: 'メール・電話' },
  { name: '猟友会 A班', area: '山北町西側', state: '確認中', eta: '18分', load: '責任者確認中', channel: 'SMS' },
];

const proposalTabs = [
  { id: 'pilot', label: '実証計画', icon: Target },
  { id: 'roi', label: '費用対効果', icon: LineChart },
  { id: 'rollout', label: '導入ステップ', icon: ClipboardCheck },
  { id: 'materials', label: '提案資料', icon: Download },
];

const navItems = [
  { id: 'dashboard', label: '今日の判断', icon: Map, notice: '今日の判断画面を表示しています' },
  { id: 'alerts', label: 'アラート確認', icon: Siren, notice: '承認すべきアラートを確認しています' },
  { id: 'monitor', label: '監視マップ', icon: Satellite, notice: '監視マップと機器状態を確認しています' },
  { id: 'field', label: '現場連携', icon: Route, notice: '通知先と巡回班を確認しています' },
  { id: 'proposal', label: '導入提案', icon: LineChart, notice: '導入提案と費用対効果を確認しています' },
];

const routeByNavId = {
  dashboard: '#/dashboard',
  alerts: '#/alerts',
  monitor: '#/monitor',
  field: '#/field',
  proposal: '#/proposal',
};

const sectionByNavId = {
  dashboard: 'top-section',
  alerts: 'alerts-section',
  monitor: 'map-section',
  field: 'field-section',
  proposal: 'proposal-section',
};

const demoModes = [
  {
    id: 'staff',
    label: '職員向け',
    title: '現場運用デモ',
    body: '検知から通知承認、出動要請、記録までを職員目線で説明します。',
  },
  {
    id: 'executive',
    label: '首長向け',
    title: '意思決定デモ',
    body: '初動時間、住民説明、責任範囲、費用対効果を短く説明します。',
  },
  {
    id: 'council',
    label: '議会向け',
    title: '予算説明デモ',
    body: '実証KPI、補助金、個人情報、継続費の説明に重点を置きます。',
  },
];

const timelineSeed = [
  { time: '10:18', label: 'AIが出没候補を検知', detail: 'カメラ A-12 / 信頼度92%', tone: 'red' },
  { time: '10:19', label: '担当者が映像を確認', detail: '人間承認待ち', tone: 'amber' },
  { time: '10:20', label: '通知先を自動選定', detail: '4/6 宛先を選択済み', tone: 'blue' },
  { time: '未実行', label: '住民通知・出動要請', detail: '承認後に実行', tone: 'muted' },
];

const implementationSteps = [
  { step: '1', title: '事前調査・設計', term: '1〜2か月', body: '出没履歴、通学路、観光施設、通信環境を重ねて設置計画を作成' },
  { step: '2', title: '実証実験', term: '3〜6か月', body: 'AI検知、誤検知、通知到達率、現地対応時間をKPI化' },
  { step: '3', title: '段階導入', term: '6〜12か月', body: '高リスク地区から順にカメラ、センサー、運用ルールを拡張' },
  { step: '4', title: '運用・改善', term: '継続', body: '月次レポート、学習データ更新、住民向け説明資料を継続提供' },
];

const reportRows = [
  { label: '想定被害削減額', value: '3.24億円', note: '観光停止・警備・人的被害リスクの抑制' },
  { label: '年間運用コスト削減', value: '8,700万円', note: '巡回の重点化、電話連絡の自動化' },
  { label: '投資回収期間', value: '1.8年', note: '標準プラン概算' },
  { label: '3年ROI', value: '214%', note: '実証後の全域展開を想定' },
];

const materialCards = [
  { title: '首長・部長向け概要', icon: ScrollText, body: '導入目的、責任範囲、予算規模、住民説明の論点を1枚に整理' },
  { title: '現場運用手順書', icon: FileCheck2, body: '検知、承認、通知、出動、誤検知記録までの担当分担を明確化' },
  { title: '議会・補助金説明用', icon: Database, body: '実証KPI、調達範囲、継続費、個人情報・安全管理の説明に対応' },
];

const alertFilters = [
  { id: 'all', label: 'すべて' },
  { id: 'approval', label: '承認待ち' },
  { id: 'critical', label: '高リスク' },
  { id: 'field', label: '現地確認' },
];

const playbookSteps = [
  { id: 'detect', label: '検知', detail: 'AI候補' },
  { id: 'review', label: '確認', detail: '職員判断' },
  { id: 'notify', label: '通知', detail: '住民・施設' },
  { id: 'patrol', label: '出動', detail: '現場確認' },
  { id: 'record', label: '記録', detail: '監査ログ' },
];

const adoptionProofRows = [
  { label: '実証KPI', value: '12指標', note: '誤検知率・通知到達・初動時間' },
  { label: '補助金説明', value: '対応可', note: '鳥獣被害対策・防災DXの両面' },
  { label: '個人情報', value: '低リスク', note: '人物識別を目的にしない設計' },
  { label: '運用開始', value: '最短90日', note: '既存カメラとの併用も可能' },
];

const visionDetections = [
  {
    id: 'VIS-A12-001',
    alertId: 'YK-260605-01',
    title: '林道北口の大型四足歩行',
    kind: '固定カメラ',
    source: 'AIカメラ A-12',
    frame: '10:18:32 / 3連続フレーム',
    location: '住宅地まで850m',
    confidence: 92,
    model: 'BearVision v0.3',
    status: 'review',
    verdict: 'クマ候補',
    action: '通知承認前の映像確認',
    thumbnail: 'photo',
    box: { left: 58, top: 34, width: 24, height: 34 },
    classes: [
      { label: 'クマ候補', value: 92 },
      { label: 'シカ', value: 4 },
      { label: '人影', value: 2 },
    ],
  },
  {
    id: 'VIS-D02-014',
    alertId: 'YK-260605-03',
    title: '沢沿いの移動体',
    kind: 'ドローン',
    source: 'ドローン D-02',
    frame: '09:22:41 / 俯瞰映像',
    location: '集落境界まで1.2km',
    confidence: 76,
    model: 'BearVision v0.3',
    status: 'field',
    verdict: '再確認候補',
    action: '次回巡回で再確認',
    thumbnail: 'drone',
    box: { left: 42, top: 45, width: 28, height: 22 },
    classes: [
      { label: 'クマ候補', value: 76 },
      { label: 'イノシシ', value: 12 },
      { label: '樹影', value: 8 },
    ],
  },
  {
    id: 'VIS-B07-003',
    alertId: 'YK-260605-02',
    title: 'キャンプ場西側の熱源',
    kind: '固定カメラ',
    source: '固定カメラ B-07',
    frame: '09:47:08 / 熱源検知',
    location: 'キャンプ場まで420m',
    confidence: 78,
    model: 'ThermalCheck v0.2',
    status: 'review',
    verdict: '大型動物候補',
    action: '施設管理者へ先行共有',
    thumbnail: 'thermal',
    box: { left: 61, top: 48, width: 20, height: 24 },
    classes: [
      { label: '大型動物', value: 78 },
      { label: '人', value: 7 },
      { label: '静止熱源', value: 6 },
    ],
  },
];

function scoreLabel(score) {
  if (score >= 0.85) return '非常に高い';
  if (score >= 0.7) return '高い';
  if (score >= 0.55) return '中程度';
  return '低い';
}

function baseStatusText(status) {
  if (status === 'notified') return '通知済み';
  if (status === 'patrol') return '出動要請済み';
  if (status === 'false_positive') return '誤検知記録';
  if (status === 'ready') return '承認待ち';
  if (status === 'watch') return '再確認中';
  if (status === 'low') return '通知保留';
  return '人間承認待ち';
}

function statusText(itemOrStatus) {
  if (typeof itemOrStatus === 'string') return baseStatusText(itemOrStatus);

  const actionLabels = [];
  if (itemOrStatus.notified) actionLabels.push('通知済み');
  if (itemOrStatus.patrolRequested) actionLabels.push('出動要請済み');
  if (itemOrStatus.falsePositive) actionLabels.push('誤検知記録');

  return actionLabels.length > 0 ? actionLabels.join('・') : baseStatusText(itemOrStatus.status);
}

function statusTone(item) {
  if (item.falsePositive) return 'false_positive';
  if (item.notified || item.patrolRequested) return 'notified';
  return item.status;
}

function visionStatusText(status) {
  if (status === 'confirmed') return '職員確認済み';
  if (status === 'field') return '現地確認候補';
  if (status === 'false_positive') return '学習キュー';
  return '確認待ち';
}

function needsApproval(item) {
  return ['review', 'ready'].includes(item.status) && !item.notified && !item.falsePositive;
}

function isFieldCheck(item) {
  return item.status === 'watch' || item.patrolRequested || item.level >= 4;
}

function matchesAlertFilter(item, filter) {
  if (filter === 'approval') return needsApproval(item);
  if (filter === 'critical') return item.level >= 4 && !item.falsePositive;
  if (filter === 'field') return isFieldCheck(item);
  return true;
}

function navItemById(id) {
  return navItems.find((item) => item.id === id) ?? navItems[0];
}

function navIdFromHash() {
  if (typeof window === 'undefined') return 'dashboard';
  const navId = window.location.hash.replace(/^#\/?/, '');
  return navItems.some((item) => item.id === navId) ? navId : 'dashboard';
}

function routeForNavId(id) {
  return routeByNavId[id] ?? routeByNavId.dashboard;
}

function writeRouteForNavId(id) {
  if (typeof window === 'undefined') return;
  const nextRoute = routeForNavId(id);
  if (window.location.hash !== nextRoute) {
    window.history.pushState(null, '', nextRoute);
  }
}

function scrollToSection(sectionId) {
  if (typeof window === 'undefined' || !sectionId) return;
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function loadSavedTimeline() {
  if (typeof window === 'undefined') return timelineSeed;
  try {
    const saved = window.localStorage.getItem('bear-demo-timeline');
    if (!saved) return timelineSeed;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 8) : timelineSeed;
  } catch {
    return timelineSeed;
  }
}

function getPlaybookState(stepId, item) {
  if (stepId === 'detect') return 'done';
  if (stepId === 'review') return item.status === 'review' || item.status === 'ready' ? 'current' : 'done';
  if (stepId === 'notify') return item.notified ? 'done' : item.falsePositive ? 'blocked' : 'pending';
  if (stepId === 'patrol') return item.patrolRequested ? 'done' : item.falsePositive ? 'blocked' : 'pending';
  if (stepId === 'record') return item.falsePositive || item.notified || item.patrolRequested ? 'current' : 'pending';
  return 'pending';
}

function App() {
  const [alertItems, setAlertItems] = useState(alerts);
  const [selectedId, setSelectedId] = useState(alerts[0].id);
  const [visionItems, setVisionItems] = useState(visionDetections);
  const [selectedVisionId, setSelectedVisionId] = useState(visionDetections[0].id);
  const [recipients, setRecipients] = useState(recipientsSeed);
  const [timeline, setTimeline] = useState(() =>
    loadSavedTimeline().map((entry, index) => ({ ...entry, id: entry.id ?? `seed-${index}` })),
  );
  const [proposal, setProposal] = useState(() => (navIdFromHash() === 'proposal' ? 'roi' : 'pilot'));
  const [activeNav, setActiveNav] = useState(navIdFromHash);
  const [mapZoom, setMapZoom] = useState(100);
  const [selectedMaterial, setSelectedMaterial] = useState('実証計画サマリー');
  const [mode, setMode] = useState('map');
  const [notice, setNotice] = useState('承認待ちの警戒情報があります');
  const [alertFilter, setAlertFilter] = useState('all');
  const [selectedPatrolTeam, setSelectedPatrolTeam] = useState(patrolRows[0].name);
  const [demoMode, setDemoMode] = useState('staff');
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const idSeq = useRef(0);

  function showToast(label, detail, tone = 'green') {
    setToast({ seq: (idSeq.current += 1), label, detail, tone });
  }

  const selected = alertItems.find((item) => item.id === selectedId) ?? alertItems[0];
  const selectedVision = visionItems.find((item) => item.id === selectedVisionId) ?? visionItems[0];
  const activeDemoMode = demoModes.find((item) => item.id === demoMode) ?? demoModes[0];
  const checkedRecipients = recipients.filter((recipient) => recipient.checked).length;
  const filteredAlertItems = useMemo(
    () => alertItems.filter((item) => matchesAlertFilter(item, alertFilter)),
    [alertItems, alertFilter],
  );

  const stats = useMemo(() => {
    const reviewCount = alertItems.filter(needsApproval).length;
    const highCount = alertItems.filter((item) => item.level >= 4 && !item.falsePositive).length;
    const notifiedCount = alertItems.filter((item) => item.notified).length;
    const falseCount = alertItems.filter((item) => item.falsePositive).length;
    const patrolCount = alertItems.filter((item) => item.patrolRequested).length;
    const actionedCount = alertItems.filter((item) => item.notified || item.patrolRequested || item.falsePositive).length;
    const averageScore = Math.round(
      (alertItems.reduce((sum, item) => sum + item.score, 0) / alertItems.length) * 100,
    );
    return { reviewCount, highCount, notifiedCount, falseCount, patrolCount, actionedCount, averageScore };
  }, [alertItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem('bear-demo-timeline', JSON.stringify(timeline.slice(0, 8)));
    } catch {
      // 保存できない環境では画面内ログだけで動作します。
    }
  }, [timeline]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function applyRouteFromHash() {
      const navId = navIdFromHash();
      const item = navItemById(navId);
      setActiveNav(item.id);
      setNotice(item.notice);
      if (item.id === 'alerts') {
        setSelectedId(alerts[0].id);
        setSelectedVisionId(visionDetections[0].id);
      }
      if (item.id === 'proposal') setProposal('roi');
      scrollToSection(sectionByNavId[item.id]);
    }

    applyRouteFromHash();
    window.addEventListener('hashchange', applyRouteFromHash);
    window.addEventListener('popstate', applyRouteFromHash);
    return () => {
      window.removeEventListener('hashchange', applyRouteFromHash);
      window.removeEventListener('popstate', applyRouteFromHash);
    };
  }, []);

  function pushTimeline(label, detail, tone = 'blue') {
    setTimeline((current) => [
      { id: (idSeq.current += 1), time: '10:24', label, detail, tone },
      ...current.slice(0, 4),
    ]);
    setNotice(label);
  }

  function updateSelected(action, label, detail) {
    setAlertItems((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              notified: action === 'notified' ? true : item.notified,
              patrolRequested: action === 'patrol' ? true : item.patrolRequested,
              falsePositive: action === 'false_positive' ? true : item.falsePositive,
            }
          : item,
      ),
    );
    pushTimeline(label, detail, action === 'false_positive' ? 'blue' : 'green');
    showToast(label, detail, action === 'false_positive' ? 'blue' : 'green');
  }

  function openConfirmation(action, title, body, confirmLabel, label, detail) {
    setPendingAction({ action, title, body, confirmLabel, label, detail });
  }

  function confirmPendingAction() {
    if (!pendingAction) return;
    updateSelected(pendingAction.action, pendingAction.label, pendingAction.detail);
    setPendingAction(null);
  }

  function approveNotification() {
    openConfirmation(
      'notified',
      '住民通知を承認しますか',
      `${selected.title}について、${checkedRecipients}/6 宛先へ注意喚起を出すデモ操作です。`,
      '通知を承認',
      '住民通知を承認しました',
      `${checkedRecipients}/6 宛先へ通知準備完了`,
    );
  }

  function requestPatrol() {
    openConfirmation(
      'patrol',
      'パトロール出動を要請しますか',
      `${selectedPatrolTeam}へ出動要請を出すデモ操作です。現地確認の責任範囲を説明できます。`,
      '出動を要請',
      'パトロール出動を要請しました',
      `${selectedPatrolTeam}へ出動要請`,
    );
  }

  function recordFalsePositive() {
    openConfirmation(
      'false_positive',
      '誤検知として記録しますか',
      `${selected.title}を通知せず、学習キューへ回すデモ操作です。`,
      '誤検知記録',
      '誤検知として記録しました',
      '学習キューへ追加',
    );
  }

  function toggleRecipient(id) {
    const target = recipients.find((recipient) => recipient.id === id);
    setRecipients((current) =>
      current.map((recipient) =>
        recipient.id === id ? { ...recipient, checked: !recipient.checked } : recipient,
      ),
    );
    if (target) {
      pushTimeline(
        `${target.name}を${target.checked ? '通知先から外しました' : '通知先に追加しました'}`,
        target.channel,
        'blue',
      );
    }
  }

  function selectAlert(id, sourceLabel) {
    const target = alertItems.find((item) => item.id === id);
    const linkedVision = visionItems.find((item) => item.alertId === id);
    setSelectedId(id);
    if (linkedVision) setSelectedVisionId(linkedVision.id);
    if (target) {
      pushTimeline(`${target.title}を選択しました`, `${sourceLabel} / ${target.source}`, 'blue');
    }
  }

  function selectFilter(filter) {
    const target = alertFilters.find((item) => item.id === filter);
    setAlertFilter(filter);
    pushTimeline(`${target?.label ?? 'すべて'}でアラートを絞り込みました`, '最新アラート一覧を再集計', 'blue');
  }

  function selectPatrolTeam(row) {
    setSelectedPatrolTeam(row.name);
    pushTimeline(`${row.name}を候補班にしました`, `${row.area} / 現着目安 ${row.eta}`, 'blue');
  }

  function selectProposal(id) {
    const target = proposalTabs.find((item) => item.id === id);
    setProposal(id);
    if (target) {
      pushTimeline(`${target.label}を表示しました`, '自治体向け提案パネルを切り替えました', 'blue');
    }
  }

  function selectDemoMode(id) {
    const target = demoModes.find((item) => item.id === id);
    if (!target) return;
    setDemoMode(id);
    pushTimeline(`${target.label}デモに切り替えました`, target.body, 'blue');
    if (id !== 'staff') {
      setProposal(id === 'executive' ? 'roi' : 'materials');
    }
  }

  function selectVision(id) {
    const target = visionItems.find((item) => item.id === id);
    if (!target) return;
    setSelectedVisionId(id);
    setSelectedId(target.alertId);
    pushTimeline(`${target.title}のAI画像を表示しました`, `${target.source} / 信頼度${target.confidence}%`, 'blue');
  }

  function applyVisionDecision(decision) {
    const target = selectedVision;
    if (!target) return;

    const nextStatus = decision === 'confirm' ? 'confirmed' : decision === 'field' ? 'field' : 'false_positive';
    const timelineLabel =
      decision === 'confirm'
        ? '画像AIでクマ候補を確認しました'
        : decision === 'field'
          ? '画像AI判定を現地確認へ回しました'
          : '画像AI判定を誤検知学習へ回しました';
    const timelineTone = decision === 'false_positive' ? 'blue' : decision === 'confirm' ? 'green' : 'amber';

    setVisionItems((current) =>
      current.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: nextStatus,
              action:
                decision === 'confirm'
                  ? '職員確認済み・通知判断へ'
                  : decision === 'field'
                    ? '現場班へ再確認依頼'
                    : '通知せず学習データへ',
            }
          : item,
      ),
    );

    setAlertItems((current) =>
      current.map((item) => {
        if (item.id !== target.alertId) return item;
        if (decision === 'false_positive') {
          return { ...item, falsePositive: true };
        }
        if (decision === 'field') {
          return { ...item, status: 'watch' };
        }
        return {
          ...item,
          status: item.status === 'low' ? 'ready' : item.status,
          evidence: item.evidence.includes('画像AI確認済み') ? item.evidence : `${item.evidence} / 画像AI確認済み`,
        };
      }),
    );

    setSelectedId(target.alertId);
    pushTimeline(timelineLabel, `${target.source} / ${target.verdict} ${target.confidence}%`, timelineTone);
    showToast(timelineLabel, `${target.source} / ${target.verdict} ${target.confidence}%`, timelineTone);
  }

  function selectNav(item) {
    writeRouteForNavId(item.id);
    setActiveNav(item.id);
    setNotice(item.notice);
    if (item.id === 'alerts') {
      setSelectedId(alertItems[0].id);
      setSelectedVisionId(visionDetections[0].id);
      scrollToSection(sectionByNavId.alerts);
      pushTimeline(item.notice, '最新アラート一覧を表示', 'blue');
      return;
    }
    if (item.id === 'monitor') {
      pushTimeline(item.notice, 'AIカメラ 48/50・環境センサー 132/140', 'blue');
      scrollToSection(sectionByNavId.monitor);
      return;
    }
    if (item.id === 'field') {
      pushTimeline(item.notice, '北部巡回隊・猟友会A班の出動候補を確認', 'blue');
      scrollToSection(sectionByNavId.field);
      return;
    }
    if (item.id === 'proposal') {
      setProposal('roi');
      pushTimeline(item.notice, '費用対効果と導入工程を表示', 'blue');
      scrollToSection(sectionByNavId.proposal);
      return;
    }
    scrollToSection(sectionByNavId.dashboard);
    pushTimeline(item.notice, `${item.label}を選択`, 'blue');
  }

  function updateMapZoom(direction) {
    setMapZoom((current) => {
      if (direction === 'in') return Math.min(150, current + 10);
      if (direction === 'out') return Math.max(80, current - 10);
      return 100;
    });
    const label = direction === 'in' ? '地図を拡大しました' : direction === 'out' ? '地図を縮小しました' : '地図表示を中央に戻しました';
    pushTimeline(label, '地図操作を反映しました', 'blue');
  }

  function selectMaterial(title) {
    setSelectedMaterial(title);
    pushTimeline(`${title}を選択しました`, '提案資料の説明項目を表示しました', 'blue');
  }

  return (
    <div className="app-shell">
      <SceneDefs />
      <aside className="sidebar" aria-label="メニュー">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1>クマ早期警戒・対応支援システム</h1>
            <p>自治体危機管理ダッシュボード</p>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavItem
              active={activeNav === item.id}
              count={item.id === 'alerts' ? stats.reviewCount : undefined}
              icon={item.icon}
              key={item.id}
              label={item.label}
              onClick={() => selectNav(item)}
            />
          ))}
        </nav>

        <div className="system-card">
          <p>システム状態</p>
          <strong><span />すべて正常</strong>
          <small>最終更新 10:24:15</small>
        </div>
      </aside>

      <main className="main" id="top-section">
        <header className="topbar">
          <div className="risk-banner">
            <strong><AlertTriangle size={18} />警戒レベル 4</strong>
            <span>市街地接近リスク上昇</span>
          </div>
          <div className="topbar-meta">
            <span>2026/06/05（金）</span>
            <span>10:24</span>
            <span className="weather">18.6℃ / 湿度78%</span>
            <span className="topbar-chip"><Clock3 size={14} />初動目標 30分</span>
            <button className="icon-button" aria-label="通知" onClick={() => selectNav(navItemById('alerts'))} type="button">
              <Bell size={18} />
              <span className="badge">{stats.reviewCount}</span>
            </button>
            <button className="icon-button" aria-label="ヘルプ" onClick={() => pushTimeline('ヘルプを開きました', 'AIは候補検知、人間が最終承認する運用です', 'blue')} type="button">
              <CircleHelp size={18} />
            </button>
            <div className="operator">
              <span>危機管理課 本部</span>
              <small>山北町モデル</small>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <DemoModeSwitch
          activeMode={activeDemoMode}
          demoMode={demoMode}
          onSelect={selectDemoMode}
        />

        <ActionDock
          checkedRecipients={checkedRecipients}
          onNotify={approveNotification}
          onPatrol={requestPatrol}
          onProposal={() => selectNav(navItemById('proposal'))}
          selected={selected}
          selectedPatrolTeam={selectedPatrolTeam}
        />

        <section className="stat-strip" aria-label="現在の状況">
          <StatCard label="今すぐ承認" value={`${stats.reviewCount}件`} note={selected.title} tone="alert" />
          <StatCard label="最高リスク" value="Lv.5" note={`${selected.distance} / ${selected.eta}`} />
          <StatCard label="次の操作" value="通知承認" note={`${checkedRecipients}/6 宛先・${selectedPatrolTeam}`} />
        </section>

        <FocusPanel
          notice={notice}
          selected={selected}
          selectedPatrolTeam={selectedPatrolTeam}
        />

        <section className="command-grid">
          <aside className="alert-queue" id="alerts-section">
            <PanelHeader title="承認待ちアラート" action="すべて表示" onAction={() => selectNav(navItemById('alerts'))} />
            <div className="filter-row" aria-label="アラート絞り込み">
              {alertFilters.map((item) => (
                <button
                  className={alertFilter === item.id ? 'active' : ''}
                  key={item.id}
                  onClick={() => selectFilter(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="alert-list">
              {filteredAlertItems.map((item) => (
                <button
                  className={`alert-card ${selected.id === item.id ? 'selected' : ''} level-${item.level}`}
                  key={item.id}
                  onClick={() => selectAlert(item.id, '最新アラート')}
                  type="button"
                >
                  <EvidenceThumb type={item.thumbnail} />
                  <div>
                    <span className="alert-time">{item.time}<em>レベル {item.level}</em></span>
                    <strong>{item.title}</strong>
                    <small>{item.area}</small>
                    <span className="alert-status-line">
                      <i>{statusText(item)}</i>
                      <b>{item.eta}</b>
                    </span>
                    <span className="alert-meta">AI信頼度 {Math.round(item.score * 100)}% / {item.source} / {item.distance}</span>
                  </div>
                </button>
              ))}
              {filteredAlertItems.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle2 size={18} />
                  <strong>該当するアラートはありません</strong>
                  <span>別の条件に切り替えると全件を確認できます</span>
                </div>
              ) : null}
            </div>
          </aside>

          <section className="map-panel" id="map-section">
            <div className="map-tabs">
              <button className={mode === 'map' ? 'selected' : ''} onClick={() => { setMode('map'); pushTimeline('地図表示に切り替えました', '道路・集落・センサーを重ねて表示', 'blue'); }} type="button">地図</button>
              <button className={mode === 'photo' ? 'selected' : ''} onClick={() => { setMode('photo'); pushTimeline('航空写真表示に切り替えました', '地形の濃淡を強調して表示', 'blue'); }} type="button">航空写真</button>
            </div>
            <SafetyMap
              items={alertItems}
              mapZoom={mapZoom}
              mode={mode}
              onSelect={(id) => selectAlert(id, '地図マーカー')}
              onZoom={updateMapZoom}
              selected={selected}
              selectedId={selected.id}
            />
          </section>

          <aside className="decision-panel">
            <PanelHeader title="対応判断パネル" action={selected.id} danger />
            <div className="selected-summary">
              <EvidenceThumb type={selected.thumbnail} large />
              <div>
                <span className={`status-pill ${statusTone(selected)}`}>{statusText(selected)}</span>
                <h2>{selected.title}</h2>
                <dl>
                  <div><dt>検知時刻</dt><dd>{selected.time}</dd></div>
                  <div><dt>検知場所</dt><dd>{selected.area}</dd></div>
                  <div><dt>検知機器</dt><dd>{selected.source}</dd></div>
                </dl>
              </div>
            </div>

            <div className="score-block">
              <div className="score-row">
                <span>AI信頼度</span>
                <strong>{Math.round(selected.score * 100)}%</strong>
                <em>{scoreLabel(selected.score)}</em>
              </div>
              <div className="score-track">
                <span style={{ width: `${selected.score * 100}%` }} />
              </div>
            </div>

            <dl className="detail-list">
              <div><dt>検知タイプ</dt><dd>{selected.type}</dd></div>
              <div><dt>天候・環境</dt><dd>{selected.weather}</dd></div>
              <div><dt>推奨対応</dt><dd>{selected.recommended}</dd></div>
              <div><dt>担当</dt><dd>{selected.owner} / {selected.channelPlan}</dd></div>
              <div><dt>備考</dt><dd>{selected.note}</dd></div>
            </dl>

            <PlaybookSteps selected={selected} />

            <NotificationPreview
              checkedRecipients={checkedRecipients}
              selected={selected}
              selectedPatrolTeam={selectedPatrolTeam}
            />

            <div className="action-stack" aria-label="対応操作">
              <button
                className="primary-action"
                disabled={selected.notified || selected.falsePositive}
                onClick={approveNotification}
              >
                <Siren size={18} />
                {selected.notified ? '通知済み' : '住民通知を承認'}
              </button>
              <button
                className="secondary-action green"
                disabled={selected.patrolRequested || selected.falsePositive}
                onClick={requestPatrol}
              >
                <Route size={18} />
                {selected.patrolRequested ? '出動要請済み' : 'パトロール出動要請'}
              </button>
              <button
                className="secondary-action"
                disabled={selected.falsePositive || selected.notified || selected.patrolRequested}
                onClick={recordFalsePositive}
              >
                <FileClock size={18} />
                {selected.falsePositive ? '誤検知記録済み' : '誤検知として記録'}
              </button>
            </div>
          </aside>
        </section>

        <section className="operations-grid" id="field-section">
          <VisionAiPanel
            items={visionItems}
            onConfirm={() => applyVisionDecision('confirm')}
            onFalsePositive={() => applyVisionDecision('false_positive')}
            onFieldCheck={() => applyVisionDecision('field')}
            onSelect={selectVision}
            selected={selectedVision}
          />

          <section className="data-panel evidence-panel">
            <PanelHeader title="証拠・記録" action="最新5件" onAction={() => pushTimeline('証拠一覧を確認しました', '最新の映像・熱源・足跡候補を表示', 'blue')} />
            <div className="evidence-rail">
              {alertItems.map((item) => (
                <button className="evidence-item" key={item.id} onClick={() => selectAlert(item.id, '証拠・記録')} type="button">
                  <EvidenceThumb type={item.thumbnail} />
                  <span>{item.time}</span>
                  <strong>{Math.round(item.score * 100)}%</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="data-panel timeline-panel">
            <PanelHeader title="対応履歴・タイムライン" action="ログ追加済み" onAction={() => pushTimeline('タイムラインを確認しました', '直近5件の対応ログを表示', 'blue')} />
            <div className="timeline-list">
              {timeline.map((item, index) => (
                <div className={`timeline-item ${item.tone}`} key={item.id ?? `${item.time}-${index}`}>
                  <span>{item.time}</span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="data-panel recipients-panel">
            <PanelHeader title="通知先" action={`${checkedRecipients}/6 選択中`} onAction={() => selectNav(navItemById('field'))} />
            <div className="recipient-list">
              {recipients.map((recipient) => {
                const Icon = recipient.icon;
                return (
                  <label className="recipient-row" key={recipient.id}>
                    <input
                      checked={recipient.checked}
                      onChange={() => toggleRecipient(recipient.id)}
                      type="checkbox"
                    />
                    <span><Icon size={15} />{recipient.name}</span>
                    <small>{recipient.channel}</small>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="data-panel patrol-team-panel">
            <PanelHeader title="巡回班候補" action={selectedPatrolTeam} onAction={() => selectNav(navItemById('field'))} />
            <div className="patrol-list">
              {patrolRows.map((row) => (
                <button
                  className={selectedPatrolTeam === row.name ? 'selected' : ''}
                  key={row.name}
                  onClick={() => selectPatrolTeam(row)}
                  type="button"
                >
                  <span><Route size={15} />{row.name}</span>
                  <strong>{row.eta}</strong>
                  <small>{row.area} / {row.load}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="data-panel device-panel">
            <PanelHeader title="機器稼働状況" action="監視中" onAction={() => selectNav(navItemById('monitor'))} />
            <div className="device-list">
              {deviceRows.map((row) => (
                <div className="device-row" key={row.name}>
                  <span><Radio size={15} />{row.name}</span>
                  <strong>{row.count}</strong>
                  <em className={row.level}>{row.state}</em>
                  <small>{row.rate}</small>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="sales-workspace" id="proposal-section" aria-label="自治体向け提案情報">
          <div className="sales-header">
            <div>
              <span>自治体営業用ビュー</span>
              <h2>運用デモから予算説明まで一画面でつなぐ</h2>
              <button className="report-button" onClick={() => setShowReport(true)} type="button">
                <FileCheck2 size={16} />月次レポートを出力（PDF）
              </button>
            </div>
            <div className="sales-proof">
              <strong>実証開始まで90日</strong>
              <em>既存カメラ・防災無線との併用を想定</em>
            </div>
          </div>

          <div className="proposal-tabs" role="tablist" aria-label="提案表示切替">
            {proposalTabs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={proposal === item.id ? 'active' : ''}
                  key={item.id}
                  onClick={() => selectProposal(item.id)}
                  type="button"
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <ProposalPanel active={proposal} onMaterialClick={selectMaterial} selectedMaterial={selectedMaterial} />
        </section>
      </main>
      <ConfirmDialog
        pendingAction={pendingAction}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <MonthlyReport open={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const Icon =
    toast.tone === 'green' ? CheckCircle2 :
    toast.tone === 'amber' ? AlertTriangle :
    toast.tone === 'red' ? Siren :
    Bell;
  return (
    <div className={`toast ${toast.tone}`} role="status" key={toast.seq}>
      <span className="toast-icon"><Icon size={18} /></span>
      <div className="toast-body">
        <strong>{toast.label}</strong>
        {toast.detail ? <small>{toast.detail}</small> : null}
      </div>
      <button className="toast-close" onClick={onClose} aria-label="閉じる" type="button"><X size={15} /></button>
    </div>
  );
}

function MonthlyReport({ open, onClose }) {
  if (!open) return null;
  const weekly = [
    { label: '第1週', value: 28 },
    { label: '第2週', value: 35 },
    { label: '第3週', value: 41 },
    { label: '第4週', value: 33 },
    { label: '第5週', value: 21 },
  ];
  const maxWeekly = Math.max(...weekly.map((w) => w.value));
  const areas = [
    { name: '玄倉地区', detect: 52, bear: 18, notify: 9, patrol: 7 },
    { name: '中川地区', detect: 43, bear: 11, notify: 6, patrol: 4 },
    { name: '共和地区', detect: 38, bear: 9, notify: 5, patrol: 4 },
    { name: '市街地周辺', detect: 25, bear: 3, notify: 3, patrol: 2 },
  ];
  const devices = [
    { name: 'AIカメラ', value: '48 / 50', rate: '96%' },
    { name: '環境センサー', value: '132 / 140', rate: '94%' },
    { name: 'ドローン', value: '3 / 4', rate: '75%' },
    { name: '通知ゲートウェイ', value: '8 / 8', rate: '100%' },
  ];
  const kpis = [
    { label: '総検知件数', value: '158', unit: '件' },
    { label: 'クマ確定', value: '41', unit: '件' },
    { label: '誤検知率', value: '12.0', unit: '%' },
    { label: '平均初動時間', value: '15.8', unit: '分' },
    { label: '通知到達率', value: '99.4', unit: '%' },
    { label: '住民通知', value: '23', unit: '回' },
  ];
  return (
    <div className="report-overlay" role="dialog" aria-modal="true" aria-label="月次運用レポート">
      <div className="report-toolbar">
        <span>月次運用レポート（デモ用サンプル）</span>
        <div className="report-toolbar-actions">
          <button className="report-print" onClick={() => window.print()} type="button"><Download size={16} />印刷 / PDF保存</button>
          <button className="report-close" onClick={onClose} type="button" aria-label="閉じる"><X size={18} /></button>
        </div>
      </div>
      <div className="report-scroll">
        <article className="report-paper">
          <header className="report-head">
            <div>
              <p className="report-kicker">クマ早期警戒・対応支援システム</p>
              <h1>月次運用レポート</h1>
            </div>
            <div className="report-meta">
              <p>対象自治体：山北町モデル</p>
              <p>対象期間：2026年5月1日〜5月31日</p>
              <p>発行日：2026年6月1日</p>
            </div>
          </header>

          <section className="report-kpis">
            {kpis.map((k) => (
              <div className="report-kpi" key={k.label}>
                <span>{k.label}</span>
                <strong>{k.value}<em>{k.unit}</em></strong>
              </div>
            ))}
          </section>

          <section className="report-block">
            <h2>週次の検知件数</h2>
            <svg className="report-chart" viewBox="0 0 520 180" role="img" aria-label="週次検知件数の推移">
              <line x1="28" y1="150" x2="500" y2="150" stroke="#cbd5d0" strokeWidth="1" />
              {weekly.map((w, i) => {
                const x = 44 + i * 94;
                const h = Math.round((w.value / maxWeekly) * 118);
                return (
                  <g key={w.label}>
                    <rect x={x} y={150 - h} width="54" height={h} rx="4" fill="#1f7a4d" />
                    <text x={x + 27} y={150 - h - 8} textAnchor="middle" className="report-chart-value">{w.value}</text>
                    <text x={x + 27} y={170} textAnchor="middle" className="report-chart-label">{w.label}</text>
                  </g>
                );
              })}
            </svg>
          </section>

          <section className="report-block">
            <h2>地区別の内訳</h2>
            <table className="report-table">
              <thead>
                <tr><th>地区</th><th>検知</th><th>クマ確定</th><th>住民通知</th><th>出動</th></tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.name}>
                    <td>{a.name}</td><td>{a.detect}</td><td>{a.bear}</td><td>{a.notify}</td><td>{a.patrol}</td>
                  </tr>
                ))}
                <tr className="report-total">
                  <td>合計</td><td>158</td><td>41</td><td>23</td><td>17</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="report-block report-two-col">
            <div>
              <h2>機器稼働状況</h2>
              <table className="report-table">
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.name}><td>{d.name}</td><td>{d.value}</td><td className="report-rate">{d.rate}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2>対応の内訳</h2>
              <ul className="report-list">
                <li><span>住民通知</span><strong>23回</strong></li>
                <li><span>パトロール出動</span><strong>17回</strong></li>
                <li><span>誤検知として記録</span><strong>19件</strong></li>
                <li><span>監視継続・経過観察</span><strong>99件</strong></li>
              </ul>
            </div>
          </section>

          <section className="report-block">
            <h2>所見・次月の重点</h2>
            <p className="report-note">
              5月は前月比で検知件数が増加し、特に玄倉地区の林道沿いで出没が集中しました。AI画像判定の職員確認運用により誤検知率は前月の17.4%から12.0%へ改善。通知から初動までの平均時間は目標30分に対し15.8分を維持しています。次月は重点警戒エリア（中川地区東側）へのドローン巡回を増やし、通学路沿いへの固定カメラ2台の増設を提案します。
            </p>
          </section>

          <footer className="report-foot">
            <span>クマ早期警戒・対応支援システム / 自治体危機管理ダッシュボード</span>
            <span>※ 本レポートはデモ用のサンプルデータです。</span>
          </footer>
        </article>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, count, onClick }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} type="button">
      <Icon size={18} />
      <span>{label}</span>
      {count ? <em>{count}</em> : null}
    </button>
  );
}

function DemoModeSwitch({ activeMode, demoMode, onSelect }) {
  return (
    <section className="demo-mode-strip" aria-label="営業デモモード">
      <div>
        <span>説明モード</span>
        <strong>{activeMode.title}</strong>
        <small>{activeMode.body}</small>
      </div>
      <div className="demo-mode-buttons" role="tablist" aria-label="説明モード切替">
        {demoModes.map((item) => (
          <button
            aria-selected={demoMode === item.id}
            className={demoMode === item.id ? 'active' : ''}
            key={item.id}
            onClick={() => onSelect(item.id)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ConfirmDialog({ pendingAction, onCancel, onConfirm }) {
  if (!pendingAction) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-dialog" aria-modal="true" role="dialog" aria-labelledby="confirm-title">
        <button className="modal-close" aria-label="閉じる" onClick={onCancel} type="button">
          <X size={18} />
        </button>
        <div className="confirm-icon" aria-hidden="true">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 id="confirm-title">{pendingAction.title}</h2>
          <p>{pendingAction.body}</p>
        </div>
        <div className="confirm-actions">
          <button className="secondary-action" onClick={onCancel} type="button">キャンセル</button>
          <button className="primary-action" onClick={onConfirm} type="button">{pendingAction.confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, note, tone }) {
  return (
    <article className={`stat-card ${tone ?? ''}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function PanelHeader({ title, action, danger = false, onAction }) {
  return (
    <div className="panel-header">
      <h3>{title}</h3>
      {onAction ? (
        <button className={danger ? 'danger' : ''} onClick={onAction} type="button">{action}</button>
      ) : (
        <span className={danger ? 'danger' : ''}>{action}</span>
      )}
    </div>
  );
}

function FocusPanel({ notice, selected, selectedPatrolTeam }) {
  return (
    <section className="focus-panel" aria-live="polite">
      <div className="focus-copy">
        <span>この画面で決めること</span>
        <h2>{selected.title}への通知承認と出動判断</h2>
        <p>{selected.recommended}</p>
      </div>
      <ol className="focus-steps">
        <li className="current"><strong>1</strong><span>映像確認</span></li>
        <li><strong>2</strong><span>通知承認</span></li>
        <li><strong>3</strong><span>{selectedPatrolTeam}へ出動要請</span></li>
      </ol>
      <div className="focus-note">
        <strong>{notice}</strong>
        <span>{selected.id} / {selected.distance}</span>
      </div>
    </section>
  );
}

function ActionDock({ checkedRecipients, onNotify, onPatrol, onProposal, selected, selectedPatrolTeam }) {
  return (
    <section className="action-dock" aria-label="対応操作バー">
      <div className="dock-summary">
        <span className={`dock-level level-${selected.level}`}>Lv.{selected.level}</span>
        <div>
          <strong>{selected.title}</strong>
          <small>{selected.distance} / {selected.eta}</small>
        </div>
      </div>
      <div className="dock-proof">
        <span><Camera size={14} />{Math.round(selected.score * 100)}%</span>
        <span><Megaphone size={14} />{checkedRecipients}/6 宛先</span>
        <span><Route size={14} />{selectedPatrolTeam}</span>
      </div>
      <div className="dock-actions">
        <button
          className="dock-primary"
          disabled={selected.notified || selected.falsePositive}
          onClick={onNotify}
          type="button"
        >
          <Siren size={17} />
          {selected.notified ? '通知済み' : '通知承認'}
        </button>
        <button
          className="dock-secondary"
          disabled={selected.patrolRequested || selected.falsePositive}
          onClick={onPatrol}
          type="button"
        >
          <Route size={17} />
          {selected.patrolRequested ? '要請済み' : '出動要請'}
        </button>
        <button className="dock-ghost" onClick={onProposal} type="button">
          <LineChart size={17} />
          提案説明
        </button>
      </div>
    </section>
  );
}

function PlaybookSteps({ selected }) {
  return (
    <div className="playbook-steps" aria-label="対応ステップ">
      {playbookSteps.map((step) => {
        const state = getPlaybookState(step.id, selected);
        return (
          <div className={`playbook-step ${state}`} key={step.id}>
            <span>{step.label}</span>
            <small>{step.detail}</small>
          </div>
        );
      })}
    </div>
  );
}

function NotificationPreview({ checkedRecipients, selected, selectedPatrolTeam }) {
  return (
    <div className="notification-preview">
      <div>
        <span><MessageSquareIcon />通知文プレビュー</span>
        <strong>【クマ出没注意】本日{selected.time.slice(0, 5)}頃、{selected.place}でクマとみられる動物を確認しました。{selected.distance}。屋外では音を鳴らして行動し、子ども・高齢者の外出は控えてください。</strong>
      </div>
      <dl>
        <div><dt>宛先</dt><dd>{checkedRecipients}/6 系統</dd></div>
        <div><dt>巡回</dt><dd>{selectedPatrolTeam}</dd></div>
        <div><dt>根拠</dt><dd>{selected.evidence}</dd></div>
      </dl>
    </div>
  );
}

function MessageSquareIcon() {
  return <Send size={14} />;
}

// 共有SVG定義（グラデーション・パターン・ノイズフィルタ）。文書内で1回だけ描画し、
// 各検知シーンが url(#...) で参照する。重複IDを避けつつフィルタを使い回すための仕組み。
function SceneDefs() {
  return (
    <svg className="scene-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="kgIrSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2a22" />
          <stop offset="0.55" stopColor="#101e18" />
          <stop offset="1" stopColor="#0a140f" />
        </linearGradient>
        <radialGradient id="kgIrGlow" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor="#3f6050" stopOpacity="0.5" />
          <stop offset="1" stopColor="#3f6050" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="kgVignette" cx="0.5" cy="0.48" r="0.72">
          <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="kgBearIr" x1="0" y1="86" x2="0" y2="178" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c2cdc4" />
          <stop offset="0.5" stopColor="#8b968c" />
          <stop offset="1" stopColor="#3c463e" />
        </linearGradient>
        <radialGradient id="kgBearThermal" cx="180" cy="114" r="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff7e6" />
          <stop offset="0.26" stopColor="#ffd23f" />
          <stop offset="0.5" stopColor="#ff7a18" />
          <stop offset="0.72" stopColor="#d72631" />
          <stop offset="1" stopColor="#5b1670" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="kgThermalBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a1036" />
          <stop offset="0.6" stopColor="#140738" />
          <stop offset="1" stopColor="#04030f" />
        </linearGradient>
        <linearGradient id="kgThermalScale" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0a0030" />
          <stop offset="0.4" stopColor="#d72631" />
          <stop offset="0.7" stopColor="#ff7a18" />
          <stop offset="0.86" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#fff7e6" />
        </linearGradient>
        <linearGradient id="kgAerial" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f4a3a" />
          <stop offset="0.5" stopColor="#15392d" />
          <stop offset="1" stopColor="#0e2a22" />
        </linearGradient>
        <linearGradient id="kgRiver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f7fa6" />
          <stop offset="1" stopColor="#2b5f86" />
        </linearGradient>
        <radialGradient id="kgAnimalTop" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#24302a" />
          <stop offset="1" stopColor="#0a120d" />
        </radialGradient>
        <linearGradient id="kgSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d362b" />
          <stop offset="1" stopColor="#221c14" />
        </linearGradient>
        <pattern id="kgScan" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="1" fill="#000000" fillOpacity="0.22" />
        </pattern>
        <pattern id="kgCanopy" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#14392c" />
          <circle cx="8" cy="8" r="7" fill="#1c4a38" />
          <circle cx="22" cy="15" r="8" fill="#173f30" />
          <circle cx="11" cy="24" r="6" fill="#1f5240" />
          <circle cx="27" cy="28" r="5" fill="#15402f" />
          <circle cx="2" cy="20" r="5" fill="#1a4636" />
        </pattern>
        <filter id="kgGrain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0" />
        </filter>
        <filter id="kgThermBlur"><feGaussianBlur stdDeviation="2.6" /></filter>
        <filter id="kgSoftBlur"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="kgFur" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.55" numOctaves="3" seed="4" result="fur" />
          <feColorMatrix in="fur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" result="furA" />
          <feComposite in="furA" in2="SourceGraphic" operator="in" result="furClip" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="furClip" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// 横向きのクマのシルエット（重なる楕円で輪郭を作る）。塗りを差し替えてIR/サーマル兼用。
function BearBody({ fill }) {
  return (
    <g fill={fill}>
      <rect x="139" y="132" width="13" height="42" rx="6" />
      <rect x="196" y="134" width="13" height="40" rx="6" />
      <ellipse cx="146" cy="120" rx="37" ry="31" />
      <ellipse cx="180" cy="107" rx="41" ry="31" />
      <ellipse cx="162" cy="123" rx="45" ry="26" />
      <rect x="150" y="138" width="13" height="38" rx="6" />
      <rect x="206" y="138" width="13" height="36" rx="6" />
      <ellipse cx="214" cy="120" rx="22" ry="18" />
      <ellipse cx="239" cy="126" rx="13" ry="8.5" />
      <circle cx="206" cy="102" r="6.5" />
      <circle cx="224" cy="102" r="6.5" />
    </g>
  );
}

// クマの足跡（肉球＋5つの指）。受信側で位置・縮尺・不透明度を指定して並べる。
function PawPrint({ x, y, s, o }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="#140d06">
      <path d="M-16 5 Q-19 -11 0 -13 Q19 -11 16 5 Q13 18 0 18 Q-13 18 -16 5 Z" />
      <ellipse cx="-15" cy="-17" rx="4.4" ry="6.2" />
      <ellipse cx="-7" cy="-23" rx="4.6" ry="6.6" />
      <ellipse cx="1" cy="-25" rx="4.8" ry="6.8" />
      <ellipse cx="9" cy="-23" rx="4.6" ry="6.6" />
      <ellipse cx="16" cy="-17" rx="4.4" ry="6.2" />
    </g>
  );
}

// 夜間IRトレイルカメラ：暗い林・地面・グロー・クマ影＋アイシャイン・粒状ノイズ・走査線・周辺減光
function PhotoScene() {
  return (
    <>
      <rect width="320" height="200" fill="url(#kgIrSky)" />
      <ellipse cx="168" cy="158" rx="190" ry="120" fill="url(#kgIrGlow)" />
      <path d="M0 98 L42 70 L74 94 L116 60 L158 92 L198 64 L248 92 L296 66 L320 90 L320 130 L0 130 Z" fill="#0b1712" opacity="0.75" />
      <g fill="#091310">
        <rect x="34" y="34" width="13" height="150" rx="3" />
        <rect x="268" y="30" width="15" height="156" rx="3" />
        <rect x="300" y="50" width="11" height="134" rx="3" />
      </g>
      <path d="M0 156 Q160 144 320 158 L320 200 L0 200 Z" fill="#091410" />
      <ellipse cx="162" cy="176" rx="118" ry="15" fill="#0f2218" opacity="0.7" />
      <g filter="url(#kgFur)">
        <BearBody fill="url(#kgBearIr)" />
      </g>
      <ellipse cx="178" cy="172" rx="62" ry="9" fill="#060c08" opacity="0.5" />
      <ellipse cx="247" cy="128" rx="5.5" ry="4.2" fill="#2b332c" />
      <circle cx="232" cy="116" r="5" fill="#bfe9ff" opacity="0.3" />
      <circle cx="232" cy="116" r="2.3" fill="#eaf8ff" />
      <rect width="320" height="200" filter="url(#kgGrain)" opacity="0.4" />
      <rect width="320" height="200" fill="url(#kgScan)" opacity="0.5" />
      <rect width="320" height="200" fill="url(#kgVignette)" />
    </>
  );
}

// サーマルカメラ：寒色背景に熱源のクマ（白→黄→橙→赤）、十字照準、温度スケール、温度表示
function ThermalScene() {
  return (
    <>
      <rect width="320" height="200" fill="url(#kgThermalBg)" />
      <ellipse cx="160" cy="196" rx="210" ry="64" fill="#3a1450" opacity="0.6" />
      <g filter="url(#kgThermBlur)">
        <BearBody fill="url(#kgBearThermal)" />
      </g>
      <ellipse cx="176" cy="112" rx="22" ry="14" fill="#fff7e6" opacity="0.45" filter="url(#kgThermBlur)" />
      <g stroke="#eafff5" strokeWidth="1" strokeOpacity="0.6" fill="none">
        <line x1="180" y1="72" x2="180" y2="96" />
        <line x1="180" y1="146" x2="180" y2="168" />
        <line x1="146" y1="120" x2="168" y2="120" />
        <line x1="192" y1="120" x2="214" y2="120" />
        <circle cx="180" cy="120" r="3.2" />
      </g>
      <rect x="300" y="44" width="8" height="112" rx="3" fill="url(#kgThermalScale)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.6" />
      <g stroke="#eafff5" strokeWidth="0.7" strokeOpacity="0.5">
        <line x1="296" y1="48" x2="300" y2="48" />
        <line x1="296" y1="76" x2="300" y2="76" />
        <line x1="296" y1="104" x2="300" y2="104" />
        <line x1="296" y1="132" x2="300" y2="132" />
        <line x1="296" y1="152" x2="300" y2="152" />
      </g>
      <text x="294" y="43" fill="#ffe1a6" fontFamily="monospace" fontSize="7" fontWeight="700" textAnchor="end">Hi</text>
      <text x="294" y="160" fill="#9fb6e6" fontFamily="monospace" fontSize="7" fontWeight="700" textAnchor="end">Lo</text>
      <rect x="120" y="44" width="62" height="18" rx="4" fill="#0a1030" fillOpacity="0.72" stroke="#ffffff" strokeOpacity="0.18" />
      <text x="151" y="57" fill="#fff7e6" fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">38.4°C</text>
      <rect width="320" height="200" filter="url(#kgGrain)" opacity="0.28" />
    </>
  );
}

// ドローン俯瞰：林冠パターン・開けた地面・川・踏み跡・真上から見た動物＋影・HUD照準・高度表示
function DroneScene() {
  return (
    <>
      <rect width="320" height="200" fill="url(#kgAerial)" />
      <rect width="320" height="200" fill="url(#kgCanopy)" opacity="0.92" />
      <ellipse cx="150" cy="118" rx="82" ry="54" fill="#2c5a3f" opacity="0.85" />
      <ellipse cx="150" cy="118" rx="54" ry="34" fill="#3d6e4a" opacity="0.7" />
      <path d="M-12 44 C 80 84 120 70 196 132 S 300 182 340 184" stroke="url(#kgRiver)" strokeWidth="15" fill="none" opacity="0.8" strokeLinecap="round" />
      <path d="M28 204 C 92 150 132 150 150 118 S 232 58 322 38" stroke="#bda36c" strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />
      <ellipse cx="154" cy="126" rx="24" ry="13" fill="#070d09" opacity="0.5" filter="url(#kgSoftBlur)" />
      <g fill="url(#kgAnimalTop)">
        <ellipse cx="150" cy="120" rx="21" ry="11" />
        <ellipse cx="168" cy="120" rx="8" ry="7" />
        <ellipse cx="137" cy="110" rx="4" ry="7" />
        <ellipse cx="137" cy="130" rx="4" ry="7" />
        <ellipse cx="159" cy="108" rx="4" ry="6.5" />
        <ellipse cx="159" cy="132" rx="4" ry="6.5" />
      </g>
      <g stroke="#dffaf0" strokeWidth="1.3" fill="none" opacity="0.85">
        <path d="M120 108 L120 100 L128 100" />
        <path d="M180 100 L188 100 L188 108" />
        <path d="M188 132 L188 140 L180 140" />
        <path d="M128 140 L120 140 L120 132" />
      </g>
      <g stroke="#cfe9e0" fill="none" opacity="0.16">
        <circle cx="20" cy="20" r="24" strokeWidth="6" strokeDasharray="3 7" />
        <circle cx="300" cy="20" r="24" strokeWidth="6" strokeDasharray="3 7" />
        <circle cx="20" cy="180" r="24" strokeWidth="6" strokeDasharray="3 7" />
        <circle cx="300" cy="180" r="24" strokeWidth="6" strokeDasharray="3 7" />
      </g>
      <rect x="8" y="8" width="304" height="184" rx="6" fill="none" stroke="#dffaf0" strokeOpacity="0.22" strokeWidth="1" />
      <circle cx="16" cy="18" r="3" fill="#ff5b5b" />
      <g fill="#dffaf0" fontFamily="monospace" fontWeight="700" opacity="0.85">
        <text x="24" y="21" fontSize="9">REC  D-02</text>
        <text x="234" y="21" fontSize="9">BAT 78%</text>
        <text x="14" y="186" fontSize="8" opacity="0.85">GPS 36.21N 139.07E</text>
        <text x="262" y="186" fontSize="9">H 82m</text>
      </g>
      <path d="M300 176 L300 164 M296 169 L300 163 L304 169" stroke="#dffaf0" strokeWidth="1.2" fill="none" opacity="0.8" />
      <rect width="320" height="200" filter="url(#kgGrain)" opacity="0.2" />
    </>
  );
}

// 足跡センサー：土の地面・粒状ノイズ・小石・奥へ続くクマの足跡列・10cmスケール
function TrackScene() {
  return (
    <>
      <rect width="320" height="200" fill="url(#kgSoil)" />
      <rect width="320" height="200" filter="url(#kgGrain)" opacity="0.55" />
      <g fill="#0f0b06" opacity="0.5">
        <circle cx="60" cy="60" r="3" />
        <circle cx="250" cy="150" r="4" />
        <circle cx="290" cy="60" r="2.5" />
        <circle cx="110" cy="182" r="3.5" />
      </g>
      <PawPrint x="64" y="158" s="1" o="0.92" />
      <PawPrint x="128" y="126" s="0.82" o="0.78" />
      <PawPrint x="184" y="98" s="0.64" o="0.6" />
      <PawPrint x="230" y="76" s="0.5" o="0.44" />
      <g stroke="#d8cfa6" strokeWidth="1" opacity="0.5">
        <line x1="250" y1="184" x2="300" y2="184" />
        <line x1="250" y1="180" x2="250" y2="188" />
        <line x1="300" y1="180" x2="300" y2="188" />
      </g>
      <text x="275" y="178" fill="#d8cfa6" fontFamily="monospace" fontSize="9" fontWeight="700" textAnchor="middle" opacity="0.6">10cm</text>
    </>
  );
}

// サムネ種別に応じた検知シーンSVG。viewBoxを slice で枠いっぱいに描画する。
function DetectionScene({ type }) {
  const scene =
    type === 'thermal' ? <ThermalScene /> :
    type === 'drone' ? <DroneScene /> :
    type === 'track' ? <TrackScene /> :
    <PhotoScene />;
  return (
    <svg className="scene-svg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {scene}
    </svg>
  );
}

function EvidenceThumb({ type, large = false }) {
  return (
    <div className={`evidence-thumb ${type} ${large ? 'large' : ''}`} aria-hidden="true">
      <DetectionScene type={type} />
    </div>
  );
}

function VisionAiPanel({ items, selected, onSelect, onConfirm, onFieldCheck, onFalsePositive }) {
  return (
    <section className="data-panel vision-panel" aria-label="AI画像判定">
      <PanelHeader title="AI画像判定" action={`${items.length}件解析`} />
      <div className="vision-workbench">
        <VisionFrame item={selected} />
        <div className="vision-detail">
          <span className={`vision-status ${selected.status}`}>{visionStatusText(selected.status)}</span>
          <h3>{selected.title}</h3>
          <dl>
            <div><dt>入力</dt><dd>{selected.kind} / {selected.source}</dd></div>
            <div><dt>フレーム</dt><dd>{selected.frame}</dd></div>
            <div><dt>場所</dt><dd>{selected.location}</dd></div>
            <div><dt>モデル</dt><dd>{selected.model}</dd></div>
          </dl>
        </div>
      </div>

      <div className="vision-scoreboard" aria-label="画像AIの分類結果">
        <div className="vision-main-score">
          <span>AI判定</span>
          <strong>{selected.confidence}%</strong>
          <em>{selected.verdict}</em>
        </div>
        <div className="vision-bars">
          {selected.classes.map((item) => (
            <div className="vision-class-row" key={item.label}>
              <span>{item.label}</span>
              <div><i style={{ width: `${item.value}%` }} /></div>
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="vision-actions" aria-label="画像AI判定への職員操作">
        <button
          className="primary-action"
          disabled={selected.status === 'confirmed'}
          onClick={onConfirm}
          type="button"
        >
          <CheckCircle2 size={17} />
          クマとして確認
        </button>
        <button
          className="secondary-action green"
          disabled={selected.status === 'field'}
          onClick={onFieldCheck}
          type="button"
        >
          <Route size={17} />
          現地確認へ
        </button>
        <button
          className="secondary-action"
          disabled={selected.status === 'false_positive'}
          onClick={onFalsePositive}
          type="button"
        >
          <FileClock size={17} />
          学習キューへ
        </button>
      </div>

      <div className="vision-list" aria-label="解析済み画像">
        {items.map((item) => (
          <button
            className={selected.id === item.id ? 'selected' : ''}
            key={item.id}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <EvidenceThumb type={item.thumbnail} />
            <span>
              <strong>{item.kind}</strong>
              <small>{item.confidence}% / {visionStatusText(item.status)}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function VisionFrame({ item }) {
  return (
    <div className={`vision-frame ${item.thumbnail}`} aria-hidden="true">
      <DetectionScene type={item.thumbnail} />
      <span className="vision-grid-overlay" />
      <span
        className="vision-box"
        style={{
          left: `${item.box.left}%`,
          top: `${item.box.top}%`,
          width: `${item.box.width}%`,
          height: `${item.box.height}%`,
        }}
      >
        <em>{item.confidence}%</em>
      </span>
      <span className="vision-label"><ScanSearch size={14} />{item.verdict}</span>
      <span className="vision-feed"><Video size={13} />LIVE</span>
    </div>
  );
}

function SafetyMap({ items, selected, selectedId, onSelect, mode, mapZoom, onZoom }) {
  return (
    <div className={`safety-map ${mode}`} style={{ '--map-zoom': mapZoom / 100 }}>
      <div className="map-canvas">
        <svg className="terrain" viewBox="0 0 980 620" role="img" aria-label="山間部、集落、センサー、出没候補の地図">
          <defs>
            <linearGradient id="mapBase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#16372e" />
              <stop offset="54%" stopColor="#1e473b" />
              <stop offset="100%" stopColor="#0e2528" />
            </linearGradient>
            <linearGradient id="riverLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#76bfe7" />
              <stop offset="100%" stopColor="#2f7fb5" />
            </linearGradient>
            <radialGradient id="kgHill" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#2f5848" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2f5848" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="aerialBase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22432a" />
              <stop offset="50%" stopColor="#1a3722" />
              <stop offset="100%" stopColor="#15301f" />
            </linearGradient>
            <pattern id="aerialCanopy" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect width="34" height="34" fill="#1d3c25" />
              <circle cx="9" cy="9" r="8" fill="#2a5532" />
              <circle cx="25" cy="16" r="9" fill="#234a2b" />
              <circle cx="13" cy="27" r="7" fill="#2f5d38" />
              <circle cx="30" cy="31" r="6" fill="#21472a" />
              <circle cx="3" cy="22" r="6" fill="#27512f" />
              <circle cx="20" cy="3" r="5" fill="#2c5734" />
            </pattern>
            <radialGradient id="aerialField" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#7d8a4e" />
              <stop offset="70%" stopColor="#5e6c3a" />
              <stop offset="100%" stopColor="#4a5630" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="aerialWater" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b6f86" />
              <stop offset="100%" stopColor="#27566e" />
            </linearGradient>
            <radialGradient id="aerialHaze" cx="0.5" cy="0.4" r="0.75">
              <stop offset="60%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#0a1810" stopOpacity="0.5" />
            </radialGradient>
            <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#04100f" floodOpacity="0.9" />
            </filter>
          </defs>
          <rect width="980" height="620" fill="url(#mapBase)" />
          <g className="map-aerial-bg">
            <rect width="980" height="620" fill="url(#aerialBase)" />
            <rect width="980" height="620" fill="url(#aerialCanopy)" />
            <ellipse cx="470" cy="330" rx="150" ry="96" fill="url(#aerialField)" opacity="0.9" />
            <ellipse cx="250" cy="470" rx="120" ry="78" fill="url(#aerialField)" opacity="0.85" />
            <ellipse cx="700" cy="250" rx="110" ry="70" fill="#3f5a32" opacity="0.5" />
            <path d="M85 110 C176 212 236 260 350 290 C478 324 560 380 702 410 C822 436 900 484 952 500" fill="none" stroke="url(#aerialWater)" strokeWidth="18" strokeLinecap="round" opacity="0.92" />
            <path d="M80 542 C215 486 330 501 445 432 C590 344 710 348 890 258" fill="none" stroke="#8a8466" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
            <path d="M80 542 C215 486 330 501 445 432 C590 344 710 348 890 258" fill="none" stroke="#cfc6a8" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
            <g fill="#b9b2a0" stroke="#6f6a58" strokeWidth="1">
              <rect x="486" y="416" width="20" height="15" />
              <rect x="514" y="430" width="20" height="15" />
              <rect x="547" y="414" width="20" height="15" />
              <rect x="585" y="438" width="20" height="15" />
              <rect x="470" y="446" width="16" height="13" />
              <rect x="610" y="420" width="16" height="13" />
            </g>
            <rect width="980" height="620" fill="url(#aerialHaze)" />
          </g>
          <g className="map-diagram-bg">
            <ellipse cx="200" cy="150" rx="220" ry="150" fill="url(#kgHill)" />
          <ellipse cx="820" cy="175" rx="210" ry="150" fill="url(#kgHill)" />
          <ellipse cx="150" cy="540" rx="170" ry="120" fill="url(#kgHill)" />
          <g stroke="#bfe8d6" strokeWidth="1" opacity="0.06">
            <line x1="98" y1="0" x2="98" y2="620" />
            <line x1="196" y1="0" x2="196" y2="620" />
            <line x1="294" y1="0" x2="294" y2="620" />
            <line x1="392" y1="0" x2="392" y2="620" />
            <line x1="490" y1="0" x2="490" y2="620" />
            <line x1="588" y1="0" x2="588" y2="620" />
            <line x1="686" y1="0" x2="686" y2="620" />
            <line x1="784" y1="0" x2="784" y2="620" />
            <line x1="882" y1="0" x2="882" y2="620" />
            <line x1="0" y1="88" x2="980" y2="88" />
            <line x1="0" y1="176" x2="980" y2="176" />
            <line x1="0" y1="264" x2="980" y2="264" />
            <line x1="0" y1="352" x2="980" y2="352" />
            <line x1="0" y1="440" x2="980" y2="440" />
            <line x1="0" y1="528" x2="980" y2="528" />
          </g>
          <g fill="none" stroke="#3a6253" strokeWidth="1.1" opacity="0.38">
            <ellipse cx="195" cy="142" rx="150" ry="100" />
            <ellipse cx="198" cy="140" rx="116" ry="76" />
            <ellipse cx="200" cy="138" rx="84" ry="55" />
            <ellipse cx="203" cy="136" rx="52" ry="34" />
            <ellipse cx="206" cy="134" rx="26" ry="17" />
          </g>
          <g fill="none" stroke="#3a6253" strokeWidth="1.1" opacity="0.36">
            <ellipse cx="818" cy="178" rx="158" ry="104" transform="rotate(-8 818 178)" />
            <ellipse cx="820" cy="176" rx="120" ry="78" transform="rotate(-8 820 176)" />
            <ellipse cx="822" cy="174" rx="84" ry="54" transform="rotate(-8 822 174)" />
            <ellipse cx="824" cy="172" rx="50" ry="32" transform="rotate(-8 824 172)" />
          </g>
          <path className="forest-band" d="M-40 120 C120 56 225 132 352 100 C520 56 608 124 770 84 C900 52 945 91 1018 72" />
          <path className="forest-band alt" d="M-50 330 C148 254 284 345 430 304 C590 258 720 344 1005 278" />
          <path className="forest-band low" d="M-60 475 C125 396 276 456 470 388 C624 332 752 376 1040 350" />
          </g>
          <path className="river" d="M85 110 C176 212 236 260 350 290 C478 324 560 380 702 410 C822 436 900 484 952 500" />
          <path className="main-road" d="M80 542 C215 486 330 501 445 432 C590 344 710 348 890 258" />
          <path className="route red-route" d="M190 180 C260 246 306 310 376 360 C456 418 530 448 650 506" />
          <path className="route blue-route" d="M728 132 C690 210 748 284 716 356 C690 420 754 484 788 548" />
          <path className="route patrol-route" d="M300 135 C285 218 300 286 260 370 C220 452 200 508 190 584" />
          <g className="map-settlement">
            <rect x="485" y="416" width="22" height="16" />
            <rect x="515" y="430" width="22" height="16" />
            <rect x="548" y="414" width="22" height="16" />
            <rect x="586" y="438" width="22" height="16" />
            <text x="508" y="490">山北町役場</text>
            <text x="596" y="536">山北駅</text>
          </g>
          <g className="map-labels">
            <text x="168" y="252">小学校</text>
            <text x="250" y="84">山林北エリア</text>
            <text x="702" y="165">観光施設エリア</text>
            <text x="746" y="407">中川</text>
            <text x="240" y="420">玄倉</text>
            <text x="500" y="386">国道123号</text>
          </g>
          <g className="sensor-points">
            <circle cx="108" cy="86" r="10" />
            <circle cx="168" cy="318" r="10" />
            <circle cx="340" cy="104" r="10" />
            <circle cx="712" cy="210" r="10" />
            <circle cx="816" cy="120" r="10" />
            <circle cx="802" cy="470" r="10" />
          </g>
          <g className="risk-zone">
            <path d="M670 278 C760 202 820 250 868 305 C878 408 780 430 700 390 C650 360 632 318 670 278" />
            <text x="702" y="328">重点警戒エリア</text>
          </g>
          <g className="risk-ring">
            <circle cx="595" cy="225" r="86" />
            <circle cx="595" cy="225" r="48" />
            <text x="530" y="172">出没候補</text>
          </g>
        </svg>

        {items.map((item, index) => (
          <button
            key={item.id}
            className={`candidate-marker ${item.tone} ${selectedId === item.id ? 'selected' : ''}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => onSelect(item.id)}
            aria-label={`${item.title}を選択`}
            type="button"
          >
            <span className="marker-pin"><MapPin size={20} /></span>
            <span className="marker-index">{index + 1}</span>
            <span className="marker-label">
              <strong>{item.id}</strong>
              <em>{statusText(item)}</em>
            </span>
          </button>
        ))}
      </div>

      <div className="map-legend">
        <strong>リスクレベル</strong>
        <span><i className="dot red" />レベル5</span>
        <span><i className="dot amber" />レベル4</span>
        <span><i className="dot blue" />通知保留</span>
        <span><Camera size={13} />カメラ</span>
        <span><Radio size={13} />センサー</span>
        <span><Plane size={13} />ドローン</span>
      </div>

      <div className="map-insight">
        <span>選択地点</span>
        <strong>{selected.place}</strong>
        <em>{selected.distance} / {selected.eta}</em>
      </div>

      <div className="map-tools">
        <button aria-label="地図を拡大" onClick={() => onZoom('in')} type="button"><Plus size={20} /></button>
        <button aria-label="地図を縮小" onClick={() => onZoom('out')} type="button"><Minus size={20} /></button>
        <button aria-label="地図を中央に戻す" onClick={() => onZoom('reset')} type="button"><Crosshair size={20} /></button>
      </div>

      <div className="map-zoom-indicator">表示倍率 {mapZoom}%</div>

      <div className="scale">500m</div>
    </div>
  );
}

function ProposalPanel({ active, onMaterialClick, selectedMaterial }) {
  if (active === 'roi') {
    return (
      <div className="proposal-grid roi-grid">
        {reportRows.map((row) => (
          <article className="proposal-card metric" key={row.label}>
            <p>{row.label}</p>
            <strong>{row.value}</strong>
            <span>{row.note}</span>
          </article>
        ))}
        <article className="proposal-card wide chart-card">
          <div>
            <h3>費用対効果の説明軸</h3>
            <p>被害抑制、巡回重点化、通知自動化、観光施設の閉鎖判断を数値で説明できます。</p>
            <ul className="proposal-checks">
              <li>巡回の優先順位をAI候補で明確化</li>
              <li>観光施設・学校への説明責任を標準化</li>
              <li>誤検知も学習データとして蓄積</li>
            </ul>
          </div>
          <div className="bar-chart" aria-hidden="true">
            <span style={{ height: '92%' }}><em>被害抑制</em></span>
            <span style={{ height: '64%' }}><em>巡回削減</em></span>
            <span style={{ height: '48%' }}><em>連絡短縮</em></span>
            <span style={{ height: '72%' }}><em>観光維持</em></span>
          </div>
        </article>
      </div>
    );
  }

  if (active === 'rollout') {
    return (
      <div className="proposal-grid rollout-grid">
        {implementationSteps.map((item) => (
          <article className="proposal-card step-card" key={item.step}>
            <span className="step-number">{item.step}</span>
            <h3>{item.title}</h3>
            <strong>{item.term}</strong>
            <p>{item.body}</p>
          </article>
        ))}
        <article className="proposal-card wide">
          <h3>標準導入の範囲</h3>
          <p>AIカメラ、環境センサー、通知管理、承認ログ、月次レポート、職員研修までを同じ運用設計に含めます。</p>
          <div className="handoff-metrics">
            <span><strong>2週間</strong>現地調査</span>
            <span><strong>4週間</strong>機器設置</span>
            <span><strong>8週間</strong>運用訓練</span>
          </div>
        </article>
      </div>
    );
  }

  if (active === 'materials') {
    return (
      <div className="proposal-grid materials-grid">
        {materialCards.map((item) => {
          const Icon = item.icon;
          return (
            <article className="proposal-card material-card" key={item.title}>
              <Icon size={23} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <button
                className={selectedMaterial === item.title ? 'selected' : ''}
                onClick={() => onMaterialClick(item.title)}
                type="button"
              >
                <Download size={16} />資料項目を見る
              </button>
            </article>
          );
        })}
        <article className="proposal-card wide handoff-card">
          <h3>営業時の見せ方</h3>
          <p>最初に運用ダッシュボードで「今日の危険」を見せ、次に実証KPI、費用対効果、導入工程へ進むと、現場部門と決裁者の両方に説明できます。</p>
          <ul className="proposal-checks">
            <li>現場担当には通知・出動の操作感を提示</li>
            <li>決裁者には費用対効果と責任範囲を提示</li>
            <li>議会説明には監査ログと月次レポートを提示</li>
          </ul>
        </article>
      </div>
    );
  }

  return (
    <div className="proposal-grid pilot-grid">
      <article className="proposal-card wide">
        <h3>6か月実証計画サマリー</h3>
        <p>対象地区を2〜3エリアに絞り、AI検知、現地確認、住民通知、誤検知学習、月次レポートまでを一連の運用として検証します。</p>
        <div className="kpi-row">
          <span><strong>80%以上</strong>検知精度目標</span>
          <span><strong>70%以上</strong>通知到達率</span>
          <span><strong>30分以内</strong>初動判断</span>
          <span><strong>月1回</strong>改善レポート</span>
        </div>
      </article>
      <article className="proposal-card">
        <h3>対象候補</h3>
        <p>通学路、観光施設、キャンプ場、農地、集落境界を優先します。</p>
      </article>
      <article className="proposal-card">
        <h3>責任範囲</h3>
        <p>AIは候補検知を支援し、通知送信と出動判断は職員承認を必須にします。</p>
      </article>
      <article className="proposal-card">
        <h3>月次成果物</h3>
        <p>出没傾向、誤検知、対応時間、通知到達率、次月の重点配置を報告します。</p>
      </article>
      {adoptionProofRows.map((item) => (
        <article className="proposal-card proof-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.note}</p>
        </article>
      ))}
    </div>
  );
}

export default App;
