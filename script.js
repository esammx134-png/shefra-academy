(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  body.classList.add("has-js");

  const welcome = document.querySelector("#welcome");
  if (welcome) {
    if (reducedMotion) {
      welcome.remove();
    } else {
      window.setTimeout(() => welcome.classList.add("is-done"), 1450);
      window.setTimeout(() => welcome.remove(), 2050);
    }
  }

  const codeWindow = document.querySelector(".code-window");
  const codeLines = [...document.querySelectorAll(".code-window__body .code-line")];
  if (codeWindow && codeLines.length) {
    const startTyping = () => {
      if (reducedMotion) {
        codeWindow.classList.add("is-typing-done");
        return;
      }

      let delay = 0;
      codeLines.forEach((line) => {
        const characters = [...line.textContent].length;
        const duration = Math.max(320, characters * 24);
        line.style.setProperty("--line-width", `${line.scrollWidth}px`);
        line.style.setProperty("--line-steps", characters);
        line.style.setProperty("--line-duration", `${duration}ms`);
        line.style.setProperty("--line-delay", `${delay}ms`);
        delay += duration + 90;
      });

      codeWindow.classList.add("is-typing");
      window.setTimeout(() => codeWindow.classList.add("is-typing-done"), delay);
    };

    if (welcome && !reducedMotion) window.setTimeout(startTyping, 1100);
    else startTyping();
  }

  document.querySelectorAll(".brand__logo").forEach((logo) => {
    logo.addEventListener("load", () => logo.classList.add("is-loaded"), { once: true });
    logo.addEventListener("error", () => logo.remove(), { once: true });
    if (logo.complete && logo.naturalWidth > 0) logo.classList.add("is-loaded");
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");

  function closeMenu() {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "فتح القائمة");
    navigation.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "فتح القائمة" : "إغلاق القائمة");
      navigation.classList.toggle("is-open", !isOpen);
      body.classList.toggle("menu-open", !isOpen);
    });
    navigation.querySelectorAll("a[href^='#']").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const answer = document.getElementById(question.getAttribute("aria-controls"));
      const willOpen = question.getAttribute("aria-expanded") !== "true";
      document.querySelectorAll(".faq-question[aria-expanded='true']").forEach((openQuestion) => {
        if (openQuestion === question) return;
        openQuestion.setAttribute("aria-expanded", "false");
        const openAnswer = document.getElementById(openQuestion.getAttribute("aria-controls"));
        openAnswer.style.maxHeight = "0px";
        openAnswer.setAttribute("aria-hidden", "true");
      });
      question.setAttribute("aria-expanded", String(willOpen));
      answer.setAttribute("aria-hidden", String(!willOpen));
      answer.style.maxHeight = willOpen ? `${answer.scrollHeight}px` : "0px";
    });
  });

  const revealElements = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      revealObserver.observe(element);
    });
  }

  const backToTop = document.querySelector(".back-to-top");
  const footer = document.querySelector(".site-footer");
  const parallaxTargets = [...document.querySelectorAll(
    ".hero-art__orbit, .hero-art__brace, .hero-art__dot, .hero-stamp"
  )];
  const parallaxSections = [...document.querySelectorAll(".hero, .learning")];
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateScrollState() {
    const footerIsVisible = footer && footer.getBoundingClientRect().top < window.innerHeight;
    backToTop?.classList.toggle("is-visible", window.scrollY > 520 && !footerIsVisible);
  }

  function updateParallax() {
    const viewportCenter = window.innerHeight / 2;
    parallaxTargets.forEach((target, index) => {
      const bounds = target.getBoundingClientRect();
      const distance = bounds.top + bounds.height / 2 - viewportCenter;
      const speed = 0.035 + (index % 3) * 0.018;
      target.style.setProperty("--parallax-y", `${-distance * speed}px`);
    });
    parallaxSections.forEach((section, index) => {
      const distance = section.getBoundingClientRect().top;
      section.style.setProperty("--section-parallax-y", `${-distance * (index ? 0.045 : 0.025)}px`);
    });
  }

  let scrollFrame = 0;
  function scheduleScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      updateScrollState();
      if (!reducedMotion) updateParallax();
    });
  }
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
  scheduleScrollUpdate();

  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".benefit-card, .code-window").forEach((element) => {
      let tiltFrame = 0;
      element.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
        tiltFrame = window.requestAnimationFrame(() => {
          const bounds = element.getBoundingClientRect();
          const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
          const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
          element.style.setProperty("--tilt-x", `${-vertical * 7}deg`);
          element.style.setProperty("--tilt-y", `${horizontal * 9}deg`);
          element.classList.add("is-tilting");
          tiltFrame = 0;
        });
      });
      element.addEventListener("pointerleave", () => {
        if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
        element.classList.remove("is-tilting");
        element.style.removeProperty("--tilt-x");
        element.style.removeProperty("--tilt-y");
        tiltFrame = 0;
      });
    });
  }

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    observedSections.forEach((section) => navObserver.observe(section));
  }

  const toast = document.querySelector(".toast");
  let toastTimer;
  document.querySelectorAll("[data-contact-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") !== link.dataset.contactPlaceholder) return;
      event.preventDefault();
      toast.textContent = "أضف رابط التواصل الحقيقي في هذا الموضع لتفعيل الرابط.";
      toast.classList.add("is-visible");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
    });
  });
})();