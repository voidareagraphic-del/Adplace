/* Brand case pages — scroll engine (no dependencies).
   data-p="scene"  : sticky scene, --p runs 0→1 while the scene is pinned
   data-p="view"   : --p runs 0→1 as the element travels from the bottom of the screen to its upper third
   data-steps="n"  : also sets data-step (0…n-1) and toggles .is-on on descendants with data-s="k"
*/
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.hasAttribute("data-count")) count(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".rv,.tints,[data-count],[data-in]").forEach(function (el) { io.observe(el); });

  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), t0 = performance.now(), fa = el.hasAttribute("data-fa");
    (function tick(t) {
      var k = reduce ? 1 : clamp((t - t0) / 1100, 0, 1), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = fa ? String(v).replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }) : v;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  var scrubs = [].slice.call(document.querySelectorAll("[data-p]"));
  var bar = document.querySelector(".bar");
  var tones = [].slice.call(document.querySelectorAll(".cover:not(.cover--light),.divider,[data-tone]"));
  var hooks = window.BOOK_HOOKS || [];

  function frame() {
    var vh = innerHeight, y = scrollY, max = document.documentElement.scrollHeight - vh;
    if (bar) {
      bar.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
      var onTone = tones.some(function (t) { var r = t.getBoundingClientRect(); return r.top <= 24 && r.bottom >= 24; });
      bar.classList.toggle("on-tone", onTone);
    }
    scrubs.forEach(function (el) {
      var r = el.getBoundingClientRect(), mode = el.getAttribute("data-p"), p;
      if (r.bottom < -vh || r.top > vh * 2) return;
      if (mode === "scene") p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      else if (mode === "pass") p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      else p = clamp((vh - r.top) / (vh * 0.7), 0, 1);
      if (reduce && mode !== "scene") p = 1;
      el.style.setProperty("--p", p.toFixed(4));
      var n = +el.getAttribute("data-steps");
      if (n) {
        var s = Math.min(n - 1, Math.floor(p * n));
        if (el._s !== s) {
          el._s = s; el.setAttribute("data-step", s);
          el.querySelectorAll("[data-s]").forEach(function (c) {
            var ks = c.getAttribute("data-s").split(",");
            c.classList.toggle("is-on", ks.indexOf(String(s)) > -1);
          });
        }
      }
      for (var i = 0; i < hooks.length; i++) hooks[i](el, p);
    });
  }
  var busy = false;
  function req() { if (!busy) { busy = true; requestAnimationFrame(function () { busy = false; frame(); }); } }
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  frame();

  /* copy colour values */
  var toast = document.createElement("div"); toast.className = "toast"; document.body.appendChild(toast);
  var tt;
  function say(m) { toast.textContent = m; toast.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("is-on"); }, 1500); }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-hex]");
    if (c) {
      var hex = c.getAttribute("data-hex"), ok = function () { say(hex + " — copied"); };
      try { navigator.clipboard.writeText(hex).then(ok, ok); } catch (_) { ok(); }
    }
    var z = e.target.closest(".zoom");
    if (z) { lbImg.src = z.getAttribute("data-full") || z.querySelector("img").src; lb.classList.add("is-on"); }
  });

  var lb = document.createElement("div"); lb.className = "lb"; lb.innerHTML = "<img alt=''>";
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");
  lb.addEventListener("click", function () { lb.classList.remove("is-on"); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("is-on"); });

  window.BOOK = { refresh: req };
})();
