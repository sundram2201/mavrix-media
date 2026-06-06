/* ============================================================
   MAVRIX MEDIA — ecosystem.js
   Builds the "REVENUE" growth ecosystem: 8 service nodes that
   slowly orbit a glowing core, with upright labels, traveling
   energy pulses and animated connector lines.
   Uses SVG <animateTransform>/<animateMotion> for rock-solid,
   cross-browser rotation about a fixed point.
   ============================================================ */
(function () {
  var svg = document.getElementById('ecoSvg');
  if (!svg) return;

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var CX = 300, CY = 300, R = 212, NODE_R = 40, SPIN = 95; // seconds per orbit

  var labels = ['Website', 'Social Media', 'AI Content', 'Video', 'Lead Gen', 'Branding', 'Authority', 'Funnels'];

  var pts = labels.map(function (l, i) {
    var a = (i / labels.length) * Math.PI * 2 - Math.PI / 2; // start at top, clockwise
    return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R, l: l };
  });

  function el(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function animTransform(from, to, dur) {
    return el('animateTransform', {
      attributeName: 'transform', attributeType: 'XML', type: 'rotate',
      from: from, to: to, dur: dur + 's', repeatCount: 'indefinite'
    });
  }

  /* ---- defs: gradients ---- */
  var defs = el('defs', {});
  defs.innerHTML =
    '<linearGradient id="ecoGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#b06bff"/><stop offset="100%" stop-color="#1ec8ff"/></linearGradient>' +
    '<radialGradient id="ecoCoreGrad"><stop offset="0%" stop-color="#cba0ff"/>' +
    '<stop offset="45%" stop-color="#8b3dff"/><stop offset="100%" stop-color="#2e7bff"/></radialGradient>';
  svg.appendChild(defs);

  /* ---- breathing core glow (behind everything, static centre) ---- */
  var glow = el('circle', { cx: CX, cy: CY, r: 150, fill: 'url(#ecoCoreGrad)', opacity: '0.14' });
  if (!reduce) {
    glow.innerHTML =
      '<animate attributeName="r" values="120;150;120" dur="6s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0.18;0.06;0.18" dur="6s" repeatCount="indefinite"/>';
  }
  svg.appendChild(glow);

  /* ---- orbit group (rotates) ---- */
  var orbit = el('g', { id: 'ecoOrbit' });
  if (!reduce) orbit.appendChild(animTransform('0 ' + CX + ' ' + CY, '360 ' + CX + ' ' + CY, SPIN));

  // connector lines + ring lines
  pts.forEach(function (p) {
    orbit.appendChild(el('path', { class: 'eco-line', d: 'M' + CX + ',' + CY + ' L' + p.x + ',' + p.y }));
  });
  pts.forEach(function (p, i) {
    var n = pts[(i + 1) % pts.length];
    orbit.appendChild(el('path', { class: 'eco-line', style: 'opacity:.16', d: 'M' + p.x + ',' + p.y + ' L' + n.x + ',' + n.y }));
  });

  // traveling energy pulses (node -> core)
  if (!reduce) {
    pts.forEach(function (p, i) {
      var dot = el('circle', { r: 3.2, class: 'eco-pulse-dot' });
      var motion = el('animateMotion', {
        dur: '3.4s', begin: (i * 0.42) + 's', repeatCount: 'indefinite',
        path: 'M' + p.x + ',' + p.y + ' L' + CX + ',' + CY
      });
      dot.appendChild(motion);
      orbit.appendChild(dot);
    });
  }

  // nodes (circle revolves; label counter-rotates to stay upright)
  pts.forEach(function (p) {
    var node = el('g', { class: 'eco-node' });
    node.appendChild(el('circle', { cx: p.x, cy: p.y, r: NODE_R, fill: '#0e0e17', stroke: 'url(#ecoGrad)', 'stroke-width': '1.6' }));
    var up = el('g', { class: 'eco-upright' });
    if (!reduce) up.appendChild(animTransform('0 ' + p.x + ' ' + p.y, '-360 ' + p.x + ' ' + p.y, SPIN));
    var t = el('text', { x: p.x, y: p.y });
    t.textContent = p.l;
    up.appendChild(t);
    node.appendChild(up);
    orbit.appendChild(node);
  });

  svg.appendChild(orbit);

  /* ---- core (static, above orbit) ---- */
  var core = el('g', {});
  var ring = el('circle', { cx: CX, cy: CY, r: 82, fill: 'none', stroke: 'url(#ecoGrad)', 'stroke-width': '1.4', 'stroke-dasharray': '4 8', opacity: '.6' });
  if (!reduce) ring.appendChild(animTransform('0 ' + CX + ' ' + CY, '360 ' + CX + ' ' + CY, 24));
  core.appendChild(ring);
  core.appendChild(el('circle', { cx: CX, cy: CY, r: 66, fill: 'url(#ecoCoreGrad)' }));
  var coreLabel = el('text', { class: 'eco-core-label', x: CX, y: CY });
  coreLabel.textContent = 'REVENUE';
  core.appendChild(coreLabel);
  svg.appendChild(core);
})();
