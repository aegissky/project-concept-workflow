/* ─────────────────────────────────────────────
   diagram-data.js  ─  다이어그램 데이터 전용 파일

   업그레이드 시 이 파일만 수정하면 됩니다:
   - glossaryData : 용어/관계 정의 (검색 모달)
   - subgraphs    : 존(Zone) 경계 박스
   - nodes        : 에이전트/시스템 노드
   - edges        : 노드 간 관계선
───────────────────────────────────────────── */

const glossaryData = [
// --- [System Lifecycle] ---
    {
        type: "term",
        ko: "프로젝트 개시",
        en: "Start",
        desc: "세션의 시작점. Lead Planner가 활성화되며 모든 에이전트가 초기 컨텍스트(rules.md 등)를 로드하는 단계입니다."
    },
    {
        type: "term",
        ko: "세션 종료",
        en: "End",
        desc: "모든 작업의 최종 상태. Archivist가 지식 자산화를 완료하고 시스템이 안전하게 현재 세션을 클로징하는 종착지입니다."
    },

    // --- [Core Agents & Roles] ---
    { type: "term", ko: "Lead Planner", en: "Lead", desc: "전체 태스크의 사령탑. 프로젝트 개시 시 SDD 명세를 작성하고, 각 에이전트에게 작업 큐를 배분합니다." },
    { type: "term", ko: "QA Reviewer", en: "QA", desc: "최종 게이트키퍼. 검증 전 rules.md(정책 참조)와 Global SkillNet(승인된 검증 스킬 탐색)에 접근하여 FE/BE/DB 산출물의 Trinity 검증을 수행합니다." },
    { type: "term", ko: "Archivist", en: "Archivist", desc: "지식 관리자. 세션 종료 전 로그를 시맨틱하게 압축하고 Global SkillNet으로 지식을 이관합니다." },
    { type: "term", ko: "Dev Team", en: "FE/BE/DB", desc: "실제 구현을 담당하는 에이전트 그룹. UI, 코어 로직, 스키마 설계를 독립적으로 수행하며 상호 동기화합니다." },
    { type: "term", ko: "작업 대기", en: "Standby", desc: "태스크 큐(sync_state.json)에 다음 작업이 없을 때 진입하는 대기 상태. Lead Planner가 새 태스크를 인입하면 즉시 해제됩니다." },
    { type: "term", ko: "프로젝트 레벨", en: "Project Level", desc: "시스템 운영 방식을 결정하는 설정값. starter / dynamic / enterprise(기본값) / desktop-app / mobile-app 중 선택. 팀 구성·QA 기준·검증 스킬 범위에 영향을 준다." },

// --- [System Memory & Infrastructure] ---
    { type: "term", ko: "Global SkillNet", en: "KB", desc: "장기 기억(LTM) 저장소. 과거의 성공 사례와 도메인 지식이 SAI화되어 저장되어 있는 시스템의 두뇌입니다." },
    { type: "term", ko: "시스템 헌법", en: "rules.md", desc: "모든 에이전트가 준수해야 할 절대적 개발 제약 조건과 아키텍처 가이드라인입니다." },
    { type: "term", ko: "이벤트 버스", en: "sync_state.json", desc: "에이전트 간 실시간 조율 채널. 작업 상태 전이 및 동기화 데이터를 관리하는 Hot Memory입니다." },
    { type: "term", ko: "작업 CCTV", en: "history.md", desc: "에이전트의 모든 사고 과정(CoT)과 상태 변화를 실시간 스트리밍으로 기록하는 블랙박스입니다." },

    { type: "term", ko: "최종 산출물", en: "task_ok.md", desc: "에이전트가 작업을 완료한 후 QA에게 제출하는 최종 결과물 및 요약 보고서." },
    { type: "term", ko: "반려 보고서", en: "task_err.md", desc: "QA가 Trinity 검증 실패 시 발행하며, FE·BE·DB 전 영역의 오류 사유와 재작업 지침을 통합 관리. 해당 영역 에이전트에게 개별 수정 요청을 전달한다." },

    { type: "term", ko: "협업 거점", en: "AgentTeam", desc: "FE/BE/DB 에이전트가 개별 작업을 넘어 통합된 하나의 솔루션을 만들기 위해 교차 검증하고 합의하는 가상 작업 공간입니다." },
    { type: "relation", ko: "Start → Lead (활성화)", en: "Project Activation", desc: "프로젝트를 시작하고 시스템 설계 주체인 Lead 에이전트를 가동하는 관계." },
    { type: "relation", ko: "Lead ⇢ KB (탐색)", en: "Intelligence Retrieval", desc: "기존 지식 베이스(KB)에서 유사 도메인 지식이나 선행 사례를 지능적으로 검색하는 관계." },
    { type: "relation", ko: "Lead → Rules (명세)", en: "SDD Specification", desc: "시스템 설계 문서(SDD)를 바탕으로 개발 가이드라인과 제약 사항을 정의하는 관계." },
    { type: "relation", ko: "Lead → Sync (인입)", en: "Task Ingestion", desc: "설계된 작업을 처리하기 위해 태스크 큐에 작업 단위를 투입하는 관계." },
    { type: "relation", ko: "Sync → FE (UI 배분)", en: "UI Component Tasking", desc: "동기화된 큐에서 프론트엔드 UI 컴포넌트 개발 태스크를 할당하는 관계." },
    { type: "relation", ko: "Sync → BE (로직 배분)", en: "Core Logic Tasking", desc: "동기화된 큐에서 백엔드 코어 비즈니스 로직 구현 태스크를 할당하는 관계." },
    { type: "relation", ko: "Sync → DB (스키마 배분)", en: "Schema Design Tasking", desc: "동기화된 큐에서 데이터베이스 스키마 및 모델링 태스크를 할당하는 관계." },
    { type: "relation", ko: "FE ⇢ Rules (준수)", en: "UI Constraint Compliance", desc: "프론트엔드 개발 시 정의된 설계 규칙과 디자인 시스템을 준수하는지 대조하는 관계." },
    { type: "relation", ko: "BE ⇢ Rules (검증)", en: "Logic Validation", desc: "백엔드 로직이 SDD 명세의 비즈니스 규칙에 부합하는지 실시간 검증하는 관계." },
    { type: "relation", ko: "DB ⇢ Rules (참조)", en: "Schema Specification Reference", desc: "데이터베이스 설계 시 사전에 정의된 데이터 명세와 무결성 규칙을 참조하는 관계." },
    { type: "relation", ko: "DB ⇢ BE (전파)", en: "Schema Dependency Propagation", desc: "변경된 DB 스키마 정보를 BE 로직에 반영하여 데이터 구조 의존성을 동기화하는 관계." },
    { type: "relation", ko: "BE ⇢ FE (제공)", en: "API Interface Provision", desc: "구현된 백엔드 기능을 FE에서 사용할 수 있도록 API 엔드포인트와 인터페이스를 제공하는 관계." },
    { type: "relation", ko: "FE ↔ AgentTeam (협업)", en: "Parallel Collaboration", desc: "프론트엔드 작업과 에이전트 팀 간의 병렬적인 상호작용 및 작업 조율 관계." },
    { type: "relation", ko: "BE ↔ AgentTeam (동기화)", en: "Logic Synchronization", desc: "백엔드 구현 상태를 에이전트 팀과 실시간으로 공유하여 정합성을 맞추는 관계." },
    { type: "relation", ko: "DB ↔ AgentTeam (무결성)", en: "Data Integrity Sync", desc: "데이터 설계 결과물이 에이전트 팀의 요구사항과 일치하는지 무결성을 확인하는 관계." },
    { type: "relation", ko: "AgentTeam → Logs (보고)", en: "Consensus Completion Report", desc: "에이전트 간의 모든 합의와 작업 조율이 완료되었음을 로그에 기록하는 관계." },
    { type: "relation", ko: "AgentTeam → QA (제출)", en: "Package Submission", desc: "협의가 완료된 전체 작업 패키지를 품질 검증(QA) 단계로 이관하는 관계." },
    { type: "relation", ko: "FE/BE/DB → Task (제출)", en: "Artifact Submission", desc: "각 계층에서 완성된 UI, API, DDL 결과물을 개별 검증 단위로 제출하는 관계." },
    { type: "relation", ko: "Task → QA (검증)", en: "Multi-faceted Validation", desc: "제출된 결과물들에 대해 시각적, 로직적, 데이터적 관점에서 최종 검수를 진행하는 관계." },
    { type: "relation", ko: "QA ⇢ Rules (정책 참조)", en: "QA Policy Reference", desc: "QA Reviewer가 영역별 검증 기준과 헌법 정책을 참조하여 Trinity 검증의 판단 근거로 활용하는 관계." },
    { type: "relation", ko: "QA ⇢ KB (스킬 탐색)", en: "QA Skill Retrieval", desc: "QA Reviewer가 Global SkillNet에서 승인된 검증 스킬을 탐색하여 품질·성능 평가에 적용하는 관계." },
    { type: "relation", ko: "QA → AgentTeam (QA 결과 배분)", en: "QA Result Distribution", desc: "QA 검토가 완료된 각 영역(FE·BE·DB)의 결과를 AgentTeam에 전달. AgentTeam은 이를 해당 에이전트에게 개별 배분한다." },
    { type: "relation", ko: "TaskErr → AgentTeam (보완 재작업)", en: "Rework Request", desc: "Trinity 불일치 발생 시 AgentTeam이 task_err.md를 수신하여 해당 영역 에이전트에게 보완 재작업을 지시하는 관계." },
    { type: "relation", ko: "AgentTeam → FE/BE/DB (QA 피드백)", en: "QA Feedback Delivery", desc: "QA 결과를 AgentTeam이 FE·BE·DB 각 에이전트에게 개별 전달. 문제 없으면 완료 처리, 문제 있으면 재작업 지시." },
    { type: "relation", ko: "AgentTeam → Sync (다음 태스크)", en: "Next Task Request", desc: "QA 전 영역 통과 시 AgentTeam이 sync_state.json에 다음 태스크를 요청하는 관계." },
    { type: "relation", ko: "Sync → Standby (큐 비어있음)", en: "Queue Empty Standby", desc: "태스크 큐에 다음 작업이 없을 때 시스템이 대기 상태로 전환되는 관계. Lead Planner가 새 태스크 인입 시 해제." },
    { type: "relation", ko: "Lead ⇢ ProjectLevel (레벨 확인)", en: "Project Level Check", desc: "프로젝트 개시 시 Lead Planner가 ProjectLevel 설정을 확인하여 팀 구성·QA 기준·검증 스킬 범위를 결정하는 관계." },
    { type: "relation", ko: "QA → TaskErr (불일치)", en: "Trinity Inconsistency", desc: "QA 과정에서 FE/BE/DB 간의 정합성 오류(Trinity 불일치) 발견 시 에러를 생성하는 관계." },
    { type: "relation", ko: "TaskErr ⇢ FE (수정)", en: "FE Fix Request", desc: "QA가 FE 산출물(UI/UX)에서 오류를 발견 시 task_err.md를 통해 FE에 수정을 재요청하는 피드백 관계." },
    { type: "relation", ko: "TaskErr ⇢ BE (수정)", en: "BE Fix Request", desc: "QA가 BE 산출물(API/로직)에서 오류를 발견 시 task_err.md를 통해 BE에 수정을 재요청하는 피드백 관계." },
    { type: "relation", ko: "TaskErr ⇢ DB (수정)", en: "DB Fix Request", desc: "QA가 DB 산출물(스키마/DDL)에서 오류를 발견 시 task_err.md를 통해 DB에 수정을 재요청하는 피드백 관계." },
    { type: "relation", ko: "QA → Archivist (승인)", en: "Final Context Approval", desc: "모든 검증이 통과되어 현재 프로젝트의 컨텍스트를 지식 자산으로 전환하기 위해 승인하는 관계." },
    { type: "relation", ko: "Archivist → Logs (압축)", en: "Semantic Compression", desc: "전체 개발 이력을 의미론적으로 압축하여 효율적인 로그 데이터로 보관하는 관계." },
    { type: "relation", ko: "Archivist → KB (SAI화)", en: "Domain SAI Indexing", desc: "정제된 도메인 지식을 SAI(Semantic AI) 형태로 변환하여 지식 베이스에 축적하는 관계." },
    { type: "relation", ko: "Archivist → End (종료)", en: "Asset Finalization", desc: "모든 작업 결과물이 지식 자산화되어 공식적으로 프로젝트 프로세스를 종료하는 관계." },

    // === AKC v3 신규 항목 ===
    // --- [Cognitive Core] ---
    { type: "term", ko: "인식 엔진", en: "Perception Engine", desc: "[v3 — v4 Perception 에이전트로 대체됨] Cognitive Core의 첫 단계. 입력 데이터를 분석하여 Intent 파악, Entity 추출, 도메인 분류를 수행하고 Context Model을 생성합니다." },
    { type: "term", ko: "월드 모델", en: "World Model", desc: "[v3 — v4 WorldModel 에이전트로 대체됨] 현재 프로젝트의 의존성 그래프, 리소스 상태, 리스크 맵을 유지하는 AI 내부 환경 모델. Planner의 판단 기준이 됩니다." },
    { type: "term", ko: "플래닝 엔진", en: "Planning Engine", desc: "[v3 — v4 Planner 에이전트로 대체됨] 목표를 DAG(방향 비순환 그래프) 형태의 태스크로 분해하고 에이전트 할당 계획을 수립합니다. Task Planner + Agent Allocator." },
    { type: "term", ko: "결정 엔진", en: "Decision Engine", desc: "[v3 — v4 Decision 에이전트로 대체됨] Utility Function과 Risk Analysis를 기반으로 최적 전략을 선택하고 실행 계획을 Sync에 인입합니다." },

    // --- [Execution Agents] ---
    { type: "term", ko: "툴 에이전트", en: "Tool Agent", desc: "API 호출, 코드 실행, 검색 등 외부 도구를 자율적으로 활용하는 실행 에이전트. Tool Selection + Execution 담당. 헌법: _docs/tool-agent/agents.md" },
    { type: "term", ko: "인프라 에이전트", en: "Infra Agent", desc: "서버 환경 구성, CI/CD 파이프라인 설정, 배포 자동화를 담당하는 인프라 전문 에이전트. 헌법: _docs/infra-agent/agents.md" },

    // --- [Self Evolution] ---
    { type: "term", ko: "리플렉션 엔진", en: "Reflection Engine", desc: "[v3 — v4 Reflection 에이전트로 대체됨] QA 결과를 바탕으로 '왜 실패했는가'를 자기 진단하고 더 나은 전략을 제안하는 Meta-Cognition 컴포넌트." },
    { type: "term", ko: "학습 엔진", en: "Learning Engine", desc: "[v3 — v4 LearningEng 에이전트로 대체됨] Reflection에서 추출된 패턴을 구조화하여 KB에 지식을 축적하고 Evolution Engine에 개선 신호를 전달합니다." },
    { type: "term", ko: "진화 엔진", en: "Evolution Engine", desc: "[v3 — v4 Evolution 에이전트로 대체됨] 전략 최적화, 워크플로 진화, 신규 스킬 생성을 담당합니다. Lead Planner에 아키텍처 개선 피드백을 전달해 시스템이 스스로 발전합니다." },

    // --- [v3 Relations] ---
    { type: "relation", ko: "Lead → Planner (작업 지시)", en: "Cognitive Activation", desc: "Lead Planner가 수행할 작업을 Planner(Planning Engine)에 지시하여 Cognitive Core 인지 루프를 시작합니다. Planner가 Perception에 분석을 요청하는 것이 실제 파이프라인 진입점입니다." },
    { type: "relation", ko: "Perception → WorldModel (모델링)", en: "Context Modeling", desc: "인식된 컨텍스트를 기반으로 현재 프로젝트의 World Model을 구성/업데이트하는 관계." },
    { type: "relation", ko: "WorldModel → Planner (계획 수립)", en: "Goal Planning", desc: "World Model 정보를 바탕으로 최적의 DAG 태스크를 생성하는 관계." },
    { type: "relation", ko: "Planner → Decision (결정)", en: "Strategic Decision", desc: "생성된 실행 계획 후보 중 Utility Function으로 최적안을 선택하는 관계." },
    { type: "relation", ko: "Decision → Sync (태스크 인입)", en: "Task Dispatch", desc: "결정된 실행 계획을 이벤트 버스(sync_state.json)에 인입하는 관계." },
    { type: "relation", ko: "QA → Reflection (결과 분석)", en: "Quality Reflection", desc: "QA 검증 결과(pass/fail)를 Reflection Engine에 전달해 품질 반성 루프를 트리거합니다." },
    { type: "relation", ko: "Reflection → LearningEng (패턴 추출)", en: "Pattern Extraction", desc: "자기 반성에서 도출된 성공/실패 패턴을 Learning Engine에 전달하는 관계." },
    { type: "relation", ko: "LearningEng → Evolution (전략 개선)", en: "Strategy Evolution", desc: "추출된 학습 패턴을 기반으로 Evolution Engine이 전략과 워크플로를 개선합니다." },
    { type: "relation", ko: "Evolution → Lead (피드백 루프)", en: "Architectural Feedback", desc: "Evolution Engine이 시스템 아키텍처 개선 사항을 Lead Planner에 반영하여 자율 진화 루프를 완성합니다." },
    { type: "relation", ko: "Archivist → LearningEng (SAI 인계)", en: "SAI Knowledge Transfer", desc: "Archivist가 시맨틱 압축된 지식을 Learning Engine에 인계하여 장기 학습 데이터로 축적합니다." },

    // === AKC v4 신규 항목 ===
    // --- [AKC v4 CognitiveZone Agents] ---
    { type: "term", ko: "Perception 에이전트", en: "Perception",
      desc: "인지 루프 1단계(Observe). 외부 세계에서 원시 데이터를 수집·정규화하여 PerceptionPayload로 변환하는 관측 전문 에이전트. (AKC v4 신규)" },

    { type: "term", ko: "WorldModel 에이전트", en: "WorldModel",
      desc: "인지 루프 2단계(Understand). PerceptionPayload를 엔티티·관계 그래프로 변환하고 불확실성(uncertainty)을 포함한 WorldState를 생성하는 세계 모델링 에이전트. (AKC v4 신규)" },

    { type: "term", ko: "Planner 에이전트", en: "Planner",
      desc: "인지 루프 3단계(Plan). WorldState를 분석해 Sequential/Parallel/Hierarchical/Adaptive/Minimal 전략 중 최적을 선택하고 의존성 그래프를 포함한 ExecutionPlan을 수립하는 계획 에이전트. (AKC v4 신규)" },

    { type: "term", ko: "Decision 에이전트", en: "Decision",
      desc: "인지 루프 4단계(Decide). RBET 프레임(Risk·Benefit·Efficiency·Trust)으로 ExecutionPlan을 평가하고 APPROVE/REJECT/PAUSE ActionDirective를 발행하는 결정 에이전트. (AKC v4 신규)" },

    // --- [AKC v4 LearningZone Agents] ---
    { type: "term", ko: "Reflection 에이전트", en: "Reflection",
      desc: "인지 루프 6-7단계(Verify→Reflect). 실행 결과를 품질 검증(Verify)하고 5-Why 근본 원인 분석으로 성공·실패 패턴을 추출(Reflect). attempt(실패 기록) 수집·Plan A/B/C 방향 전환 이력 보존·'포기한 이유도 자산' 원칙 적용. (AKC v4 + §K)" },

    { type: "term", ko: "LearningEng 에이전트", en: "LearningEng",
      desc: "인지 루프 8단계(Learn). 5단계 Status Lifecycle(experience→attempt→draft→verified→canonical)으로 지식 성숙도 관리. 즉시기록(5분 룰) 트리거 수신, 4차원 자산화 분석(표준 개발/기획/설계/도메인) 수행, canonical 승격(3개 도메인 검증) 판단. (AKC v4 + §K)" },

    { type: "term", ko: "Evolution 에이전트", en: "Evolution",
      desc: "인지 루프 9단계(Improve). LearningEng의 KnowledgeSummary 기반 헌법 개정안 작성. 지식 통합 정책(유사 패턴 3개→canonical 생성), deprecated 표시 정책(삭제 금지), 진화 이력 관리 책임. EvolutionProposal 생성 시 4차원 자산화 분석 의무(표준 개발/기획/설계/도메인) 적용 — 분석 결과는 rationale 필드에 기록. (AKC v4 + §K + KNOWHOW.md §7)" },

    { type: "term", ko: "경험 자산화 정책", en: "KnowledgeAssetPolicy",
      desc: "§K 정책. '모든 경험은 자산이다' 철학 — 성공·실패·미완성 불문하고 기록. 5단계 Status Lifecycle / 5분 룰 즉시기록 / 4차원 자산화 분석 / deprecated 표시(삭제 금지) / canonical 승격 조건(3개 도메인+4차원 분석+boilerplate 반영)." },

    { type: "term", ko: "5단계 지식 성숙도", en: "StatusLifecycle",
      desc: "experience(즉시) → attempt(시도) → draft(분석) → verified(검증) → canonical(표준화). verified 이상만 자동 적용, canonical은 3개 이상 도메인 검증 + 4차원 분석 완성 + boilerplate 반영 조건 충족 시 승격." },

    // --- [AKC v4 Data Structures] ---
    { type: "term", ko: "관측 페이로드", en: "PerceptionPayload",
      desc: "Perception이 생성하는 표준 데이터 구조. source, raw(html/text/screenshot), metadata, qualityFlag(CLEAN/PARTIAL/NOISY/FAILED) 포함. (AKC v4 신규)" },

    { type: "term", ko: "세계 상태", en: "WorldState",
      desc: "WorldModel이 생성하는 현재 세계의 구조화된 표현. 엔티티 목록, 관계 그래프, 도메인 컨텍스트, 불확실성 스코어(0.0~1.0) 포함. (AKC v4 신규)" },

    { type: "term", ko: "실행 계획", en: "ExecutionPlan",
      desc: "Planner가 수립하는 태스크 분해 결과물. 태스크 목록, 의존성 그래프, 병렬 실행 그룹, Fallback 계획 포함. (AKC v4 신규)" },

    { type: "term", ko: "행동 지시", en: "ActionDirective",
      desc: "Decision이 발행하는 실행 승인 문서. RBET 스코어, 안전 게이트 검사 결과, APPROVE/REJECT/PAUSE 결정 포함. (AKC v4 신규)" },

    { type: "term", ko: "반성 보고서", en: "ReflectionReport",
      desc: "Reflection이 생성하는 실행 사후 분석 보고서. 품질 검증 결과, 근본 원인 분석, 오류 패턴, 학습 데이터(LearningRecord) 포함. (AKC v4 신규)" },

    { type: "term", ko: "지식 요약", en: "KnowledgeSummary",
      desc: "LearningEng이 주기적으로 생성하는 학습 누적 보고서. 성숙 패턴 통계, 에이전트 성능 지표, 전략 추천, Evolution 트리거 목록 포함. (AKC v4 신규)" },

    { type: "term", ko: "진화 제안서", en: "EvolutionProposal",
      desc: "Evolution이 Lead에 제출하는 시스템 개선 제안 문서. 변경 항목, 위험도(Patch/Minor/Major/Breaking), 영향 시뮬레이션, 헌법 초안 파일 경로 포함. (AKC v4 신규)" },

    { type: "term", ko: "헌법 등록부", en: "constitutionRegistry",
      desc: "rules.md §4 부트스트랩이 관리하는 하위 헌법 변경 추적 레코드. 파일별 MD5 체크섬·수정시각·상태(loaded/changed/missing/conflict) 저장. (AKC v4 신규)" },

    { type: "term", ko: "루프 가드", en: "loopGuard",
      desc: "무한 루프 방지를 위한 글로벌 안전장치. 세션 재진입 총횟수(≤10), LLM 턴 총횟수(≤50), 세션 최대 시간(≤120분) 초과 시 강제 에스컬레이션. (AKC v4 신규)" },

    { type: "term", ko: "오류 추적 ID", en: "ERR-ID",
      desc: "QA 미달 시 사람 에스컬레이션을 위한 오류 고유 식별자. 형식: ERR-{순번} (예: ERR-001). qa/agents.md §4-1 메일 에스컬레이션 단계에서 사용되며 반복 오류 패턴 추적 기준으로 활용. (2026-03-26 헌법 개정)" },

    // --- [AKC v4 Cognitive Pipeline Relations] ---
    { type: "relation", ko: "Perception → WorldModel (페이로드 전달)", en: "PerceptionPayload Transfer",
      desc: "Perception이 수집·정규화한 PerceptionPayload를 WorldModel에 전달하여 세계 모델 구축을 시작하는 관계." },

    { type: "relation", ko: "WorldModel → Planner (WorldState 전달)", en: "WorldState Handoff",
      desc: "WorldModel이 구축한 엔티티 관계 그래프와 불확실성 스코어를 Planner에 전달하는 관계." },

    { type: "relation", ko: "Planner → Decision (계획 제출)", en: "ExecutionPlan Submission",
      desc: "Planner가 의존성 그래프·전략·Fallback을 포함한 ExecutionPlan을 Decision에 제출하는 관계." },

    { type: "relation", ko: "Decision → AgentZone (ActionDirective 위임)", en: "Execution Delegation",
      desc: "Decision이 APPROVE된 ActionDirective를 FE/BE/DB/ToolAgent/InfraAgent에 위임하여 실행을 시작하는 관계." },

    { type: "relation", ko: "QA → Reflection (품질 반성 트리거)", en: "Quality Reflection Trigger",
      desc: "QA Reviewer가 Trinity 검증 완료(pass/fail 무관) 후 결과를 Reflection에 전달하여 Verify→Reflect 루프를 트리거하는 관계. AgentZone 직접 연결이 아닌 QA 경유가 정확한 흐름." },

    { type: "relation", ko: "Reflection → LearningEng (학습 데이터 전달)", en: "LearningRecord Transfer",
      desc: "Reflection이 추출한 성공·실패 패턴 LearningRecord를 LearningEng에 전달하여 지식 축적을 시작하는 관계." },

    { type: "relation", ko: "LearningEng → Evolution (지식 요약 전달)", en: "KnowledgeSummary Dispatch",
      desc: "LearningEng이 누적 학습 결과와 Evolution 트리거 목록을 담은 KnowledgeSummary를 Evolution에 전달하는 관계." },

    { type: "relation", ko: "Evolution → Lead (진화 제안 제출)", en: "EvolutionProposal Submission",
      desc: "Evolution이 헌법 개정 초안을 포함한 EvolutionProposal을 Lead에 제출하여 승인 프로세스를 시작하는 관계." },

    // --- [AKC v4 Re-entry Relations] ---
    { type: "relation", ko: "WorldModel → Perception (재관측 요청)", en: "Re-observation Request",
      desc: "WorldModel이 uncertainty ≥ 0.5일 때 missingData 목록과 함께 Perception에 추가 데이터 수집을 요청하는 재진입 관계. 최대 2회(rules.md §6)." },

    { type: "relation", ko: "Decision → Planner (재계획 요청)", en: "Replan Request",
      desc: "Decision이 REJECT_REPLAN 결정 시 거부 사유와 수정 요구사항을 포함해 Planner에 재계획을 지시하는 재진입 관계. 최대 3회(rules.md §6)." },

    { type: "relation", ko: "Reflection → Decision (재실행 요청)", en: "Re-execution Request",
      desc: "Reflection Verify 실패 시 실패 태스크 ID와 사유를 포함해 Decision에 재실행을 지시하는 재진입 관계. 최대 2회(rules.md §6)." },

    // === Asset Box ===
    { type: "term", ko: "자산 박스", en: "AssetBox",
      desc: "에이전트 실행 흐름과 비연결된 독립 자산 영역. StyleBox(디자인 자산)와 InfraBox(인프라 자산)를 포함하며, manager_assent.md가 전체를 통합 관리한다." },
    { type: "term", ko: "자산 통합 관리자", en: "manager_assent.md",
      desc: "AssetBox 내 모든 자산(디자인 타입, 인프라 구성)의 등록·버전·접근 정책을 통합 관리하는 파일. Lead Planner가 프로젝트 개시 시 읽기 전용으로 참조한다." },

    // === Style Box ===
    { type: "term", ko: "스타일 박스", en: "StyleBox",
      desc: "AssetBox 내 디자인 자산 전용 영역. manager_design.md가 UI 레이아웃 타입과 반응형 변형(PC·모바일·태블릿·통합 반응형)을 관리한다." },
    { type: "term", ko: "디자인 자산 관리자", en: "manager_design.md",
      desc: "type01~typeN 폴더별 UI 디자인 레이아웃·스타일을 관리. 반응형 4종: PC형(1920px 기준) / 모바일형(375px 기준) / 태블릿PC형(768px 기준) / PC형+모바일형(Mobile-First 통합 반응형)." },

    // === Infra Box ===
    { type: "term", ko: "인프라 박스", en: "InfraBox",
      desc: "AssetBox 내 인프라 자산 전용 영역. Bare Metal·방화벽·Kubernetes·Docker·VM 5종 매니저 파일이 각 인프라 구성 정책을 정의한다." },
    { type: "term", ko: "베어메탈 관리자", en: "manager_baremetal_web_was_db.md",
      desc: "물리 서버 기반 Web(Nginx)/WAS(Spring Boot)/DB(PostgreSQL) 3계층 구성 정책. 레벨별 서버 수, HA 구성, OS 표준, 백업 정책 정의." },
    { type: "term", ko: "방화벽 관리자", en: "manager_firewall.md",
      desc: "네트워크 방화벽 정책 정의. Default Deny 원칙, DMZ/WAS/DB 존 분리, 허용 포트 정책표. Docker/Kubernetes NetworkPolicy와 연동." },
    { type: "term", ko: "Kubernetes VM 관리자", en: "manager_kubervm.md",
      desc: "Kubernetes 클러스터 VM 구성·네임스페이스 구조·배포 정책 정의. 레벨별 노드 수, 이미지 태그 고정, NetworkPolicy, Helm Chart 연동." },
    { type: "term", ko: "Docker 관리자", en: "manager_docker.md",
      desc: "Docker 이미지 태그 규칙(latest 금지), 베이스 이미지 표준, Dockerfile 작성 규칙, 레지스트리 정책, 컨테이너 실행 정책(Privileged 금지) 정의." },
    { type: "term", ko: "가상머신 관리자", en: "manager_vm.md",
      desc: "하이퍼바이저 기반 VM 템플릿(골든 이미지), 자원 할당 기준, 스냅샷 정책(최대 3개), VM 생명주기 정의. Bare Metal과 연동." },

    // === SkillNet Policy (2026-03-21) ===
    { type: "term", ko: "공통 스킬", en: "CommonSkill",
      desc: "역할·분야에 관계없이 전체 에이전트가 공유하는 기반 스킬. 00(관리), 01(계획), 09(협업), 19(MCP), 21(메모리) 번호가 해당한다." },
    { type: "term", ko: "내 업무 스킬", en: "RoleSkill",
      desc: "특정 역할·업무에 특화된 에이전트 전용 스킬. 역할 에이전트가 주도하여 업그레이드한다. 실제 작업 효과 향상이 확인된 경우에만 업그레이드 허용." },
    { type: "term", ko: "쓰레기 스킬 폴더", en: "TrashSkill",
      desc: "업그레이드 시도 후 성능·작업흐름이 기존보다 저하된 내용을 임시 보관하는 폴더(98_trash_skills/). 2회 재시도 후 사람의 최종 판단으로만 삭제 가능." },

    // === 2026-03-28 신규 추가 ===
    { type: "term", ko: "사람의 사상·방향성", en: "HumanVision",
      desc: "헌법 개정 필수 참조 문서(_docs/human_vision.md). §V1~§V5: 사람의 방향성·가치·제약. 헌법 개정 전 반드시 참조 — §V5 원칙에 반하는 방향으로 헌법 개정 불가." },

    { type: "term", ko: "요구사항 검증 정책", en: "RequirementsValidation",
      desc: "rules_요구사항검증정책.md. §R-1: 5차원 완성도 게이트(목적/범위/사용자/비기능/제약) → §R-2: 8섹션 시방서(착수 전 필수) → §R-3: 4게이트 검증(요구사항→설계→구현→인수) → §R-7: JARVIS-DNA 9단계 연동." },

    { type: "term", ko: "엔터프라이즈 아키텍트 마스터", en: "EADM",
      desc: "23_eadm_architect_skill. Enterprise Architecture & Development Master — 풀스택 엔터프라이즈 시스템 설계. Hexagonal Architecture, Redis HA, Kafka Pub/Sub, ELK 스택. D_architecture 섹션 v1.0." },

    { type: "term", ko: "정책 이력 관리", en: "policy-history.md",
      desc: "#concept 최신 정책이 프로젝트에 반영된 이력을 기록하는 파일. /concept-init 실행 시 자동 기록. 갱신일·에이전트명·적용 결과 추적." },

    // === 2026-03-28 스킬 참조 & 기술 확보 정책 ===
    { type: "term", ko: "스킬 참조 우선순위", en: "SkillReferencePriority",
      desc: "에이전트가 스킬을 참조할 때의 3단계 폴백 순서. 1차: 프로젝트 CLAUDE_local.md(내부 스킬) → 2차: #Global SkillNet(전문가 스킬 23개) → 3차: .All_Skills(Anthropic 공식 스킬 18개). 상위에서 없거나 오류 시 다음 계층으로 자동 전환." },

    { type: "term", ko: "기술 확보 게이트", en: "TechAcquisitionGate",
      desc: "개발 착수 전 기술 확보 완료를 강제하는 Cognitive Zone 게이트. Perception(기술 관측)→WorldModel(갭 분석)→Planner(확보 계획)→Decision(사람 품질 검토). 사람 승인 후에만 Lead Planner가 태스크 생성 가능." },

    { type: "term", ko: "기술 커버리지 매트릭스", en: "TechCoverageMatrix",
      desc: "WorldModel이 작성하는 기술 갭 분석표. 요구사항 각 항목에 대해 기존 자산(스킬 3단계 + knowhow)으로 COVERED인지 GAP인지 판별. 갭 항목은 5유형(TG-SKILL/AUTH/ENV/COMPAT/DOMAIN)으로 분류." },

    { type: "term", ko: "기술 갭 유형", en: "TechGapTypes",
      desc: "기술 미확보 시 5가지 분류. TG-SKILL(기술 부족) / TG-AUTH(권한 부족) / TG-ENV(환경 불일치) / TG-COMPAT(호환성 문제) / TG-DOMAIN(도메인 전문지식 부족). 사람이 먼저 조사·확보 후 AI가 검토·적용." },

    { type: "term", ko: "프로젝트 로컬 스킬", en: "CLAUDE_local.md",
      desc: "프로젝트별 에이전트 스킬 매핑 파일. 스킬 참조 3단계 중 1차(최우선) 소스. 프로젝트 컨텍스트에 최적화된 스킬 구성을 정의하며, Lead Planner가 태스크 분배 시 이 매핑을 우선 참조." },

    // === 2026-03-28 기술 확보 관계 ===
    { type: "relation", ko: "Perception → WorldModel (기술 관측)", en: "Tech Observation",
      desc: "Perception이 요구사항에서 필요 기술 항목을 전수 추출하여 Raw Tech List를 WorldModel에 전달하는 관계. 기술 확보 게이트의 1단계." },

    { type: "relation", ko: "WorldModel → Planner (기술 갭 분석)", en: "Tech Gap Analysis",
      desc: "WorldModel이 스킬 3단계 + knowhow 대비 갭을 분석한 기술 커버리지 매트릭스를 Planner에 전달하는 관계. 기술 확보 게이트의 2단계." },

    { type: "relation", ko: "Planner → Decision (기술 확보 계획)", en: "Tech Acquisition Plan",
      desc: "Planner가 기술 갭 항목별 확보 계획 + 확보 후 태스크 분해 초안을 Decision에 제출하는 관계. 기술 확보 게이트의 3단계." },

    { type: "relation", ko: "Decision → 사람 (기술 확보 품질 검토)", en: "Tech Gate Human Review",
      desc: "Decision이 기술 확보 현황을 정리하여 사람에게 품질 검토를 요청하는 관계. 사람 승인 후에만 태스크 생성 가능. AI 자체 판정 금지." },

    { type: "term", ko: "동적 오케스트레이터 승격", en: "Dynamic Orchestrator Promotion",
      desc: "Sub-agent가 수신 작업 재분석 후 승격 조건 3가지(대규모 범위+병렬 가능 작업 2개+계획서 완성)를 모두 충족할 때 Agent로 자동 승격하는 패턴. 단일 Lead 독점 구조를 벗어나 재귀적 N계층 병렬 처리가 가능해진다." },

    { type: "term", ko: "작업 계획서", en: "Task Plan",
      desc: "Sub-agent가 Agent로 승격하기 위한 필수 선행 문서. 분기 작업 목록, 병렬/순차 구분, 예상 완료 순서를 명시해야 하며 계획서 없이는 승격 불가." },

    { type: "term", ko: "재귀 N계층 병렬 처리", en: "Recursive N-tier Parallel",
      desc: "Lead Planner → 승격 Agent(중간) → 하위 Sub-agent로 이어지는 계층적 병렬 실행 구조. 승격된 중간 Agent는 자신의 위임 범위 내에서 오케스트레이터 역할을 수행하며 QA→Archivist 완결까지 책임진다." },

    { type: "relation", ko: "Sub-agent → Agent (동적 승격)", en: "Dynamic Promotion",
      desc: "승격 조건 3가지(대규모 범위+병렬 작업 2개+계획서)를 충족한 Sub-agent가 Agent로 승격하여 자신의 Sub-agent를 병렬 지시하는 관계. 승격 시 Lead Planner에 promotion_notice 전송 필수." },

    { type: "relation", ko: "승격 Agent → 자신의 Sub-agent (위임 범위 내 지시)", en: "Promoted Agent Instruction",
      desc: "승격된 중간 Agent가 Lead로부터 위임받은 범위 내에서 자신의 Sub-agent에게 실행 지시를 내리는 관계. 위임 범위 초과 시 Lead에 에스컬레이션 필수." }
];

