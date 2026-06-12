// ============================================================
//  Community Calendar — app.js
// ============================================================

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────
  let events = [];      // parsed event objects
  let currentYear  = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed
  let currentView  = "calendar";

  // ── DOM refs ───────────────────────────────────────────────
  const monthLabel    = document.getElementById("month-label");
  const calendarBody  = document.getElementById("calendar-body");
  const listBody      = document.getElementById("list-body");
  const statusBar     = document.getElementById("status-bar");
  const statusMsg     = document.getElementById("status-msg");
  const lastSync      = document.getElementById("last-sync");
  const modalOverlay  = document.getElementById("modal-overlay");
  const modalClose    = document.getElementById("modal-close");
  const siteBrandName = document.querySelector(".brand-name");

  // ── Init ───────────────────────────────────────────────────
  siteBrandName.textContent = CONFIG.SITE_NAME;
  document.title = CONFIG.SITE_NAME;

  setupNavButtons();
  setupMonthNav();
  setupModal();
  fetchEvents();

  if (CONFIG.REFRESH_INTERVAL > 0) {
    setInterval(fetchEvents, CONFIG.REFRESH_INTERVAL);
  }

  // ── Data fetching ──────────────────────────────────────────
  async function fetchEvents() {
    showStatus("Syncing events…", false);

    const range  = encodeURIComponent(`${CONFIG.SHEET_NAME}!A2:Z1000`);
    const url    = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;

    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      events = parseRows(data.values || []);
      hideStatus();
      render();

      const now = new Date();
      lastSync.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    } catch (err) {
      console.error("Failed to load events:", err);
      showStatus(`Could not load events: ${err.message}. Check your Sheet ID and API key in config.js.`, true);
      // If we already have events cached, still render them
      if (events.length) render();
    }
  }

  function parseRows(rows) {
    const C = CONFIG.COLUMNS;
    return rows
      .map((row, i) => ({
        date:        (row[C.date]        || "").trim(),
        name:        (row[C.name]        || "Untitled Event").trim(),
        description: (row[C.description] || "").trim(),
        location:    (row[C.location]    || "").trim(),
        spots:       (row[C.spots]       || "").trim(),
        signupUrl:   (row[C.signupUrl]   || "").trim(),
        rowIndex:    i + 2, // 1-indexed, skipping header row
      }))
      .filter(e => e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date));
  }

  // ── Rendering ──────────────────────────────────────────────
  function render() {
    renderMonthLabel();
    if (currentView === "calendar") renderCalendar();
    else renderList();
  }

  function renderMonthLabel() {
    const d = new Date(currentYear, currentMonth, 1);
    monthLabel.textContent = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function renderCalendar() {
    calendarBody.innerHTML = "";

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = toDateStr(new Date());

    // Blank cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      calendarBody.appendChild(makeEl("div", "calendar-cell empty"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      const dayEvents = events.filter(e => e.date === dateStr);

      const cell = makeEl("div", `calendar-cell${dateStr === today ? " today" : ""}`);
      cell.dataset.date = dateStr;

      const num = makeEl("span", "day-number");
      num.textContent = d;
      cell.appendChild(num);

      dayEvents.forEach(ev => {
        const pill = makeEl("button", "event-pill");
        pill.textContent = ev.name;
        pill.addEventListener("click", () => openModal(ev));
        cell.appendChild(pill);
      });

      calendarBody.appendChild(cell);
    }
  }

  function renderList() {
    listBody.innerHTML = "";

    // Filter events for the current month
    const prefix = `${currentYear}-${pad(currentMonth + 1)}`;
    const monthEvents = events
      .filter(e => e.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (monthEvents.length === 0) {
      const empty = makeEl("p", "list-empty");
      empty.textContent = "No events this month.";
      listBody.appendChild(empty);
      return;
    }

    monthEvents.forEach(ev => {
      const row = makeEl("button", "list-row");
      row.addEventListener("click", () => openModal(ev));

      const dateDiv = makeEl("div", "list-date");
      const d = new Date(ev.date + "T00:00:00");
      dateDiv.innerHTML = `<span class="list-day">${d.getDate()}</span><span class="list-weekday">${d.toLocaleDateString("en-US", { weekday: "short" })}</span>`;

      const infoDiv = makeEl("div", "list-info");
      const nameEl  = makeEl("span", "list-name");
      nameEl.textContent = ev.name;
      infoDiv.appendChild(nameEl);

      if (ev.location) {
        const locEl = makeEl("span", "list-location");
        locEl.textContent = "📍 " + ev.location;
        infoDiv.appendChild(locEl);
      }

      row.appendChild(dateDiv);
      row.appendChild(infoDiv);

      if (ev.signupUrl) {
        const badge = makeEl("span", "list-signup-badge");
        badge.textContent = "Sign up →";
        row.appendChild(badge);
      }

      listBody.appendChild(row);
    });
  }

  // ── Modal ──────────────────────────────────────────────────
  function openModal(ev) {
    const d = new Date(ev.date + "T00:00:00");
    const formatted = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    document.getElementById("modal-date-badge").textContent = formatted;
    document.getElementById("modal-title").textContent = ev.name;
    document.getElementById("modal-description").textContent = ev.description || "No description provided.";

    const meta = document.getElementById("modal-meta");
    meta.innerHTML = "";

    if (ev.location) {
      const loc = makeEl("div", "meta-item");
      loc.innerHTML = `<span class="meta-icon">📍</span> ${ev.location}`;
      meta.appendChild(loc);
    }

    if (ev.spots) {
      const spots = makeEl("div", "meta-item");
      spots.innerHTML = `<span class="meta-icon">👥</span> ${ev.spots} spot${ev.spots === "1" ? "" : "s"} available`;
      meta.appendChild(spots);
    }

    const signupArea = document.getElementById("modal-signup");
    signupArea.innerHTML = "";

    if (ev.signupUrl) {
      const btn = makeEl("a", "signup-btn");
      btn.href = ev.signupUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.textContent = "Sign up for this event →";
      signupArea.appendChild(btn);
    } else {
      const note = makeEl("p", "no-signup");
      note.textContent = "No sign-up link for this event.";
      signupArea.appendChild(note);
    }

    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  function setupModal() {
    modalClose.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
    });
  }

  // ── Navigation ─────────────────────────────────────────────
  function setupMonthNav() {
    document.getElementById("prev-month").addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      render();
    });
    document.getElementById("next-month").addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      render();
    });
  }

  function setupNavButtons() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.view;
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("view-calendar").classList.toggle("hidden", currentView !== "calendar");
        document.getElementById("view-list").classList.toggle("hidden", currentView !== "list");
        render();
      });
    });
  }

  // ── Status bar ─────────────────────────────────────────────
  function showStatus(msg, isError) {
    statusMsg.textContent = msg;
    statusBar.hidden = false;
    statusBar.className = isError ? "status-bar error" : "status-bar";
  }

  function hideStatus() {
    statusBar.hidden = true;
  }

  // ── Helpers ────────────────────────────────────────────────
  function makeEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toDateStr(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

})();
