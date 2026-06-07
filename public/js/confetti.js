(function ConfettiModule() {
  'use strict';

  var PARTICLE_COUNT = 120;
  var GRAVITY = 0.35;
  var DRAG = 0.98;
  var DURATION_MS = 4000;
  var SPREAD = 70;
  var COLORS = [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
    '#FF6EC7', '#A66CFF', '#FFB86C', '#50FA7B',
    '#FF79C6', '#8BE9FD', '#F1FA8C', '#BD93F9',
  ];

  var canvas = null;
  var ctx = null;
  var particles = [];
  var animFrame = null;
  var startTime = 0;

  function createCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:99999;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    var angle = randomRange(-SPREAD, SPREAD) * (Math.PI / 180);
    var velocity = randomRange(6, 14);
    var size = randomRange(5, 10);
    var shape = Math.random() < 0.4 ? 'circle' : (Math.random() < 0.5 ? 'rect' : 'strip');

    return {
      x: canvas.width * 0.5 + randomRange(-canvas.width * 0.25, canvas.width * 0.25),
      y: -10,
      vx: Math.sin(angle) * velocity * randomRange(0.5, 1.5),
      vy: Math.cos(angle) * velocity * randomRange(0.3, 0.8) * -1 + 2,
      size: size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomRange(0, 360),
      rotationSpeed: randomRange(-8, 8),
      shape: shape,
      wobble: randomRange(0, Math.PI * 2),
      wobbleSpeed: randomRange(0.03, 0.08),
      opacity: 1,
      width: shape === 'strip' ? randomRange(2, 4) : size,
      height: shape === 'strip' ? randomRange(8, 16) : size,
    };
  }

  function update(elapsed) {
    var progress = Math.min(elapsed / DURATION_MS, 1);
    var fadeStart = 0.7;

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];

      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.vy *= DRAG;

      p.x += p.vx + Math.sin(p.wobble) * 0.8;
      p.y += p.vy;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotationSpeed;

      if (progress > fadeStart) {
        p.opacity = Math.max(0, 1 - (progress - fadeStart) / (1 - fadeStart));
      }

      if (p.y > canvas.height + 20 || p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'strip') {
        ctx.fillRect(-p.width * 0.5, -p.height * 0.5, p.width, p.height);
      } else {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
      }

      ctx.restore();
    }
  }

  function loop() {
    var elapsed = Date.now() - startTime;

    if (elapsed > DURATION_MS && particles.length === 0) {
      cleanup();
      return;
    }

    update(elapsed);
    draw();
    animFrame = requestAnimationFrame(loop);
  }

  function cleanup() {
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
    ctx = null;
    particles = [];
  }

  function launch() {
    cleanup();
    createCanvas();

    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    startTime = Date.now();
    loop();
  }

  window.Confetti = { launch: launch };
})();
