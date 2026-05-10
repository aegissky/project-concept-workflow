/* ─────────────────────────────────────────────
   layer-view.js  ─  레이어 탭뷰 + 계층형 레이아웃
   script.js의 nodes / edges / subgraphs / glossaryData 전역 변수 참조
───────────────────────────────────────────── */
(function () {

    /* ── 전체 흐름 레이어 정의 ── */

    // 데이터: data/layer-data.js 에서 로드 (FLOW_ROWS, ZONE_TABS, KEYWORD_GROUPS)

    // 가장 긴 키워드부터 교체 (중복 매칭 방지)
    const _KW_FLAT = (() => {
        const all = [];
        KEYWORD_GROUPS.forEach(g => g.words.forEach(w => all.push({ word: w, color: g.color })));
        all.sort((a, b) => b.word.length - a.word.length);
        return all;
    })();

    function highlightKeywords(text) {
        if (!text) return text;
        const n = text.length;
        const used = new Uint8Array(n);
        const reps = [];

        _KW_FLAT.forEach(({ word, color }) => {
            const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            let m;
            while ((m = re.exec(text)) !== null) {
                const s = m.index, e = s + m[0].length;
                let overlap = false;
                for (let i = s; i < e; i++) if (used[i]) { overlap = true; break; }
                if (!overlap) {
                    reps.push({ s, e, word: m[0], color });
                    for (let i = s; i < e; i++) used[i] = 1;
                }
            }
        });

        reps.sort((a, b) => a.s - b.s);
        let result = '', pos = 0;
        reps.forEach(({ s, e, word, color }) => {
            result += text.slice(pos, s);
            result += `<span style="color:${color};font-weight:700">${word}</span>`;
            pos = e;
        });
        return result + text.slice(pos);
    }

    /* ── 헬퍼 ── */
    function getNode(id) { return nodes.find(n => n.id === id); }

    function getGlossaryDesc(nodeId, label) {
        const g = glossaryData.find(g => g.en === nodeId || g.en === label);
        return g ? g.desc : null;
    }

    function nodeCard(nodeId, color) {
        const n = getNode(nodeId);
        if (!n) return '';
        const desc = getGlossaryDesc(n.id, n.label);
        const borderCol = color || n.color || '#475569';
        return `
            <div class="lv-node-card" style="border-color:${borderCol}40">
                <div class="lv-node-label" style="color:${borderCol}">${n.label}</div>
                ${n.sub ? `<div class="lv-node-sub">${highlightKeywords(n.sub)}</div>` : ''}
                ${desc ? `<div class="lv-node-desc">${highlightKeywords(desc)}</div>` : ''}
            </div>`;
    }

    /* ── 전체 흐름 렌더 ── */
    function renderFullFlow() {
        let html = '<div class="lv-flow">';
        FLOW_ROWS.forEach((row, i) => {
            if (i > 0) {
                const cls = row.arrowType === 'dashed' ? 'lv-arrow dashed' : 'lv-arrow';
                html += `<div class="${cls}">↓</div>`;
            }
            html += `
                <div class="lv-row" style="background:${row.bg};border-color:${row.color}30">
                    <div class="lv-row-header">
                        <span class="lv-row-title" style="color:${row.color}">${row.icon} ${row.label}</span>
                        ${row.note ? `<span class="lv-row-note">${row.note}</span>` : ''}
                    </div>
                    <div class="lv-nodes${row.sequential ? ' sequential' : ''}">`;

            row.nodeIds.forEach((id, ni) => {
                if (row.sequential && ni > 0) {
                    html += `<span class="lv-seq-arrow" style="color:${row.color}">→</span>`;
                }
                html += nodeCard(id, row.color);
            });

            html += `</div></div>`;
        });
        html += '</div>';
        return html;
    }

    /* ── 존 디테일 렌더 ── */
    function renderZoneDetail(zoneId) {
        const zone = subgraphs.find(s => s.id === zoneId);
        if (!zone) return '<p style="color:#64748b;padding:24px">존 정보를 찾을 수 없습니다.</p>';

        const zoneNodes = nodes.filter(n => n.parent === zoneId);
        let body = '';

        if (zoneId === 'CognitiveZone') {
            body = renderSequential(zoneNodes, zone.color, '순차 처리: 인식 → 세계 모델링 → 계획 수립 → 실행 결정');
        } else if (zoneId === 'LearningZone') {
            body = renderEvolution(zoneNodes, zone.color);
        } else if (zoneId === 'AssetBox') {
            body = renderAsset(zone.color);
        } else {
            body = renderGrid(zoneNodes, zone.color);
        }

        const zoneEdgesHtml = renderEdgeList(zoneNodes, zone.color);

        return `
            <div class="lv-zone-detail">
                <div class="lv-zone-header" style="border-color:${zone.color};background:${zone.bg||'rgba(255,255,255,.03)'}">
                    <h2 style="color:${zone.color}">${zone.label}</h2>
                    <p class="lv-zone-count">${zoneNodes.length}개 노드</p>
                </div>
                ${body}
                ${zoneEdgesHtml}
            </div>`;
    }

    function renderSequential(zoneNodes, color, subtitle) {
        let html = `<div class="lv-sequential-flow">
            <p class="lv-subtitle" style="color:${color}99">${subtitle}</p>
            <div class="lv-seq-row">`;
        zoneNodes.forEach((n, i) => {
            if (i > 0) html += `<span class="lv-big-arrow" style="color:${color}">→</span>`;
            html += nodeCard(n.id, color);
        });
        html += `</div></div>`;
        return html;
    }

    function renderGrid(zoneNodes, color) {
        if (!zoneNodes.length) return '<p style="color:#64748b;font-size:12px">이 존에 노드가 없습니다.</p>';
        return '<div class="lv-grid">' + zoneNodes.map(n => nodeCard(n.id, color)).join('') + '</div>';
    }

    function renderEvolution(zoneNodes, color) {
        const archivist = zoneNodes.find(n => n.id === 'Archivist');
        const evoNodes  = zoneNodes.filter(n => n.id !== 'Archivist');
        let html = '<div class="lv-evolution-layout">';

        if (archivist) {
            html += `<div class="lv-evo-section">
                <h3 style="color:${color}">📚 지식 아카이브</h3>
                <div class="lv-grid">${nodeCard(archivist.id, color)}</div>
            </div>`;
        }
        if (evoNodes.length) {
            html += `<div class="lv-evo-section">
                <h3 style="color:${color}">🌱 자기 진화 엔진 (순차 처리)</h3>
                <div class="lv-seq-row">`;
            evoNodes.forEach((n, i) => {
                if (i > 0) html += `<span class="lv-big-arrow" style="color:${color}">→</span>`;
                html += nodeCard(n.id, color);
            });
            html += `</div></div>`;
        }
        html += '</div>';
        return html;
    }

    function renderAsset(color) {
        const assetMgr   = nodes.find(n => n.id === 'ManagerAssent');
        const styleBox   = subgraphs.find(s => s.id === 'StyleBox');
        const infraBox   = subgraphs.find(s => s.id === 'InfraBox');
        const styleNodes = nodes.filter(n => n.parent === 'StyleBox');
        const infraNodes = nodes.filter(n => n.parent === 'InfraBox');

        let html = '<div class="lv-asset-layout">';

        if (assetMgr) {
            html += `<div class="lv-asset-section">
                <h3 style="color:#f59e0b">🗂 통합 자산 관리자</h3>
                <div class="lv-grid">${nodeCard(assetMgr.id, '#f59e0b')}</div>
            </div>`;
        }
        if (styleBox) {
            html += `<div class="lv-asset-section">
                <h3 style="color:${styleBox.color}">🎨 ${styleBox.label} — 디자인 자산</h3>
                <div class="lv-grid">${styleNodes.map(n => nodeCard(n.id, styleBox.color)).join('')}</div>
            </div>`;
        }
        if (infraBox) {
            html += `<div class="lv-asset-section">
                <h3 style="color:${infraBox.color}">🖥 ${infraBox.label} — 인프라 자산</h3>
                <div class="lv-grid">${infraNodes.map(n => nodeCard(n.id, infraBox.color)).join('')}</div>
            </div>`;
        }
        html += '</div>';
        return html;
    }

    function renderEdgeList(zoneNodes, color) {
        const ids = new Set(zoneNodes.map(n => n.id));
        const rel = edges.filter(e => ids.has(e.from) || ids.has(e.to));
        if (!rel.length) return '';

        const rows = rel.map(e => {
            const f = getNode(e.from), t = getNode(e.to);
            if (!f || !t) return '';
            const arrow = e.dashed ? '⟶ (참조)' : '→';
            return `<div class="lv-edge-item">
                <span class="lv-edge-from">${f.label}</span>
                <span class="lv-edge-arrow" style="color:${color}88">${arrow}</span>
                <span class="lv-edge-to">${t.label}</span>
                ${e.text ? `<span class="lv-edge-label">${e.text}</span>` : ''}
            </div>`;
        }).join('');

        return `<div class="lv-edges-section">
            <h4 style="color:${color}88">관계 정의</h4>
            <div class="lv-edges-list">${rows}</div>
        </div>`;
    }

    /* ── 렌더 진입점 ── */
    let currentZone = 'all';

    function renderContent() {
        const el = document.getElementById('layerContent');
        if (!el) return;
        el.innerHTML = currentZone === 'all' ? renderFullFlow() : renderZoneDetail(currentZone);
    }

    /* ── 레이어 패널 서브탭 구성 ── */
    function setupLayerPanel() {
        const tabBar = document.getElementById('layerTabBar');
        if (!tabBar) return;

        tabBar.innerHTML = ZONE_TABS.map(t =>
            `<button class="layer-tab-btn${t.id === 'all' ? ' active' : ''}" data-zone="${t.id}">
                ${t.icon} ${t.label}
             </button>`
        ).join('');

        tabBar.addEventListener('click', e => {
            const btn = e.target.closest('.layer-tab-btn');
            if (!btn) return;
            tabBar.querySelectorAll('.layer-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentZone = btn.dataset.zone;
            renderContent();
        });
    }

    /* ── 메인 탭 (다이어그램 ↔ 레이어 뷰) ── */
    function setupMainTabs() {
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const isDiagram = btn.dataset.tab === 'diagram';
                const dp = document.getElementById('diagramPanel');
                const lp = document.getElementById('layerPanel');

                if (isDiagram) {
                    dp.style.display = '';
                    lp.style.display = 'none';
                } else {
                    dp.style.display = 'none';
                    lp.style.display = 'flex';
                    renderContent();
                }
            });
        });
    }

    /* ── 초기화 ── */
    function init() {
        setupLayerPanel();
        setupMainTabs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
