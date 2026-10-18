/* SoulGrain ONWARD — 2D clasp-layout research.
 * Standalone/browser/Node reusable. All coordinates are reference-image units u,
 * NOT millimetres or production-pattern measurements. No external dependencies.
 */
(function (scope) {
  'use strict';
  const PHI = (1 + Math.sqrt(5)) / 2;
  const DEG = Math.PI / 180;
  const boundaryStart = { x: 600, y: 270 };
  const boundaryEnd = { x: 418, y: 650 };
  const point = (x, y) => ({ x, y });
  const add = (a, b) => point(a.x + b.x, a.y + b.y);
  const sub = (a, b) => point(a.x - b.x, a.y - b.y);
  const mul = (a, k) => point(a.x * k, a.y * k);
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const boundaryVector = sub(boundaryEnd, boundaryStart);
  const boundaryLength = Math.hypot(boundaryVector.x, boundaryVector.y);
  const boundaryNormal = point(boundaryVector.y / boundaryLength, -boundaryVector.x / boundaryLength);
  const atBoundary = (t) => add(boundaryStart, mul(boundaryVector, t));
  const angleOf = (v) => Math.atan2(v.y, v.x) / DEG;
  const boundaryAngle = angleOf(boundaryVector);

  // The visibly free cuff edge is traced as a straight design datum. The ink
  // itself is curved, thick, and perspective-distorted. Point reading is about
  // ±4 u; replacing the visibly curved front edge with this chord creates up
  // to roughly 10–15 u deviation, deliberately disclosed as a construction datum.
  // The visible shoe-body region includes its own eyelet facing, not the tongue.
  const regions = {
    cuff: [point(186, 218), point(490, 242), point(600, 270), point(418, 650),
      point(381, 670), point(323, 619), point(201, 550), point(83, 505),
      point(115, 432), point(148, 344), point(174, 236)],
    body: [point(600, 270), point(631, 310), point(676, 364), point(760, 410),
      point(959, 466), point(1045, 574), point(936, 603), point(805, 620),
      point(676, 617), point(441, 638), point(418, 650)],
  };
  const eyelets = [
    [510, 284, 19, '翻筒孔1'], [475, 368, 20, '翻筒孔2'],
    [442, 440, 20, '翻筒孔3'], [410, 513, 19, '翻筒孔4'],
    [381, 583, 19, '翻筒孔5'], [583, 338, 19, '鞋身孔1'],
    [626, 395, 19, '鞋身孔2'], [678, 435, 19, '鞋身孔3'],
    [741, 457, 19, '鞋身孔4'], [802, 478, 19, '鞋身孔5'],
    [865, 487, 19, '鞋身孔6'], [928, 500, 19, '鞋身孔7'],
  ].map(([x, y, r, name]) => ({ x, y, r, name }));
  const structureLines = [
    { id: 'cuffTop', name: '翻筒上缘', points: [point(186, 218), point(490, 242), point(600, 270)] },
    { id: 'cuffSplit', name: '翻筒分割缝 S', points: [point(148, 344), point(398, 459)] },
    { id: 'cuffLowerSplit', name: '翻筒下分割缝', points: [point(115, 432), point(346, 555)] },
    { id: 'cuffHem', name: '翻筒下缘', points: [point(83, 505), point(201, 550), point(323, 619), point(381, 670), point(418, 650)] },
    { id: 'eyeletInner', name: '翻筒鞋眼片内缘', points: [point(490, 242), point(322, 619)] },
    { id: 'boundary', name: '翻筒／鞋身交界参考弦 R', points: [boundaryStart, boundaryEnd] },
    { id: 'bodyEyeletLower', name: '鞋身鞋眼片下缝', points: [point(551, 351), point(600, 415), point(659, 466), point(743, 499), point(889, 531), point(960, 591)] },
    { id: 'heel', name: '后跟结构线', points: [point(203, 551), point(223, 666)] },
    { id: 'soleTop', name: '鞋底上缘', points: [point(223, 666), point(441, 638), point(676, 617), point(797, 620), point(936, 603), point(1043, 576)] },
    { id: 'soleDatum', name: '鞋底方向弦 T', points: [point(223, 666), point(902, 623)] },
  ];
  const seamDirection = sub(point(398, 459), point(148, 344));
  const seamAngle = angleOf(seamDirection);
  const soleDirection = sub(point(902, 623), point(223, 666));
  const soleAngle = angleOf(soleDirection);
  const gap1 = point((475 + 442) / 2, (368 + 440) / 2);
  const gap2 = point((442 + 410) / 2, (440 + 513) / 2);

  /** Infinite-line intersection. a + t*u = b + s*v. */
  function lineIntersection(a, u, b, v) {
    const denom = cross(u, v);
    if (Math.abs(denom) < 1e-9) return null;
    const t = cross(sub(b, a), v) / denom;
    const s = cross(sub(b, a), u) / denom;
    return { ...add(a, mul(u, t)), t, s };
  }
  function clasp(p, angle, length = 160, width = 18, headRadius = 12) {
    return { x: p.x, y: p.y, angle, length, width, headRadius };
  }

  // Exact logarithmic golden spiral. r(theta + pi/2) / r(theta) = phi.
  // The two stations and the 15° angular interval are explicit designer choices;
  // they are NOT claimed as hidden properties of the original shoe.
  const spiral = {
    b: 2 * Math.log(PHI) / Math.PI,
    stationT: [0.40, 0.64],
    delta: 15 * DEG,
  };
  const spiralP1 = atBoundary(spiral.stationT[0]);
  const spiralP2 = atBoundary(spiral.stationT[1]);
  const spiralK = Math.exp(spiral.b * spiral.delta);
  // Complex-plane solution C=(P2-k*R_delta*P1)/(1-k*R_delta).
  const ar = 1 - spiralK * Math.cos(spiral.delta);
  const ai = -spiralK * Math.sin(spiral.delta);
  const nr = spiralP2.x - spiralK * (Math.cos(spiral.delta) * spiralP1.x - Math.sin(spiral.delta) * spiralP1.y);
  const ni = spiralP2.y - spiralK * (Math.sin(spiral.delta) * spiralP1.x + Math.cos(spiral.delta) * spiralP1.y);
  const dd = ar * ar + ai * ai;
  spiral.center = point((nr * ar + ni * ai) / dd, (ni * ar - nr * ai) / dd);
  spiral.r0 = distance(spiralP1, spiral.center);
  spiral.theta0 = Math.atan2(spiralP1.y - spiral.center.y, spiralP1.x - spiral.center.x);
  spiral.pointAt = function (delta) {
    const r = this.r0 * Math.exp(this.b * delta);
    return add(this.center, point(r * Math.cos(this.theta0 + delta), r * Math.sin(this.theta0 + delta)));
  };
  spiral.tangentAngle = function (delta) {
    return (this.theta0 + delta + Math.atan2(1, this.b)) / DEG;
  };
  spiral.normalAngle = function (delta) { return this.tangentAngle(delta) - 90; };
  spiral.polyline = function (start = -0.35, end = 0.55, count = 100) {
    return Array.from({ length: count }, (_, i) => this.pointAt(start + (end - start) * i / (count - 1)));
  };

  // This distinct inset is a real Fibonacci quarter-circle construction:
  // 13,8,5,3,2,1,1 squares. It is only an approximation to a golden logarithmic
  // spiral; piecewise constant curvature is not the log spiral's curvature.
  const fibonacciReference = {
    width: 21, height: 13,
    radii: [13, 8, 5, 3, 2, 1, 1],
    squares: [[0, 0, 13], [13, 5, 8], [16, 0, 5], [13, 0, 3], [13, 3, 2], [15, 4, 1], [15, 3, 1]],
    path: 'M 0 0 A 13 13 0 0 0 13 13 A 8 8 0 0 0 21 5 A 5 5 0 0 0 16 0 A 3 3 0 0 0 13 3 A 2 2 0 0 0 15 5 A 1 1 0 0 0 16 4 A 1 1 0 0 0 15 3',
    note: '斐波那契方块的分段四分之一圆弧；不等于精确黄金对数螺线。参考截图也采用分块圆弧式表达，不能据此宣称任意曲线具有黄金性质。',
  };
  const c1 = lineIntersection(boundaryStart, boundaryVector, gap1, seamDirection);
  const c2 = lineIntersection(boundaryStart, boundaryVector, gap2, seamDirection);
  const presets = [
    {
      id: 'A', name: '黄金分割 · 边界节奏', shortName: '黄金分割',
      clasps: [clasp(atBoundary(1 / (PHI * PHI)), 10, 128), clasp(atBoundary(1 / PHI), seamAngle, 128)],
      rationale: '只将扣件中心在交界线R上的站位设为0.381966与0.618034；角度按可见孔位避让选择，不把整只鞋、扣长或角度包装为黄金比例。',
      formula: 'R(t)=(600,270)+t(-182,380); t₁=φ⁻², t₂=φ⁻¹, φ=(1+√5)/2。',
      construction: ['标出R的两端及其轴长。', '按φ⁻²/φ⁻¹计算两中心。', '上扣10°、下扣与分割缝平行；角度不受黄金比例约束。'],
      limitations: '需要用模板从两个交界端点量取比例；交界布边伸缩会改变实际定位。中心黄金不等于客观美学优越。',
      guides: { kind: 'golden', stations: [0, 1 / (PHI * PHI), 1 / PHI, 1] },
    },
    {
      id: 'B', name: '螺线映射 · 法向展开', shortName: '螺线映射',
      clasps: [clasp(spiralP1, spiral.normalAngle(0)), clasp(spiralP2, spiral.normalAngle(spiral.delta))],
      rationale: '以R(0.40)/R(0.64)为人为选定的两站，令黄金对数螺线在15°参数间隔内经过两站；扣轴取螺线法线。旁列斐波那契圆弧近似，二者明确区分。',
      formula: 'P(θ)=C+r₀eᵇ⁽θ−θ₀⁾(cosθ,sinθ); b=2lnφ/π; Δθ=π/12; α=θ+atan2(1,b)−π/2。',
      construction: ['先选择能避孔的R(.40)/R(.64)两站，而非声称鞋型本身具有黄金结构。', '以Δθ=15°及r₂/r₁=φ^(1/6)求唯一螺线中心C。', '扣轴沿两站的螺线法线，得到约17.99°/32.99°。'],
      limitations: '15°与两站位置属于设计自由度；故事必须同时披露这些选择。局部螺线只能提供方向秩序，不能证明传统文化中存在此公式。',
      guides: { kind: 'spiral', stations: spiral.stationT, spiral },
    },
    {
      id: 'C', name: '结构延伸 · 同向缝线', shortName: '结构延伸',
      clasps: [clasp(c1, seamAngle), clasp(c2, seamAngle)],
      rationale: '扣轴平行翻筒分割缝S，分别经过相邻孔2/3与孔3/4的中点；这些线与可见交界R的交点就是扣件中心。使用现成结构定位置，不强加比例。',
      formula: 'G₁=(E₂+E₃)/2=(458.5,404), G₂=(E₃+E₄)/2=(426,476.5); Cᵢ=R∩{Gᵢ+λ(250,115)}; α=atan2(115,250)。',
      construction: ['标记中间三颗翻筒孔的中心。', '取两相邻孔中心的中点G₁/G₂。', '过G点作翻筒分割缝平行线，和R相交定位；两扣同一规格、同一倾角。'],
      limitations: '手绘缝线有曲率与线宽，当前用端点弦代表方向。量产时需以真实纸样孔距及缝线重新建立定位基准。',
      guides: { kind: 'structure', gaps: [gap1, gap2], direction: seamDirection, seamAngle },
    },
    {
      id: 'D', name: '平行构成 · 克制留白', shortName: '自由几何',
      clasps: [clasp(atBoundary(0.39), soleAngle, 108, 18, 11), clasp(atBoundary(0.565), soleAngle, 108, 18, 11)],
      rationale: '两扣采用同尺寸矩形＋圆头，轴线平行鞋底参考弦T；较短扣身保留鞋身留白。站位0.39/0.565由可见孔位与留白调节，无黄金比例主张。',
      formula: 'α=atan2(623−666,902−223); C₁=R(.39), C₂=R(.565); L₁=L₂=108u, W₁=W₂=18u, r₁=r₂=11u。',
      construction: ['取鞋底方向弦T，作为两扣共同方向。', '以等长、等宽、等圆头建立共同部件家族。', '将中心置于R(.39)/R(.565)，以避孔与留白验证，而非套用数列。'],
      limitations: '鞋底参考弦不是实际水平线或地平线；透视会改变此角度。较短扣身的实际连接余量要由鞋厂确认。',
      guides: { kind: 'free', stations: [0.39, 0.565], direction: soleDirection, soleAngle },
    },
  ];

  function anchors(item) {
    const d = point(Math.cos(item.angle * DEG), Math.sin(item.angle * DEG));
    const half = mul(d, item.length / 2);
    return { cuff: sub(item, half), body: add(item, half) };
  }
  function local(p, item) {
    const a = item.angle * DEG;
    const dx = p.x - item.x, dy = p.y - item.y;
    return point(dx * Math.cos(a) + dy * Math.sin(a), -dx * Math.sin(a) + dy * Math.cos(a));
  }
  function pointSegmentDistance(p, a, b) {
    const ab = sub(b, a), ab2 = dot(ab, ab);
    const t = ab2 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / ab2)) : 0;
    return distance(p, add(a, mul(ab, t)));
  }
  function insidePolygon(p, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if (pointSegmentDistance(p, a, b) < 1e-7) return true;
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }
  function polygonEdgeDistance(p, polygon) {
    return Math.min(...polygon.map((v, i) => pointSegmentDistance(p, v, polygon[(i + 1) % polygon.length])));
  }
  /** Exterior signed distance from clasp solid to a circular source eyelet. */
  function eyeletClearance(item, eye) {
    const p = local(eye, item);
    // Rectangle is [-L/2-W/2,+L/2] × [-W/2,+W/2]: its left
    // attachment has W/2 fabric margin beyond the anchor center.
    const dx = Math.abs(p.x + item.width / 4) - (item.length / 2 + item.width / 4);
    const dy = Math.abs(p.y) - item.width / 2;
    const rectSdf = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
    const headSdf = Math.hypot(p.x - item.length / 2, p.y) - item.headRadius;
    return Math.min(rectSdf, headSdf) - eye.r;
  }
  function rectangleCorners(item) {
    const a = item.angle * DEG;
    return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy]) => {
      const x = sx < 0 ? -item.length / 2 - item.width / 2 : item.length / 2;
      const y = sy * item.width / 2;
      return point(item.x + x*Math.cos(a)-y*Math.sin(a), item.y + x*Math.sin(a)+y*Math.cos(a));
    });
  }
  function footprintSamples(item) {
    const corners = rectangleCorners(item), samples = [];
    corners.forEach((a, i) => {
      const b = corners[(i + 1) % corners.length];
      for (let j = 0; j <= 8; j++) samples.push(add(a, mul(sub(b, a), j / 8)));
    });
    const head = anchors(item).body;
    for (let i = 0; i < 32; i++) {
      const theta = i * Math.PI / 16;
      samples.push(point(head.x + item.headRadius * Math.cos(theta), head.y + item.headRadius * Math.sin(theta)));
    }
    return samples;
  }
  /** Exact finite-segment distance to the rotated rectangle (without stroke).
   * Transforming into the clasp's local frame preserves Euclidean distances.
   * A slab intersection gives zero; otherwise closest point is an endpoint/
   * edge or rectangle-corner/segment pairing, all evaluated explicitly.
   */
  function segmentRectangleDistance(a, b, item) {
    const p = local(a, item), q = local(b, item);
    const xmin = -item.length / 2 - item.width / 2, xmax = item.length / 2;
    const ymin = -item.width / 2, ymax = item.width / 2;
    let tmin = 0, tmax = 1, intersects = true;
    [[p.x, q.x - p.x, xmin, xmax], [p.y, q.y - p.y, ymin, ymax]].forEach(([start, delta, min, max]) => {
      if (!intersects) return;
      if (Math.abs(delta) < 1e-12) { if (start < min || start > max) intersects = false; return; }
      let enter = (min - start) / delta, exit = (max - start) / delta;
      if (enter > exit) [enter, exit] = [exit, enter];
      tmin = Math.max(tmin, enter); tmax = Math.min(tmax, exit);
      if (tmin > tmax) intersects = false;
    });
    if (intersects) return 0;
    const pointRect = (v) => Math.hypot(Math.max(xmin - v.x, 0, v.x - xmax), Math.max(ymin - v.y, 0, v.y - ymax));
    const corners = [point(xmin, ymin), point(xmax, ymin), point(xmax, ymax), point(xmin, ymax)];
    return Math.min(pointRect(p), pointRect(q), ...corners.map((v) => pointSegmentDistance(v, p, q)));
  }
  /** Distance from a finite seam segment to the clasp's whole 2D solid.
   * The solid is the rectangle UNION circular head. Circle penetration may
   * return negative; rectangle crossing is represented as zero. SVG display
   * strokes, actual fabric thickness, and sewing construction are excluded.
   */
  function segmentClaspDistance(a, b, item) {
    const head = anchors(item).body;
    return Math.min(segmentRectangleDistance(a, b, item), pointSegmentDistance(head, a, b) - item.headRadius);
  }
  function polygonsOverlap(a, b) {
    return [a, b].every((polygon) => polygon.every((p, i) => {
      const edge = sub(polygon[(i + 1) % polygon.length], p);
      const axis = point(-edge.y, edge.x);
      const pa = a.map((v) => dot(v, axis)), pb = b.map((v) => dot(v, axis));
      return Math.max(...pa) >= Math.min(...pb) && Math.max(...pb) >= Math.min(...pa);
    }));
  }
  function circleRectangleDistance(center, radius, item) {
    const p = local(center, item);
    const dx = Math.abs(p.x + item.width / 4) - (item.length / 2 + item.width / 4);
    const dy = Math.abs(p.y) - item.width / 2;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radius;
  }
  function pairClearance(a, b) {
    const ac = rectangleCorners(a), bc = rectangleCorners(b);
    const ah = anchors(a).body, bh = anchors(b).body;
    const headGap = distance(ah, bh) - a.headRadius - b.headRadius;
    const headRectA = circleRectangleDistance(ah, a.headRadius, b);
    const headRectB = circleRectangleDistance(bh, b.headRadius, a);
    if (polygonsOverlap(ac, bc)) return Math.min(-0.01, headGap, headRectA, headRectB);
    let rectGap = Infinity;
    ac.forEach((v) => bc.forEach((p, i) => { rectGap = Math.min(rectGap, pointSegmentDistance(v, p, bc[(i + 1) % bc.length])); }));
    bc.forEach((v) => ac.forEach((p, i) => { rectGap = Math.min(rectGap, pointSegmentDistance(v, p, ac[(i + 1) % ac.length])); }));
    return Math.min(rectGap, headGap, headRectA, headRectB);
  }
  /** Validation is 2D visual screening, NOT sewing strength or manufacturing certification. */
  function validate(item, margin = 4) {
    const errors = [], warnings = [];
    const required = ['x', 'y', 'angle', 'length', 'width', 'headRadius'];
    if (required.some((key) => !Number.isFinite(item[key])) || item.length <= 0 || item.width <= 0 || item.headRadius <= 0) {
      return { valid: false, errors: ['参数必须为有限数字，长度、宽度和圆头半径必须大于0。'], warnings, anchors: null };
    }
    const end = anchors(item);
    const signed = (p) => dot(sub(p, boundaryStart), boundaryNormal);
    const cuffSigned = signed(end.cuff), bodySigned = signed(end.body);
    if (!(cuffSigned < -margin && bodySigned > margin)) errors.push('两固定端未分别跨在翻筒与鞋身两侧。');
    const cuffInside = insidePolygon(end.cuff, regions.cuff);
    const bodyInside = insidePolygon(end.body, regions.body);
    if (!cuffInside) errors.push('翻筒固定端超出可见翻筒区域。');
    if (!bodyInside) errors.push('鞋身固定端超出可见鞋身区域。');
    const cuffEdge = polygonEdgeDistance(end.cuff, regions.cuff);
    const bodyEdge = polygonEdgeDistance(end.body, regions.body);
    if (cuffInside && cuffEdge < item.width / 2 + margin) warnings.push('翻筒固定端靠近布边，需确认缝份与加固余量。');
    if (bodyInside && bodyEdge < item.headRadius + margin) warnings.push('鞋身固定端靠近布边，需确认圆头底座与缝份。');
    const holeDistances = eyelets.map((eye) => ({ name: eye.name, clearance: eyeletClearance(item, eye) }));
    const nearestEye = holeDistances.reduce((a, b) => a.clearance < b.clearance ? a : b);
    if (nearestEye.clearance < 0) errors.push(`扣件轮廓与${nearestEye.name}重叠（约${(-nearestEye.clearance).toFixed(1)}u）。`);
    else if (nearestEye.clearance < margin) warnings.push(`与${nearestEye.name}净距仅${nearestEye.clearance.toFixed(1)}u，低于研究余量${margin}u。`);
    // The boundary itself is intentionally crossed. For other key seams, flag
    // attachment patches close to actual traced segments (not infinite lines).
    let seamClearance = Infinity, seamName = '';
    let footprintSeam = Infinity, footprintSeamName = '';
    const footprintSeamSegments = [];
    const seams = structureLines.filter((line) => ['cuffSplit', 'cuffLowerSplit', 'bodyEyeletLower', 'heel', 'soleTop'].includes(line.id));
    seams.forEach((line) => line.points.slice(1).forEach((b, i) => {
      const a = line.points[i];
      [end.cuff, end.body].forEach((p) => {
        const value = pointSegmentDistance(p, a, b) - Math.min(item.width / 2, 8);
        if (value < seamClearance) { seamClearance = value; seamName = line.name; }
      });
      const profileDistance = segmentClaspDistance(a, b, item);
      footprintSeamSegments.push({ name: line.name, id: line.id, segment: i, clearance: profileDistance });
      if (profileDistance < footprintSeam) { footprintSeam = profileDistance; footprintSeamName = line.name; }
    }));
    if (seamClearance < margin) warnings.push(`固定端邻近${seamName}，需在真实纸样复核加固区域。`);
    if (footprintSeam <= 0) warnings.push(`完整扣形轮廓与${footprintSeamName}相交；需人工复核位置、净空及固定工艺。`);
    else if (footprintSeam < margin) warnings.push(`完整扣形距${footprintSeamName}仅${footprintSeam.toFixed(2)}u，低于${margin}u研究余量；圆头及扣身需实样复核。`);
    // Whole footprint screening, including the fabric margin behind the left
    // anchor and circular-head perimeter. Region polygons remain 2D estimates.
    const samples = footprintSamples(item);
    const outsideSamples = samples.filter((p) => !insidePolygon(p, regions.cuff) && !insidePolygon(p, regions.body));
    if (outsideSamples.length) errors.push('扣件轮廓部分超出翻筒与鞋身的可见区域。');
    const sole = structureLines.find((line) => line.id === 'soleTop').points;
    let soleClearance = Infinity;
    samples.forEach((p) => sole.slice(1).forEach((b, i) => { soleClearance = Math.min(soleClearance, pointSegmentDistance(p, sole[i], b)); }));
    const boundaryT = dot(sub(item, boundaryStart), boundaryVector) / dot(boundaryVector, boundaryVector);
    const bodyMinY = Math.min(...samples.map((p) => p.y));
    const bodyMaxY = Math.max(...samples.map((p) => p.y));
    if (bodyMaxY > 638 && item.x < 900) errors.push('扣件轮廓进入鞋底或后跟底边高风险区。');
    return {
      valid: errors.length === 0, errors, warnings, anchors: end,
      boundaryT, boundaryOffset: signed(item), cuffSigned, bodySigned,
      cuffInside, bodyInside,
      clearances: {
        nearestEye, eyelets: holeDistances, cuffEdge, bodyEdge,
        seam: seamClearance, seamName,
        anchorPatchSeam: seamClearance, anchorPatchSeamName: seamName,
        footprintSeam, footprintSeamName, footprintSeamSegments,
        sole: soleClearance,
      },
      bounds: { minY: bodyMinY, maxY: bodyMaxY },
      note: '4u为屏幕筛查余量，不是4mm；anchorPatchSeam仅为两锚点减8u以内研究脚印的旧指标；footprintSeam为矩形＋完整圆头到关键缝线有限折线段的严格二维距离（圆头穿入可为负、矩形相交为0），不含显示描边；原缝线曲率、描图误差、透视、布料运动和缝制公差未计入。',
    };
  }
  function validateLayout(items, margin = 4) {
    const results = items.map((item) => validate(item, margin));
    const pairGaps = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      pairGaps.push({ i, j, clearance: pairClearance(items[i], items[j]) });
    }
    const errors = results.flatMap((result, index) => result.errors.map((error) => `扣${index + 1}：${error}`));
    const warnings = results.flatMap((result, index) => result.warnings.map((warning) => `扣${index + 1}：${warning}`));
    pairGaps.forEach((pair) => {
      if (pair.clearance < 0) errors.push(`扣${pair.i + 1}与扣${pair.j + 1}轮廓重叠。`);
      else if (pair.clearance < margin) warnings.push(`两扣轮廓间距小于${margin}u。`);
    });
    return { valid: errors.length === 0, errors, warnings, results, pairGaps };
  }
  function metrics(items) {
    const a = items[0], b = items[1];
    if (!a || !b) return null;
    const t1 = dot(sub(a, boundaryStart), boundaryVector) / dot(boundaryVector, boundaryVector);
    const t2 = dot(sub(b, boundaryStart), boundaryVector) / dot(boundaryVector, boundaryVector);
    return {
      centerDistance: distance(a, b), deltaAngle: b.angle - a.angle,
      lengthRatio: b.length / a.length, widthRatio: b.width / a.width,
      stationT: [t1, t2], boundarySpacing: Math.abs(t2 - t1) * boundaryLength,
      boundaryLength,
      centerOfTwo: point((a.x + b.x) / 2, (a.y + b.y) / 2),
      // Only a geometric center, not a measured visual or mass centroid.
      note: '双中心均值不代表真实质量重心或客观视觉重心。',
    };
  }
  const DATA = {
    title: 'SoulGrain ONWARD 蒙古扣几何布局研究',
    version: '1.0', referenceSize: { width: 1280, height: 894 },
    coordinateSystem: '原始手绘截图坐标；原点左上；X向右、Y向下；单位u等于图像像素；角度为SVG屏幕顺时针度。',
    disclaimer: '二维设计研究参考。无鞋楦尺寸、透视校正、展开纸样或工艺公差，不能作为量产尺寸。',
    traceUncertainty: '关键点人工描读误差约±4u或更多；交界R是端点参考弦，对原弯曲墨线的局部偏离可约10–15u，非逐点精确边界；截图透视未矫正。',
    culturalNote: '只借用蒙古扣的近矩形扣身与圆形扣头这一造型特征；数学构图为当代设计方法，不冒称传统历史中的黄金比例。',
    phi: PHI, boundaryStart, boundaryEnd, boundaryVector, boundaryLength, boundaryNormal, boundaryAngle,
    seamAngle, soleAngle, eyelets, regions, structureLines, presets, spiral, fibonacciReference,
  };
  scope.ClaspGeometry = {
    ...DATA, DATA, atBoundary, point, add, sub, mul, dot, cross, distance,
    lineIntersection, anchors, local, pointSegmentDistance, insidePolygon,
    polygonEdgeDistance, eyeletClearance, rectangleCorners, footprintSamples,
    segmentRectangleDistance, segmentClaspDistance,
    pairClearance, validate, validateLayout, metrics,
  };
})(typeof globalThis === 'undefined' ? window : globalThis);
