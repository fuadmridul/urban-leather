// Urban Leather — GSAP animations + small interactions (shared by all pages)
(function () {
  "use strict";

  // Tell the inline watchdog (in each page) that this script ran and is
  // managing animation visibility — it only forces content visible if
  // this file never executes at all.
  window.__ulAnimOk = true;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // ---------- Page transition: wipe OUT on internal page links ----------
  var overlay = document.getElementById("pageTransition");
  function isInternalPage(href) {
    return /^[a-z0-9\-\/]+\.html(#.*)?$/i.test(href) && href.indexOf("://") === -1;
  }
  if (overlay && !reduceMotion) {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || !isInternalPage(href)) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        overlay.style.animation = "none";
        overlay.style.visibility = "visible";
        overlay.style.pointerEvents = "all";
        overlay.style.transform = "translateX(-101%)";
        void overlay.offsetWidth; // reflow so the transition runs
        overlay.style.transition = "transform 0.45s cubic-bezier(0.76, 0, 0.24, 1)";
        overlay.style.transform = "translateX(0)";
        window.setTimeout(function () {
          window.location.href = href;
        }, 470);
      });
    });
  }

  // ---------- Header state + back-to-top on scroll ----------
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    if (header) {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    if (toTop) {
      if (window.scrollY > 600) toTop.classList.add("show");
      else toTop.classList.remove("show");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // ---------- Mobile menu ----------
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("hidden");
      menuBtn.setAttribute("aria-expanded", String(!open));
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Order form -> Messenger handoff (no backend) ----------
  var form = document.getElementById("orderForm");
  if (form) {
    var nameEl = document.getElementById("fName");
    var productEl = document.getElementById("fProduct");
    var noteEl = document.getElementById("fNote");
    var errBox = document.getElementById("formError");
    [nameEl, productEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () { el.classList.remove("field-error"); });
      el.addEventListener("change", function () { el.classList.remove("field-error"); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = nameEl.value.trim();
      var product = productEl.value;
      var note = noteEl.value.trim();

      // Required-field feedback: highlight + message instead of failing silently
      var missing = [];
      if (!name) { nameEl.classList.add("field-error"); missing.push("your name"); }
      if (!product) { productEl.classList.add("field-error"); missing.push("a product"); }
      if (missing.length) {
        if (errBox) {
          errBox.textContent = "Please add " + missing.join(" and ") + " so we can take your order.";
          errBox.classList.remove("hidden");
        }
        (!name ? nameEl : productEl).focus();
        return;
      }
      if (errBox) errBox.classList.add("hidden");

      var lines = [
        "Hello Urban Leather! I would like to order:",
        "Product: " + product,
        "Name: " + name,
      ];
      if (note) lines.push("Note: " + note);
      lines.push("Please confirm the price and details. Thank you!");
      var message = lines.join("\n");

      var box = document.getElementById("orderSummary");
      if (box) {
        box.textContent =
          "Your message is ready — Messenger is opening in a new tab. If it doesn't appear, copy this and send it to us:\n\n" +
          message;
        box.classList.remove("hidden");
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).catch(function () {});
      }
      window.open("https://m.me/61568058020640", "_blank", "noopener");
    });
  }

  // ---------- No-animation fallback: make everything visible ----------
  if (reduceMotion || !hasGsap) {
    document.querySelectorAll("[data-hero], [data-reveal]").forEach(function (el) {
      el.style.opacity = "1";
    });
    document.querySelectorAll(".line-inner").forEach(function (el) {
      el.style.transform = "none";
    });
    return;
  }

  // ---------- GSAP animation setup (guarded: any failure shows content) ----------
  try {
  // ---------- Hero entrance: masked headline lines, then the rest ----------
  var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  var lineInners = gsap.utils.toArray(".line-inner");
  if (lineInners.length) {
    heroTl.fromTo(
      lineInners,
      { yPercent: 112 },
      {
        yPercent: 0,
        duration: 1.05,
        stagger: 0.14,
        delay: 0.55,
        ease: "power4.out",
      }
    );
  }
  var heroEls = gsap.utils.toArray("[data-hero]");
  if (heroEls.length) {
    heroTl.fromTo(
      heroEls,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.12 },
      lineInners.length ? "-=0.55" : 0.15
    );
  }

  // ---------- Monogram badge gentle float ----------
  var badge = document.querySelector(".float-badge");
  if (badge) {
    gsap.to(badge, {
      y: -12,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1.6,
    });
  }

  // ---------- Hero background parallax ----------
  var heroBg = document.getElementById("heroBg");
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: heroBg.closest("section") || heroBg,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // ---------- Section heads: eyebrow letters, heading, gold rule ----------
  gsap.utils.toArray(".section-head").forEach(function (head) {
    var eyebrow = head.querySelector(".eyebrow");
    var chars = [];
    if (eyebrow && !eyebrow.dataset.split) {
      eyebrow.dataset.split = "1";
      var text = eyebrow.textContent;
      eyebrow.textContent = "";
      text.split("").forEach(function (c) {
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = c === " " ? " " : c;
        eyebrow.appendChild(s);
        chars.push(s);
      });
    }
    var tl = gsap.timeline({
      scrollTrigger: { trigger: head, start: "top 86%", once: true },
    });
    if (chars.length) {
      tl.fromTo(
        chars,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.022, ease: "power2.out" }
      );
    }
    var heading = head.querySelector("h2, h3");
    if (heading) {
      tl.fromTo(
        heading,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
        chars.length ? "-=0.25" : 0
      );
    }
    var rule = head.querySelector(".gold-rule");
    if (rule) {
      tl.fromTo(
        rule,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      );
    }
    var sub = head.querySelector("p:not(.eyebrow)");
    if (sub) {
      tl.fromTo(
        sub,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=0.45"
      );
    }
  });

  // ---------- Generic reveals (excluding product cards in grids) ----------
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    if (el.closest(".card-grid")) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 42 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  // ---------- Product grids: staggered reveal ----------
  gsap.utils.toArray(".card-grid").forEach(function (grid) {
    var cards = grid.querySelectorAll(".product-card");
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      }
    );
  });

  // ---------- Craft / cover images: gentle parallax ----------
  gsap.utils.toArray(".parallax-img").forEach(function (img) {
    gsap.set(img, { scale: 1.1 });
    gsap.fromTo(
      img,
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest("section") || img,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });

  // ---------- Product card 3D tilt (desktop, fine pointer only) ----------
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".product-card").forEach(function (card) {
      var rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      var ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 7);
        rx(-py * 7);
      });
      card.addEventListener("mouseleave", function () {
        rx(0);
        ry(0);
      });
    });
  }

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
  } catch (err) {
    // Animation setup failed midway — never leave content hidden.
    document.querySelectorAll("[data-hero], [data-reveal]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".line-inner").forEach(function (el) {
      el.style.transform = "none";
    });
  }
})();
