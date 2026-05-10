# AKC 설계 구조 (Design Structure)

## 1. 8존(Zone) 공간 배치

AKC 시스템의 노드들은 8개의 논리적 영역으로 구분된다. 이 구분은 단순한 시각적 분류가 아니라 **접근 권한, 변경 가능성, 데이터 흐름 방향**을 정의한다.

```
┌─────────────────────────────────────────────────────────────────┐
│  COLD MEMORY (LTM) — 참조 전용                                   │
│  Global SkillNet │ rules.md │ ProjectLevel │ human_vision.md    │
└─────────────────────────────────────────────────────────────────┘
              ↓ 참조(read-only)
┌──────────────────────────┐
│  COGNITIVE CORE          │
│  Perception → WorldModel │
│  → Planner → Decision    │
└──────────────────────────┘
              ↓ ActionDirective
┌──────────────────────────────────────────────────┐
│  EXECUTION AGENTS (AgentZone)                    │
│  FE Dev │ BE Dev │ DB Admin │ ToolAgent │ Infra  │
└──────────────────────────────────────────────────┘
              ↓↑ 상태 공유
┌──────────────────────────┐
│  HOT MEMORY (STM)        │
│  sync_state.json         │  ← 이벤트 버스
│  history.md              │  ← 작업 CCTV
└──────────────────────────┘
              ↓ QA 결과
┌──────────────────────────────────────────────────┐
│  SELF EVOLUTION (LearningZone)                   │
│  Reflection → LearningEng → Evolution            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  ASSET BOX (실행 흐름 비연결 — 독립 자산)                    │
│  StyleBox: manager_design.md (디자인 타입)                  │
│  InfraBox: Baremetal / Firewall / Kubernetes / Docker / VM │
└──────────────────────────────────────────────────────────┘
```

### 존 설계 원칙

**Cold Memory**: 에이전트가 직접 쓸 수 없다. 오직 `Archivist + LearningEng`의 승인된 경로로만 업데이트. 지식의 안정성을 보장하기 위해 쓰기 권한을 명시적으로 박탈.

**Hot Memory**: 모든 에이전트가 실시간으로 읽고 쓴다. sync_state.json은 태스크 큐(이벤트 버스)이고, history.md는 Chain-of-Thought를 포함한 전체 작업 이력(블랙박스).

**Asset Box**: 실행 흐름에 연결되지 않는다. Lead Planner가 프로젝트 개시 시 **읽기 전용**으로 참조만 한다. 실행 중 에이전트가 AssetBox를 직접 수정하면 설계 의도 위반.

---

## 2. 세션 데이터 흐름: 파일 기반 메시지 패싱

에이전트 간 통신은 파일 시스템을 통한 명시적 메시지 패싱으로 구현된다.

```
Lead
  │ sync_state.json에 태스크 인입
  ↓
FE/BE/DB 에이전트
  │ history.md에 CoT 기록 (실시간)
  │ task_fe_ok.md / task_be_ok.md / task_db_ok.md 제출
  ↓
QA Reviewer
  │ Trinity 검증
  ├── 통과 → QA → Archivist → End
  └── 실패 → task_err.md 발행
              │
              └── AgentTeam → 해당 에이전트 재작업 요청
```

파일 기반의 장점:
1. **감사 가능(Auditable)**: 모든 상태 변화가 파일로 남는다. 사후 디버깅이 가능.
2. **에이전트 독립성**: 에이전트 간 직접 통신이 없으므로 하나가 실패해도 전체가 블록되지 않는다.
3. **재현 가능성**: 특정 시점의 파일 상태를 복원하면 그 시점부터 재실행 가능.

---

## 3. 버전 진화: v2 → v3 → v4

### v2 기반 구조

v2는 Lead → FE/BE/DB → QA → Archivist의 **단선 파이프라인**이었다. 인지 기능이 Lead Planner 하나에 집중되어 있었고, 자기 진화 루프가 없었다.

```
v2: Lead → [FE, BE, DB] → QA → Archivist → End
```

병목: Lead 과부하, 인지 실패 시 전체 중단, 과거 실패에서 배우는 메커니즘 없음.

### v3: 인지 코어와 진화 엔진 도입

v3에서 **Cognitive Core**(인식/월드모델/플래닝/결정 엔진)와 **Self Evolution**(반성/학습/진화 엔진)이 추가됐다. 그러나 이 엔진들은 단일 컴포넌트 내부 모듈로 구현됐고, 에이전트 수준의 독립성은 없었다.

```
v3: Lead → [Perception, WorldModel, Planning, Decision 엔진] → [FE, BE, DB] → QA → [Reflection, Learning, Evolution 엔진] → Lead
```

### v4: 모듈 → 독립 에이전트

v4에서 모든 엔진이 **독립적인 에이전트**로 승격됐다. 각 에이전트는 고유한 헌법(agents.md)을 가지고, 명확한 입출력 계약으로 연결된다.

```
v4: 모든 인지/진화 컴포넌트 = 독립 에이전트
    → 각자 헌법 보유, 각자 입출력 계약
    → §K 정책, RBET 프레임, 5단계 성숙도, 루프 가드 추가
```

v4 신규 데이터 구조:
- `PerceptionPayload` — qualityFlag 포함
- `WorldState` — uncertaintyScore 포함
- `ExecutionPlan` — dependencyGraph + fallbackPlan
- `ActionDirective` — RBET 스코어 + 안전 게이트 결과
- `ReflectionReport` — 5-Why 분석 + LearningRecord
- `KnowledgeSummary` — 성숙 패턴 통계 + Evolution 트리거
- `EvolutionProposal` — 위험도 분류 + 헌법 초안 경로

