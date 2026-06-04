// contact.js — contact form submits to Formspree over AJAX so the page never
// navigates away. If JS fails, the form's native action/method still POST.
(function () {
  "use strict";

  var cf = document.getElementById("contactForm");
  if (!cf) return;
  var cs = document.getElementById("cstatus");

  cf.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = cf.querySelector("button[type=submit]");
    cs.className = "cstatus"; cs.textContent = "Sending…";
    btn.disabled = true;
    fetch(cf.action, { method: "POST", body: new FormData(cf), headers: { "Accept": "application/json" } })
      .then(function (r) {
        if (r.ok) {
          cf.reset();
          cs.className = "cstatus ok";
          cs.textContent = "Thanks. Your message is on its way.";
          return;
        }
        return r.json().then(function (d) {
          var m = (d && d.errors && d.errors.map(function (x) { return x.message; }).join(", "))
            || "Something went wrong. Try again, or reach me on LinkedIn.";
          cs.className = "cstatus err"; cs.textContent = m;
        });
      })
      .catch(function () {
        cs.className = "cstatus err";
        cs.textContent = "Network error. Try again, or reach me on LinkedIn.";
      })
      .finally(function () { btn.disabled = false; });
  });
})();