// ─── Subgraphs (존 경계 박스) ───────────────────────────────────────────────
let subgraphs = [
    { id: 'ColdZone',      label: 'COLD MEMORY (LTM)',  x: 0, y: 0, w: 100, h: 100, color: '#4ade80',  bg: 'rgba(34, 197, 94, 0.15)'     },
    { id: 'CognitiveZone', label: 'COGNITIVE CORE',     x: 0, y: 0, w: 100, h: 100, color: '#a78bfa',  bg: 'rgba(167, 139, 250, 0.12)'   },
    { id: 'AgentZone',     label: 'EXECUTION AGENTS',   x: 0, y: 0, w: 100, h: 100, color: '#60a5fa',  bg: 'rgba(96, 165, 250, 0.12)'    },
    { id: 'HotZone',       label: 'HOT MEMORY (STM)',   x: 0, y: 0, w: 100, h: 100, color: '#fbbf24',  bg: 'rgba(245, 158, 11, 0.15)'    },
    { id: 'LearningZone',  label: 'SELF EVOLUTION',     x: 0, y: 0, w: 100, h: 100, color: '#f472b6',  bg: 'rgba(244, 114, 182, 0.12)'   },

    // === ASSET BOX (독립 자산 영역 — 실행 흐름 비연결) ===
    { id: 'AssetBox',  label: 'ASSET BOX',   x: 1800, y: 30,  w: 400, h: 760, color: '#f59e0b',  bg: 'rgba(245, 158, 11, 0.08)'    },
    { id: 'StyleBox',  label: 'STYLE BOX',   x: 0,    y: 0,   w: 100, h: 100, color: '#ec4899',  bg: 'rgba(236, 72, 153, 0.12)'    },
    { id: 'InfraBox',  label: 'INFRA BOX',   x: 0,    y: 0,   w: 100, h: 100, color: '#06b6d4',  bg: 'rgba(6, 182, 212, 0.12)'     }
];

