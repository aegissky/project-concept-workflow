# AKC 시스템 개념 (Concepts)

## 1. 인지 파이프라인: Observe → Understand → Plan → Decide

AKC v4의 가장 중요한 설계 결정은 **인지를 단일 에이전트가 아닌 4개의 전문화된 에이전트 파이프라인으로 분리**한 것이다.

```
Lead Planner
    │ 작업 지시
    ▼
Planner → Perception  →  WorldModel  →  Planner  →  Decision
              (Observe)   (Understand)    (Plan)       (Decide)
```

각 단계는 독립된 에이전트가 담당하며, 명확한 입출력 계약(Contract)으로 연결된다:

### 1-1. Perception (Observe)

**역할**: 외부 세계에서 원시 데이터를 수집하고 정규화한다.

**출력**: `PerceptionPayload`
```json
{
  "source": "user_request | file | api | screenshot",
  "raw": "...",
  "metadata": { "timestamp": "...", "format": "..." },
  "qualityFlag": "CLEAN | PARTIAL | NOISY | FAILED"
}
```

qualityFlag가 `FAILED`이면 파이프라인이 진입하지 않고 즉시 에스컬레이션된다.

**핵심 설계**: Perception은 해석하지 않는다. 원시 데이터를 구조화할 뿐이다. 해석은 WorldModel의 책임이다. 이 분리가 없으면 관측 편향이 계획 단계까지 전파된다.

### 1-2. WorldModel (Understand)

**역할**: PerceptionPayload를 엔티티·관계 그래프로 변환하고 현재 세계의 상태를 모델링한다.

**출력**: `WorldState`
```json
{
  "entities": [...],
  "relations": [...],
  "domainContext": "...",
  "uncertaintyScore": 0.0~1.0
}
```

**핵심 설계**: `uncertaintyScore ≥ 0.5`이면 WorldModel은 Perception에 재관측을 요청한다 (최대 2회). 불확실한 상태에서 계획을 수립하면 잘못된 방향으로 확신하며 전진하는 위험이 있기 때문이다.

### 1-3. Planner (Plan)

**역할**: WorldState를 분석해 목표 달성을 위한 실행 계획을 수립한다. DAG(방향 비순환 그래프) 형태로 태스크를 분해하고 에이전트 할당 전략을 결정한다.

**5가지 실행 전략**:
- `Sequential` — 순차 실행 (의존성 강한 경우)
- `Parallel` — 독립 태스크 병렬 실행
- `Hierarchical` — 계층적 위임 (Dynamic Promotion)
- `Adaptive` — 실행 중 전략 변경 허용
- `Minimal` — 최소 에이전트, 최소 단계 (단순 작업)

**출력**: `ExecutionPlan`
```json
{
  "tasks": [...],
  "dependencyGraph": {...},
  "parallelGroups": [...],
  "fallbackPlan": {...}
}
```

### 1-4. Decision (Decide)

**역할**: Planner의 ExecutionPlan을 RBET 프레임으로 평가하고 실행 승인 여부를 결정한다.

**RBET 프레임**:
| 축 | 의미 |
|----|------|
| **R**isk | 실행 시 발생 가능한 위험 (되돌릴 수 없는 변경, 시스템 영향 범위) |
| **B**enefit | 기대되는 이득 (목표 달성도, 품질 향상) |
| **E**fficiency | 자원 대비 효과 (시간, 계산 비용) |
| **T**rust | 실행 에이전트에 대한 신뢰도 (과거 성공률) |

**출력**: `ActionDirective`
```json
{
  "decision": "APPROVE | REJECT | PAUSE",
  "rbetScores": { "risk": 0.2, "benefit": 0.8, "efficiency": 0.7, "trust": 0.9 },
  "safetyGateResults": [...],
  "rationale": "..."
}
```

`REJECT`는 두 종류로 분기된다:
- `REJECT_ABORT` — 재계획 없이 중단 (안전 위반)
- `REJECT_REPLAN` — Planner에 재계획 요청 (최대 3회)

---

## 2. Trinity QA 게이트

QA Reviewer는 FE/BE/DB 세 영역의 산출물이 **서로 일관성(Consistency)을 유지하는지** 동시에 검증한다. 이것이 Trinity 검증이다.

단순히 각 영역의 품질을 개별 검증하는 것이 아니라:

```
FE (UI/UX) ←→ BE (API 인터페이스) ←→ DB (스키마)
```

이 삼각 관계에서 하나라도 불일치가 발생하면 `task_err.md`를 발행하고 해당 영역에 재작업을 지시한다.

### 왜 삼각형인가?

FE-BE 불일치: API 형식이 UI가 기대하는 것과 다름
BE-DB 불일치: 비즈니스 로직이 스키마 구조를 잘못 가정
FE-DB 불일치: UI가 표시하는 데이터 구조가 실제 저장 구조와 다름

이 세 방향의 불일치가 **독립적으로 발생 가능**하기 때문에, 각각을 개별 검증하는 것만으로는 전체 일관성을 보장할 수 없다.

### 검증 자원

QA는 검증 시 두 가지 외부 자원을 참조한다:
- `rules.md` — 정책 기준 (무엇이 허용되는가)
- `Global SkillNet` — 승인된 검증 스킬 (어떻게 검증하는가)

---

## 3. 자기 진화 루프: Reflect → Learn → Evolve

QA 이후 결과는 단순히 통과/실패로 끝나지 않는다. 반드시 **왜 그런 결과가 나왔는지**를 분석하는 단계로 이어진다.

