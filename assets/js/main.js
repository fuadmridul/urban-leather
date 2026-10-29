// Urban Leather — GSAP animations + small interactions
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header state on scroll
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
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

  // Order form -> Messenger handoff (no backend; the order finishes in chat)
  var form = document.getElementById("orderForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var product = document.getElementById("fProduct").value;
      var note = document.getElementById("fNote").value.trim();
      var lines = [
        "Hello Urban Leather! I would like to order:",
        "Product: " + product,
        "Name: " + name,
      ];
      if (note) lines.push("Note: " + note);
      lines.push("Please confirm the price and details. Thank you!");
      var message = lines.join("\n");

      var box = document.getElementById("orderSummary");
      box.textContent =
        "Your message is ready — Messenger is opening in a new tab. If it doesn't appear, copy this and send it to us:\n\n" +
        message;
      box.classList.remove("hidden");

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).catch(function () {});
      }
      window.open("https://m.me/61568058020640", "_blank", "noopener");
    });
  }

  // GSAP animations
  if (reduceMotion || typeof gsap === "undefined") {
    document.querySelectorAll("[data-hero], [data-reveal]").forEach(function (el) {
      el.style.opacity = "1";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance timeline
  var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(
    "[data-hero]",
    { opacity: 0, y: 36 },
    { opacity: 1, y: 0, duration: 1.05, stagger: 0.14, delay: 0.15 }
  );

  // Hero background parallax
  gsap.to("#heroBg", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: "#home",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // Section reveals
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 42 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );
  });
})();
