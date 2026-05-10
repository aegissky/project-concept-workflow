# AEGIS Concept Viewer

AEGIS 시스템 아키텍처를 인터랙티브하게 시각화하는 다이어그램 뷰어.

## 뷰

| 경로 | 언어 | 설명 |
|------|------|------|
| `index.html` | 한국어 | 메인 인터랙티브 뷰 |
| `eng/index.html` | English | English mirror |

## 기능

- **다이어그램 뷰** — Canvas 기반 Force-Directed 그래프 (드래그·줌·자동 배치)
- **레이어 뷰** — 12계층 아키텍처 탭 탐색 (존별 필터링)
- **용어 검색** — 용어집 모달 (관계·설명 포함)
- **오프라인 지원** — CDN 없이 `assets/` 로컬 자산으로 완전 동작

## 구조

```
concept/
├── index.html          # 메인 진입점 (KO)
├── script.js           # Canvas 렌더링 & 인터랙션
├── layer-view.js       # 레이어 탭뷰 렌더링
├── data/
│   ├── diagram-data.js # 노드·엣지·용어 데이터
│   └── layer-data.js   # 레이어뷰 정적 데이터
├── assets/
│   ├── tailwind.cdn.js # Tailwind CSS (오프라인)
│   └── fonts/          # Inter 웹폰트 (오프라인)
└── eng/                # English mirror (동일 구조)
```

## 오프라인 전환

`index.html` 상단 2줄 교체:

```html
<!-- 변경 전 (CDN) -->
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800" rel="stylesheet">

<!-- 변경 후 (로컬) -->
<script src="assets/tailwind.cdn.js"></script>
<link rel="stylesheet" href="assets/fonts/inter.css">
```

## 데이터 수정

- **노드·관계 추가**: `data/diagram-data.js` — `nodes[]`, `edges[]`, `glossaryData[]`
- **레이어 수정**: `data/layer-data.js` — `FLOW_ROWS[]`, `ZONE_TABS[]`
- 영문판 변경 시 `eng/data/` 동일하게 적용