```
QA 결과
   │
   ▼
Reflection (실패 진단)
   │  LearningRecord
   ▼
LearningEng (패턴 축적)
   │  KnowledgeSummary
   ▼
Evolution (전략 진화)
   │  EvolutionProposal
   ▼
Lead Planner (아키텍처 반영)
```

### Reflection: 5-Why 근본 원인 분석

단순히 "무엇이 틀렸는가"가 아니라 "왜 틀렸는가"를 다섯 번 반복해 근본 원인까지 파고든다.

예:
1. FE-BE 불일치 발생 → 왜? API 응답 형식이 달랐다
2. API 형식이 왜 달랐나? BE가 최신 UI 요구사항을 반영하지 않았다
3. 왜 반영하지 않았나? sync_state.json 업데이트가 누락됐다
4. 왜 누락됐나? BE 에이전트가 Sync 읽기를 건너뛰었다
5. 왜 건너뛰었나? 작업 지시에 Sync 확인 단계가 명시되지 않았다

**근본 원인**: Lead Planner의 작업 지시 템플릿에 Sync 확인 단계가 빠져 있음 → EvolutionProposal로 헌법 개정 제안.

### LearningEng: 5단계 지식 성숙도

경험이 신뢰할 수 있는 지식이 되기까지의 단계:

```
experience → attempt → draft → verified → canonical
```

| 단계 | 조건 | 자동 적용 |
|------|------|-----------|
| experience | 즉시 기록 (5분 룰) | 불가 |
| attempt | 시도한 방법 기록 (실패 포함) | 불가 |
| draft | 패턴 분석 완료 | 불가 |
| verified | 2개 도메인에서 검증 | 가능 |
| canonical | 3개 이상 도메인 + 4차원 분석 + boilerplate 반영 | 가능 |

`verified` 미만은 절대 자동 적용되지 않는다. 신뢰되지 않은 지식이 시스템 동작에 영향을 미치는 것을 차단하기 위해서다.

### Evolution: 헌법 개정 제안

Evolution 에이전트는 직접 헌법을 수정하지 않는다. 반드시 `EvolutionProposal`을 Lead Planner에 제출하고, Lead가 인간에게 승인을 요청하는 절차를 거친다.

변경 위험도 분류:
- `Patch` — 설명 문구 수정, 예시 추가
- `Minor` — 기존 규칙의 범위 조정
- `Major` — 새로운 규칙 추가, 기존 규칙 폐기
- `Breaking` — 시스템 동작 방식 근본 변경

---

## 4. 동적 오케스트레이터 승격 (Dynamic Promotion)

단일 Lead Planner가 모든 에이전트를 조율하면 복잡한 프로젝트에서 병목이 발생한다. 이를 해결하는 메커니즘이 **동적 승격**이다.

**승격 조건 (3가지 모두 충족)**:
1. 대규모 범위 (단일 에이전트로 처리하기 어려운 복잡도)
2. 병렬 처리 가능한 독립 태스크 2개 이상 존재
3. 태스크 계획서(Task Plan) 완성 — 승격 없이 시작 불가

**승격 후 구조**:
```
Lead Planner
    │
    ├─ 승격된 Agent A (중간 오케스트레이터)
    │       ├─ Sub-agent A1
    │       └─ Sub-agent A2
    └─ 승격된 Agent B
            ├─ Sub-agent B1
            └─ Sub-agent B2
```

승격된 중간 Agent는 위임받은 범위 안에서 독립적으로 QA → Archivist 완결까지 책임진다. 위임 범위를 초과하는 결정은 Lead에 에스컬레이션해야 한다.

승격 시 즉시 `promotion_notice`를 Lead에 전송하여 Lead가 전체 조율 상태를 유지할 수 있도록 한다.

---

## 5. 루프 가드 (loopGuard)

자기 진화와 재진입 루프를 허용하는 시스템에서 **무한 루프는 가장 치명적인 실패 모드**다.

AKC는 세 단계의 하드 리밋을 건다:
| 제한 | 기준 | 위반 시 |
|------|------|---------|
| 세션 재진입 | ≤ 10회 | 강제 에스컬레이션 |
| LLM 턴 | ≤ 50회 | 강제 에스컬레이션 |
| 세션 최대 시간 | ≤ 120분 | 강제 에스컬레이션 |

에스컬레이션은 인간에게 상황을 전달하고 시스템 일시 중단을 의미한다. 이 리밋은 헌법에 의해 정의되며, 에이전트 스스로 변경 불가하다.

재진입 루프별 별도 리밋도 있다:
- WorldModel → Perception 재관측: 최대 2회
- Decision → Planner 재계획: 최대 3회
- Reflection → Decision 재실행: 최대 2회

---

## 6. 기술 확보 게이트 (Tech Acquisition Gate)

개발을 시작하기 전, 시스템은 **요구사항이 요구하는 기술을 실제로 보유하고 있는지** 강제로 확인한다.

```
Perception → WorldModel → Planner → Decision → 인간 승인
(기술 관측)  (갭 분석)    (확보 계획) (품질 검토)
```

WorldModel이 생성하는 `TechCoverageMatrix`:
- 요구사항 각 항목 × 기존 자산(스킬 3단계 + knowhow) = COVERED / GAP

GAP은 5가지 유형으로 분류:
- `TG-SKILL` — 기술 역량 부족
- `TG-AUTH` — 권한 부족
- `TG-ENV` — 환경 불일치
- `TG-COMPAT` — 호환성 문제
- `TG-DOMAIN` — 도메인 전문지식 부족

인간이 먼저 GAP을 해소한 후 AI가 확인하는 순서. AI 자체 판정으로 GAP을 해소했다고 선언하는 것은 금지된다.
