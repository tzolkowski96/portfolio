// feed.js — Medium writing feed: stamp a sync time and hydrate from feed.json
// (written by the scheduled Action) when present, falling back to the posts
// baked into the HTML so the section is never empty.
(function () {
  "use strict";

  var HANDLE = "@grateful_aqua_goat_147";
  var feedSync = document.getElementById("feedSync");

  function stampSync() {
    var t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (feedSync) { feedSync.textContent = HANDLE + " · synced " + t; }
  }

  function renderFeed(items) {
    var feed = document.getElementById("feed");
    if (!feed || !items || !items.length) return;
    feed.innerHTML = items.slice(0, 6).map(function (p) {
      var meta = (p.read ? "<span>" + p.read + "</span>" : "") + "<span class='open'>Open →</span>";
      return "<a class='post' href='" + p.url + "' target='_blank' rel='noopener'>"
        + "<div class='date'>" + p.date + "</div>"
        + "<div class='body'><div class='ttl'>" + p.title + "</div>"
        + (p.dek ? "<div class='dek'>" + p.dek + "</div>" : "")
        + (p.tag ? "<div class='tag'>" + p.tag + "</div>" : "") + "</div>"
        + "<div class='meta'>" + meta + "</div></a>";
    }).join("");
  }

  stampSync();
  fetch("feed.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (items) { if (items) { renderFeed(items); stampSync(); } })
    .catch(function () { /* no feed.json yet — keep the embedded posts */ });
})();
