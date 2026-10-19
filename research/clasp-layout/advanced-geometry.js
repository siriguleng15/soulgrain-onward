/* SoulGrain ONWARD — additional E–I geometry experiments.
 * Depends only on geometry-data.js; never changes A–D, the shoe trace, or models.
 * All lengths are 2D image units u, not mm or production-pattern dimensions.
 */
(function (scope) {
  'use strict';
  const G = scope.ClaspGeometry;
  if (!G) throw new Error('Load geometry-data.js before advanced-geometry.js');
  const D = Math.PI / 180, EPS = 1e-7;
  const P = G.point, add = G.add, sub = G.sub, mul = G.mul;
  const dot = G.dot, cross = G.cross, dist = G.distance;
  const midpoint = (a, b) => mul(add(a, b), 0.5);
  const norm = (v) => Math.hypot(v.x, v.y);
  const unit = (v) => mul(v, 1 / norm(v));
  const angle = (v) => Math.atan2(v.y, v.x) / D;
  const vector = (degrees) => P(Math.cos(degrees * D), Math.sin(degrees * D));
  const angleDelta = (a, b) => ((a - b + 540) % 360 + 360) % 360 - 180;
  const lineDistance = (p, a, u) => Math.abs(cross(sub(p, a), u)) / norm(u);
  const lineParameter = (p, a, u) => dot(sub(p, a), u) / dot(u, u);
  const boundaryResidual = (p) => lineDistance(p, G.boundaryStart, G.boundaryVector);
  const intersectBoundary = (a, u) => {
    const p = G.lineIntersection(G.boundaryStart, G.boundaryVector, a, u);
    if (!p) throw new Error('Parallel layout construction cannot locate a clasp');
    return P(p.x, p.y);
  };
  const makeClasp = (p, degrees, length = 160, width = 18, headRadius = 12) => ({
    x: p.x, y: p.y, angle: degrees, length, width, headRadius,
  });
  const seam = G.structureLines.find((s) => s.id === 'cuffSplit');
  const S0 = seam.points[0], S1 = seam.points[1];
  const eS = unit(sub(S1, S0)), nS = P(-eS.y, eS.x);
  const gaps = [midpoint(G.eyelets[1], G.eyelets[2]), midpoint(G.eyelets[2], G.eyelets[3])];
  const inheritedC = G.presets.find((p) => p.id === 'C');
  const eH = P(4 / 5, 3 / 5), hAngle = angle(eH);

  // E. Fix the structural origin/direction BEFORE evaluating root rectangles.
  // 100u is a disclosed common experimental width, not an observed shoe ratio.
  const rootWidth = 100;
  const rootRectangles = [2, 3, 5].map((root) => {
    const height = rootWidth / Math.sqrt(root);
    const origin = P(gaps[0].x, gaps[0].y);
    const bottom = add(origin, mul(nS, height));
    const centers = [intersectBoundary(origin, eS), intersectBoundary(bottom, eS)];
    const clasps = centers.map((p) => makeClasp(p, G.seamAngle));
    const opposite = add(add(origin, mul(eS, rootWidth)), mul(nS, height));
    const diagonal = sub(opposite, origin);
    const topRight = add(origin, mul(eS, rootWidth));
    const footParameter = dot(sub(topRight, origin), diagonal) / dot(diagonal, diagonal);
    const perpendicularFoot = add(origin, mul(diagonal, footParameter));
    return {
      root, origin, width: rootWidth, height, e: eS, n: nS, centers, clasps,
      corners: [origin, topRight, opposite, bottom],
      diagonal, diagonalLength:norm(diagonal), footParameter, perpendicularFoot,
      screening: G.validateLayout(clasps),
    };
  });
  const chosenRoot = rootRectangles[0];

  // F. Same real gap seeds form the BASE of an acute golden triangle. The
  // left-hand apex and both leg directions follow from the 36° apex angle.
  // Keeping C's 160u parts is an intentional controlled comparison. It fails
  // a local eyelet/seam check; do not quietly migrate seeds to hide that result.
  const baseVector = sub(gaps[1], gaps[0]), baseLength = norm(baseVector);
  const baseNormal = P(baseVector.y / baseLength, -baseVector.x / baseLength);
  const apex = sub(midpoint(gaps[0], gaps[1]), mul(baseNormal, baseLength / (2 * Math.tan(18 * D))));
  const triangle = { A: apex, B: gaps[0], C: gaps[1] };
  triangle.D = add(apex, mul(sub(triangle.C, apex), 1 / G.phi));
  triangle.legs = [sub(triangle.B, apex), sub(triangle.C, apex)];
  triangle.clasps = triangle.legs.map((v) => makeClasp(intersectBoundary(apex, v), angle(v)));

  // G. Inherit C's structural midpoints. For equal part length, translating
  // both midpoints by the same head vector preserves their connecting line.
  // Choosing the buckle axes perpendicular to that line makes them parallel
  // to the common chord of the actual-head-centred auxiliary Vesica circles.
  const gCenters = inheritedC.clasps.map((c) => P(c.x, c.y));
  const gAxis = unit(P(gCenters[1].y - gCenters[0].y, gCenters[0].x - gCenters[1].x));
  const gClasps = gCenters.map((p) => makeClasp(p, angle(gAxis)));
  function vesica(items) {
    const heads = items.map((c) => G.anchors(c).body);
    const d = dist(heads[0], heads[1]);
    if (d < 1e-9) return { heads, d, radius: d, intersections: null, physicalGap: -items[0].headRadius - items[1].headRadius };
    const center = midpoint(heads[0], heads[1]);
    const chord = unit(P(heads[1].y - heads[0].y, heads[0].x - heads[1].x));
    const offset = mul(chord, Math.sqrt(3) * d / 2);
    return { heads, d, radius: d, center, chord, chordAngle: angle(chord), intersections: [add(center, offset), sub(center, offset)], physicalGap: d - items[0].headRadius - items[1].headRadius };
  }
  const gVesica = vesica(gClasps);

  // H. The 4-horizontal / 3-vertical right-triangle direction is explicit.
  // It determines the axes through the structural gap seeds, whose R crossings
  // determine the midpoints. 36.8699° is measured from +x, not from the vertical.
  const hClasps = gaps.map((p) => makeClasp(intersectBoundary(p, eH), hAngle));

  // I. An actual head is tangent to a constructed, disclosed parallel reference.
  // A free tangent could always be slid to any circle; here the line is fixed
  // first from the structural gap and the adjacent conservative eyelet radius.
  // The 4:3 direction then determines L from the tangency equation, not vice versa.
  const tangentRadius = 12;
  const tangentGuides = gaps.map((p, i) => {
    const delta = Math.max(G.eyelets[i + 1].r, G.eyelets[i + 2].r);
    const referencePoint = add(p, mul(nS, delta));
    const length = (delta + tangentRadius) / dot(eH, nS);
    const clasp = makeClasp(add(p, mul(eH, length / 2)), hAngle, length, 18, tangentRadius);
    const head = G.anchors(clasp).body;
    const touch = sub(head, mul(nS, tangentRadius));
    return {
      seed: p, delta, referencePoint, length, clasp, head, touch,
      // This finite displayed segment is an auxiliary ruler, not a sewn seam.
      segment: [sub(touch, mul(eS, 50)), add(touch, mul(eS, 50))],
      sourceOffset: dot(sub(referencePoint, S0), nS),
      originalSeamHeadClearance: G.pointSegmentDistance(head, S0, S1) - tangentRadius,
      originalInfiniteSeamHeadClearance: Math.abs(dot(sub(head, S0), nS)) - tangentRadius,
    };
  });

  const presets = [
    {
      id: 'E', name: '根号矩形 · 同一结构种子', shortName: '根号矩形',
      clasps: chosenRoot.clasps,
      rationale: '以孔2/3中点G₁为矩形原点，长边沿原分割缝S；固定长边100u，分别研究长高比√2、√3、√5。顶边与底边和R的实际交点决定扣中心，主实验采用√2；其余并列记录筛查失败，不移动原鞋或种子补救。',
      formula: 'O=G₁; e=eS, n=Rot90°e; W=100u; Hₙ=W/√n; M₁=R∩(O+λe), M₂=R∩(O+Hₙn+λe), n∈{2,3,5}。',
      construction: ['先固定G₁与S方向，再选择共同试验宽100u。', '分别以100/√2、100/√3、100/√5求高度，保持同一正交框架。', '主√2的顶/底长边真交点控制中心；两轴沿S，不把各向异性缩放的图称作根号矩形。', '另画主对角线及从右上角向它的垂线；垂足参数n/(n+1)可核对，但这些分析线不冒称决定中心。'],
      limitations: '100u与主√2均为人为研究选择。√2下扣已接近孔3；√3/√5更密、碰孔，不能因数学名称而优先打样。',
      guides: { kind: 'root-rectangles', rectangles: rootRectangles, chosen: 2 },
      intent: '在同一结构原点和同一长边条件下，隔离比较√2、√3、√5的高度与扣间距影响。',
      decision: '保留为比例与净空的对照实验；主√2仍需复核，√3/√5不作为当前可缝候选。',
      manufacturing: '矩形网格可做定位模板，但保守孔包络筛查显示主√2下扣余量不足；需要真实纸样确认后才能调整，不能从100u换算生产毫米。',
      marketing: '可以展示“同一结构、三种根号比例的比较”，并公开被孔位淘汰的结果；不能宣称根号比例天然更美或源自传统蒙古数学。',
      freeParameters: ['共同实验长边W=100u。', '主实验选择√2；√3/√5作为未采用对照。', '扣件沿用C的L160/W18/r12；矩形比例不规定扣件长宽。'],
      evaluation: ['比例、坐标和交点可重算，√2/√3/√5是真正改变站位的变量。', '同向关系延续结构秩序，但更短的间距会逼近眼孔，不能只看网格。', '蒙古扣造型与现代比例实验并置，没有文化历史上的根号主张。', '主实验有临孔警告，另外两种碰孔，暂非直接量产定位。', '适合讲清筛选过程，失败比较同样属于真实设计故事。'],
    },
    {
      id: 'F', name: '黄金三角 · 结构约束负例', shortName: '黄金三角',
      clasps: triangle.clasps,
      rationale: '以真实孔间中点G₁/G₂作底边，构造顶点位于翻筒侧的36°–72°–72°黄金三角；两条等腰边的延长线与R相交，真实控制两扣中心与轴向。角平分线分出36°–36°–108°黄金钝三角。沿用C扣件尺寸时，上扣触孔压缝，明确记录为负例。',
      formula: 'B=G₁,C=G₂; A=(B+C)/2−N|BC|/(2tan18°); |AB|/|BC|=φ; D=A+(C−A)/φ; M₁=R∩AB, M₂=R∩AC。',
      construction: ['从G₁/G₂建立底边，顶角36°求A，绝非先任意放两扣再补三角。', '扣轴分别沿AB/AC的真实方向，两腿延长与R求交。', 'BD平分B角；ABD为36°/36°/108°，与ABC的36°/72°/72°分开说明。', '保持C的160u扣件进行控制比较，公开上扣触孔与压缝结果。'],
      limitations: '36°/72°/108°不是同一三角形的三个角。黄金三角本身成立不等于布局适合鞋面；当前上扣存在明确结构干涉。',
      guides: { kind: 'golden-triangles', triangle },
      intent: '验证真实黄金三角边方向进入既有孔位体系后，究竟获得秩序还是制造干涉。',
      decision: '当前保留为负例与研究，不推荐直接打样；若后续改变扣件尺寸，应重新检查并披露尺寸自由度。',
      manufacturing: '两种角度增加定位工序；当前上扣触及鞋身孔2并压鞋眼片下缝，不能以数学成立代替工艺通过。',
      marketing: '可诚实展示“黄金三角成立但结构筛查淘汰”的过程；不声称黄金三角决定最佳设计，也不附会传统服饰历史。',
      freeParameters: ['顶点选在底边的翻筒一侧，而不是镜像的鞋身一侧。', '顶角选36°，由此产生黄金等腰三角。', '保留C扣件L160/W18/r12作为同规格比较；不为消除失败偷偷迁移种子。'],
      evaluation: ['黄金三角与黄金钝三角定义精确，扣轴确由边方向生成。', '明显的方向张力同时带来上扣结构干涉，当前不以美感掩盖。', '三角关系是当代构图，不能作为蒙古扣历史数学证据。', '上扣碰孔且压缝，当前不推荐工厂照图缝制。', '可讲述数学方案被鞋面约束修正的真实过程，避免伪科学式宣传。'],
    },
    {
      id: 'G', name: '辅助双圆 · 公共弦定向', shortName: '双圆公共弦',
      clasps: gClasps,
      rationale: '继承C从孔间点和缝线求得的两中心，保持等长扣件；令扣轴垂直两中心连线。两真实圆头成为辅助圆的圆心，辅助半径ρ等于头心距d，Vesica公共弦与两扣轴平行。小圆头本身不重叠；辅助圆只提供方向比较。',
      formula: 'Mᵢ=Mᵢ,C; e⊥(M₂−M₁); Hᵢ=Mᵢ+(L/2)e; ρ=|H₂−H₁|; J±=(H₁+H₂)/2±(√3/2)ρn; 扣轴∥J+J−。',
      construction: ['先固定C的结构中心，不由大辅助圆任意找新鞋型。', '等长扣件使两头心连线与两中点连线平行，公共弦方向反过来确定两轴。', '以实际头心画两ρ=d辅助圆，画出两个真实交点；头半径仍12u。'],
      limitations: '任意两不同点都能补画ρ=d的Vesica，因此透镜本身不是独特美学证明。本实验相对C只改变约0.89°方向，增量有限；不能把辅助大圆说成两个真实扣头交叠。',
      guides: { kind: 'vesica', vesica: gVesica },
      intent: '控制中心与尺寸不变，只比较“随缝线方向”和“随双圆公共弦方向”是否产生值得保留的差异。',
      decision: '作为C的轻微方向对照，暂不因辅助图形复杂而优先；需隐藏辅助圆后审视是否真正改善。',
      manufacturing: '同长同角有利于模板定位，当前二维筛查通过；辅助圆不需要做在鞋上，也不解决布料展开与固定强度。',
      marketing: '可以说“以真实扣头为圆心比较公共弦方向”；必须同时标ρ_guide和r_head，不能宣称真实扣头构成重叠透镜或传统神圣几何。',
      freeParameters: ['直接继承C的两中点与L160/W18/r12。', '选择扣轴平行辅助公共弦，这是一项设计规则，不是文化史事实。', '辅助半径ρ=d，不等于实体圆头半径r=12u。'],
      evaluation: ['实际圆心、辅助半径和交点可验证，公共弦真实控制轴向。', '相对C只有约0.89°变化；应脱离辅助大圆比较真实成鞋差异。', '仅保留指定扣形和跨布片关系，不把Vesica包装为蒙古文化史。', '当前无图上警告且可统一方向，但辅助圆本身不增加制造价值。', '可作透明的几何对照故事；不能把任何两点都可补画的图形说成唯一来源。'],
    },
    {
      id: 'H', name: '3∶4∶5 · 孔间基准定位', shortName: '3∶4∶5定位',
      clasps: hClasps,
      rationale: '继承C的两孔间中点，改用水平4、竖向3的直角三角方向线，与R求交定位两中心。每枚扣两锚点的差向量为(4k,3k)，锚距为5k；相对水平角是36.8699°，不是把3横4竖与角度混淆。',
      formula: 'e=(4,3)/5; Mᵢ=R∩{Gᵢ+λe}; Qᵢ−Pᵢ=(4k,3k), L=5k, α=atan2(3,4)=36.86989765°; 预设k=32u。',
      construction: ['原点仍取G₁/G₂；与C对照时只改变轴向规则。', '过孔间点作(4,3)方向线与R求交，两扣同长同角。', '在实际两锚点之间标出4k横边、3k竖边、5k斜边，完整保存坐标。'],
      limitations: '3:4:5是施加的定位规则，不是从手绘测得原鞋的天然比例。36.87°从水平量取；若交换横竖腿，角度会变为53.13°。',
      guides: { kind: 'pythagorean', direction: eH, seeds: gaps },
      intent: '以可用横竖定位的简单直角关系替代黄金叙事，测试其是否更易转成工厂定位模板。',
      decision: '值得和C等结构方案进行纸样对照；当前二维筛查通过，尚非最终推荐或量产定稿。',
      manufacturing: '同角同规格且4k/3k可转成定位孔或治具；实际纸样仍要重建坐标、缝份、放码和活动余量。',
      marketing: '可以展示“从孔间基准出发的4横3竖定位”，不用宣称数学证明美或给传统文化虚构勾股历史。',
      freeParameters: ['选择水平4、竖向3而非反向配比。', '保留C扣件L160/W18/r12，故k=L/5=32u。', '中心仍取与R的交点，R为参考弦而非拉直真实布边。'],
      evaluation: ['端点差、直角和勾股关系直接可核，中心来源于既有孔间基准。', '方向比C更陡，当前孔位与留白筛查良好，仍需成鞋视觉比较。', '几何只解释现代定位，文化表达仍来自真实扣形和服饰结构关系。', '横竖定位清楚、两扣同规格，当前通过二维初筛但未验证材料。', '故事易解释且不依赖神秘比例，可展示从结构到定位模板的过程。'],
    },
    {
      id: 'I', name: '圆头切线 · 偏置条件求长', shortName: '偏置切线',
      clasps: tangentGuides.map((g) => g.clasp),
      rationale: '以孔间点Gᵢ作为实际翻筒锚点，扣轴沿4:3方向。先将S的平行参考线经过Gᵢ+δnS，δ取相邻保守孔包络半径20u，再要求实际圆头r=12u与该固定辅助线相切，由此解出锚距。切线不是实体缝线，扣轴穿圆心也不称作切线。',
      formula: 'Pᵢ=Gᵢ; e=(4,3)/5; Tᵢ=Gᵢ+δnS+λeS; δ=max(r_eye,a,r_eye,b)=20u; Q=P+Le; L=(δ+r_head)/(e·nS)=151.824418u。',
      construction: ['先由孔间点、原分割缝方向与保守孔包络确定偏置参考线，不事后任意平移切线。', '实际圆头中心到Tᵢ的法向距离必须等于r，联立4:3轴向解L。', '标出实际切点K=Q−rnS，另报圆头到原有限S段及完整扣形到所有关键缝的净距。', 'S的延长和偏置只用于定位研究；鞋面不新增这些实体缝线。'],
      limitations: '任意圆总可补画切线，本实验的可追溯增量在于先由孔位固定辅助线，再反求L。δ=20u是描图包络选参，不是缝份；辅助切线主要落在原S的延长区域，不能冒充原实体缝线的相切。',
      guides: { kind: 'offset-tangency', lines: tangentGuides, direction: eH },
      intent: '检验“先给结构参考线，再用实际圆头求长度”是否比随意滑动圆与线更可复算。',
      decision: '保留为可追溯切线研究和纸样讨论；当前筛查通过，但较长的S延长与人为偏置需要审慎解释。',
      manufacturing: '给定的偏置线是定位辅助，不增加真实缝线。锚点、L与切点可做模板，但20u不能当生产间距，必须重取真实眼孔与纸样。',
      marketing: '可以讲述由孔间点和偏置参考求得实际圆头切点；须披露线是辅助延长/平行线，不说原鞋缝线与扣头天然相切。',
      freeParameters: ['轴向选用H的(4,3)/5，便于控制对照。', 'δ取一倍相邻孔的保守圆形包络半径20u；倍数1是一项设计选择。', '圆头r=12u、扣身宽18u沿用既有符号；由约束求得L，不独立挑选好看的L。', '图示切线段以切点为中点取100u长，仅用于看清有限辅助关系。'],
      evaluation: ['切点、垂直关系、实际圆头半径及反求L均可核对。', '两扣同长同角且当前留白可读；偏置线不应喧宾夺主。', '相切只属于当代几何方法，不附会传统蒙古扣数学史。', '当前图上筛查通过；仍依赖真实纸样取种子及重估20u偏置。', '能讲清“固定参考后求解”的过程，但必须展示辅助线与实体缝线之别。'],
    },
  ];

  // SVG helpers use the existing page classes and remain dependency-free.
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
  const fmt = (v, digits = 2) => Number(v).toFixed(digits);
  const line = (a, b, cls = 'geom-guide', extra = '') => `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" ${extra}/>`;
  const text = (p, value, cls = 'svg-label') => `<text class="${cls}" x="${p.x}" y="${p.y}">${esc(value)}</text>`;
  const dotSvg = (p, color = '#85709b') => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}"/>`;
  const poly = (points, close = false, extra = '') => `<${close ? 'polygon' : 'polyline'} class="geom-guide" points="${points.map((p) => `${p.x},${p.y}`).join(' ')}" ${extra}/>`;
  const caption = (lines) => lines.map((s, i) => text(P(763, 208 + i * 19), s)).join('');
  const extend = (a, v, lo, hi) => line(add(a, mul(v, lo)), add(a, mul(v, hi)), 'extension-guide');
  const rightAngle = (corner, u, v, size = 5) => poly([add(corner, mul(u, size)), add(add(corner, mul(u, size)), mul(v, size)), add(corner, mul(v, size))]);
  const arc = (center, a, b, radius = 18) => {
    let delta = angleDelta(angle(b), angle(a));
    const start = add(center, mul(unit(a), radius)), end = add(center, mul(unit(b), radius));
    return `<path class="geom-guide" d="M${start.x} ${start.y} A${radius} ${radius} 0 0 ${delta >= 0 ? 1 : 0} ${end.x} ${end.y}"/>`;
  };
  function renderGuides(p) {
    if (!p || !presets.some((q) => q.id === p.id)) return '';
    let s = '';
    if (p.id === 'E') {
      rootRectangles.forEach((r, i) => {
        s += poly(r.corners, true, `style="stroke:${i ? '#b7aebb' : '#85709b'};opacity:${i ? '.22' : '.45'};stroke-dasharray:${i ? '3 4' : 'none'}"`);
        s += line(r.corners[3], r.corners[2], 'extension-guide', `style="opacity:${i ? '.18' : '.35'}"`);
        r.centers.forEach((c) => { s += dotSvg(c, i ? '#b7aebb' : '#85709b'); });
      });
      const r=chosenRoot,diagUnit=unit(r.diagonal),altitudeUnit=unit(sub(r.corners[1],r.perpendicularFoot));
      s+=line(r.origin,r.corners[2],'geom-guide','style="opacity:.35"')+line(r.corners[1],r.perpendicularFoot,'extension-guide','style="opacity:.35"');
      s+=rightAngle(r.perpendicularFoot,diagUnit,altitudeUnit,3)+dotSvg(r.perpendicularFoot,'#b16445');
      s += dotSvg(gaps[0], '#b16445');
      // Rigidly remove the S rotation and translate the SAME geometry. No
      // scaling, anisotropy, shoe deformation, or new positioning rule is used.
      // The main shoe keeps only faint true construction lines; crowded labels
      // are placed in this explicitly separate local reference diagram.
      const origin=P(979,321);
      const localMap=(q)=>P(origin.x+dot(sub(q,r.origin),eS),origin.y+dot(sub(q,r.origin),nS));
      s+='<g class="root-local-inset"><rect x="963" y="273" width="192" height="163" rx="3" fill="#fbfaf8" stroke="#d9d1dd" stroke-width="1"/>';
      s+=text(P(971,288),'移除旋转的局部示意','svg-small');
      s+=text(P(971,302),'刚性旋转／平移；非鞋体位置或mm','svg-small');
      rootRectangles.forEach((q,i)=>{
        s+=poly(q.corners.map(localMap),true,`style="stroke:${i?'#aea4b6':'#85709b'};opacity:${i?'.62':'1'};stroke-dasharray:${i?'3 4':'none'}"`);
        s+=text(add(localMap(q.corners[2]),P(8,3)),`√${q.root}${i?' 对照':' 主'}`,'svg-small');
      });
      s+=line(localMap(r.origin),localMap(r.corners[2]),'geom-guide','style="opacity:.55"');
      s+=line(localMap(r.corners[1]),localMap(r.perpendicularFoot),'extension-guide','style="opacity:.7"');
      const f=localMap(r.perpendicularFoot);
      s+=rightAngle(f,unit(P(r.diagonal.x*eS.x+r.diagonal.y*eS.y,r.diagonal.x*nS.x+r.diagonal.y*nS.y)),unit(sub(localMap(r.corners[1]),f)),3);
      s+=dotSvg(f,'#b16445')+line(P(1017,356),f,'extension-guide','style="stroke-width:.8"')+text(P(1006,353),'F','svg-small');
      const localM=r.centers.map(localMap);
      const rStart=localMap(sub(r.centers[0],mul(G.boundaryVector,.03)));
      const rEnd=localMap(add(r.centers[1],mul(G.boundaryVector,.03)));
      s+=line(rStart,rEnd,'geom-guide','style="stroke:#4f7184;stroke-dasharray:3 3"');
      localM.forEach((q,i)=>{s+=dotSvg(q,'#4f7184')+text(add(q,P(8,i?-3:12)),`M${i+1}`,'svg-small');});
      s+=text(P(1071,354),'R','svg-small')+text(P(1009,316),'100u','svg-small');
      s+=text(P(971,420),'F=2/3：对角分析，不决定扣中心','svg-small');
      s+='</g>';
      s += caption(['E / 同一G₁、同一S方向、同一长边100u', '边/R交点定位；对角与垂线仅作分析', '√2临孔；√3、√5碰孔，保留失败比较']);
    } else if (p.id === 'F') {
      const tr = triangle;
      s += poly([tr.A, tr.B, tr.C], true, 'style="stroke-dasharray:none"');
      s += line(tr.B, tr.D, 'extension-guide');
      tr.legs.forEach((v, i) => { s += extend(tr.A, v, 0, 2.25) + dotSvg(p.clasps[i]); });
      s += arc(tr.A, sub(tr.B, tr.A), sub(tr.C, tr.A), 22);
      s += arc(tr.D, sub(tr.A, tr.D), sub(tr.B, tr.D), 12);
      s += text(add(tr.A, P(-38, -10)), 'A · 36°') + text(add(tr.B, P(5, -15)), 'B=G₁ · 72°');
      s += text(add(tr.C, P(-64, 18)), 'C=G₂ · 72°') + text(add(tr.D, P(-43, 17)), 'D · 108°');
      s += caption(['F / ABC：36°–72°–72°，等腰边/底边=φ', 'ABD：36°–36°–108°，长边/短边=φ', '扣轴真沿两腿；默认160u上扣触孔压缝']);
    } else if (p.id === 'G') {
      const v = gVesica;
      const jp=v.intersections[0],jm=v.intersections[1];
      s+=`<path d="M${jp.x} ${jp.y} A${v.radius} ${v.radius} 0 0 1 ${jm.x} ${jm.y} A${v.radius} ${v.radius} 0 0 1 ${jp.x} ${jp.y} Z" fill="#c6b8d6" fill-opacity=".22" stroke="none"/>`;
      v.heads.forEach((h, i) => {
        s += `<circle class="geom-guide" cx="${h.x}" cy="${h.y}" r="${v.radius}" style="stroke-dasharray:none;opacity:.65"/>`;
        s += dotSvg(h) + text(add(h, P(7, i ? 22 : -17)), `H${i + 1} · 实际圆头心`);
      });
      s += line(v.heads[0], v.heads[1]);
      s += line(v.intersections[0], v.intersections[1], 'extension-guide');
      v.intersections.forEach((j, i) => { s += dotSvg(j, '#b16445') + text(add(j, P(5, i ? -10 : 18)), i ? 'J−' : 'J+'); });
      const radiusEnd = add(v.heads[0], P(v.radius, 0));
      s += line(v.heads[0], radiusEnd) + text(add(midpoint(v.heads[0], radiusEnd), P(0, -7)), 'ρ=d');
      s += caption(['G / 真实圆头心H₁、H₂；辅助圆ρ=d', `ρ=${fmt(v.radius)}u，预设实体r_head=12u`, '扣轴∥公共弦；实体圆头没有互相重叠']);
    } else if (p.id === 'H') {
      p.clasps.forEach((c, i) => {
        const a = G.anchors(c), corner = P(a.body.x, a.cuff.y), k = c.length / 5;
        s += line(a.cuff, corner) + line(corner, a.body) + line(a.cuff, a.body, 'extension-guide');
        s += rightAngle(corner, P(-1, 0), P(0, 1));
        s += dotSvg(gaps[i], '#b16445');
        if (i === 0) {
          s += text(add(midpoint(a.cuff, corner), P(-6, -9)), `4k=${fmt(4*k,0)}u`);
          s += text(add(midpoint(corner, a.body), P(8, 0)), `3k=${fmt(3*k,0)}u`);
          s += text(add(midpoint(a.cuff, a.body), P(-53, 24)), `5k=${fmt(5*k,0)}u`);
          const angleLeader=add(a.cuff,mul(vector(hAngle/2),23));
          s += arc(a.cuff, P(1,0), eH, 20)+line(P(404,381),angleLeader,'extension-guide','style="stroke-width:.9"')+text(P(350,378),'36.87°');
        }
      });
      s += caption(['H / 横4k、竖3k、斜5k；预设k=32u', '方向过真实G₁/G₂，与R交点控制中心', '36.8699°从水平量取，非竖直量角']);
    } else if (p.id === 'I') {
      s += extend(S0, eS, norm(sub(S1, S0)), 560);
      tangentGuides.forEach((t, i) => {
        s += line(t.segment[0], t.segment[1], 'extension-guide');
        s += line(t.seed, t.referencePoint) + text(add(midpoint(t.seed, t.referencePoint), P(-39, 0)), 'δ=20u');
        s += line(t.head, t.touch) + rightAngle(t.touch, eS, nS, 4);
        s += dotSvg(t.touch, '#b16445') + text(add(t.touch, P(9, -9)), `K${i + 1} · 切点`);
        s += text(add(t.segment[1], P(8, 2)), `T${i + 1} ∥ S`);
      });
      s += caption(['I / 先固定孔位偏置参考Tᵢ，再由r反求L', `L=(20+12)/(e·nS)=${fmt(tangentGuides[0].length)}u`, 'Tᵢ是延长/平行辅助线；扣轴不是切线']);
    }
    return `<g class="advanced-construction" data-experiment="${p.id}">${s}</g>`;
  }

  function residual(label, value, unitName = 'u', tolerance = EPS) {
    return { label, value, unit: unitName, tolerance, satisfied: Number.isFinite(value) && Math.abs(value) <= tolerance };
  }
  function analysis(p, items) {
    if (!p || !presets.some((q) => q.id === p.id) || !Array.isArray(items) || items.length !== 2) return null;
    const rs = [], details = {};
    if (p.id === 'E') {
      const r = chosenRoot;
      items.forEach((c, i) => {
        rs.push(residual(`扣${i+1}距√2规定长边`, lineDistance(c, i ? r.corners[3] : r.origin, eS)));
        rs.push(residual(`扣${i+1}距交界参考弦R`, boundaryResidual(c)));
        rs.push(residual(`扣${i+1}轴对S偏角`, angleDelta(c.angle, G.seamAngle), '°'));
      });
      details.rootRectangles = rootRectangles.map((r) => ({ root:r.root, width:r.width, height:r.height, ratio:r.width/r.height, centers:r.centers, diagonalLength:r.diagonalLength, perpendicularFoot:r.perpendicularFoot, footParameter:r.footParameter, valid:r.screening.valid, warnings:r.screening.warnings, errors:r.screening.errors }));
      details.adopted = '只有√2规定主中心；√3/√5是固定100u同原点条件下的失败比较，未自动迁移。';
    } else if (p.id === 'F') {
      items.forEach((c, i) => {
        rs.push(residual(`扣${i+1}中点距黄金三角腿延长线`, lineDistance(c, triangle.A, triangle.legs[i])));
        rs.push(residual(`扣${i+1}轴对三角腿偏角`, angleDelta(c.angle, angle(triangle.legs[i])), '°'));
        rs.push(residual(`扣${i+1}中点距R`, boundaryResidual(c)));
      });
      details.triangle = { A:triangle.A, B:triangle.B, C:triangle.C, D:triangle.D, acuteAngles:[36,72,72], gnomonAngles:[36,36,108], equalLeg:dist(triangle.A,triangle.B), base:dist(triangle.B,triangle.C), ratio:dist(triangle.A,triangle.B)/dist(triangle.B,triangle.C) };
      details.warning = '几何可完全成立而结构仍失败。原负例保留，改扣件尺寸后必须重新筛查；不能仅凭三角成立称设计成功。';
    } else if (p.id === 'G') {
      const current = vesica(items);
      current.heads.forEach((h, i) => { rs.push(residual(`扣${i+1}实际圆头距固定辅助圆心`, dist(h, gVesica.heads[i]))); });
      if (current.intersections) items.forEach((c, i) => { rs.push(residual(`扣${i+1}轴对当前两头心公共弦偏角`, angleDelta(c.angle, current.chordAngle), '°')); });
      else rs.push(residual('两圆头重合，Vesica构造退化', Infinity));
      items.forEach((c, i) => { rs.push(residual(`扣${i+1}中点偏离继承C位置`, dist(c, gCenters[i]))); });
      details.currentAuxiliary = current;
      details.referenceAuxiliary = gVesica;
      details.warning = '图中辅助圆固定在预设圆心，手调后可能已不在实际圆头上；任意两头心都可重新补画ρ=d圆，不代表原方向约束自动仍成立。实体圆头净距另报，不称实体透镜。';
    } else if (p.id === 'H') {
      details.endpointTriangles = items.map((c, i) => {
        const a = G.anchors(c), delta = sub(a.body, a.cuff), k = c.length / 5;
        rs.push(residual(`扣${i+1}横边−4k`, delta.x - 4*k));
        rs.push(residual(`扣${i+1}竖边−3k`, delta.y - 3*k));
        rs.push(residual(`扣${i+1}中点距孔间4:3方向线`, lineDistance(c, gaps[i], eH)));
        rs.push(residual(`扣${i+1}中点距R`, boundaryResidual(c)));
        return { P:a.cuff, Q:a.body, k, horizontal:delta.x, vertical:delta.y, hypotenuse:dist(a.cuff,a.body), angleFromHorizontal:c.angle };
      });
    } else if (p.id === 'I') {
      details.tangencies = items.map((c, i) => {
        const t = tangentGuides[i], a = G.anchors(c), signedDistance = dot(sub(a.body, t.referencePoint), nS);
        const touch = sub(a.body, mul(nS, signedDistance));
        const touchParameter = lineParameter(touch, t.segment[0], sub(t.segment[1], t.segment[0]));
        rs.push(residual(`扣${i+1}翻筒锚点偏离G${i+1}`, dist(a.cuff, t.seed)));
        rs.push(residual(`扣${i+1}实际头心至Tᵢ法距−r`, signedDistance - c.headRadius));
        rs.push(residual(`扣${i+1}轴对4:3方向偏角`, angleDelta(c.angle, hAngle), '°'));
        if (touchParameter < -EPS || touchParameter > 1+EPS) rs.push(residual(`扣${i+1}切点超出显示辅助线段`, Math.max(-touchParameter, touchParameter-1)));
        return {
          referencePoint:t.referencePoint, delta:t.delta, sourceOffset:t.sourceOffset,
          actualHead:a.body, radius:c.headRadius, touch, touchParameter,
          headToReferenceLine:Math.abs(signedDistance),
          headToOriginalFiniteS:G.pointSegmentDistance(a.body,S0,S1)-c.headRadius,
          headToOriginalInfiniteS:Math.abs(dot(sub(a.body,S0),nS))-c.headRadius,
          sourceSeamProjectionParameter:lineParameter(touch,S0,sub(S1,S0)),
          note:'Tᵢ为预先构造的平行/延长参考；headToOriginalFiniteS是对有限S弦段的净距，并非对原曲线墨迹的工业实测。',
        };
      });
      details.warning = '切线不是实体缝线；扣轴穿圆心而非相切。只有当前锚点、方向、圆半径和切线残差同时成立，才保留本轮切线推导。';
    }
    const screening = G.validateLayout(items);
    const relationSatisfied = rs.every((r) => r.satisfied);
    const geometricSummary = relationSatisfied ? '当前参数保持本实验声明的几何关系。' : '当前参数已偏离原构造；原辅助图仅供对照，不再宣称精确满足。';
    const riskSummary = !screening.valid ? ` 二维筛查有${screening.errors.length}项干涉错误，数学成立也不代表可缝。` : screening.warnings.length ? ` 二维筛查有${screening.warnings.length}项需复核风险。` : ' 当前二维筛查未报错误或警告，仍不是量产验证。';
    return { id:p.id, summary:geometricSummary+riskSummary, relationSatisfied, residuals:rs, details, screening, coordinateSystem:G.coordinateSystem, disclaimer:G.disclaimer, traceUncertainty:G.traceUncertainty };
  }

  // Idempotent addition; existing A–D objects and their numeric values are intact.
  presets.forEach((preset) => { if (!G.presets.some((p) => p.id === preset.id)) G.presets.push(preset); });
  scope.ClaspAdvanced = {
    version:'1.0', presets:G.presets.filter((p) => ['E','F','G','H','I'].includes(p.id)),
    renderGuides, analysis,
    constructions:{ gaps, eS, nS, eH, rootRectangles, triangle, vesica:gVesica, tangentGuides },
    helpers:{ lineDistance, lineParameter, vesica, angleDelta },
    note:'二维结构化实验；数学规则是现代设计选择，不是传统文化历史证明，所有u均非毫米。',
  };
})(typeof globalThis === 'undefined' ? window : globalThis);
