const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");

const paintIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", paintIcons);
} else {
  paintIcons();
}

window.addEventListener("load", paintIcons);

if (navToggle && header && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      header.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".accordion details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".accordion details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelectorAll(".ticker div").forEach((ticker) => {
  ticker.innerHTML = `${ticker.innerHTML}${ticker.innerHTML}`;
});

const moduleCards = document.querySelectorAll(".module-card");
const moduleInspector = document.querySelector(".module-inspector");

if (moduleCards.length && moduleInspector) {
  const moduleOrb = moduleInspector.querySelector(".module-orb span");
  const moduleTitle = moduleInspector.querySelector(".module-copy h3");
  const moduleDescription = moduleInspector.querySelector(".module-copy p:not(.eyebrow)");
  const moduleMetaValues = moduleInspector.querySelectorAll(".module-meta dd");

  const selectModule = (card) => {
    moduleCards.forEach((item) => {
      item.classList.toggle("is-active", item === card);
      item.setAttribute("aria-pressed", String(item === card));
    });

    if (moduleOrb) moduleOrb.textContent = card.dataset.module || "";
    if (moduleTitle) moduleTitle.textContent = card.querySelector("strong")?.textContent || "";
    if (moduleDescription) moduleDescription.textContent = card.dataset.description || "";
    if (moduleMetaValues[0]) moduleMetaValues[0].textContent = card.dataset.level || "";
    if (moduleMetaValues[1]) moduleMetaValues[1].textContent = card.dataset.focus || "";
    if (moduleMetaValues[2]) moduleMetaValues[2].textContent = card.dataset.time || "";

    moduleInspector.classList.remove("is-changing");
    void moduleInspector.offsetWidth;
    moduleInspector.classList.add("is-changing");
    window.setTimeout(() => moduleInspector.classList.remove("is-changing"), 280);
  };

  moduleCards.forEach((card) => {
    card.setAttribute("aria-pressed", String(card.classList.contains("is-active")));
    card.addEventListener("click", () => selectModule(card));
    card.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) selectModule(card);
    });
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progress = document.querySelector(".scroll-progress");

const updateScrollProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const courseCovers = Array.from(document.querySelectorAll(".course-cover"));
const finePointer = window.matchMedia("(pointer: fine)").matches;

const defaultCourseTilt = { tiltX: 2, tiltY: -7, lift: 0 };
const courseTiltStates = courseCovers.map((cover) => ({
  cover,
  current: { ...defaultCourseTilt },
  target: { ...defaultCourseTilt }
}));
let courseTiltFrame = 0;

const applyCourseTilt = ({ cover, current }) => {
  cover.style.setProperty("--cover-tilt-x", `${current.tiltX.toFixed(2)}deg`);
  cover.style.setProperty("--cover-tilt-y", `${current.tiltY.toFixed(2)}deg`);
  cover.style.setProperty("--cover-lift", `${current.lift.toFixed(2)}px`);
};

const animateCourseTilt = () => {
  let keepAnimating = false;

  courseTiltStates.forEach((state) => {
    Object.keys(state.current).forEach((key) => {
      const diff = state.target[key] - state.current[key];
      state.current[key] += diff * 0.18;
      if (Math.abs(diff) > 0.01) keepAnimating = true;
    });

    applyCourseTilt(state);
  });

  if (keepAnimating) {
    courseTiltFrame = requestAnimationFrame(animateCourseTilt);
  } else {
    courseTiltFrame = 0;
  }
};

const requestCourseTiltFrame = () => {
  if (!courseTiltFrame) courseTiltFrame = requestAnimationFrame(animateCourseTilt);
};

const resetCourseTiltTargets = () => {
  courseTiltStates.forEach((state) => {
    state.cover.classList.remove("is-pointer-near");
    state.target = { ...defaultCourseTilt };
  });
  requestCourseTiltFrame();
};

if (!reduceMotion && finePointer && courseTiltStates.length) {
  window.addEventListener(
    "pointermove",
    (event) => {
      courseTiltStates.forEach((state) => {
        const rect = state.cover.getBoundingClientRect();
        const influence = 170;
        const closestX = Math.min(Math.max(event.clientX, rect.left), rect.right);
        const closestY = Math.min(Math.max(event.clientY, rect.top), rect.bottom);
        const distance = Math.hypot(event.clientX - closestX, event.clientY - closestY);

        if (distance > influence) {
          state.cover.classList.remove("is-pointer-near");
          state.target = { ...defaultCourseTilt };
          return;
        }

        const rawX = (event.clientX - rect.left) / rect.width;
        const rawY = (event.clientY - rect.top) / rect.height;
        const x = Math.min(1, Math.max(0, rawX));
        const y = Math.min(1, Math.max(0, rawY));
        const strength = 1 - distance / influence;

        state.cover.classList.add("is-pointer-near");
        state.target = {
          tiltX: (0.5 - y) * 13 * strength,
          tiltY: (x - 0.5) * 17 * strength,
          lift: -10 * strength
        };
      });

      requestCourseTiltFrame();
    },
    { passive: true }
  );

  window.addEventListener("blur", resetCourseTiltTargets);
  document.addEventListener("mouseleave", resetCourseTiltTargets);
}

document.querySelectorAll("[data-feedback-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".student-carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".student-slide"));
  const dots = Array.from(carousel.querySelectorAll("[data-feedback-dot]"));
  const prev = carousel.querySelector("[data-feedback-prev]");
  const next = carousel.querySelector("[data-feedback-next]");
  const current = carousel.querySelector("[data-feedback-current]");
  const total = carousel.querySelector("[data-feedback-total]");
  let activeIndex = 0;
  let touchStartX = 0;

  if (!track || slides.length === 0) return;

  const getCarouselMetrics = () => {
    const viewport = carousel.querySelector(".student-carousel-viewport");
    const slide = slides[0];
    const trackStyles = getComputedStyle(track);
    const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
    const step = slide.offsetWidth + gap;
    const visibleCount = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
    const maxIndex = Math.max(slides.length - visibleCount, 0);
    return { step, visibleCount, maxIndex };
  };

  const updateCarousel = (nextIndex) => {
    const { step, visibleCount, maxIndex } = getCarouselMetrics();
    if (nextIndex < 0) activeIndex = maxIndex;
    else if (nextIndex > maxIndex) activeIndex = 0;
    else activeIndex = nextIndex;

    track.style.transform = `translateX(-${activeIndex * step}px)`;
    if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
    if (total) total.textContent = String(maxIndex + 1).padStart(2, "0");

    const featuredIndex = activeIndex + Math.min(visibleCount - 1, 1);

    slides.forEach((slide, index) => {
      const isActive = index >= activeIndex && index < activeIndex + visibleCount;
      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-featured", index === featuredIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.hidden = index > maxIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  prev?.addEventListener("click", () => updateCarousel(activeIndex - 1));
  next?.addEventListener("click", () => updateCarousel(activeIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => updateCarousel(index));
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") updateCarousel(activeIndex - 1);
    if (event.key === "ArrowRight") updateCarousel(activeIndex + 1);
  });

  carousel.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0]?.clientX || 0;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0]?.clientX || touchStartX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) < 42) return;
      updateCarousel(activeIndex + (delta < 0 ? 1 : -1));
    },
    { passive: true }
  );

  window.addEventListener("resize", () => updateCarousel(activeIndex), { passive: true });
  updateCarousel(0);
});

