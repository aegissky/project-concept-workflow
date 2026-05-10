const canvas = document.getElementById('diagramCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');
const wrapper = document.getElementById('canvasWrapper');
const tooltip = document.getElementById('tooltip');
const coordDisplay = document.getElementById('coords');


// 데이터: data/diagram-data.js 에서 로드 (glossaryData, subgraphs, nodes, edges)

let selectedTarget = null;
let offset = { x: 0, y: 0 };
let flowOffset = 0;
let minCanvasWidth = 2800;
let minCanvasHeight = 1800;
let scrollInterval = null;
const scrollThreshold = 60;
const scrollSpeed = 12;
let zoom = 1.0;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.15;

function applyZoom(newZoom) {
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    canvas.style.transform = `scale(${zoom})`;
    canvas.style.transformOrigin = '0 0';
    wrapper.style.width = (canvas.width * zoom) + 'px';
    wrapper.style.height = (canvas.height * zoom) + 'px';
    const display = document.getElementById('zoomDisplay');
    if (display) display.textContent = Math.round(zoom * 100) + '%';
}

function resize() {
    canvas.width = Math.max(container.clientWidth, minCanvasWidth);
    canvas.height = Math.max(container.clientHeight, minCanvasHeight);
    canvas.style.transform = `scale(${zoom})`;
    canvas.style.transformOrigin = '0 0';
    wrapper.style.width = (canvas.width * zoom) + 'px';
    wrapper.style.height = (canvas.height * zoom) + 'px';
}

function updateCanvasSize(x, y, w = 0, h = 0) {
    let changed = false;
    const margin = 300;
    if (x + w + margin > canvas.width) {
        canvas.width = x + w + margin;
        changed = true;
    }
    if (y + h + margin > canvas.height) {
        canvas.height = y + h + margin;
        changed = true;
    }
    if (changed) {
        wrapper.style.width = (canvas.width * zoom) + 'px';
        wrapper.style.height = (canvas.height * zoom) + 'px';
    }
    return changed;
}

function updateZoneSize(zoneId) {
    const zone = subgraphs.find(s => s.id === zoneId);
    if (!zone) return;
    const children = nodes.filter(n => n.parent === zoneId);
    if (children.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    children.forEach(n => {
        if (n.x < minX) minX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.x + n.w > maxX) maxX = n.x + n.w;
        if (n.y + n.h > maxY) maxY = n.y + n.h;
    });
    const padding = 25;
    const headerHeight = 35;
    zone.x = minX - padding;
    zone.y = minY - headerHeight;
    zone.w = (maxX - minX) + (padding * 2);
    zone.h = (maxY - minY) + headerHeight + padding;
    updateCanvasSize(zone.x, zone.y, zone.w, zone.h);
}

function updateAssetBoxSize() {
    const aBox = subgraphs.find(s => s.id === 'AssetBox');
    if (!aBox) return;
    const sBox = subgraphs.find(s => s.id === 'StyleBox');
    const iBox = subgraphs.find(s => s.id === 'InfraBox');
    const aMgr = nodes.find(n => n.id === 'ManagerAssent');
    const parts = [aMgr, sBox, iBox].filter(Boolean);
    if (!parts.length) return;
    const PAD = 25, HEADER = 38;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    parts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x + (p.w || 0) > maxX) maxX = p.x + (p.w || 0);
        if (p.y + (p.h || 0) > maxY) maxY = p.y + (p.h || 0);
    });
    aBox.x = minX - PAD;
    aBox.y = minY - HEADER;
    aBox.w = (maxX - minX) + PAD * 2;
    aBox.h = (maxY - minY) + HEADER + PAD;
    updateCanvasSize(aBox.x, aBox.y, aBox.w, aBox.h);
}

// AssetBox 내부 요소 여부 판별
function isAssetElement(target) {
    if (!target) return false;
    const assetNodeIds = ['ManagerAssent'];
    const assetZoneIds = ['StyleBox', 'InfraBox'];
    const assetParents = ['StyleBox', 'InfraBox'];
    return assetNodeIds.includes(target.id) ||
           assetZoneIds.includes(target.id) ||
           assetParents.includes(target.parent);
}

