// MotorHaus — main.js
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- Preloader ---- */
  var preloader = document.getElementById("preloader");
  if (preloader) {
    var hidePreloader = function () { document.body.classList.add("loaded"); };
    if (document.readyState === "complete") hidePreloader();
    else window.addEventListener("load", hidePreloader);
    setTimeout(hidePreloader, 2500);
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header + scroll progress ---- */
  var header = document.getElementById("siteHeader");
  var scrollProgress = document.getElementById("scrollProgress");
  var heroSection = document.querySelector(".hero");
  var heroVisual = document.querySelector(".hero-visual");
  var heroVisualBaseOpacity = heroVisual ? parseFloat(getComputedStyle(heroVisual).opacity) || 0.9 : 0.9;
  function onScroll() {
    if (header) {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }

    var backBtn = document.getElementById("backToTop");
    if (backBtn) {
      if (window.scrollY > 500) backBtn.classList.add("visible");
      else backBtn.classList.remove("visible");
    }

    if (scrollProgress) {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.width = pct + "%";
    }

    if (heroSection && heroVisual && !prefersReducedMotion) {
      var rect = heroSection.getBoundingClientRect();
      // 0 at top of viewport, 1 once the hero has fully scrolled past
      var driveProgress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      // travel the full viewport width so the car exits completely off the left edge
      var travel = rect.width + heroVisual.offsetWidth;
      var tx = -driveProgress * travel;
      var ty = -driveProgress * 40;
      var rot = -driveProgress * 4;
      heroVisual.style.transform = "translate3d(" + tx + "px," + ty + "px,0) rotate(" + rot + "deg)";
      heroVisual.style.opacity = String(heroVisualBaseOpacity * (1 - driveProgress * 0.3));
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.innerHTML = isOpen
        ? '<svg class="icon" width="24" height="24"><use href="#icon-close"/></svg>'
        : '<svg class="icon" width="24" height="24"><use href="#icon-menu"/></svg>';
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = '<svg class="icon" width="24" height="24"><use href="#icon-menu"/></svg>';
      });
    });
  }

  /* ---- Back to top ---- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Scroll reveal (staggered within grids) ---- */
  var reveals = document.querySelectorAll(".reveal");
  var staggerGroups = document.querySelectorAll(".services-grid, .gallery-grid, .testimonial-grid, .process-steps, .hero-stats, .why-visual");
  staggerGroups.forEach(function (group) {
    var items = group.querySelectorAll(".reveal");
    items.forEach(function (el, i) {
      el.style.setProperty("--reveal-i", Math.min(i, 6));
    });
  });
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---- Animated stat counters ---- */
  var counters = document.querySelectorAll(".stat-num");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        openItem.classList.remove("open");
        var b = openItem.querySelector(".faq-q");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Contact form (client-side only, no backend wired up) ---- */
  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (form && formNote) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        formNote.textContent = "Please fill in all required fields correctly.";
        return;
      }
      formNote.textContent = "Thanks! Your request has been received — our team will call you back shortly.";
      form.reset();
    });
  }

  /* ---- Lightweight particle background ---- */
  var canvas = document.getElementById("particles");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var particleCount = window.innerWidth < 700 ? 26 : 55;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          hue: Math.random() > 0.5 ? "255, 30, 60" : "122, 0, 18"
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.hue + ", 0.55)";
        ctx.fill();
      });
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createParticles();
      }, 200);
    });
  }

  /* ---- Cursor glow (spotlight follow) ---- */
  var cursorGlow = document.getElementById("cursorGlow");
  if (cursorGlow && canHover && !prefersReducedMotion) {
    var glowX = 0, glowY = 0, glowTX = 0, glowTY = 0, glowRafId = null;

    var updateGlow = function () {
      glowX += (glowTX - glowX) * 0.15;
      glowY += (glowTY - glowY) * 0.15;
      cursorGlow.style.transform = "translate3d(" + glowX + "px," + glowY + "px,0) translate(-50%,-50%)";
      if (Math.abs(glowTX - glowX) > 0.5 || Math.abs(glowTY - glowY) > 0.5) {
        glowRafId = requestAnimationFrame(updateGlow);
      } else {
        glowRafId = null;
      }
    };
    document.addEventListener("mousemove", function (e) {
      glowTX = e.clientX;
      glowTY = e.clientY;
      cursorGlow.classList.add("active");
      if (!glowRafId) glowRafId = requestAnimationFrame(updateGlow);
    });
    document.addEventListener("mouseleave", function () {
      cursorGlow.classList.remove("active");
    });
  }

  /* ---- Scrollspy: highlight active nav link ---- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-desktop a"));
  var spySections = [];
  navAnchors.forEach(function (a) {
    var hash = a.getAttribute("href").split("#")[1];
    var sec = hash ? document.getElementById(hash) : null;
    if (sec) spySections.push({ el: sec, link: a });
  });
  if ("IntersectionObserver" in window && spySections.length) {
    var spyIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var match = null;
          for (var i = 0; i < spySections.length; i++) {
            if (spySections[i].el === entry.target) { match = spySections[i]; break; }
          }
          if (!match) return;
          navAnchors.forEach(function (a) { a.classList.remove("active"); });
          match.link.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    spySections.forEach(function (s) { spyIO.observe(s.el); });
  }

  /* ---- 3D tilt on cards ---- */
  if (canHover && !prefersReducedMotion) {
    var tiltEls = document.querySelectorAll(".service-card, .testimonial-card");
    tiltEls.forEach(function (card) {
      card.classList.add("tilt-card");
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(700px) rotateX(" + (py * -6) + "deg) rotateY(" + (px * 8) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    /* ---- Magnetic buttons ---- */
    var magneticEls = document.querySelectorAll(".btn-lg");
    magneticEls.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = e.clientX - rect.left - rect.width / 2;
        var my = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + (mx * 0.25) + "px," + (my * 0.35) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }
})();
