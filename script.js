
(() => {
  "use strict";

  /* =========================================
     RAM. PORTFOLIO — INTERACTION ENGINE
     ========================================= */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isMobile = window.matchMedia(
    "(max-width: 768px)"
  ).matches;


  /* =========================================
     01. PAGE INITIALIZATION
     ========================================= */

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("page-loaded");

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    initializeNavigation();
    initializeScrollProgress();
    initializeScrollAnimations();
    initializeCursor();
    initializeMagneticButtons();
    initializeCardEffects();
    initializeTextGlitch();
    initializeCertificatePreview();
    initializeComments();
    initializeContactForm();
    initializeImageFallback();
    initializeActiveNavigation();
  });


  /* =========================================
     02. NAVIGATION
     ========================================= */

  function initializeNavigation() {
    const navbar = $("#navbar");
    const menuToggle = $("#menuToggle");
    const nav = $("#nav");

    if (!navbar) return;

    const updateNavbar = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    };

    window.addEventListener("scroll", updateNavbar, {
      passive: true
    });

    updateNavbar();

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    $$("a", nav).forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      }
    });
  }


  /* =========================================
     03. SCROLL PROGRESS
     ========================================= */

  function initializeScrollProgress() {
    const progress = $("#progress");
    if (!progress) return;

    let ticking = false;

    function update() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage = scrollable > 0
        ? (window.scrollY / scrollable) * 100
        : 0;

      progress.style.width = `${percentage}%`;
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }


  /* =========================================
     04. LENIS SMOOTH SCROLL
     ========================================= */

  let lenis = null;

  function initializeSmoothScroll() {
    if (reducedMotion || isMobile || !window.Lenis) return;

    lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      lerp: 0.085
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);
    }

    document.addEventListener("click", event => {
      const link = event.target.closest('a[href^="#"]');

      if (!link || !lenis) return;

      const target = $(link.getAttribute("href"));

      if (target) {
        event.preventDefault();
        lenis.scrollTo(target, {
          offset: -75,
          duration: 1.25
        });
      }
    });
  }


  /* =========================================
     05. GSAP SCROLL ANIMATIONS
     ========================================= */

  function initializeScrollAnimations() {
    const motionTargets = $$(".reveal:not(.section-heading):not(.future-card):not(.expertise-card):not(.certificate)").filter(element => !element.matches(".contact-heading h2"));

    // If animation libraries are unavailable, keep every section visible.
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
      motionTargets.forEach(element => element.classList.add("visible"));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    initializeSmoothScroll();

    // Scroll-linked motion: progress follows the scrollbar and reverses
    // naturally when the visitor scrolls upward. No opacity fade system.
    motionTargets.forEach((element, index) => {
      const direction = index % 4;
      const from = direction === 0
        ? { x: -150, y: 35, rotateY: -13, rotateX: 5, scale: 0.94 }
        : direction === 1
          ? { x: 150, y: 35, rotateY: 13, rotateX: -5, scale: 0.94 }
          : direction === 2
            ? { x: 0, y: 125, rotateX: 12, rotateY: 0, scale: 0.92 }
            : { x: 0, y: -115, rotateX: -10, rotateY: 0, scale: 0.94 };

      gsap.fromTo(element, from, {
        x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: element,
          start: "top 96%",
          end: "top 42%",
          scrub: 1.35,
          invalidateOnRefresh: true
        }
      });
    });

    // Headings travel across the viewport with a 3D tilt, tied to scroll.
    $$(".section-heading, .contact-heading h2").forEach((heading, index) => {
      gsap.fromTo(heading,
        { x: index % 2 ? 115 : -115, rotateY: index % 2 ? 12 : -12, scale: 0.94 },
        {
          x: 0, rotateY: 0, scale: 1, ease: "none",
          scrollTrigger: {
            trigger: heading,
            start: "top 98%",
            end: "top 48%",
            scrub: 1.6,
            invalidateOnRefresh: true
          }
        }
      );
    });

    // Images have a stronger camera push/pull as each project passes by.
    $$(".project-image img, .about-photo img").forEach((image, index) => {
      gsap.fromTo(image,
        { scale: 1.34, yPercent: index % 2 ? 13 : -13, rotateZ: index % 2 ? 1.5 : -1.5 },
        {
          scale: 1, yPercent: 0, rotateZ: 0, ease: "none",
          scrollTrigger: {
            trigger: image.closest(".project, .about-photo") || image,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.8,
            invalidateOnRefresh: true
          }
        }
      );
    });

    // Portrait moves like a slow camera rig through the hero section.
    const heroPhoto = $(".hero-photo");
    const portrait = $(".portrait-card");
    if (heroPhoto) {
      gsap.fromTo(heroPhoto,
        { scale: 1.22, yPercent: -8, rotateZ: -1.2 },
        {
          scale: 1.04, yPercent: 8, rotateZ: 0, ease: "none",
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: 2,
            invalidateOnRefresh: true
          }
        }
      );
    }
    if (portrait) {
      gsap.fromTo(portrait,
        { y: 0, rotateY: -5 },
        {
          y: 95, rotateY: 5, ease: "none",
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: 2.2
          }
        }
      );
    }

    // Large statement and technology tiles get pronounced scroll travel.
    $$(".statement h2").forEach((statement, index) => {
      gsap.fromTo(statement,
        { x: index % 2 ? 180 : -180, rotateX: 8, scale: 0.92 },
        {
          x: 0, rotateX: 0, scale: 1, ease: "none",
          scrollTrigger: {
            trigger: statement,
            start: "top 100%",
            end: "top 30%",
            scrub: 1.7
          }
        }
      );
    });

    $$(".future-card, .expertise-card, .certificate").forEach((card, index) => {
      gsap.fromTo(card,
        { y: index % 2 ? 105 : -85, rotateY: index % 2 ? 11 : -11, scale: 0.92 },
        {
          y: 0, rotateY: 0, scale: 1, ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 98%",
            end: "top 50%",
            scrub: 1.5
          }
        }
      );
    });

    ScrollTrigger.refresh();
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }

  /* =========================================
     06. CUSTOM CURSOR
     ========================================= */

  function initializeCursor() {
    if (isMobile || reducedMotion) return;

    const cursor = $("#cursor");
    const ring = $("#cursorRing");

    if (!cursor || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    document.addEventListener("pointermove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursor.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;

      ring.style.transform =
        `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    $$("a, button, input, textarea, select").forEach(element => {
      element.addEventListener("mouseenter", () => {
        cursor.classList.add("cursor-hover");
        ring.classList.add("cursor-ring-hover");
      });

      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("cursor-hover");
        ring.classList.remove("cursor-ring-hover");
      });
    });
  }


  /* =========================================
     07. MAGNETIC BUTTONS
     ========================================= */

  function initializeMagneticButtons() {
    if (isMobile || reducedMotion) return;

    $$(".primary-button, .secondary-button, .nav-button").forEach(button => {
      button.addEventListener("pointermove", event => {
        const rect = button.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.transform =
          `translate(${x * 0.12}px, ${y * 0.16}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }


  /* =========================================
     08. 3D CARD TILT + GLOW
     ========================================= */

  function initializeCardEffects() {
    if (isMobile || reducedMotion) return;

    const cards = $$(".project, .expertise-card, .future-card, .certificate");

    cards.forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 5;
        const rotateX = ((centerY - y) / centerY) * 5;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);

        card.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }


  /* =========================================
     09. GLITCH TEXT EFFECT
     ========================================= */

  function initializeTextGlitch() {
    if (reducedMotion) return;

    const headings = $$(".glitch-heading, .section-heading");

    headings.forEach(heading => {
      heading.addEventListener("mouseenter", () => {
        heading.classList.add("glitch-active");

        window.setTimeout(() => {
          heading.classList.remove("glitch-active");
        }, 500);
      });
    });

    /* Random subtle glitch */

    const heroHeading = $(".glitch-heading");

    if (!heroHeading) return;

    window.setInterval(() => {
      if (document.hidden) return;

      heroHeading.classList.add("glitch-active");

      window.setTimeout(() => {
        heroHeading.classList.remove("glitch-active");
      }, 180);

    }, 6500);
  }


  /* =========================================
     10. ACTIVE NAVIGATION
     ========================================= */

  function initializeActiveNavigation() {
    const sections = $$("main section[id]");
    const navLinks = $$("#nav a");

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", active);
        });
      });
    }, {
      rootMargin: "-35% 0px -55% 0px"
    });

    sections.forEach(section => observer.observe(section));
  }


  /* =========================================
     11. CERTIFICATE PDF PREVIEW
     ========================================= */

  function initializeCertificatePreview() {
    const modal = $("#pdfModal");
    const viewer = $("#pdfViewer");
    const closeButton = $("#closeModal");

    if (!modal || !viewer || !closeButton) return;

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");

      window.setTimeout(() => {
        viewer.src = "about:blank";
      }, 250);
    };

    $$(".preview-button").forEach(button => {
      button.addEventListener("click", () => {
        const pdfPath = button.dataset.pdf;

        if (!pdfPath) return;

        viewer.src = pdfPath;
        modal.classList.add("active");
        document.body.classList.add("modal-open");
      });
    });

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
    });
  }


  /* =========================================
     12. COMMENTS SYSTEM
     ========================================= */

  function initializeComments() {
    const form = $("#commentForm");
    const feed = $("#commentFeed");
    const status = $("#commentStatus");
    const viewComments = $("#viewComments");

    if (!form || !feed) return;

    const STORAGE_KEY = "ram_portfolio_comments_v1";
    const MAX_COMMENTS = 30;

    function getComments() {
      try {
        const stored = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(stored) ? stored : [];
      } catch {
        return [];
      }
    }

    function saveComments(comments) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(comments.slice(0, MAX_COMMENTS))
        );

        return true;
      } catch {
        return false;
      }
    }

    function createCommentElement(comment) {
      const article = document.createElement("article");
      article.className = "comment-item";

      const name = document.createElement("strong");
      name.className = "comment-author";
      name.textContent = comment.name;

      const message = document.createElement("p");
      message.className = "comment-message";
      message.textContent = comment.message;

      const date = document.createElement("span");
      date.className = "comment-date";
      date.textContent = comment.date;

      article.append(name, message, date);

      return article;
    }

    function updateViewCommentsLink() {
      if (!viewComments) return;
      const count = getComments().length;
      const isOpen = viewComments.getAttribute("aria-expanded") === "true";
      viewComments.textContent = isOpen
        ? `HIDE COMMENTS (${count}) ↑`
        : `VIEW COMMENTS (${count}) ↓`;
    }

    if (viewComments) {
      viewComments.addEventListener("click", () => {
        const isOpen = viewComments.getAttribute("aria-expanded") === "true";
        const shouldOpen = !isOpen;
        feed.hidden = !shouldOpen;
        viewComments.setAttribute("aria-expanded", String(shouldOpen));
        updateViewCommentsLink();
      });
    }

    function renderComments() {
      const comments = getComments();

      feed.replaceChildren();

      if (!comments.length) {
        const empty = document.createElement("p");
        empty.className = "empty-comments";
        empty.textContent = "✳ Be the first to leave a note.";

        feed.appendChild(empty);
        updateViewCommentsLink();
        return;
      }

      comments.forEach(comment => {
        feed.appendChild(createCommentElement(comment));
      });
      updateViewCommentsLink();
    }

    form.addEventListener("submit", event => {
      event.preventDefault();

      const name = $("#commentName")?.value.trim();
      const message = $("#commentMessage")?.value.trim();

      if (!name || !message) {
        if (status) status.textContent = "Please complete both fields.";
        return;
      }

      if (name.length > 60 || message.length > 1000) {
        if (status) status.textContent = "Your message is too long.";
        return;
      }

      const comments = getComments();

      comments.unshift({
        name,
        message,
        date: new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      });

      if (!saveComments(comments)) {
        if (status) {
          status.textContent = "Unable to save comments in this browser.";
        }
        return;
      }

      form.reset();
      renderComments();

      if (status) status.textContent = "Your comment has been saved!";

      window.setTimeout(() => {
        if (status) status.textContent = "";
      }, 3500);
    });

    renderComments();
  }


  /* =========================================
     13. WHATSAPP CONTACT FORM
     ========================================= */

  function initializeContactForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");

    if (!form) return;

    const WHATSAPP_NUMBER = "918519982011";

    form.addEventListener("submit", event => {
      event.preventDefault();

      const formData = new FormData(form);

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const budget = String(formData.get("budget") || "Not specified").trim();
      const timeline = String(formData.get("timeline") || "Not specified").trim();
      const details = String(formData.get("details") || "").trim();

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneDigits = phone.replace(/\D/g, "");

      if (!name || !email || !phone || !service || !details) {
        if (status) status.textContent = "Please complete all required fields.";
        return;
      }

      if (!emailValid) {
        if (status) status.textContent = "Please enter a valid email address.";
        return;
      }

      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        if (status) status.textContent = "Please enter a valid phone number.";
        return;
      }

      if (details.length < 10) {
        if (status) status.textContent = "Please provide at least 10 characters of project details.";
        return;
      }

      const message = [
        "RAM. — NEW PROJECT ENQUIRY",
        "--------------------------------",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Interest: ${service}`,
        `Estimated Budget: ${budget}`,
        `Timeline: ${timeline}`,
        "",
        "PROJECT DETAILS",
        details,
        "",
        "Sent through RAM. Portfolio"
      ].join("\n");

      const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      const newWindow = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
      );

      if (status) {
        status.textContent = newWindow
          ? "WhatsApp opened. Review your message and press Send."
          : "Please allow pop-ups to open WhatsApp.";
      }
    });
  }


  /* =========================================
     14. IMAGE FALLBACK
     ========================================= */

  function initializeImageFallback() {
    $$("img").forEach(img => {
      img.addEventListener("error", () => {
        img.classList.add("image-error");

        img.style.background =
          "linear-gradient(135deg, #17152d, #24204a, #142e42)";

        img.alt = img.alt || "Image unavailable";
      }, { once: true });
    });
  }


  /* =========================================
     15. HOVER SOUND-FREE INTERACTIONS
     ========================================= */

  function initializeSectionTransitions() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;

    $$(".section").forEach(section => {
      gsap.fromTo(
        section,
        { "--section-glow": 0 },
        {
          "--section-glow": 1,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "top 25%",
            scrub: true
          }
        }
      );
    });
  }


  /* =========================================
     16. INITIALIZE OPTIONAL EFFECTS
     ========================================= */

  initializeSectionTransitions();


})();
/* =====================================
   SCROLL UP / DOWN REVEAL ANIMATIONS
===================================== */

function initializeDirectionalScrollAnimations() {
    const elements = document.querySelectorAll(".reveal");

    if (!elements.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        elements.forEach(element => {
            element.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const element = entry.target;

            if (entry.isIntersecting) {
                const direction = window.scrollY >=
                    (element.dataset.lastScrollY || 0)
                    ? "down"
                    : "up";

                element.classList.remove(
                    "from-top",
                    "from-bottom",
                    "from-left",
                    "from-right"
                );

                element.classList.add(
                    direction === "down" ? "from-bottom" : "from-top"
                );

                requestAnimationFrame(() => {
                    element.classList.add("is-visible");
                });
            } else {
                element.classList.remove("is-visible");
                element.dataset.lastScrollY = window.scrollY;
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    elements.forEach(element => observer.observe(element));
}