---

## 4. 에이전트 스킬 참조 계층

에이전트가 작업 수행 시 스킬을 참조하는 3단계 폴백:

```
1차: CLAUDE_local.md (프로젝트 내 최적화된 스킬)
2차: Global SkillNet (전문가 스킬 23개 도메인)
3차: .All_Skills (Anthropic 공식 스킬 18개)
```

상위에 없거나 오류 시 자동으로 다음 계층으로 전환. 1차가 최우선인 이유는 프로젝트 컨텍스트에 최적화된 스킬이 일반 스킬보다 현재 태스크에 더 정확하기 때문이다.

**쓰레기 스킬 폴더 (98_trash_skills/)**: 업그레이드 시도 후 성능이 오히려 저하된 스킬을 임시 보관. 삭제는 2회 재시도 후 인간 최종 판단으로만 가능. 이것도 §K 철학의 연장 — 실패한 스킬도 자산.

---

## 5. ProjectLevel: 규모별 시스템 설정

프로젝트의 복잡도와 팀 구성에 따라 시스템 동작 방식이 달라진다.

| Level | 용도 | 특성 |
|-------|------|------|
| `starter` | 개인 프로젝트, PoC | 최소 에이전트, 간소화된 QA |
| `dynamic` | 스타트업, 소규모 팀 | 상황에 따라 동적으로 팀 구성 |
| `enterprise` | 기본값, 중대형 프로젝트 | 전체 에이전트 풀, 완전한 QA |
| `desktop-app` | 데스크탑 애플리케이션 | 인프라 에이전트 제외, UI 중점 |
| `mobile-app` | 모바일 애플리케이션 | 반응형 설계 최적화 |

ProjectLevel은 Cold Memory에 저장되며, Lead Planner가 프로젝트 개시 시 읽어 팀 구성, QA 기준, 검증 스킬 범위를 결정한다.

---

## 6. Asset Box 설계: 실행 흐름과의 의도적 분리

Asset Box가 실행 흐름과 연결되지 않는 것은 버그가 아니라 **의도된 설계**다.

StyleBox (디자인 자산):
- `manager_design.md` — type01~typeN 폴더별 UI 레이아웃
- 반응형 4종: PC형(1920px) / 모바일형(375px) / 태블릿PC형(768px) / PC+모바일 통합 반응형

InfraBox (인프라 자산):
- `manager_baremetal_web_was_db.md` — 물리 서버 3계층 (Nginx/Spring Boot/PostgreSQL)
- `manager_firewall.md` — Default Deny, DMZ/WAS/DB 존 분리
- `manager_kubervm.md` — Kubernetes 클러스터, 네임스페이스, Helm Chart
- `manager_docker.md` — 이미지 빌드 규칙, latest 태그 금지
- `manager_vm.md` — 골든 이미지, 스냅샷 정책(최대 3개)

이 자산들을 실행 흐름에서 분리한 이유:
1. **재사용성**: 실행 흐름에 연결되면 특정 프로젝트에 종속된다. 분리하면 다른 프로젝트에서 동일한 인프라 자산을 참조 가능.
2. **오염 방지**: 실행 중 에이전트가 인프라 설정을 직접 변경하는 것을 구조적으로 차단.
3. **버전 독립성**: 인프라 자산 버전업이 진행 중인 프로젝트 실행에 영향을 주지 않음.

---

## 7. 시각화 아키텍처: 이중 뷰 설계

AKC 개념 뷰어는 동일한 데이터를 두 가지 방식으로 표현한다.

### 다이어그램 뷰 (Canvas 기반)

Force-Directed Graph 렌더링:
- 각 노드는 드래그 가능, 존 경계 박스 안에 포함
- 스크롤/줌/자동 배치(선 정리) 지원
- 선이 겹치는 문제를 "선 정리" 버튼으로 자동 해결 (Spread Algorithm)
- 엣지는 실선(강한 관계)과 점선(참조/의존 관계)으로 구분

기술 스택:
- Canvas API (DOM 없이 직접 픽셀 렌더링 — 노드 수 증가에도 성능 유지)
- `requestAnimationFrame` 기반 애니메이션 루프
- 히트 테스트: 마우스 좌표 → 노드 경계 박스 충돌 검사

### 레이어 뷰 (HTML 기반)

12개 레이어를 탭으로 탐색:
- FLOW_ROWS: 전체 흐름을 행(Row)으로 구조화
- ZONE_TABS: 각 존 상세 탭 — 순차 흐름 또는 그리드로 표현
- 각 노드 카드에 label / sub / desc 3단계 정보 표시

두 뷰는 동일한 `diagram-data.js` + `layer-data.js` 데이터를 공유하므로, 데이터를 한 번만 수정하면 두 뷰에 모두 반영된다.

---

## 8. ERR-ID 오류 추적 체계

QA 미달 시 발행되는 오류에는 고유 식별자가 부여된다: `ERR-{순번}` (예: ERR-001).

이 식별자는:
1. `task_err.md`에 기록되어 해당 재작업 사이클을 추적
2. 동일한 ERR-ID가 반복 발생하면 Reflection에서 패턴으로 인식
3. 에스컬레이션 시 인간에게 전달 — "어떤 오류가 몇 번이나 반복됐는지" 가시화

ERR-ID가 없으면 같은 오류가 다른 이름으로 반복되어도 패턴이 보이지 않는다. ID 체계는 시스템이 자신의 약점을 인식하게 만드는 장치다.
