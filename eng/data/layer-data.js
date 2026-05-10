/* ─────────────────────────────────────────────
   layer-data.js  ─  레이어뷰 정적 데이터
   layer-view.js의 렌더링 로직에서 참조하는 전역 변수
   업그레이드 시 이 파일만 수정
───────────────────────────────────────────── */

/* ── 전체 흐름 레이어 정의 ── */
const FLOW_ROWS = [
    {
        id: 'sys-start', label: '시스템 시작', icon: '▶',
        nodeIds: ['Start'],
        color: '#94a3b8', bg: 'rgba(148,163,184,.06)',
    },
    {
        id: 'lead', label: 'Lead Planner — 프로젝트 설계', icon: '👑',
        nodeIds: ['Lead'],
        color: '#a78bfa', bg: 'rgba(139,92,246,.07)',
    },
    {
        id: 'cold', label: 'COLD MEMORY (LTM)', icon: '🧊',
        nodeIds: ['KB', 'Rules', 'ProjectLevel', 'HumanVision'],
        color: '#4ade80', bg: 'rgba(34,197,94,.06)',
        note: '참조 전용 — 에이전트 직접 쓰기 불가',
        arrowType: 'dashed',
    },
    {
        id: 'cognitive', label: 'COGNITIVE CORE', icon: '🧠',
        nodeIds: ['Perception', 'WorldModel', 'Planner', 'Decision'],
        color: '#a78bfa', bg: 'rgba(167,139,250,.07)',
        note: '순차 처리: 인식 → 모델링 → 계획 → 결정',
        sequential: true,
    },
    {
        id: 'hot', label: 'HOT MEMORY (STM)', icon: '🔥',
        nodeIds: ['Sync', 'Logs'],
        color: '#fbbf24', bg: 'rgba(245,158,11,.07)',
        note: '이벤트 버스 + 작업 로그 실시간 기록',
    },
    {
        id: 'execution', label: 'EXECUTION AGENTS', icon: '⚙️',
        nodeIds: ['FE', 'BE', 'DB', 'ToolAgent', 'InfraAgent'],
        color: '#60a5fa', bg: 'rgba(96,165,250,.07)',
    },
    {
        id: 'collab', label: '협업 교차 검증', icon: '🤝',
        nodeIds: ['AgentTeam'],
        color: '#facc15', bg: 'rgba(250,204,21,.07)',
    },
    {
        id: 'artifacts', label: 'Task Artifacts', icon: '📄',
        nodeIds: ['TaskFE', 'TaskBE', 'TaskDB', 'TaskErr'],
        color: '#cbd5e1', bg: 'rgba(203,213,225,.04)',
        note: 'TaskErr → 재작업 루프',
    },
    {
        id: 'qa', label: 'QA Review — Trinity 검증', icon: '✅',
        nodeIds: ['QA'],
        color: '#34d399', bg: 'rgba(52,211,153,.07)',
    },
    {
        id: 'archivist', label: 'Archivist — 지식 자산화', icon: '📚',
        nodeIds: ['Archivist'],
        color: '#f472b6', bg: 'rgba(244,114,182,.07)',
    },
    {
        id: 'evolution', label: 'SELF EVOLUTION', icon: '🌱',
        nodeIds: ['Reflection', 'LearningEng', 'Evolution'],
        color: '#f472b6', bg: 'rgba(244,114,182,.07)',
        note: '실패 진단 → 패턴 학습 → 전략 진화',
        sequential: true,
    },
    {
        id: 'sys-end', label: '세션 종료 / 대기', icon: '⏹',
        nodeIds: ['End', 'Standby'],
        color: '#64748b', bg: 'rgba(100,116,139,.05)',
    },
];

/* ── 존 서브탭 정의 ── */
const ZONE_TABS = [
    { id: 'all',           label: '전체 흐름',   icon: '⟳' },
    { id: 'ColdZone',      label: 'Cold Memory', icon: '🧊' },
    { id: 'CognitiveZone', label: 'Cognitive',   icon: '🧠' },
    { id: 'AgentZone',     label: 'Execution',   icon: '⚙️' },
    { id: 'HotZone',       label: 'Hot Memory',  icon: '🔥' },
    { id: 'LearningZone',  label: 'Evolution',   icon: '🌱' },
    { id: 'AssetBox',      label: 'Asset Box',   icon: '📦' },
];

/* ── 키워드 하이라이팅 ── */
const KEYWORD_GROUPS = [
    // 인지 파이프라인 데이터 구조 & 개념 (violet)
    { color: '#a78bfa', words: [
        'PerceptionPayload', 'WorldState', 'ExecutionPlan', 'ActionDirective',
        'RBET', '인지 루프', 'Context Model', 'Utility Function', 'DAG',
        '의존성 그래프', '관계 그래프', '엔티티',
        'uncertainty', '불확실성',
        'Sequential', 'Parallel', 'Hierarchical', 'Adaptive', 'Minimal',
        '5차원 게이트', '시방서', '4게이트', 'RequirementsValidation',
        'TechAcquisitionGate', 'TechCoverageMatrix', 'TechGapTypes',
        '기술 확보 게이트', '기술 커버리지', '기술 갭',
        'TG-SKILL', 'TG-AUTH', 'TG-ENV', 'TG-COMPAT', 'TG-DOMAIN',
    ]},
    // 에이전트 역할명 (blue)
    { color: '#60a5fa', words: [
        'Lead Planner', 'QA Reviewer', 'Dev Team',
        'FE Dev', 'BE Dev', 'DB Admin',
        'ToolAgent', 'InfraAgent', 'AgentTeam',
        'Perception', 'WorldModel', 'LearningEng', 'Decision', 'Planner',
        'Reflection', 'Evolution', 'Archivist',
        'FE/BE/DB',
        'EADM', 'Enterprise Architect',
    ]},
    // Cold Memory / 지식 저장소 (green)
    { color: '#4ade80', words: [
        'Global SkillNet', 'ColdZone', 'Cold Memory',
        'rules.md', 'KB', 'LTM', '장기 기억', '지식 자산', 'SAI화', 'SAI',
        '공통 스킬', '내 업무 스킬', 'CommonSkill', 'RoleSkill',
        'human_vision.md', 'HumanVision', 'policy-history.md',
        'SkillReferencePriority', '스킬 참조 우선순위',
        'CLAUDE_local.md', '.All_Skills',
    ]},
    // Hot Memory / 이벤트 버스 (amber)
    { color: '#fbbf24', words: [
        'sync_state.json', 'history.md', 'HotZone', 'Hot Memory',
        'STM', '이벤트 버스', '블랙박스', 'CoT',
        'task_err.md', 'task_ok.md',
    ]},
    // 자기 진화 / 메타 인지 (pink)
    { color: '#f472b6', words: [
        'Meta-Cognition', '자기 진화', '자기 성찰', '자기 반성',
        '자기 진단', '5-Why', 'Hypothesis', 'Canonical',
        '성공·실패 패턴', '학습 패턴',
        '쓰레기 스킬', 'TrashSkill', '2회 재시도', 'NEVER STOP',
    ]},
    // 결정 상태 & 리스크 지표 (cyan)
    { color: '#38bdf8', words: [
        'APPROVE', 'REJECT', 'PAUSE',
        'CLEAN', 'PARTIAL', 'NOISY', 'FAILED',
        'Risk', 'Benefit', 'Efficiency', 'Trust',
    ]},
    // QA / 검증 (emerald)
    { color: '#34d399', words: [
        'Trinity 검증', 'Trinity', 'SDD', '품질 검증', '품질 반성',
    ]},
];
