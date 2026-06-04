// nav.js — mobile section menu + scroll-spy active-link highlighting.
(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var btn = document.getElementById("menuBtn");
  if (nav && btn) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (nav && "IntersectionObserver" in window) {
    var links = nav.querySelectorAll("a");
    var sections = document.querySelectorAll("section[id]");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        links.forEach(function (l) {
          var on = l.getAttribute("href") === "#" + id;
          l.classList.toggle("active", on);
          if (on) { l.setAttribute("aria-current", "true"); }
          else { l.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