// ─── Nodes (에이전트 / 시스템 노드) ────────────────────────────────────────
let nodes = [
    // === SYSTEM ===
    { id: 'Start',        label: '프로젝트 개시',        x: 40,   y: 390,  w: 110, h: 45, color: '#94a3b8', group: 'System' },
    { id: 'Standby',      label: '작업 대기',            x: 40,   y: 680,  w: 110, h: 45, color: '#64748b', group: 'System', sub: '큐 비어있음' },
    { id: 'End',          label: '세션 종료',            x: 1550, y: 375,  w: 110, h: 45, color: '#94a3b8', group: 'System' },

    // === COLD MEMORY ===
    { id: 'KB',           label: 'Global SkillNet',     x: 240,  y: 60,   w: 170, h: 65, color: '#4ade80', group: 'Cold', sub: '장기 지능 (Cold)',       parent: 'ColdZone' },
    { id: 'Rules',        label: '_docs/rules.md',      x: 490,  y: 60,   w: 170, h: 65, color: '#4ade80', group: 'Cold', sub: '시스템 헌법',            parent: 'ColdZone' },
    { id: 'ProjectLevel', label: 'Project Level',       x: 740,  y: 60,   w: 170, h: 65, color: '#4ade80', group: 'Cold', sub: 'default: enterprise',   parent: 'ColdZone' },
    { id: 'HumanVision',  label: 'human_vision.md',    x: 990,  y: 60,   w: 170, h: 65, color: '#4ade80', group: 'Cold', sub: '헌법 개정 필수 참조',    parent: 'ColdZone' },

    // === MANAGEMENT ===
    { id: 'Lead',         label: 'Lead Planner',        x: 200,  y: 355,  w: 170, h: 85, color: '#a78bfa', group: 'Mgmt' },
    { id: 'QA',           label: 'QA Reviewer',         x: 1010, y: 360,  w: 170, h: 85, color: '#34d399', group: 'Mgmt' },

    // === COGNITIVE CORE ===
    { id: 'Perception',   label: 'Perception Engine',   x: 445,  y: 200,  w: 150, h: 65, color: '#a78bfa', group: 'Cognitive', sub: '입력 인식 / 분석',    parent: 'CognitiveZone' },
    { id: 'WorldModel',   label: 'World Model',         x: 620,  y: 200,  w: 150, h: 65, color: '#a78bfa', group: 'Cognitive', sub: '환경 모델 구성',      parent: 'CognitiveZone' },
    { id: 'Planner',      label: 'Planning Engine',     x: 795,  y: 200,  w: 150, h: 65, color: '#a78bfa', group: 'Cognitive', sub: 'DAG 태스크 생성',    parent: 'CognitiveZone' },
    { id: 'Decision',     label: 'Decision Engine',     x: 970,  y: 200,  w: 155, h: 65, color: '#a78bfa', group: 'Cognitive', sub: '배분 결정: 누가·기술·방법', parent: 'CognitiveZone' },

    // === EXECUTION AGENTS (AgentZone) ===
    { id: 'FE',           label: 'FE Dev: UI/UX',       x: 445,  y: 360,  w: 130, h: 55, color: '#60a5fa', group: 'Dev', parent: 'AgentZone' },
    { id: 'BE',           label: 'BE Dev: Core',        x: 445,  y: 430,  w: 130, h: 55, color: '#60a5fa', group: 'Dev', parent: 'AgentZone' },
    { id: 'DB',           label: 'DB Admin: Schema',    x: 445,  y: 500,  w: 130, h: 55, color: '#60a5fa', group: 'Dev', parent: 'AgentZone' },
    { id: 'ToolAgent',    label: 'Tool Agent',          x: 445,  y: 570,  w: 130, h: 55, color: '#60a5fa', group: 'Dev', sub: 'API / 자동화 도구',     parent: 'AgentZone' },
    { id: 'InfraAgent',   label: 'Infra Agent',         x: 445,  y: 640,  w: 130, h: 55, color: '#60a5fa', group: 'Dev', sub: '환경 구성 / 배포',      parent: 'AgentZone' },

    // === COLLABORATION ===
    { id: 'AgentTeam',    label: 'Agent Collaboration', x: 640,  y: 450,  w: 170, h: 65, color: '#facc15', group: 'Dev' },

    // === HOT MEMORY ===
    { id: 'Sync',         label: 'sync_state.json',     x: 240,  y: 785,  w: 170, h: 65, color: '#fbbf24', group: 'Hot', sub: '이벤트 버스 (Hot)',      parent: 'HotZone' },
    { id: 'Logs',         label: 'history.md',          x: 720,  y: 785,  w: 170, h: 65, color: '#fbbf24', group: 'Hot', sub: '작업 CCTV',              parent: 'HotZone' },

    // === TASK ARTIFACTS ===
    { id: 'TaskFE',       label: 'task_fe_ok.md',       x: 870,  y: 360,  w: 130, h: 45, color: '#cbd5e1', group: 'Task' },
    { id: 'TaskBE',       label: 'task_be_ok.md',       x: 870,  y: 420,  w: 130, h: 45, color: '#cbd5e1', group: 'Task' },
    { id: 'TaskDB',       label: 'task_db_ok.md',       x: 870,  y: 480,  w: 130, h: 45, color: '#cbd5e1', group: 'Task' },
    { id: 'TaskErr',      label: 'task_err.md',         x: 1020, y: 565,  w: 130, h: 45, color: '#f87171', group: 'Task' },

    // === SELF EVOLUTION ===
    { id: 'Reflection',   label: 'Reflection Engine',   x: 1255, y: 510,  w: 150, h: 65, color: '#f472b6', group: 'Evo', sub: '실패 진단 / 전략 평가', parent: 'LearningZone' },
    { id: 'LearningEng',  label: 'Learning Engine',     x: 1455, y: 510,  w: 150, h: 65, color: '#f472b6', group: 'Evo', sub: '패턴 추출 / 지식 갱신', parent: 'LearningZone' },
    { id: 'Evolution',    label: 'Evolution Engine',    x: 1355, y: 610,  w: 150, h: 65, color: '#f472b6', group: 'Evo', sub: '전략 / 워크플로 진화',  parent: 'LearningZone' },

    // === ARCHIVIST ===
    { id: 'Archivist',    label: 'Archivist',           x: 1230, y: 350,  w: 140, h: 75, color: '#f472b6', group: 'Evo', parent: 'LearningZone' },

    // === ASSET BOX ===
    { id: 'ManagerAssent',    label: 'manager_assent.md',            x: 1830, y: 65,  w: 330, h: 55, color: '#f59e0b', group: 'Asset', sub: '자산 통합 관리자' },

    // === STYLE BOX ===
    { id: 'ManagerDesign',    label: 'manager_design.md',            x: 1845, y: 185, w: 310, h: 75, color: '#ec4899', group: 'Style', sub: 'type01~  ·  PC / 모바일 / 태블릿 / 반응형', parent: 'StyleBox' },

    // === INFRA BOX ===
    { id: 'ManagerBaremetal', label: 'manager_baremetal\nweb_was_db.md', x: 1845, y: 385, w: 310, h: 55, color: '#06b6d4', group: 'Infra', sub: 'Bare Metal : Web / WAS / DB', parent: 'InfraBox' },
    { id: 'ManagerFirewall',  label: 'manager_firewall.md',          x: 1845, y: 455, w: 310, h: 55, color: '#06b6d4', group: 'Infra', sub: '방화벽 정책 · DMZ / WAS / DB 존 분리', parent: 'InfraBox' },
    { id: 'ManagerKubervm',   label: 'manager_kubervm.md',           x: 1845, y: 525, w: 310, h: 55, color: '#06b6d4', group: 'Infra', sub: 'Kubernetes 클러스터 · VM 구성', parent: 'InfraBox' },
    { id: 'ManagerDocker',    label: 'manager_docker.md',            x: 1845, y: 595, w: 310, h: 55, color: '#06b6d4', group: 'Infra', sub: '이미지 빌드 · 레지스트리 · 컨테이너', parent: 'InfraBox' },
    { id: 'ManagerVm',        label: 'manager_vm.md',                x: 1845, y: 665, w: 310, h: 55, color: '#06b6d4', group: 'Infra', sub: '골든 이미지 · 스냅샷 · VM 생명주기', parent: 'InfraBox' }
];

