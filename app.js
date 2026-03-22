(function () {
  "use strict";

  const STORAGE_KEY = "habitTrackerKids_v1";
  const HISTORY_DAYS = 21;

  const THRESHOLDS = {
    kindness: 3,
    curious: 3,
    healthySmile: 3,
    active: 3,
    reader: 3,
    tidy: 3,
    hula: 3,
    brave: 3,
    mistake: 3,
    growth: 3,
  };

  const TRACKS = [
    {
      id: "kindness",
      field: "helpedSomeone",
      name: "Kind heart",
      icon: "💗",
      composite: false,
    },
    {
      id: "curious",
      field: "learnedSomething",
      name: "Curious star",
      icon: "✨",
      composite: false,
    },
    {
      id: "healthySmile",
      field: "brushedTeeth",
      name: "Sparkle teeth",
      icon: "🦷",
      composite: false,
    },
    {
      id: "active",
      field: "exercisedOrPlayed",
      name: "Energy bunny",
      icon: "🐰",
      composite: false,
    },
    {
      id: "reader",
      field: "readTwoPages",
      name: "Book explorer",
      icon: "📚",
      composite: false,
    },
    {
      id: "tidy",
      field: "tidiedUp",
      name: "Tidy helper",
      icon: "🧹",
      composite: false,
    },
    {
      id: "hula",
      field: "hulaHoopPractice",
      name: "Hoop hero",
      icon: "⭕",
      composite: false,
    },
    {
      id: "brave",
      field: "triedSomethingHard",
      name: "Brave try",
      icon: "🌟",
      composite: false,
    },
    {
      id: "mistake",
      field: "madeMistake",
      name: "Learning moment",
      icon: "🌈",
      composite: false,
    },
    {
      id: "growth",
      field: null,
      name: "Growth star",
      icon: "🦄",
      composite: true,
    },
  ];

  const QUESTIONS = [
    {
      key: "helpedSomeone",
      emoji: "🤝",
      label: "Did you help someone?",
      hint: "",
      highlight: false,
    },
    {
      key: "learnedSomething",
      emoji: "🧠",
      label: "Did you learn something new?",
      hint: "",
      highlight: false,
    },
    {
      key: "brushedTeeth",
      emoji: "🦷",
      label: "Did you brush your teeth before bedtime?",
      hint: "",
      highlight: false,
    },
    {
      key: "exercisedOrPlayed",
      emoji: "🏃",
      label: "Did you exercise or play downstairs?",
      hint: "",
      highlight: false,
    },
    {
      key: "readTwoPages",
      emoji: "📖",
      label: "Did you read at least 2 pages of a book?",
      hint: "",
      highlight: false,
    },
    {
      key: "tidiedUp",
      emoji: "🧸",
      label: "Did you tidy up after yourself?",
      hint: "",
      highlight: false,
    },
    {
      key: "hulaHoopPractice",
      emoji: "⭕",
      label: "Did you practice your hula hoop?",
      hint: "",
      highlight: false,
    },
    {
      key: "triedSomethingHard",
      emoji: "💪",
      label: "Did you try to do something hard?",
      hint: "Trying is brave, even if it feels tricky.",
      highlight: true,
    },
    {
      key: "madeMistake",
      emoji: "🌈",
      label: "Did you make a mistake?",
      hint: "Mistakes can be good — they help us learn. Tap Yes or No; both are okay.",
      highlight: true,
    },
  ];

  /** @type {{ version: number, entries: Record<string, Record<string, boolean>>, unlockedRewards: string[] }} */
  let store = loadStore();
  /** @type {Record<string, boolean | null>} null = not chosen yet today */
  let answers = defaultAnswers();

  const els = {
    todayDateLabel: document.getElementById("todayDateLabel"),
    questionsRoot: document.getElementById("questionsRoot"),
    dayForm: document.getElementById("dayForm"),
    saveHint: document.getElementById("saveHint"),
    badgesRoot: document.getElementById("badgesRoot"),
    streakAsOf: document.getElementById("streakAsOf"),
    historyToggle: document.getElementById("historyToggle"),
    historyPanel: document.getElementById("historyPanel"),
    historyRoot: document.getElementById("historyRoot"),
    toastRegion: document.getElementById("toastRegion"),
    modalRoot: document.getElementById("modalRoot"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    modalOk: document.getElementById("modalOk"),
  };

  function defaultAnswers() {
    return {
      helpedSomeone: /** @type {boolean | null} */ (null),
      learnedSomething: null,
      brushedTeeth: null,
      exercisedOrPlayed: null,
      readTwoPages: null,
      tidiedUp: null,
      hulaHoopPractice: null,
      triedSomethingHard: null,
      madeMistake: null,
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { version: 1, entries: {}, unlockedRewards: [] };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { version: 1, entries: {}, unlockedRewards: [] };
      }
      return {
        version: 1,
        entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
        unlockedRewards: Array.isArray(parsed.unlockedRewards) ? parsed.unlockedRewards : [],
      };
    } catch {
      return { version: 1, entries: {}, unlockedRewards: [] };
    }
  }

  function saveStore() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: store.version,
        entries: store.entries,
        unlockedRewards: store.unlockedRewards,
      })
    );
  }

  function formatISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseISODate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDaysISO(iso, delta) {
    const dt = parseISODate(iso);
    dt.setDate(dt.getDate() + delta);
    return formatISODate(dt);
  }

  function todayISO() {
    return formatISODate(new Date());
  }

  function formatFriendlyDate(iso) {
    const dt = parseISODate(iso);
    return dt.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function trackPassesDay(track, entry) {
    if (!entry) return false;
    if (track.composite) {
      return !!(entry.triedSomethingHard || entry.madeMistake);
    }
    return !!entry[track.field];
  }

  function computeStreak(endISO, track) {
    let streak = 0;
    let d = endISO;
    while (true) {
      const entry = store.entries[d];
      if (!entry) break;
      if (!trackPassesDay(track, entry)) break;
      streak += 1;
      d = addDaysISO(d, -1);
    }
    return streak;
  }

  function computeAllStreaks(endISO) {
    const out = {};
    for (const t of TRACKS) {
      out[t.id] = computeStreak(endISO, t);
    }
    return out;
  }

  function renderTodayLabel() {
    const iso = todayISO();
    els.todayDateLabel.textContent = formatFriendlyDate(iso);
    els.streakAsOf.textContent = `Streaks count days in a row up to today (${formatFriendlyDate(iso)}).`;
  }

  function renderQuestions() {
    const iso = todayISO();
    const saved = store.entries[iso];
    const base = defaultAnswers();
    if (saved) {
      for (const q of QUESTIONS) {
        base[q.key] = typeof saved[q.key] === "boolean" ? saved[q.key] : null;
      }
    }
    answers = base;

    els.questionsRoot.innerHTML = "";
    for (const q of QUESTIONS) {
      const card = document.createElement("div");
      card.className = "q-card" + (q.highlight ? " q-card--highlight" : "");

      const row = document.createElement("div");
      row.className = "q-card__row";

      const em = document.createElement("span");
      em.className = "q-card__emoji";
      em.textContent = q.emoji;
      em.setAttribute("aria-hidden", "true");

      const text = document.createElement("div");
      text.className = "q-card__text";

      const label = document.createElement("p");
      label.className = "q-card__label";
      label.id = `q-${q.key}-label`;
      label.textContent = q.label;

      text.appendChild(label);
      if (q.hint) {
        const hint = document.createElement("p");
        hint.className = "q-card__hint";
        hint.textContent = q.hint;
        text.appendChild(hint);
      }

      row.appendChild(em);
      row.appendChild(text);
      card.appendChild(row);

      const choices = document.createElement("div");
      choices.className = "q-card__choices";
      choices.setAttribute("role", "group");
      choices.setAttribute("aria-labelledby", `q-${q.key}-label`);

      const yes = document.createElement("button");
      yes.type = "button";
      yes.className = "choice choice--yes";
      yes.textContent = "Yes";

      const no = document.createElement("button");
      no.type = "button";
      no.className = "choice choice--no";
      no.textContent = "No";

      function syncPressed() {
        const v = answers[q.key];
        yes.setAttribute("aria-pressed", String(v === true));
        no.setAttribute("aria-pressed", String(v === false));
      }

      yes.addEventListener("click", () => {
        answers[q.key] = true;
        syncPressed();
      });
      no.addEventListener("click", () => {
        answers[q.key] = false;
        syncPressed();
      });

      syncPressed();

      choices.appendChild(yes);
      choices.appendChild(no);
      card.appendChild(choices);
      els.questionsRoot.appendChild(card);
    }
  }

  function boolForSave(v) {
    return v === true;
  }

  function renderBadges() {
    const endISO = todayISO();
    const streaks = computeAllStreaks(endISO);
    const unlocked = new Set(store.unlockedRewards);

    els.badgesRoot.innerHTML = "";
    for (const t of TRACKS) {
      const streak = streaks[t.id] || 0;
      const threshold = THRESHOLDS[t.id] ?? 3;
      const isUnlocked = unlocked.has(t.id);

      const badge = document.createElement("div");
      badge.className = "badge" + (isUnlocked ? " badge--unlocked" : "");

      const icon = document.createElement("div");
      icon.className = "badge__icon";
      icon.textContent = t.icon;

      const name = document.createElement("p");
      name.className = "badge__name";
      name.textContent = t.name;

      const count = document.createElement("p");
      count.className = "badge__count";
      count.textContent = `${streak} day${streak === 1 ? "" : "s"} in a row`;

      badge.appendChild(icon);
      badge.appendChild(name);
      badge.appendChild(count);

      if (isUnlocked) {
        const status = document.createElement("p");
        status.className = "badge__status";
        status.textContent = "Badge won!";
        badge.appendChild(status);
      } else if (streak > 0) {
        const status = document.createElement("p");
        status.className = "badge__status";
        status.textContent = `${streak}/${threshold}`;
        badge.appendChild(status);
      }

      els.badgesRoot.appendChild(badge);
    }
  }

  function getHistoryDates() {
    const end = todayISO();
    const list = [];
    for (let i = 0; i < HISTORY_DAYS; i++) {
      list.push(addDaysISO(end, -i));
    }
    return list;
  }

  function renderHistory() {
    const dates = getHistoryDates();
    const withData = dates.filter((d) => store.entries[d]);

    els.historyRoot.innerHTML = "";
    if (withData.length === 0) {
      const p = document.createElement("p");
      p.className = "history__empty";
      p.textContent = "No saved days yet. Tap Save my day when you are ready.";
      els.historyRoot.appendChild(p);
      return;
    }

    for (const iso of withData) {
      const entry = store.entries[iso];
      const row = document.createElement("div");
      row.className = "history__row";

      const dateEl = document.createElement("p");
      dateEl.className = "history__date";
      dateEl.textContent = formatFriendlyDate(iso);

      const dots = document.createElement("div");
      dots.className = "history__dots";
      dots.setAttribute("aria-label", "Yes or no for each question that day");

      for (const q of QUESTIONS) {
        const dot = document.createElement("span");
        dot.className = "dot";
        if (entry[q.key] === true) {
          dot.classList.add("dot--yes");
        } else if (entry[q.key] === false) {
          dot.classList.add("dot--no");
        }
        dot.title = `${q.label.replace(/\?/, "")}: ${entry[q.key] === true ? "Yes" : entry[q.key] === false ? "No" : "—"}`;
        dots.appendChild(dot);
      }

      row.appendChild(dateEl);
      row.appendChild(dots);
      els.historyRoot.appendChild(row);
    }
  }

  function showToast(message, ms) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = message;
    els.toastRegion.appendChild(t);
    window.setTimeout(() => {
      t.remove();
    }, ms || 3200);
  }

  function showModal(title, body) {
    els.modalTitle.textContent = title;
    els.modalBody.textContent = body;
    els.modalRoot.hidden = false;
    els.modalOk.focus();
  }

  function closeModal() {
    els.modalRoot.hidden = true;
  }

  /**
   * @param {string[]} previousUnlockedIds
   */
  function processNewUnlocks(previousUnlockedIds) {
    const endISO = todayISO();
    const streaks = computeAllStreaks(endISO);
    const previous = new Set(previousUnlockedIds);
    const newly = [];

    for (const t of TRACKS) {
      const th = THRESHOLDS[t.id] ?? 3;
      if ((streaks[t.id] || 0) >= th && !previous.has(t.id)) {
        newly.push(t);
      }
    }

    if (newly.length === 0) return;

    const unlocked = new Set(store.unlockedRewards);
    for (const t of newly) {
      unlocked.add(t.id);
    }
    store.unlockedRewards = Array.from(unlocked);
    saveStore();

    const first = newly[0];
    const names = newly.map((t) => t.name).join(", ");
    showModal(
      newly.length === 1 ? `New badge: ${first.name}!` : "New badges unlocked!",
      newly.length === 1
        ? `You kept it up ${THRESHOLDS[first.id]} days in a row. You are doing great!`
        : `You unlocked: ${names}. Amazing work!`
    );

    if (newly.length > 1) {
      showToast(`Also: ${newly.slice(1).map((t) => t.name).join(", ")}`, 4000);
    }
  }

  function persistTodayEntry() {
    const iso = todayISO();
    /** @type {Record<string, boolean> & { updatedAt?: string }} */
    const row = {};
    for (const q of QUESTIONS) {
      row[q.key] = boolForSave(answers[q.key]);
    }
    row.updatedAt = new Date().toISOString();
    store.entries[iso] = row;
    saveStore();
  }

  function syncUnlockedBadgesSilent() {
    const endISO = todayISO();
    const streaks = computeAllStreaks(endISO);
    const unlocked = new Set(store.unlockedRewards);
    let changed = false;
    for (const t of TRACKS) {
      const th = THRESHOLDS[t.id] ?? 3;
      if ((streaks[t.id] || 0) >= th && !unlocked.has(t.id)) {
        unlocked.add(t.id);
        changed = true;
      }
    }
    if (changed) {
      store.unlockedRewards = Array.from(unlocked);
      saveStore();
    }
  }

  els.dayForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const unlockedBefore = [...store.unlockedRewards];
    persistTodayEntry();
    els.saveHint.textContent = "Saved! Come back tomorrow for another sparkle day.";

    if (answers.madeMistake === true) {
      showToast("Trying and oops-ing is how we grow! 🦄", 3500);
    }

    renderBadges();
    renderHistory();
    processNewUnlocks(unlockedBefore);
  });

  els.historyToggle.addEventListener("click", () => {
    const open = els.historyToggle.getAttribute("aria-expanded") === "true";
    els.historyToggle.setAttribute("aria-expanded", String(!open));
    els.historyPanel.hidden = open;
  });

  els.modalOk.addEventListener("click", closeModal);
  els.modalRoot.querySelector("[data-close-modal]").addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modalRoot.hidden) {
      closeModal();
    }
  });

  renderTodayLabel();
  renderQuestions();
  syncUnlockedBadgesSilent();
  renderBadges();
  renderHistory();
})();