const revealTargets = document.querySelectorAll(
  "section .section-heading, .course-cover, .course-copy-grid article, .benefit-grid article, .track-phases article, .student-carousel, .feedback-marquee, .plan-card, .accordion, .footer-grid"
);

if (!reduceMotion && "IntersectionObserver" in window) {
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const countOnce = (element) => {
  const raw = element.textContent.trim();
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  if (!match) return;
  const target = Number(match[1]);
  const suffix = raw.replace(match[1], "");
  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progressValue = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progressValue < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (!reduceMotion && "IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countOnce(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll(".proof-bar dt").forEach((metric) => countObserver.observe(metric));
}

const canvas = document.querySelector(".energy-canvas");

if (canvas && !reduceMotion) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  const points = Array.from({ length: 38 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00018,
    vy: (Math.random() - 0.5) * 0.00018,
    pulse: Math.random() * Math.PI * 2
  }));

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time) => {
    context.clearRect(0, 0, width, height);

    points.forEach((point) => {
      point.x += point.vx * 16;
      point.y += point.vy * 16;
      if (point.x < 0.02 || point.x > 0.98) point.vx *= -1;
      if (point.y < 0.08 || point.y > 0.92) point.vy *= -1;
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const ax = a.x * width;
        const ay = a.y * height;
        const bx = b.x * width;
        const by = b.y * height;
        const distance = Math.hypot(ax - bx, ay - by);
        if (distance < 160) {
          const alpha = (1 - distance / 160) * 0.18;
          context.strokeStyle = `rgba(185, 141, 255, ${alpha})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.stroke();
        }
      }
    }

    points.forEach((point) => {
      const x = point.x * width;
      const y = point.y * height;
      const radius = 1.4 + Math.sin(time / 700 + point.pulse) * 0.55;
      context.fillStyle = "rgba(185, 141, 255, 0.76)";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });

    animationFrame = requestAnimationFrame(draw);
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animationFrame = requestAnimationFrame(draw);
}
