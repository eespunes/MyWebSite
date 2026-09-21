/* Scroll-spy dots, smooth in-page navigation, hero typing and matrix rain. */
(function () {
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

  /* ------------------------------------------------------ smooth nav links */
  root.addEventListener("click", function (ev) {
    var a = ev.target.closest('a[href^="#s-"]');
    if (!a) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    ev.preventDefault();
    root.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------- hero typing lines */
  (function type() {
    var el = document.getElementById("cv-type");
    if (!el) return;
    var lines = [
      "java --spring-boot --aws --event-driven",
      "migrate legacy/ --to cloud-native --in 6mo",
      "scale pipeline 20 -> 300000 events/day",
      "mcp connect copilot://customs-data",
    ];
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

  /* ---------------------------------------------------------- matrix rain */
  (function rain() {
    var canvas = document.getElementById("cv-rain");
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    var glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ERIK";
    var fs = 15;
    var cols = [];
    var w = 0;
    var h = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Array.from({ length: Math.ceil(w / fs) }, function () {
        return -Math.random() * (h / fs);
      });
    }

    resize();
    window.addEventListener("resize", resize);

    var last = 0;
    (function draw(t) {
      requestAnimationFrame(draw);
      if (t - last < 58) return;
      last = t;
      ctx.fillStyle = "rgba(18,18,18,0.09)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = fs + 'px "JetBrains Mono", monospace';
      for (var i = 0; i < cols.length; i++) {
        var ch = glyphs[(Math.random() * glyphs.length) | 0];
        var y = cols[i] * fs;
        ctx.fillStyle = Math.random() > 0.97 ? "#d6ffe9" : "#00BF63";
        ctx.fillText(ch, i * fs, y);
        if (y > h && Math.random() > 0.975) cols[i] = 0;
        else cols[i]++;
      }
    })(0);
  })();
})();
