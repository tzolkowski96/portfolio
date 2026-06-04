// readout.js — header readout: scroll progress + Central-time clock.
(function () {
  "use strict";

  var pct = document.getElementById("scrollPct");
  function pad3(n) { return ("00" + n).slice(-3); }
  function onScroll() {
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    pct.textContent = pad3(Math.round(p * 100)) + "%";
  }
  if (pct) {
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var clock = document.getElementById("clock");
  function tick() {
    try {
      var t = new Date().toLocaleTimeString("en-GB", { timeZone: "America/Chicago", hour12: false });
      clock.textContent = t + " CT";
    } catch (e) {
      clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false }) + " LOCAL";
    }
  }
  if (clock) { tick(); setInterval(tick, 1000); }
})();
