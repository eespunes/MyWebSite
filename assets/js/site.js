// Build v1.73 · 2026-09-21
/* Full-page paging, scroll-spy dots, expandable entries and the hero typing line. */
window.initSite = function () {
  "use strict";

  var root = document.getElementById("cv-scroll");
  if (!root) return;

  /* ---------------------------------------------------- active section dot */
  var sections = Array.prototype.slice.call(
    root.querySelectorAll("section[data-snap]")
  );
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-dot]"));

  function sync() {
    var mid = root.getBoundingClientRect().top + root.clientHeight * 0.5;
    var active = sections[0];
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.height > 0 && r.top <= mid && r.bottom > mid) active = s;
    });
    dots.forEach(function (d) {
      d.classList.toggle("is-active", d.getAttribute("data-dot") === active.id);
    });
  }

  var raf = 0;
  root.addEventListener(
    "scroll",
    function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        sync();
      });
    },
    { passive: true }
  );
  sync();

  /* --------------------------------------------------- one gesture, one page */
  /* Full-page paging: a wheel tick, arrow key or swipe moves exactly one
     section and the scroller is locked until it settles, so it can never come
     to rest between two sections. Sections whose content overflows scroll
     internally first (see .cv-pane) — only once a pane is at its end does the
     gesture page on. Disabled below 900px, where sections are free-flowing. */

  var paging = window.matchMedia("(min-width: 901px)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var locked = false;
  var unlockTimer = 0;
  var settleAt = 0;

  /* Hold the lock until the scroll has settled AND the gesture has stopped
     producing events, so a trackpad's momentum tail cannot page a second
     time. */
  function armUnlock() {
    clearTimeout(unlockTimer);
    var wait = Math.max(settleAt - Date.now(), 160);
    unlockTimer = setTimeout(function () {
      locked = false;
    }, wait);
  }

  function currentIndex() {
    var mid = root.scrollTop + root.clientHeight * 0.5;
    for (var i = 0; i < sections.length; i++) {
      var top = sections[i].offsetTop;
      if (mid >= top && mid < top + sections[i].offsetHeight) return i;
    }
    return root.scrollTop <= 0 ? 0 : sections.length - 1;
  }

  function goTo(index) {
    index = Math.max(0, Math.min(sections.length - 1, index));
    var top = sections[index].offsetTop;
    if (Math.abs(root.scrollTop - top) < 2) return false;
    locked = true;
    root.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    settleAt = Date.now() + (reduced ? 80 : 700);
    armUnlock();
    return true;
  }

  /* Let an overflowing pane consume the gesture before the page turns. */
  function paneCanScroll(target, delta) {
    var pane = target && target.closest ? target.closest(".cv-pane") : null;
    if (!pane) return false;
    var room = pane.scrollHeight - pane.clientHeight;
    if (room <= 1) return false;
    return delta > 0
      ? pane.scrollTop < room - 1
      : pane.scrollTop > 1;
  }

  root.addEventListener(
    "wheel",
    function (ev) {
      if (!paging.matches || ev.ctrlKey) return;
      var delta = ev.deltaY;
      if (Math.abs(delta) < 4) return;
      if (paneCanScroll(ev.target, delta)) return;
      ev.preventDefault();
      if (locked) {
        armUnlock();
        return;
      }
      goTo(currentIndex() + (delta > 0 ? 1 : -1));
    },
    { passive: false }
  );

  var PAGE_KEYS = {
    ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1,
  };

  root.addEventListener("keydown", function (ev) {
    if (!paging.matches) return;
    if (ev.target.closest("[data-exp-head]")) return;
    var step = PAGE_KEYS[ev.key];
    if (step === undefined && ev.key !== "Home" && ev.key !== "End") return;
    if (step !== undefined && paneCanScroll(ev.target, step)) return;
    ev.preventDefault();
    if (locked) return;
    if (ev.key === "Home") goTo(0);
    else if (ev.key === "End") goTo(sections.length - 1);
    else goTo(currentIndex() + step);
  });

  var touchY = null;

  root.addEventListener(
    "touchstart",
    function (ev) {
      touchY = ev.touches.length === 1 ? ev.touches[0].clientY : null;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchmove",
    function (ev) {
      if (!paging.matches || touchY === null || locked) return;
      var delta = touchY - ev.touches[0].clientY;
      if (Math.abs(delta) < 40) return;
      if (paneCanScroll(ev.target, delta)) return;
      touchY = null;
      goTo(currentIndex() + (delta > 0 ? 1 : -1));
    },
    { passive: true }
  );

  /* ------------------------------------------------------ smooth nav links */
  root.addEventListener("click", function (ev) {
    var a = ev.target.closest('a[href^="#s-"]');
    if (!a) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    ev.preventDefault();
    var i = sections.indexOf(target);
    if (i >= 0) goTo(i);
    else root.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  });

  /* ------------------------------------------------ expandable experience */
  function toggleEntry(head) {
    var key = head.getAttribute("data-exp-head");
    var body = document.querySelector('[data-exp-body="' + key + '"]');
    var chev = document.querySelector('[data-exp-chev="' + key + '"]');
    if (!body) return;
    var open = !body.hidden;
    body.hidden = open;
    head.setAttribute("aria-expanded", String(!open));
    var labels = window.CV_LABELS || {};
    if (chev) chev.textContent = open ? labels.expand || "" : labels.collapse || "";
  }

  root.addEventListener("click", function (ev) {
    var head = ev.target.closest("[data-exp-head]");
    if (head) toggleEntry(head);
  });

  root.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    var head = ev.target.closest("[data-exp-head]");
    if (!head) return;
    ev.preventDefault();
    toggleEntry(head);
  });

  /* ----------------------------------------------------- hero typing lines */
  (function type() {
    var el = document.getElementById("cv-type");
    if (!el) return;
    var lines = window.CV_TERMINAL_LINES || [];
    if (!lines.length) return;
    if (reduced) {
      el.textContent = lines[0];
      return;
    }
    var li = 0;
    var ci = 0;
    var deleting = false;

    (function tick() {
      var full = lines[li];
      ci += deleting ? -1 : 1;
      el.textContent = full.slice(0, ci);
      var wait = deleting ? 28 : 55;
      if (!deleting && ci === full.length) {
        deleting = true;
        wait = 1900;
      } else if (deleting && ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        wait = 320;
      }
      setTimeout(tick, wait);
    })();
  })();
};
