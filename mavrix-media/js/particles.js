/* ============================================================
   MAVRIX MEDIA — particles.js
   Lightweight particle constellation for the hero background.
   Self-contained; runs only if #net canvas exists.
   ============================================================ */
(function () {
  var cv = document.getElementById('net');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var w, h, parts;

  function size() {
    w = cv.width = window.innerWidth * DPR;
    h = cv.height = window.innerHeight * DPR;
  }

  function init() {
    size();
    var count = reduce ? 0 : Math.min(70, Math.floor(window.innerWidth / 22));
    parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * DPR,
        vy: (Math.random() - 0.5) * 0.25 * DPR,
        r: (Math.random() * 1.6 + 0.6) * DPR
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = 'rgba(176,107,255,.7)';
      ctx.fill();
      for (var j = i + 1; j < parts.length; j++) {
        var q = parts[j], dx = p.x - q.x, dy = p.y - q.y;
        var d = Math.hypot(dx, dy), max = 130 * DPR;
        if (d < max) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(120,140,255,' + (1 - d / max) * 0.22 + ')';
          ctx.lineWidth = DPR * 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  init();
  if (!reduce) draw(); else ctx.clearRect(0, 0, w, h);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(init, 200);
  });
})();