function handleAutoScroll(mouseX, mouseY) {
    const rect = container.getBoundingClientRect();
    const relX = mouseX - rect.left;
    const relY = mouseY - rect.top;
    let scrollX = 0, scrollY = 0;
    if (relX < scrollThreshold) scrollX = -scrollSpeed;
    else if (relX > rect.width - scrollThreshold) scrollX = scrollSpeed;
    if (relY < scrollThreshold) scrollY = -scrollSpeed;
    else if (relY > rect.height - scrollThreshold) scrollY = scrollSpeed;
    if (scrollX !== 0 || scrollY !== 0) {
        if (!scrollInterval) {
            scrollInterval = setInterval(() => {
                container.scrollLeft += scrollX;
                container.scrollTop += scrollY;
            }, 16);
        }
    } else { stopAutoScroll(); }
}

function stopAutoScroll() {
    if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
}

function drawEdge(edge) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;
    const x1 = fromNode.x + fromNode.w / 2;
    const y1 = fromNode.y + fromNode.h / 2;
    const x2 = toNode.x + toNode.w / 2;
    const y2 = toNode.y + toNode.h / 2;

    // 역방향 엣지가 존재하면 수직 방향으로 평행 오프셋 적용 (겹침 방지)
    const PARALLEL_OFFSET = 7;
    const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);
    let ox1 = x1, oy1 = y1, ox2 = x2, oy2 = y2;
    if (hasReverse) {
        const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) || 1;
        const px = -(y2 - y1) / len * PARALLEL_OFFSET;
        const py =  (x2 - x1) / len * PARALLEL_OFFSET;
        ox1 = x1 + px; oy1 = y1 + py;
        ox2 = x2 + px; oy2 = y2 + py;
    }

    ctx.beginPath();
    ctx.setLineDash(edge.dashed ? [6, 4] : []);
    ctx.strokeStyle = edge.from === 'TaskErr' ? '#f87171' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.moveTo(ox1, oy1);
    ctx.lineTo(ox2, oy2);
    ctx.stroke();
    if (!edge.dashed) {
        ctx.setLineDash([2, 18]);
        ctx.lineDashOffset = -flowOffset;
        ctx.strokeStyle = edge.from === 'TaskErr' ? '#fecaca' : '#818cf8';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.setLineDash([]);
    const angle = Math.atan2(oy2 - oy1, ox2 - ox1);
    const headlen = 10;
    ctx.fillStyle = ctx.strokeStyle;
    // to 방향 arrowhead
    ctx.beginPath();
    ctx.moveTo(ox2, oy2);
    ctx.lineTo(ox2 - headlen * Math.cos(angle - Math.PI / 6), oy2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(ox2 - headlen * Math.cos(angle + Math.PI / 6), oy2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
    // bi: true 시 from 방향 arrowhead 추가
    if (edge.bi) {
        ctx.beginPath();
        ctx.moveTo(ox1, oy1);
        ctx.lineTo(ox1 + headlen * Math.cos(angle - Math.PI / 6), oy1 + headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ox1 + headlen * Math.cos(angle + Math.PI / 6), oy1 + headlen * Math.sin(angle + Math.PI / 6));
        ctx.fill();
    }
    if (edge.text) {
        const mx = (ox1 + ox2) / 2;
        const my = (oy1 + oy2) / 2;
        ctx.font = 'bold 11px sans-serif';
        const textWidth = ctx.measureText(edge.text).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(mx - textWidth/2 - 4, my - 8, textWidth + 8, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(edge.text, mx, my + 5);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
    for(let x=0; x<canvas.width; x+=24) { ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); }
    for(let y=0; y<canvas.height; y+=24) { ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); }
    ctx.stroke();
    subgraphs.forEach(zone => {
        const isSelected = selectedTarget === zone;
        ctx.fillStyle = zone.bg; ctx.strokeStyle = zone.color;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.setLineDash(isSelected ? [5, 5] : []);
        ctx.beginPath(); ctx.roundRect(zone.x, zone.y, zone.w, zone.h, 15); ctx.fill(); ctx.stroke();
        ctx.setLineDash([]); ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left'; ctx.fillText(zone.label, zone.x + 15, zone.y + 24);
    });
    edges.forEach(drawEdge);
    nodes.forEach(node => {
        const isSelected = selectedTarget === node;
        ctx.shadowBlur = isSelected ? 20 : 8; ctx.shadowColor = isSelected ? node.color : 'rgba(0,0,0,0.5)';
        ctx.fillStyle = isSelected ? '#1e293b' : '#0f172a'; ctx.strokeStyle = node.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath(); ctx.roundRect(node.x, node.y, node.w, node.h, 10); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center'; ctx.fillText(node.label, node.x + node.w / 2, node.y + node.h / 2 + 5);
        if (node.sub) {
            ctx.font = '11px sans-serif'; ctx.fillStyle = node.color;
            ctx.fillText(node.sub, node.x + node.w / 2, node.y + node.h + 16);
        }
    });
    flowOffset += 0.5;
    requestAnimationFrame(draw);
}

function renderGlossary(filter = "") {
    const list = document.getElementById('glossaryList');
    const filtered = glossaryData.filter(item => 
        item.ko.includes(filter) || item.en.toLowerCase().includes(filter.toLowerCase()) || item.desc.includes(filter)
    );
    list.innerHTML = filtered.map(item => `
        <div class="p-3 bg-slate-800/50 border ${item.type === 'relation' ? 'border-indigo-900/50' : 'border-slate-700'} rounded-lg hover:border-indigo-500 transition mb-2">
            <div class="flex justify-between items-start mb-1">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] px-1.5 py-0.5 rounded ${item.type === 'relation' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400'} font-bold uppercase tracking-tighter">${item.type}</span>
                    <span class="font-bold ${item.type === 'relation' ? 'text-indigo-300' : 'text-slate-200'} text-sm">${item.ko}</span>
                </div>
                <span class="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">${item.en}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed pl-1">${item.desc}</p>
        </div>
    `).join('');
}

canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
    selectedTarget = nodes.findLast(n => pos.x >= n.x && pos.x <= n.x + n.w && pos.y >= n.y && pos.y <= n.y + n.h) ||
                     subgraphs.findLast(s => pos.x >= s.x && pos.x <= s.x + s.w && pos.y >= s.y && pos.y <= s.y + s.h);
    if (selectedTarget) {
        offset.x = pos.x - selectedTarget.x; offset.y = pos.y - selectedTarget.y;
        const isZone = subgraphs.some(s => s === selectedTarget);
        if (isZone) {
            selectedTarget.isZone = true;
            if (selectedTarget.id === 'AssetBox') {
                // AssetBox 드래그: StyleBox·InfraBox 서브존 + 전체 자산 노드 함께 이동
                const childNodes = nodes.filter(n =>
                    n.id === 'ManagerAssent' || n.parent === 'StyleBox' || n.parent === 'InfraBox'
                );
                selectedTarget.nodeRefs = childNodes.map(n => ({
                    node: n, dx: n.x - selectedTarget.x, dy: n.y - selectedTarget.y
                }));
                selectedTarget.zoneRefs = subgraphs
                    .filter(s => s.id === 'StyleBox' || s.id === 'InfraBox')
                    .map(s => ({ zone: s, dx: s.x - selectedTarget.x, dy: s.y - selectedTarget.y }));
            } else {
                selectedTarget.nodeRefs = nodes.filter(n => n.parent === selectedTarget.id)
                    .map(n => ({ node: n, dx: n.x - selectedTarget.x, dy: n.y - selectedTarget.y }));
                selectedTarget.zoneRefs = [];
            }
        } else { selectedTarget.isZone = false; }
    }
}

window.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseXInCanvas = (e.clientX - rect.left) / zoom;
    const mouseYInCanvas = (e.clientY - rect.top) / zoom;
    coordDisplay.innerText = `X: ${Math.round(mouseXInCanvas)}, Y: ${Math.round(mouseYInCanvas)}`;
    
    if (selectedTarget) {
        handleAutoScroll(e.clientX, e.clientY);
        const newX = mouseXInCanvas - offset.x; 
        const newY = mouseYInCanvas - offset.y;
        
        if (selectedTarget.isZone) {
            const dx = newX - selectedTarget.x;
            const dy = newY - selectedTarget.y;
            selectedTarget.nodeRefs.forEach(ref => { ref.node.x += dx; ref.node.y += dy; });
            if (selectedTarget.zoneRefs) {
                selectedTarget.zoneRefs.forEach(ref => { ref.zone.x += dx; ref.zone.y += dy; });
            }
            selectedTarget.x = newX; selectedTarget.y = newY;
            if (isAssetElement(selectedTarget)) updateAssetBoxSize();
        } else {
            selectedTarget.x = newX; selectedTarget.y = newY;
            if (selectedTarget.parent) updateZoneSize(selectedTarget.parent);
            if (isAssetElement(selectedTarget)) updateAssetBoxSize();
        }
        updateCanvasSize(selectedTarget.x, selectedTarget.y, selectedTarget.w || 0, selectedTarget.h || 0);
        
        tooltip.style.display = 'block'; 
        tooltip.style.left = (e.clientX + 15) + 'px'; 
        tooltip.style.top = (e.clientY + 15) + 'px';
        tooltip.innerHTML = `
            <div class="font-bold text-white mb-1">${selectedTarget.id || selectedTarget.label}</div>
            <div class="text-[10px] text-indigo-300">이동 중...</div>
        `;
    }
};

