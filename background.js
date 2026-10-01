(() => {
  const canvas = document.getElementById("data-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let particles = [];
  let pulses = [];
  let animationId = null;
  let lastFrame = 0;
  let mouse = { x: -1000, y: -1000 };

  const settings = {
    particleDensity: 0.00009,
    maxParticles: 110,
    connectionDistance: 145,
    mouseRadius: 180,
    speed: 0.35,
    pulseInterval: 450,
    maxPulses: 18,
  };

  let lastPulseTime = 0;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;

      this.vx = (Math.random() - 0.5) * settings.speed;
      this.vy = (Math.random() - 0.5) * settings.speed;

      this.radius = Math.random() * 1.5 + 1;
      this.opacity = Math.random() * 0.45 + 0.25;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) {
        this.vx *= -1;
      }

      if (this.y < 0 || this.y > height) {
        this.vy *= -1;
      }

      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }

    draw() {
      ctx.beginPath();

      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(81, 190, 255, ${this.opacity})`;

      ctx.fill();
    }
  }

  class Pulse {
    constructor(start, end) {
      this.start = start;
      this.end = end;
      this.progress = Math.random();
      this.speed = 0.004 + Math.random() * 0.006;
      this.direction = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
      this.progress += this.speed * this.direction;

      return this.progress >= 0 && this.progress <= 1;
    }

    draw() {
      const t = this.progress;

      const x = this.start.x + (this.end.x - this.start.x) * t;

      const y = this.start.y + (this.end.y - this.start.y) * t;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);

      glow.addColorStop(0, "rgba(110, 225, 255, 0.95)");
      glow.addColorStop(0.35, "rgba(55, 170, 255, 0.35)");
      glow.addColorStop(1, "rgba(55, 170, 255, 0)");

      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
      settings.maxParticles,
      Math.max(25, Math.floor(width * height * settings.particleDensity)),
    );

    particles = Array.from({ length: count }, () => new Particle());

    pulses = [];
  }

  function drawGrid() {
    const spacing = 55;

    ctx.strokeStyle = "rgba(95, 155, 210, 0.035)";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawConnections(timestamp) {
    const availableEdges = [];

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > settings.connectionDistance) continue;

        const alpha = (1 - distance / settings.connectionDistance) * 0.22;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle = `rgba(70, 160, 240, ${alpha})`;

        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Store a subset of edges for traveling pulses.
        if (distance < settings.connectionDistance * 0.65) {
          availableEdges.push([a, b]);
        }
      }
    }

    if (
      timestamp - lastPulseTime > settings.pulseInterval &&
      pulses.length < settings.maxPulses &&
      availableEdges.length > 0
    ) {
      const edge =
        availableEdges[Math.floor(Math.random() * availableEdges.length)];

      pulses.push(new Pulse(edge[0], edge[1]));
      lastPulseTime = timestamp;
    }
  }

  function drawMouseInteraction() {
    if (mouse.x < 0 || mouse.y < 0) return;

    for (const particle of particles) {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < settings.mouseRadius) {
        const alpha = (1 - distance / settings.mouseRadius) * 0.25;

        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(particle.x, particle.y);

        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;

        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function drawPulses() {
    pulses = pulses.filter((pulse) => {
      const alive = pulse.update();

      if (alive) pulse.draw();

      return alive;
    });
  }

  function render(timestamp = 0) {
    if (document.hidden || reducedMotion.matches) {
      animationId = null;
      return;
    }

    // Limit to approximately 30 FPS.
    if (timestamp - lastFrame < 33) {
      animationId = requestAnimationFrame(render);
      return;
    }

    lastFrame = timestamp;

    ctx.clearRect(0, 0, width, height);

    drawGrid();

    for (const particle of particles) {
      particle.update();
    }

    drawConnections(timestamp);
    drawMouseInteraction();

    for (const particle of particles) {
      particle.draw();
    }

    drawPulses();

    animationId = requestAnimationFrame(render);
  }

  function startAnimation() {
    if (reducedMotion.matches || document.hidden || animationId !== null) {
      return;
    }

    lastFrame = 0;
    animationId = requestAnimationFrame(render);
  }

  function stopAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function drawStaticScene() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    for (const particle of particles) {
      particle.draw();
    }

    drawConnections(0);
  }

  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("mouseout", (event) => {
    if (!event.relatedTarget) {
      mouse.x = -1000;
      mouse.y = -1000;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  reducedMotion.addEventListener("change", () => {
    stopAnimation();

    if (reducedMotion.matches) {
      drawStaticScene();
    } else {
      startAnimation();
    }
  });

  resizeCanvas();

  if (reducedMotion.matches) {
    drawStaticScene();
  } else {
    startAnimation();
  }
})();