// ─── Edges (노드 간 관계선) ──────────────────────────────────────────────────
const edges = [
    // === SYSTEM START ===
    { from: 'Start',       to: 'Lead',        text: '프로젝트 활성화' },

    // === LEAD → COLD MEMORY ===
    { from: 'Lead',        to: 'Rules',       text: 'SDD 명세 작성' },
    { from: 'Lead',        to: 'ProjectLevel',text: '레벨 확인',          dashed: true },
    { from: 'Lead',        to: 'HumanVision', text: '사상 참조',          dashed: true },

    // === LEAD → COGNITIVE CORE ===
    { from: 'Lead',        to: 'Planner',     text: '작업 지시' },
    { from: 'Planner',     to: 'Perception',  text: '분석 요청' },
    { from: 'Perception',  to: 'WorldModel',  text: '컨텍스트 모델링' },
    { from: 'WorldModel',  to: 'Planner',     text: '목표 계획 수립' },
    { from: 'Planner',     to: 'Decision',    text: '전략·배분 결정' },
    { from: 'Decision',    to: 'Sync',        text: '태스크 인입' },

    // === COGNITIVE → COLD MEMORY (참조) ===
    { from: 'Perception',  to: 'KB',          text: 'SAI 탐색',           dashed: true },
    { from: 'WorldModel',  to: 'Rules',       text: '제약 참조',          dashed: true },
    { from: 'Planner',     to: 'KB',          text: '전략·이전결과 탐색', dashed: true },

    // === SYNC → EXECUTION AGENTS ===
    { from: 'Sync',        to: 'FE',          text: 'UI 컴포넌트 개발' },
    { from: 'Sync',        to: 'BE',          text: '코어 로직 구현' },
    { from: 'Sync',        to: 'DB',          text: '스키마 설계' },
    { from: 'Sync',        to: 'ToolAgent',   text: '도구 실행' },
    { from: 'Sync',        to: 'InfraAgent',  text: '인프라 실행' },

    // === DEV → RULES ===
    { from: 'FE',          to: 'Rules',       text: '제약 준수',          dashed: true },
    { from: 'BE',          to: 'Rules',       text: '로직 검증',          dashed: true },
    { from: 'DB',          to: 'Rules',       text: '명세 참조',          dashed: true },
    { from: 'ToolAgent',   to: 'Rules',       text: '헌법 준수',          dashed: true },
    { from: 'InfraAgent',  to: 'Rules',       text: '헌법 준수',          dashed: true },

    // === DEV → LOGS ===
    { from: 'FE',          to: 'Logs',        text: '실시간 사고 기록' },
    { from: 'BE',          to: 'Logs',        text: '상태 전이 기록' },
    { from: 'DB',          to: 'Logs',        text: 'DDL 로깅' },
    { from: 'ToolAgent',   to: 'Logs',        text: '도구 실행 기록' },
    { from: 'InfraAgent',  to: 'Logs',        text: '인프라 변경 기록' },

    // === DEV DEPENDENCIES ===
    { from: 'DB',          to: 'BE',          text: '스키마 의존성 전파', dashed: true },
    { from: 'BE',          to: 'FE',          text: 'API 인터페이스 제공',dashed: true },

    // === DEV → AGENT TEAM ===
    { from: 'FE',          to: 'AgentTeam',   text: '병렬 협업' },
    { from: 'BE',          to: 'AgentTeam',   text: '동기화' },
    { from: 'DB',          to: 'AgentTeam',   text: '데이터 무결성' },
    { from: 'ToolAgent',   to: 'AgentTeam',   text: '도구 결과 합류' },
    { from: 'InfraAgent',  to: 'AgentTeam',   text: '인프라 결과 합류' },

    // === AGENT TEAM ===
    { from: 'AgentTeam',   to: 'Logs',        text: '합의 완료 보고' },
    { from: 'AgentTeam',   to: 'QA',          text: '작업 패키지 제출' },

    // === TASK SUBMISSIONS ===
    { from: 'FE',          to: 'TaskFE',      text: 'UI 제출' },
    { from: 'BE',          to: 'TaskBE',      text: 'API 제출' },
    { from: 'DB',          to: 'TaskDB',      text: 'DDL 제출' },
    { from: 'TaskFE',      to: 'QA',          text: '시각 검증' },
    { from: 'TaskBE',      to: 'QA',          text: '로직 검증' },
    { from: 'TaskDB',      to: 'QA',          text: '데이터 검증' },

    // === DECISION → RULES ===
    { from: 'Decision',    to: 'Rules',       text: '헌법 참조',          dashed: true },

    // === QA ===
    { from: 'QA',          to: 'Rules',       text: '정책 참조',          dashed: true },
    { from: 'QA',          to: 'KB',          text: '스킬 탐색',          dashed: true },
    { from: 'QA',          to: 'AgentTeam',   text: 'QA 결과 배분' },
    { from: 'QA',          to: 'TaskErr',     text: 'Trinity 불일치' },

    // === REWORK LOOP ===
    { from: 'TaskErr',     to: 'AgentTeam',   text: '보완 재작업 요청' },
    { from: 'AgentTeam',   to: 'FE',          text: 'QA 피드백 전달',     dashed: true },
    { from: 'AgentTeam',   to: 'BE',          text: 'QA 피드백 전달',     dashed: true },
    { from: 'AgentTeam',   to: 'DB',          text: 'QA 피드백 전달',     dashed: true },
    { from: 'AgentTeam',   to: 'Sync',        text: '다음 태스크 요청',   dashed: true },
    { from: 'Sync',        to: 'Standby',     text: '큐 비어있음',        dashed: true },

    // === QA → ARCHIVIST ===
    { from: 'QA',          to: 'Archivist',   text: '최종 컨텍스트 승인' },

    // === SELF EVOLUTION LAYER ===
    { from: 'QA',          to: 'Reflection',  text: '결과 분석' },
    { from: 'Reflection',  to: 'LearningEng', text: '패턴 추출' },
    { from: 'LearningEng', to: 'KB',          text: '지식 업데이트' },
    { from: 'LearningEng', to: 'Evolution',   text: '전략 개선' },
    { from: 'Archivist',   to: 'LearningEng', text: 'SAI 학습 인계',     dashed: true },
    { from: 'Evolution',   to: 'Lead',        text: '아키텍처 피드백',   dashed: true },

    // === ARCHIVIST → END ===
    { from: 'Archivist',   to: 'Logs',        text: '시맨틱 압축' },
    { from: 'Archivist',   to: 'KB',          text: '도메인 SAI화' },
    { from: 'Archivist',   to: 'End',         text: '자산화 종료' },

    // === AKC v4 RE-ENTRY (재진입 루프) ===
    { from: 'WorldModel',  to: 'Perception',  text: '재관측 요청 (uncertainty≥0.5)', dashed: true },
    { from: 'Decision',    to: 'Planner',     text: '재계획 요청 (REJECT_REPLAN)',   dashed: true },
    { from: 'Reflection',  to: 'Decision',    text: '재실행 요청 (Verify 실패)',      dashed: true },

    // === 동적 승격 (Dynamic Promotion v2.0) ===
    { from: 'AgentTeam',   to: 'Lead',        text: '승격 통보 (promotion_notice)',  dashed: true },
    { from: 'AgentTeam',   to: 'AgentTeam',   text: '승격 Agent → 자신의 Sub-agent 지시 (조건 충족 후)', dashed: true }
];