window.onmouseup = () => { 
    selectedTarget = null; 
    tooltip.style.display = 'none'; 
    stopAutoScroll(); 
};

// ─── 선 정리: Force-Directed Auto Layout ───────────────────────────────────
function autoLayout() {
    const ITER  = 220;      // 시뮬레이션 반복 횟수
    const K_REP = 16000;    // 반발력 (노드 간 밀어내기)
    const K_SPR = 0.020;    // 엣지 스프링 (연결 노드 당기기)
    const K_GRV = 0.016;    // 존 중력 (부모 존 중심 복귀)
    const DAMP  = 0.76;     // 감쇠 (진동 방지)
    const VMAX  = 32;       // 프레임당 최대 이동량(px)

    // 속도 초기화
    nodes.forEach(n => { n._vx = 0; n._vy = 0; });

    // 버튼 비활성화 (실행 중 중복 클릭 방지)
    const btn = document.getElementById('spreadBtn');
    btn.disabled = true;
    btn.textContent = '⏳ 정리 중...';

    function tick() {
        nodes.forEach(a => {
            const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
            let fx = 0, fy = 0;

            // ① 반발력: 가까운 노드를 밀어냄 (겹침 구간에서 3배 강화)
            nodes.forEach(b => {
                if (a === b) return;
                const bx = b.x + b.w / 2, by = b.y + b.h / 2;
                const dx = ax - bx, dy = ay - by;
                const d2 = dx * dx + dy * dy || 1;
                const d  = Math.sqrt(d2);
                const minGap = (a.w + b.w) / 2 + 60;
                const f = d < minGap ? K_REP * 3 / d2 : K_REP / d2;
                fx += (dx / d) * f;
                fy += (dy / d) * f;
            });

            // ② 엣지 스프링: 연결된 노드끼리 당김
            edges.forEach(e => {
                const otherId = e.from === a.id ? e.to
                              : e.to   === a.id ? e.from : null;
                if (!otherId) return;
                const b = nodes.find(n => n.id === otherId);
                if (!b) return;
                fx += (b.x + b.w / 2 - ax) * K_SPR;
                fy += (b.y + b.h / 2 - ay) * K_SPR;
            });

            // ③ 존 중력: parent 존 중심 방향으로 약하게 당김
            if (a.parent) {
                const z = subgraphs.find(s => s.id === a.parent);
                if (z) {
                    fx += (z.x + z.w / 2 - ax) * K_GRV;
                    fy += (z.y + z.h / 2 - ay) * K_GRV;
                }
            }

            // 속도 업데이트 (감쇠 적용)
            a._vx = Math.max(-VMAX, Math.min(VMAX, (a._vx + fx) * DAMP));
            a._vy = Math.max(-VMAX, Math.min(VMAX, (a._vy + fy) * DAMP));
        });

        // 위치 적용 + 캔버스 경계 제한
        nodes.forEach(n => {
            n.x = Math.max(20, Math.min(canvas.width  - n.w - 20, n.x + n._vx));
            n.y = Math.max(20, Math.min(canvas.height - n.h - 20, n.y + n._vy));
            if (n.parent) updateZoneSize(n.parent);
        });

        // AssetBox 수동 리사이즈 (직접 parent 자식 노드 없음)
        const aBox = subgraphs.find(s => s.id === 'AssetBox');
        const sBox = subgraphs.find(s => s.id === 'StyleBox');
        const iBox = subgraphs.find(s => s.id === 'InfraBox');
        const aMgr = nodes.find(n => n.id === 'ManagerAssent');
        if (aBox) {
            const parts = [aMgr, sBox, iBox].filter(Boolean);
            if (parts.length) {
                const minX = Math.min(...parts.map(p => p.x)) - 25;
                const minY = Math.min(...parts.map(p => p.y)) - 35;
                const maxX = Math.max(...parts.map(p => p.x + (p.w || 0))) + 25;
                const maxY = Math.max(...parts.map(p => p.y + (p.h || 0))) + 25;
                aBox.x = minX; aBox.y = minY;
                aBox.w = maxX - minX; aBox.h = maxY - minY;
            }
        }
    }

    let iter = 0;
    function animate() {
        tick();
        iter++;
        // 진행 표시 (25% / 50% / 75% 단계)
        if (iter === Math.floor(ITER * 0.25)) btn.textContent = '⏳ 25%...';
        if (iter === Math.floor(ITER * 0.5))  btn.textContent = '⏳ 50%...';
        if (iter === Math.floor(ITER * 0.75)) btn.textContent = '⏳ 75%...';
        if (iter < ITER) {
            requestAnimationFrame(animate);
        } else {
            // 완료: 임시 속도 프로퍼티 제거 및 버튼 복구
            nodes.forEach(n => { delete n._vx; delete n._vy; });
            btn.disabled = false;
            btn.innerHTML = '<span>⊞</span> 선 정리';
        }
    }
    animate();
}
// ───────────────────────────────────────────────────────────────────────────

const glossaryModal = document.getElementById('glossaryModal');
document.getElementById('glossaryBtn').onclick = () => { glossaryModal.classList.remove('hidden'); renderGlossary(); };
document.getElementById('closeGlossary').onclick = () => glossaryModal.classList.add('hidden');
document.getElementById('glossarySearch').oninput = (e) => renderGlossary(e.target.value);
document.getElementById('resetBtn').onclick = () => location.reload();
document.getElementById('spreadBtn').onclick = autoLayout;
document.getElementById('zoomInBtn').onclick = () => applyZoom(zoom + ZOOM_STEP);
document.getElementById('zoomOutBtn').onclick = () => applyZoom(zoom - ZOOM_STEP);
document.getElementById('zoomDisplay').onclick = () => applyZoom(1.0);

container.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        applyZoom(zoom + delta);
    }
}, { passive: false });

window.onload = () => { resize(); subgraphs.forEach(z => updateZoneSize(z.id)); draw(); };
window.onresize = resize;