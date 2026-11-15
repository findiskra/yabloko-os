// =============================================
// РАБОЧИЙ СТОЛ ЗАМПРЕДА — game.js
// Полная версия: 4 цикла, 5 мини-игр, 7 финалов
// =============================================

// ---- СОСТОЯНИЕ ----
const G = {
  yabloko: 78,
  meria: 62,
  fler: 42,
  siloviki: 28,
  kompro: 0,
  battery_audit: 0,
  krapukhin_trust: 70,
  party_money: 500000,
  cash: 200000,
  meria_total: 0,
  moral_debt: 0,
  media: 10,
  rage: 20,
  cycle: 0,
  date: "Сентябрь 2019",
  gamePhase: "boot",
  flashbacks_read: 0,
  ntv_count: 0,
  purge_count: 0,
  lobanov_threat: 60,
  currentTgContact: null,
  flags: {
    sreda_site_built: false,
    grigoriy_call_accepted: false,
    apra_poa: false,
    second_tranche_delayed: false,
    sergey_loyal: false,
    sergey_hostile: false,
    sergey_neutral: false,
    deg_manipulation: false,
    honest_candidate: false,
    lobanov_attack_agreed: false,
    lobanov_betrayed: false,
    deg_statement: false,
    apra_exposed: false,
    apra_soft_exposure: false,
    mgd_strong_list: false,
    warning_screenshot: false,
    mercedes_bought: false,
    mo_chairman: false,
    kruglov_letter_read: false,
    kac_supporters_purged: false,
  }
};

// ---- ПЕРСОНАЖИ ----
const CHARS = {
  grigoriy_a: { name: "Григорий Ал.", short: "Г.А.", color: "#2d6a2d" },
  kurator:    { name: "Куратор",      short: "???",  color: "#555555" },
  krapukhin:  { name: "Крапухин А.",  short: "К.А.", color: "#795548" },
  sergey:     { name: "С. Прокопьев", short: "С.П.", color: "#1565C0" },
  ntv_prod:   { name: "Продюсер НТВ", short: "НТВ",  color: "#b71c1c" },
  inspector:  { name: "Инспектор Носков", short: "РПН", color: "#424242" },
  lobanov:    { name: "Михаил Лобанов", short: "М.Л.", color: "#c62828" },
  the_insider:{ name: "Редакция The Insider", short: "СМИ", color: "#e65100" },
};

// ---- ПОЧТА ----
const mailbox = [];
let currentMailId = null;

// ---- WINDOWS STATE ----
const openWindows = {};
let zTop = 200;
let activeWindowId = null;

// ---- SCHEME STATE ----
let schemeTimer = null;
let schemeTimerLeft = 90;
let schemeDone = false;

window.G = G;
window.mailbox = mailbox;
window.CHARS = CHARS;


// =============================================
// BOOT SEQUENCE
// =============================================
const bootSequence = [
  { text: "СИСТЕМА: РАБОЧИЙ СТОЛ ЗАМПРЕДА", pause: 250 },
  { text: "ВЕРСИЯ: 2019.09.30 [ЯБЛОКО-OS]", pause: 200 },
  { text: "ПОЛЬЗОВАТЕЛЬ: К.А. ГОНЧАРОВ", pause: 300 },
  { text: "ИНИЦИАЛИЗАЦИЯ ШКАЛ И КАССЫ...", pause: 650 },
  { text: "...ГОТОВО. ВХОД В СИСТЕМУ.", pause: 400 },
];

let desktopShown = false;

function skipBoot() {
  if (desktopShown) return;
  showDesktop();
}

function runBoot() {
  const container = document.getElementById("boot-lines");
  const bootScreen = document.getElementById("boot-screen");
  if (bootScreen) bootScreen.onclick = skipBoot;
  document.addEventListener("keydown", function onBootKey(e) {
    if (!desktopShown) {
      skipBoot();
      document.removeEventListener("keydown", onBootKey);
    }
  });

  if (!container) {
    showDesktop();
    return;
  }

  let idx = 0;
  function typeNextLine() {
    if (desktopShown) return;
    if (idx >= bootSequence.length) {
      setTimeout(() => {
        if (!desktopShown) {
          const boot = document.getElementById("boot-screen");
          if (boot) {
            boot.style.transition = "opacity 0.6s";
            boot.style.opacity = "0";
            setTimeout(showDesktop, 650);
          } else {
            showDesktop();
          }
        }
      }, 700);
      return;
    }

    const item = bootSequence[idx];
    const lineEl = document.createElement("div");
    container.appendChild(lineEl);

    let charIdx = 0;
    const str = item.text;

    function typeChar() {
      if (desktopShown) return;
      if (charIdx < str.length) {
        lineEl.textContent += str[charIdx];
        charIdx++;
        setTimeout(typeChar, 10 + Math.random() * 14);
      } else {
        idx++;
        setTimeout(typeNextLine, item.pause);
      }
    }
    typeChar();
  }
  typeNextLine();
}

function showDesktop() {
  if (desktopShown) return;
  desktopShown = true;

  const boot = document.getElementById("boot-screen");
  if (boot) boot.style.display = "none";

  const d = document.getElementById("desktop");
  if (d) {
    d.classList.remove("hidden");
    d.classList.add("fade-in");
  }

  updateHUD();
  showToast("Добро пожаловать. У вас одно непрочитанное сообщение.");
  startP02();
}

// =============================================
// HUD & STATS
// =============================================
function updateHUD() {
  const fields = ["yabloko", "meria", "fler", "siloviki"];
  fields.forEach(f => {
    const val = Math.max(0, Math.min(100, G[f]));
    const bar = document.getElementById("bar-" + f);
    const valEl = document.getElementById("val-" + f);
    if (bar) bar.style.width = val + "%";
    if (valEl) valEl.textContent = val;
    // Check extremes
    if (val <= 0 || val >= 100) {
      if (bar) bar.classList.add("hud-danger");
      if (valEl) valEl.classList.add("hud-danger");
      triggerGameOver(f, val);
    } else {
      if (bar) bar.classList.remove("hud-danger");
      if (valEl) valEl.classList.remove("hud-danger");
    }
  });

  const dateEl = document.getElementById("tray-date") || document.getElementById("hud-date");
  if (dateEl) dateEl.textContent = G.date;

  const cycleEl = document.getElementById("hud-cycle");
  if (cycleEl) cycleEl.textContent = G.cycle;

  const cashEl = document.getElementById("hud-cash");
  if (cashEl) cashEl.textContent = fmtMoney(G.cash);

  updateDesktopDominance();
}

function updateDesktopDominance() {
  const desktop = document.getElementById("desktop");
  const badge = document.getElementById("hud-dominance-badge");
  const trayPill = document.getElementById("tray-dominance");
  if (!desktop) return;

  desktop.classList.remove("tint-classic", "tint-yabloko", "tint-meria", "tint-siloviki", "tint-fler");

  let dom = "classic";
  let label = "БАЛАНС";

  if (G.siloviki >= 45) {
    dom = "siloviki";
    label = "СИЛОВИКИ";
  } else if (G.meria >= 60 && G.meria > G.yabloko) {
    dom = "meria";
    label = "МЭРИЯ";
  } else if (G.yabloko >= 60 && G.yabloko > G.meria) {
    dom = "yabloko";
    label = "ЯБЛОКО";
  } else if (G.fler >= 55) {
    dom = "fler";
    label = "ФЛЕР";
  }

  desktop.classList.add("tint-" + dom);
  if (badge) badge.textContent = label;
  if (trayPill) trayPill.textContent = label;
}

function clamp(val, lo, hi) { return Math.max(lo, Math.min(hi, val)); }

function modStat(key, delta) {
  G[key] = clamp(G[key] + delta, 0, 100);
  updateHUD();
}

function fmtMoney(n) {
  return n.toLocaleString("ru-RU") + " р.";
}

function showToast(msg, duration) {
  duration = duration || 4000;
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("toast-out");
    setTimeout(() => el.remove(), 450);
  }, duration);
}

let gameOverTriggered = false;
function triggerGameOver(field, val) {
  if (gameOverTriggered) return;
  gameOverTriggered = true;

  const labels = { yabloko: "ЯБЛОКО", meria: "МЭРИЯ", fler: "ФЛЕР", siloviki: "СИЛОВИКИ" };
  const reasons = {
    yabloko: {
      zero: "Партийное бюро исключило тебя из партии за соглашательство и нарушение устава. Пропуск в офис на Пятницкой заблокирован, табличку с двери кабинета уже скрутили.",
      max: "Ты попытался стать заметнее основателя партии. Григорий Алексеевич созвал экстренный съезд, переписал регламент и отправил тебя заведовать архивом без права голоса."
    },
    meria: {
      zero: "Мэрия разорвала все негласные контакты. Транши фонда «Среда» заморожены, куратор заблокировал номер, а в районных газетах вышла статья о фиктивных экологах.",
      max: "Ты стал настолько неприкрытым спойлером мэрии, что на Старой площади поморщились от такой топорной работы. Тебя списали в утиль за полной ненадобностью."
    },
    fler: {
      zero: "Либеральный флер испарился без остатка. На любых дебатах в тебя летят насмешки, соратники не подают руки, а избиратели считают обычным чиновничьим прихвостнем.",
      max: "Ты слишком увлекся ролью пламенного оппозиционера. Центр «Э» завел уголовное дело еще до обеда, а партия официально открестилась от твоих опасных заявлений."
    },
    siloviki: {
      zero: "Интерес органов сошел на нет. Никто больше не следит за твоими счетами — впрочем, и считаться с тобой перестали даже в районном «Жилищнике».",
      max: "У дверей квартиры — группа захвата и сонные понятые. Статья 159 часть 4 УК РФ. Адвокат Крапухин улетел в Ереван первым рейсом, оставив тебя наедине со следователем."
    }
  };

  const reason = (val <= 0) ? reasons[field].zero : reasons[field].max;
  const badge = "[ПОРАЖЕНИЕ: " + labels[field] + "]";
  const title = "«ДОСРОЧНЫЙ ФИНАЛ КАРЬЕРЫ»";

  const overlay = document.getElementById("ending-overlay");
  if (overlay) {
    overlay.classList.remove("hidden");
    overlay.innerHTML =
      '<div class="ending-win">' +
        '<div class="ending-header" style="background:linear-gradient(to right, #b71c1c, #404040);">' +
          '<span>ДОСРОЧНЫЙ ФИНАЛ: РАБОЧИЙ СТОЛ ЗАМПРЕДА</span>' +
        '</div>' +
        '<div class="ending-body">' +
          '<div class="ending-badge" style="background:#b71c1c;">' + badge + ' ' + title + '</div>' +
          '<div class="ending-text">' + reason + '</div>' +
          '<div class="ending-stats">' +
            '<div>ЯБЛОКО: <strong>' + G.yabloko + ' / 100</strong></div>' +
            '<div>МЭРИЯ: <strong>' + G.meria + ' / 100</strong></div>' +
            '<div>СИЛОВИКИ: <strong>' + G.siloviki + ' / 100</strong></div>' +
            '<div>ФЛЕР: <strong>' + G.fler + ' / 100</strong></div>' +
            '<div>Личная касса: <strong>' + fmtMoney(G.cash) + '</strong></div>' +
            '<div>Партийная касса: <strong>' + fmtMoney(G.party_money) + '</strong></div>' +
            '<div>Получено от мэрии: <strong>' + fmtMoney(G.meria_total) + '</strong></div>' +
            '<div>Эфиров у Норкина: <strong>' + G.ntv_count + '</strong></div>' +
            '<div>Исключено активистов: <strong>' + G.purge_count + '</strong></div>' +
            '<div>Этап вылета: <strong>Цикл ' + G.cycle + ' (' + G.date + ')</strong></div>' +
          '</div>' +
        '</div>' +
        '<div class="ending-footer">' +
          '<button class="btn-primary" style="font-size:16px;padding:6px 16px;" onclick="location.reload()">Начать заново</button>' +
          '<button class="btn-primary" onclick="openAboutModal()">О системе</button>' +
        '</div>' +
      '</div>';
  } else {
    const goScreen = document.getElementById("gameover-screen");
    if (goScreen) {
      document.getElementById("gameover-reason").textContent = reason;
      goScreen.classList.remove("hidden");
    }
  }
}

function setBadge(id, n) {
  const el = document.getElementById("badge-" + id);
  if (!el) return;
  if (n > 0) {
    el.textContent = n;
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

// =============================================
// WINDOW SYSTEM
// =============================================
function createWindow(id, title, width, height, content) {
  const existing = document.getElementById("win-" + id);
  if (existing) {
    bringToFront(id);
    return existing;
  }

  const win = document.createElement("div");
  win.className = "win";
  win.id = "win-" + id;
  win.style.width = (width || 560) + "px";
  win.style.height = (height || 420) + "px";
  win.style.left = (220 + Object.keys(openWindows).length * 20) + "px";
  win.style.top = (20 + Object.keys(openWindows).length * 20) + "px";
  win.style.zIndex = ++zTop;

  win.innerHTML =
    '<div class="win-header" id="wh-' + id + '">' +
      '<span class="win-title">' + title + '</span>' +
      '<div class="win-controls">' +
        '<button class="win-btn" onclick="toggleMinimizeWindow(\'' + id + '\')" title="Свернуть">_</button>' +
        '<button class="win-btn" onclick="toggleMaximizeWindow(\'' + id + '\')" title="Развернуть">□</button>' +
        '<button class="win-btn" onclick="closeWindow(\'' + id + '\')" title="Закрыть">x</button>' +
      '</div>' +
    '</div>' +
    '<div class="win-body" id="wb-' + id + '">' +
    '</div>';

  document.getElementById("windows-container").appendChild(win);
  openWindows[id] = win;

  makeDraggable(win, document.getElementById("wh-" + id));
  win.addEventListener("mousedown", () => bringToFront(id));

  if (content) {
    document.getElementById("wb-" + id).innerHTML = content;
  }

  bringToFront(id);
  updateTaskbar();
  return win;
}

function closeWindow(id) {
  const win = document.getElementById("win-" + id);
  if (win) {
    win.remove();
    delete openWindows[id];
    if (activeWindowId === id) activeWindowId = null;
    updateTaskbar();
  }
}

function openWindow(id) {
  const existing = document.getElementById("win-" + id);
  if (existing) {
    if (existing.style.display === "none") existing.style.display = "flex";
    bringToFront(id);
    return;
  }

  if (id === "telegram") buildTelegramWindow();
  else if (id === "mail") buildMailWindow();
  else if (id === "browser") buildBrowserWindow();
  else if (id === "docs") buildDocsWindow();
  else if (id === "stats") buildStatsWindow();
}

function bringToFront(id) {
  const win = document.getElementById("win-" + id);
  if (!win) return;
  win.style.display = "flex";
  win.style.zIndex = ++zTop;
  activeWindowId = id;

  const curTop = parseInt(win.style.top, 10);
  if (isNaN(curTop) || curTop < 4) {
    win.style.top = "8px";
  }

  document.querySelectorAll(".win").forEach(w => {
    if (w.id === "win-" + id) {
      w.classList.remove("inactive");
    } else {
      w.classList.add("inactive");
    }
  });
  updateTaskbar();
}

function updateTaskbar() {
  const container = document.getElementById("taskbar-windows");
  if (!container) return;
  container.innerHTML = "";
  Object.keys(openWindows).forEach(id => {
    const win = openWindows[id];
    const titleEl = win.querySelector(".win-title");
    const title = titleEl ? titleEl.textContent : id;
    const btn = document.createElement("button");
    btn.className = "tb-window-btn " + (activeWindowId === id && win.style.display !== "none" ? "active" : "inactive");
    btn.textContent = title;
    btn.onclick = () => toggleWindowFromTaskbar(id);
    container.appendChild(btn);
  });
}

function toggleWindowFromTaskbar(id) {
  const win = document.getElementById("win-" + id);
  if (!win) return;
  if (activeWindowId === id && win.style.display !== "none") {
    win.style.display = "none";
    activeWindowId = null;
    updateTaskbar();
  } else {
    bringToFront(id);
  }
}

function toggleMinimizeWindow(id) {
  const win = document.getElementById("win-" + id);
  if (!win) return;
  win.style.display = "none";
  if (activeWindowId === id) activeWindowId = null;
  updateTaskbar();
}

function toggleMaximizeWindow(id) {
  const win = document.getElementById("win-" + id);
  if (!win) return;
  if (win.dataset.maximized === "true") {
    win.style.left = win.dataset.origLeft;
    win.style.top = win.dataset.origTop;
    win.style.width = win.dataset.origWidth;
    win.style.height = win.dataset.origHeight;
    win.dataset.maximized = "false";
  } else {
    win.dataset.origLeft = win.style.left;
    win.dataset.origTop = win.style.top;
    win.dataset.origWidth = win.style.width;
    win.dataset.origHeight = win.style.height;
    win.style.left = "0px";
    win.style.top = "4px";
    win.style.width = "100%";
    win.style.height = "calc(100% - 4px)";
    win.dataset.maximized = "true";
  }
}

function makeDraggable(win, header) {
  let dragging = false;
  let ox = 0, oy = 0;

  header.addEventListener("mousedown", function(e) {
    if (e.target.classList.contains("win-btn")) return;
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    bringToFront(win.id.replace("win-", ""));
    e.preventDefault();
  });

  document.addEventListener("mousemove", function(e) {
    if (!dragging) return;
    const bodyEl = document.getElementById("desktop-body");
    const bodyW = bodyEl ? bodyEl.clientWidth : window.innerWidth;
    const bodyH = bodyEl ? bodyEl.clientHeight : (window.innerHeight - 80);

    const rawX = e.clientX - ox;
    const rawY = e.clientY - oy;

    const clampedY = Math.max(4, Math.min(bodyH - 36, rawY));
    const clampedX = Math.max(-win.offsetWidth + 80, Math.min(bodyW - 80, rawX));

    win.style.left = clampedX + "px";
    win.style.top  = clampedY + "px";
  });

  document.addEventListener("mouseup", function() {
    dragging = false;
  });
}


// =============================================
// TELEGRAM MESSENGER
// =============================================
const tgContacts = [
  {
    id: "grigoriy_a",
    char: CHARS.grigoriy_a,
    badge: 1,
    messages: [
      {
        type: "in",
        sender: "Григорий Ал.",
        text: "Кирилл, добрый день. Позвони, когда удобно — есть разговор. Не срочно, но важно. Касается партийных инструментов."
      }
    ],
    choices: [
      { label: "А: Слушаю вас, Григорий Алексеевич", fn: "p02_callNow" },
      { label: "Б: В чем суть? (напишите здесь)", fn: "p02_callNow" },
      { label: "В: Перезвоню позже", fn: "p02_callLater" }
    ]
  },
  { id: "krapukhin", char: CHARS.krapukhin, badge: 0, messages: [], choices: [] },
  { id: "kurator", char: CHARS.kurator, badge: 0, messages: [], choices: [] },
  { id: "sergey", char: CHARS.sergey, badge: 0, messages: [], choices: [] },
  { id: "ntv_prod", char: CHARS.ntv_prod, badge: 0, messages: [], choices: [] },
  { id: "lobanov", char: CHARS.lobanov, badge: 0, messages: [], choices: [] },
  { id: "the_insider", char: CHARS.the_insider, badge: 0, messages: [], choices: [] },
];

function buildTelegramWindow() {
  const win = createWindow("telegram", "Telegram (Мессенджер)", 640, 480);
  renderTelegramUI();
  bringToFront("telegram");
}

function renderTelegramUI() {
  const body = document.getElementById("wb-telegram");
  if (!body) return;

  const totalBadge = tgContacts.reduce((s, c) => s + c.badge, 0);
  setBadge("telegram", totalBadge);

  let contactsHtml = tgContacts.map(c =>
    '<div class="tg-contact' + (G.currentTgContact === c.id ? " active" : "") +
    '" onclick="selectTgContact(\'' + c.id + '\')">' +
      '<span>' + c.char.name + '</span>' +
      (c.badge > 0 ? '<span class="tg-contact-badge">' + c.badge + '</span>' : '') +
    '</div>'
  ).join("");

  body.innerHTML =
    '<div class="tg-layout">' +
      '<div class="tg-sidebar">' +
        '<div class="tg-sidebar-title">Мессенджер</div>' +
        contactsHtml +
      '</div>' +
      '<div class="tg-chat" id="tg-chat-area">' +
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-family:var(--font);font-size:18px;">Выберите контакт</div>' +
      '</div>' +
    '</div>';

  if (G.currentTgContact) {
    renderTgChat(G.currentTgContact);
  }
}

function selectTgContact(id) {
  G.currentTgContact = id;
  const contact = tgContacts.find(c => c.id === id);
  if (contact) contact.badge = 0;
  renderTelegramUI();
}

function renderTgChat(contactId) {
  const contact = tgContacts.find(c => c.id === contactId);
  if (!contact) return;
  const area = document.getElementById("tg-chat-area");
  if (!area) return;

  let msgsHtml = contact.messages.map(m =>
    '<div class="tg-msg ' + (m.type === "in" ? "incoming" : "outgoing") + '">' +
      (m.type === "in" ? '<div class="tg-sender-name">' + m.sender + '</div>' : '') +
      '<div class="tg-bubble">' + m.text + '</div>' +
    '</div>'
  ).join("");

  let choicesHtml = "";
  if (contact.choices && contact.choices.length > 0) {
    choicesHtml =
      '<div class="tg-choices">' +
        contact.choices.map((ch, i) =>
          '<button class="tg-choice-btn" onclick="handleTgChoice(\'' + contactId + '\',' + i + ')">' + ch.label + '</button>'
        ).join("") +
      '</div>';
  }

  area.innerHTML =
    '<div class="tg-chat-header">' + contact.char.name + '</div>' +
    '<div class="tg-messages" id="tg-msgs-' + contactId + '">' + msgsHtml + '</div>' +
    choicesHtml;

  scrollMsgs(contactId);
}

function scrollMsgs(contactId) {
  const el = document.getElementById("tg-msgs-" + contactId);
  if (el) el.scrollTop = el.scrollHeight;
}

function addTgMessage(contactId, type, text, sender, cb) {
  let contact = tgContacts.find(c => c.id === contactId);
  if (!contact) {
    const charData = CHARS[contactId] || { name: contactId, short: "???", color: "#555" };
    contact = { id: contactId, char: charData, badge: 0, messages: [], choices: [] };
    tgContacts.push(contact);
  }

  if (type === "in") {
    contact.badge += 1;
    setBadge("telegram", tgContacts.reduce((s, c) => s + c.badge, 0));
    contact.messages.push({ type, text, sender: sender || contact.char.name });
    renderTelegramUI();
    if (cb) {
      cb();
      // Автоматически открыть Telegram и переключиться на нужный контакт
      setTimeout(() => {
        openWindow("telegram");
        selectTgContact(contactId);
        bringToFront("telegram");
      }, 400);
    }
  } else {
    contact.messages.push({ type, text, sender: "Я" });
    contact.choices = [];
    renderTgChat(contactId);
    if (cb) cb();
  }
}

function setTgChoices(contactId, choices) {
  const contact = tgContacts.find(c => c.id === contactId);
  if (contact) contact.choices = choices;
  if (G.currentTgContact === contactId) renderTgChat(contactId);
}

function handleTgChoice(contactId, idx) {
  const contact = tgContacts.find(c => c.id === contactId);
  if (!contact || !contact.choices[idx]) return;
  const fn = contact.choices[idx].fn;
  contact.choices = [];
  renderTgChat(contactId);
  if (window[fn]) window[fn]();
}

// =============================================
// MAIL WINDOW
// =============================================
function buildMailWindow() {
  const win = createWindow("mail", "Почта — К.А. Гончаров", 680, 460);
  renderMailUI();
  bringToFront("mail");
}

function renderMailUI() {
  const body = document.getElementById("wb-mail");
  if (!body) return;

  const totalUnread = mailbox.filter(m => m.unread).length;
  setBadge("mail", totalUnread);

  let listHtml = mailbox.map((m, i) =>
    '<div class="mail-item' + (currentMailId === i ? " active" : "") + (m.unread ? " unread" : "") +
    '" onclick="openMail(' + i + ')">' +
      '<div class="mail-item-from">' + m.from + '</div>' +
      '<div class="mail-item-subj">' + m.subject + '</div>' +
    '</div>'
  ).join("");

  if (mailbox.length === 0) {
    listHtml = '<div style="padding:16px;color:#888;font-size:16px;">Входящих нет</div>';
  }

  let readingHtml = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:18px;">Выберите письмо</div>';
  if (currentMailId !== null && mailbox[currentMailId]) {
    const cur = mailbox[currentMailId];
    readingHtml =
      '<div class="mail-reading-pane">' +
        '<div class="mail-header-info">' +
          '<div><strong>От:</strong> ' + cur.from + '</div>' +
          '<div><strong>Тема:</strong> ' + cur.subject + '</div>' +
          '<div><strong>Дата:</strong> ' + cur.date + '</div>' +
        '</div>' +
        '<div class="mail-body-text">' + cur.body + '</div>' +
        (cur.actions ? '<div class="mail-actions">' + cur.actions + '</div>' : '') +
      '</div>';
  }

  body.innerHTML =
    '<div class="mail-layout">' +
      '<div class="mail-list">' +
        '<div class="mail-list-title">Входящие</div>' +
        listHtml +
      '</div>' +
      '<div class="mail-reading" id="mail-reading-area">' + readingHtml + '</div>' +
    '</div>';
}

function openMail(id) {
  currentMailId = id;
  if (mailbox[id]) {
    mailbox[id].unread = false;
    setBadge("mail", mailbox.filter(m => m.unread).length);
  }
  renderMailUI();
}

function addMail(from, subject, body, actions, autoOpen) {
  const id = mailbox.length;
  mailbox.push({ id, from, subject, body, actions, unread: true, date: G.date });
  setBadge("mail", mailbox.filter(m => m.unread).length);
  if (autoOpen) {
    if (!document.getElementById("win-mail")) buildMailWindow();
    openMail(id);
    bringToFront("mail");
  } else {
    renderMailUI();
  }
  return id;
}

// =============================================
// BROWSER WINDOW
// =============================================
function buildBrowserWindow() {
  const win = createWindow("browser", "Браузер", 640, 480);
  document.getElementById("wb-browser").innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-family:var(--font);font-size:18px;">Введите адрес</div>';
  bringToFront("browser");
}

function buildBrowserWithContent(url, content) {
  if (!document.getElementById("win-browser")) {
    createWindow("browser", "Браузер", 640, 480);
  }
  bringToFront("browser");
  const body = document.getElementById("wb-browser");
  body.innerHTML =
    '<div class="browser-bar">' +
      '<span style="font-family:var(--font);font-size:14px;color:#555;">Адрес:</span>' +
      '<div class="browser-url">' + url + '</div>' +
    '</div>' +
    '<div class="browser-body" id="browser-content">' + content + '</div>';
}

// =============================================
// STATS WINDOW
// =============================================
function buildStatsWindow() {
  const win = createWindow("stats", "Статистика — Гончаров К.А.", 440, 420);
  const body = document.getElementById("wb-stats");
  if (body) {
    body.innerHTML =
      '<div class="stats-body">' +
        '<div style="font-size:20px;font-weight:bold;margin-bottom:12px;">Текущие показатели</div>' +
        '<div class="stats-row"><span>ЯБЛОКО</span><span>' + G.yabloko + '</span></div>' +
        '<div class="stats-row"><span>МЭРИЯ</span><span>' + G.meria + '</span></div>' +
        '<div class="stats-row"><span>ФЛЕР</span><span>' + G.fler + '</span></div>' +
        '<div class="stats-row"><span>СИЛОВИКИ</span><span>' + G.siloviki + '</span></div>' +
        '<div class="stats-row"><span>КОМПРОМАТ</span><span>' + G.kompro + '</span></div>' +
        '<div class="stats-row"><span>АУДИТ БАТАРЕЕК</span><span>' + G.battery_audit + '</span></div>' +
        '<div class="stats-row"><span>ДОВЕРИЕ КРАПУХИНА</span><span>' + G.krapukhin_trust + '</span></div>' +
        '<div class="stats-row"><span>КАССА ПАРТИИ</span><span>' + fmtMoney(G.party_money) + '</span></div>' +
        '<div class="stats-row"><span>ЛИЧНАЯ КАССА</span><span>' + fmtMoney(G.cash) + '</span></div>' +
        '<div class="stats-row"><span>ТРАНШИ МЭРИИ</span><span>' + fmtMoney(G.meria_total) + '</span></div>' +
        '<div class="stats-row"><span>ЦИКЛ</span><span>' + G.cycle + '</span></div>' +
        '<div class="stats-row"><span>ДАТА</span><span>' + G.date + '</span></div>' +
      '</div>';
  }
}

// =============================================
// DOCS & FLASHBACKS WINDOW
// =============================================
const docsRegistry = [
  {
    id: "f01",
    name: "конспект_2012.txt",
    cycle: 1,
    title: "Лекция Явлинского Г.А. Октябрь 2012",
    content: "«Лекция Явлинского Г.А. «Демократия и институты».\nЛичные заметки. Октябрь 2012.\n\nОн сказал: власть без подотчетности — это не власть, это аренда у тех, кто сильнее. Любая партия, которая принимает деньги от противника, теряет не деньги — она теряет себя.\n\nЯ записал это. Надо перечитывать.»"
  },
  {
    id: "f02",
    name: "фото_болотная_2011.txt",
    cycle: 2,
    title: "Архив: Болотная площадь 2011",
    content: "«Зима 2011. Белые ленты. Мы стояли на набережной до темноты.\nКто-то рядом нес рукописный плакат: «Вы нас даже не представляете».\nТогда казалось, что через пару лет все изменится.\nМы были молодыми и наивными.»"
  },
  {
    id: "f03",
    name: "письмо_маме_2009.txt",
    cycle: 3,
    title: "Личные письма: 2009 год",
    content: "«Мам, привет. Был сегодня на первом собрании в «Молодежном Яблоке».\nТам было человек тридцать. Половина — студенты, как я.\nКто-то говорил про честные выборы, кто-то — про свободу прессы.\nМне понравилось. Я думаю, что буду ходить.\nМожет, это что-то изменит.\nНе смейся.\nК.»"
  },
  {
    id: "f04",
    name: "список_исключенных.txt",
    cycle: 4,
    title: "Протоколы бюро: Декабрь 2021",
    content: "«Список исключенных из МО «Яблоко» по результатам заседаний бюро:\n1. Прокопьев С.В. (признан нарушившим партийную дисциплину)\n2. Заславский И.Б.\n3. Волкова А.М.\n4. Зотов Д.С.\n\nРешение принято большинством голосов. Члены партии уведомлены.»"
  }
];

function buildDocsWindow() {
  const win = createWindow("docs", "Документы и архивы", 580, 420);
  const body = document.getElementById("wb-docs");
  if (!body) return;

  const availableDocs = docsRegistry.filter(d => G.cycle >= d.cycle);

  let listHtml = availableDocs.map(d =>
    '<div class="doc-file-item" style="padding:8px;border-bottom:1px solid #ccc;cursor:pointer;display:flex;align-items:center;gap:8px;" onclick="viewDoc(\'' + d.id + '\')">' +
      '<span style="font-weight:bold;color:#00126b;">DOC</span>' +
      '<div>' +
        '<div style="font-size:16px;font-weight:bold;">' + d.name + '</div>' +
        '<div style="font-size:12px;color:#666;">' + d.title + '</div>' +
      '</div>' +
    '</div>'
  ).join("");

  body.innerHTML =
    '<div style="padding:12px;height:100%;overflow-y:auto;background:#fff;" id="docs-content-area">' +
      '<div style="font-size:18px;font-weight:bold;margin-bottom:8px;color:#00126b;">Каталог: /Архивы зампреда/</div>' +
      listHtml +
    '</div>';
}

window.viewDoc = function(docId) {
  const doc = docsRegistry.find(d => d.id === docId);
  if (!doc) return;
  G.flashbacks_read++;
  showToast("Открыт архивный документ: " + doc.name);
  const area = document.getElementById("docs-content-area");
  if (area) {
    area.innerHTML =
      '<button class="btn-primary" style="margin-bottom:10px;" onclick="buildDocsWindow()">← Назад к списку</button>' +
      '<div style="font-size:18px;font-weight:bold;margin-bottom:8px;color:#00126b;">' + doc.name + '</div>' +
      '<div style="font-size:15px;line-height:1.5;white-space:pre-wrap;background:#f9f9f6;padding:12px;border:1px solid #ccc;">' + doc.content + '</div>';
  }
};


// =============================================
// MINIGAME 1: СХЕМА (РАСПРЕДЕЛЕНИЕ ТРАНША)
// =============================================
const INCOMING = 14200000;

const schemeNodes = [
  {
    id: "node1",
    title: "ИП Крапухин А.М. «Информационные услуги»",
    desc: "Договор на оказание консультационных услуг. Гибкое назначение.",
    min: 0,
    max: 9000000,
    getHeat: (v) => {
      if (v > 8000000) return "red";
      if (v > 6000000) return "orange";
      if (v > 3000000) return "yellow";
      return "green";
    },
    getHint: (v) => {
      if (v > 8000000) return "КРАСНЫЙ СЛЕД: сумма через одно ИП вызовет немедленную блокировку ФНС.";
      if (v > 6000000) return "ВЫСОКИЙ РИСК: финансовый мониторинг запросит первичные акты.";
      return "";
    },
    onSubmit: (v) => {
      G.cash += Math.round(v * 0.15);
      if (v > 6000000) {
        G.kompro += 20;
        G.krapukhin_trust += 15;
      } else {
        G.krapukhin_trust += 5;
      }
    }
  },
  {
    id: "node2",
    title: "Аренда офиса «Гагаринский»",
    desc: "Фактическая аренда помещений под штаб и склад батареек.",
    min: 0,
    max: 2000000,
    getHeat: (v) => {
      if (v > 1800000) return "yellow";
      return "green";
    },
    getHint: (v) => {
      if (v > 1800000) return "Завышенная ставка аренды для Гагаринского района.";
      return "";
    },
    onSubmit: (v) => {
      G.yabloko += Math.round((v / 2000000) * 10);
      G.party_money += Math.round(v * 0.2);
    }
  },
  {
    id: "node3",
    title: "ООО «Агентство Апра» (Полиграфия)",
    desc: "Печать брошюр, методичек и эко-плакатов.",
    min: 0,
    max: 4500000,
    getHeat: (v) => {
      if (v > 4000000) return "red";
      if (v > 2500000) return "orange";
      return "green";
    },
    getHint: (v) => {
      if (v > 4000000) return "Тираж на такую сумму невозможно спрятать без склада.";
      return "";
    },
    onSubmit: (v) => {
      G.cash += Math.round(v * 0.10);
      G.battery_audit -= Math.round((v / 4500000) * 10);
      if (v > 2500000) G.kompro += 15;
    }
  },
  {
    id: "node4",
    title: "Эко-акции и вывоз батареек (Реальный сектор)",
    desc: "Реальные контейнеры у метро и утилизация на заводе в Ярославле.",
    min: 0,
    max: 3000000,
    getHeat: (v) => {
      if (v < 500000) return "orange";
      return "green";
    },
    getHint: (v) => {
      if (v < 500000) return "Слишком мало реальных расходов: Росприроднадзор придет сразу.";
      return "";
    },
    onSubmit: (v) => {
      G.battery_audit -= Math.round((v / 3000000) * 25);
      G.fler += Math.round((v / 3000000) * 15);
      G.meria += 5;
    }
  }
];

function openScheme() {
  const overlay = document.getElementById("scheme-overlay");
  if (!overlay) return;
  overlay.classList.remove("hidden");
  schemeTimerLeft = 90;
  schemeDone = false;
  buildSchemeOverlay();
}

function buildSchemeOverlay() {
  const overlay = document.getElementById("scheme-overlay");
  if (!overlay) return;

  let nodesHtml = schemeNodes.map(n => {
    return (
      '<div class="scheme-node heat-green" id="sn-' + n.id + '">' +
        '<div class="scheme-node-title">' + n.title + '</div>' +
        '<div class="scheme-node-desc">' + n.desc + '</div>' +
        '<div style="font-size:13px;color:#333;margin-top:2px;">Лимит узла: ' + fmtMoney(n.max) + '</div>' +
        '<input type="number" class="scheme-node-input" id="inp-' + n.id + '" ' +
          'placeholder="0" min="' + n.min + '" max="' + n.max + '" step="100000" ' +
          'oninput="onSchemeInput(\'' + n.id + '\')" />' +
        '<div class="scheme-quick-btns">' +
          '<button type="button" class="btn-quick" onclick="addSchemeAmount(\'' + n.id + '\', 100000)">+100 тыс</button>' +
          '<button type="button" class="btn-quick" onclick="addSchemeAmount(\'' + n.id + '\', 500000)">+500 тыс</button>' +
          '<button type="button" class="btn-quick" onclick="addSchemeAmount(\'' + n.id + '\', 1000000)">+1 млн</button>' +
          '<button type="button" class="btn-quick" onclick="setSchemeMax(\'' + n.id + '\')">Макс</button>' +
          '<button type="button" class="btn-quick btn-reset" onclick="resetSchemeAmount(\'' + n.id + '\')">Сброс</button>' +
        '</div>' +
        '<div class="scheme-node-hint" id="hint-' + n.id + '"></div>' +
      '</div>'
    );
  }).join("");

  overlay.innerHTML =
    '<div class="scheme-panel">' +
      '<div class="scheme-header">' +
        '<div class="scheme-title">1С: Бухгалтерия «Среда» — Распределение транша N 23/МР-ЭКО</div>' +
        '<div class="scheme-subtitle">Распределите входящие средства по узлам. Не превышайте бюджет и избегайте красных цепочек.</div>' +
      '</div>' +
      '<div class="scheme-timer-track">' +
        '<div class="scheme-timer-fill" id="scheme-timer-bar" style="width:100%;"></div>' +
      '</div>' +
      '<div class="scheme-info-row">' +
        '<span class="scheme-incoming">Входящий транш: <strong>' + fmtMoney(INCOMING) + '</strong></span>' +
        '<span class="scheme-remaining" id="scheme-remaining">Остаток: ' + fmtMoney(INCOMING) + '</span>' +
        '<span id="scheme-timer-txt" style="margin-left:auto;font-size:15px;font-weight:bold;">Время: 90 сек.</span>' +
      '</div>' +
      '<div class="scheme-nodes">' + nodesHtml + '</div>' +
      '<div class="scheme-footer">' +
        '<button class="btn-scheme-submit" id="scheme-submit-btn" onclick="submitScheme()">Провести акты и закрыть квартал</button>' +
      '</div>' +
    '</div>';

  startSchemeTimer();
}

function getSchemeNodeValue(nodeId) {
  const inp = document.getElementById("inp-" + nodeId);
  if (!inp) return 0;
  const v = parseInt(inp.value, 10);
  return isNaN(v) ? 0 : v;
}

function getSchemeTotal() {
  return schemeNodes.reduce((s, n) => s + getSchemeNodeValue(n.id), 0);
}

window.onSchemeInput = function(nodeId) {
  const node = schemeNodes.find(n => n.id === nodeId);
  if (!node) return;

  const inp = document.getElementById("inp-" + nodeId);
  const card = document.getElementById("sn-" + nodeId);
  const hint = document.getElementById("hint-" + nodeId);
  if (!inp || !card) return;

  let v = parseInt(inp.value, 10);
  if (isNaN(v)) v = 0;

  if (v > node.max) {
    inp.value = node.max;
    v = node.max;
    inp.classList.add("error");
  } else {
    inp.classList.remove("error");
  }

  const heat = node.getHeat(v);
  card.className = "scheme-node heat-" + heat;
  if (hint) hint.textContent = node.getHint(v);

  updateSchemeRemaining();
};

function updateSchemeRemaining() {
  const total = getSchemeTotal();
  const rem = INCOMING - total;
  const el = document.getElementById("scheme-remaining");
  const btn = document.getElementById("scheme-submit-btn");
  if (!el) return;
  el.textContent = "Остаток: " + fmtMoney(rem);
  el.className = "scheme-remaining";
  if (rem === 0) {
    el.classList.add("ok");
    if (btn) btn.disabled = false;
  } else if (rem < 0) {
    el.classList.add("danger");
    if (btn) btn.disabled = true;
  } else {
    el.classList.add("warn");
    if (btn) btn.disabled = false;
  }
}

function startSchemeTimer() {
  if (schemeTimer) clearInterval(schemeTimer);
  schemeTimer = setInterval(() => {
    schemeTimerLeft--;
    const bar = document.getElementById("scheme-timer-bar");
    const txt = document.getElementById("scheme-timer-txt");
    if (bar) {
      bar.style.width = ((schemeTimerLeft / 90) * 100) + "%";
      if (schemeTimerLeft < 30) bar.classList.add("danger");
    }
    if (txt) txt.textContent = "Время: " + schemeTimerLeft + " сек.";
    if (schemeTimerLeft <= 0) {
      clearInterval(schemeTimer);
      schemeAutoSubmit();
    }
  }, 1000);
}

function schemeAutoSubmit() {
  schemeNodes.forEach(n => {
    const inp = document.getElementById("inp-" + n.id);
    if (inp && inp.value === "") inp.value = "0";
  });
  resolveScheme(true);
}

window.addSchemeAmount = function(nodeId, amount) {
  const node = schemeNodes.find(n => n.id === nodeId);
  if (!node) return;
  const inp = document.getElementById("inp-" + nodeId);
  if (!inp) return;
  let current = parseInt(inp.value, 10);
  if (isNaN(current)) current = 0;
  let next = Math.min(node.max, current + amount);
  inp.value = next;
  onSchemeInput(nodeId);
};

window.setSchemeMax = function(nodeId) {
  const node = schemeNodes.find(n => n.id === nodeId);
  if (!node) return;
  const inp = document.getElementById("inp-" + nodeId);
  if (!inp) return;
  inp.value = node.max;
  onSchemeInput(nodeId);
};

window.resetSchemeAmount = function(nodeId) {
  const inp = document.getElementById("inp-" + nodeId);
  if (!inp) return;
  inp.value = 0;
  onSchemeInput(nodeId);
};

window.submitScheme = function() {
  if (schemeTimer) clearInterval(schemeTimer);
  resolveScheme(false);
};

function resolveScheme(isAuto) {
  if (schemeDone) return;
  schemeDone = true;

  schemeNodes.forEach(n => {
    const v = getSchemeNodeValue(n.id);
    if (n.onSubmit) n.onSubmit(v);
  });

  const total = getSchemeTotal();
  const rem = INCOMING - total;
  let resultMsg = "";

  if (rem > 0) {
    G.battery_audit = clamp(G.battery_audit + 20, 0, 200);
    resultMsg = "Необоснованный остаток на счетах. Аудит вырос.";
  } else if (rem < 0) {
    G.battery_audit = clamp(G.battery_audit + 30, 0, 200);
    resultMsg = "Перерасход бюджета. Ошибка бухгалтерии.";
  } else {
    let reds = 0;
    schemeNodes.forEach(n => {
      const v = getSchemeNodeValue(n.id);
      if (n.getHeat(v) === "red") reds++;
    });

    if (reds === 0) {
      G.battery_audit = clamp(G.battery_audit - 15, 0, 200);
      G.siloviki = clamp(G.siloviki - 10, 0, 100);
      G.kompro = clamp(G.kompro + 5, 0, 100);
      resultMsg = "Идеальная проводка. Акты приняты без замечаний.";
    } else {
      G.battery_audit = clamp(G.battery_audit + 10, 0, 200);
      G.siloviki = clamp(G.siloviki + 10, 0, 100);
      G.kompro = clamp(G.kompro + 20, 0, 100);
      resultMsg = "Схема закрыта. Есть следы для проверяющих органов.";
    }
  }

  updateHUD();
  const overlay = document.getElementById("scheme-overlay");
  if (overlay) overlay.classList.add("hidden");

  showToast(resultMsg, 4000);

  // Автоматический переход к Событию 1-02 через 2.5 секунды
  setTimeout(() => {
    startEvent102();
  }, 2500);
}

// =============================================
// MINIGAME 2: МАНЕВР (ОКРУГ 197)
// =============================================
let manevrState = {
  popov: 38,
  lobanov: 46,
  goncharov: 8,
  others: 8,
  turn: 0,
  maxTurns: 5
};

function startManevr() {
  manevrState = {
    popov: 38,
    lobanov: 46,
    goncharov: G.flags.honest_candidate ? 14 : 8,
    others: 8,
    turn: 0,
    maxTurns: 5
  };
  buildManevrWindow();
}

function buildManevrWindow() {
  const win = createWindow("manevr", "Оперативный штаб — Выборы в Госдуму (Округ 197)", 740, 500);
  renderManevrUI();
  bringToFront("manevr");
}

function renderManevrUI() {
  const body = document.getElementById("wb-manevr");
  if (!body) return;

  let curatorMsg = "Куратор: Лобанов набирает 46%! Вы должны сбить его до 38%, иначе ДЭГ не удержит победу Попова.";
  if (manevrState.lobanov <= 38) {
    curatorMsg = "Куратор: Лобанов сбит ниже 38%. Отличная работа. ДЭГ сделает остальное.";
  }

  body.innerHTML =
    '<div class="manevr-container">' +
      '<div class="manevr-header-bar">' +
        '<span>Штабная кампания — Ход ' + (manevrState.turn + 1) + ' из ' + manevrState.maxTurns + '</span>' +
        '<span>Касса кампании: ' + fmtMoney(G.cash) + '</span>' +
      '</div>' +
      '<div class="manevr-body">' +
        '<div class="manevr-actions-col">' +
          '<div style="font-size:16px;font-weight:bold;margin-bottom:4px;color:#00126b;">Оперативные действия</div>' +
          '<div class="manevr-action-card">' +
            '<div class="manevr-act-title">1. Выпустить спецвыпуск газеты в Кунцево</div>' +
            '<div class="manevr-act-desc">Тираж 50 000 экз. Критика районной инфраструктуры и призыв голосовать за Яблоко.</div>' +
            '<div class="manevr-act-meta">' +
              '<span class="manevr-cost">Стоимость: 200 000 р.</span>' +
              '<button class="btn-primary" onclick="execManevrAction(\'newspaper\')">Выпустить</button>' +
            '</div>' +
          '</div>' +
          '<div class="manevr-action-card">' +
            '<div class="manevr-act-title">2. Провести жесткие дебаты против Лобанова</div>' +
            '<div class="manevr-act-desc">Атака на позицию КПРФ по крымскому консенсусу. Раскалывает протестный электорат.</div>' +
            '<div class="manevr-act-meta">' +
              '<span class="manevr-cost">Стоимость: 0 р. (-5 Флер)</span>' +
              '<button class="btn-primary" onclick="execManevrAction(\'debates\')">Атаковать</button>' +
            '</div>' +
          '</div>' +
          '<div class="manevr-action-card">' +
            '<div class="manevr-act-title">3. Встреча с избирателями в Раменках</div>' +
            '<div class="manevr-act-desc">Личный диалог у метро. Защита зеленых насаждений и парка.</div>' +
            '<div class="manevr-act-meta">' +
              '<span class="manevr-cost">Стоимость: 150 000 р. (+5 Флер)</span>' +
              '<button class="btn-primary" onclick="execManevrAction(\'meeting\')">Провести</button>' +
            '</div>' +
          '</div>' +
          '<div class="manevr-action-card">' +
            '<div class="manevr-act-title">4. Слив «разоблачения» Лобанова в районные чаты</div>' +
            '<div class="manevr-act-desc">Анонимная сетка ботов с обвинениями в связях с несистемными левыми.</div>' +
            '<div class="manevr-act-meta">' +
              '<span class="manevr-cost">Стоимость: 50 000 р. (+10 Компромат)</span>' +
              '<button class="btn-primary" onclick="execManevrAction(\'leak\')">Опубликовать</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">' +
            '<button class="btn-primary" style="background:#b71c1c;color:#fff;" onclick="chooseCampaignDirection(\'C\')">Снять кандидатуру</button>' +
            '<button class="btn-primary" onclick="finishManevr()">Завершить кампанию →</button>' +
          '</div>' +
        '</div>' +
        '<div class="manevr-monitor-col">' +
          '<div style="font-size:16px;font-weight:bold;margin-bottom:6px;color:#00126b;">Социология округа 197</div>' +
          '<div class="manevr-poll-card">' +
            '<div class="poll-row">' +
              '<span><strong>Лобанов (КПРФ)</strong></span>' +
              '<span><strong>' + manevrState.lobanov + '%</strong></span>' +
            '</div>' +
            '<div class="poll-track"><div class="poll-fill fill-lobanov" style="width:' + manevrState.lobanov + '%;"></div></div>' +
          '</div>' +
          '<div class="manevr-poll-card">' +
            '<div class="poll-row">' +
              '<span><strong>Попов (ЕР / Мэрия)</strong></span>' +
              '<span><strong>' + manevrState.popov + '%</strong></span>' +
            '</div>' +
            '<div class="poll-track"><div class="poll-fill fill-popov" style="width:' + manevrState.popov + '%;"></div></div>' +
          '</div>' +
          '<div class="manevr-poll-card">' +
            '<div class="poll-row">' +
              '<span><strong>Гончаров (Яблоко)</strong></span>' +
              '<span><strong>' + manevrState.goncharov + '%</strong></span>' +
            '</div>' +
            '<div class="poll-track"><div class="poll-fill fill-goncharov" style="width:' + manevrState.goncharov + '%;"></div></div>' +
          '</div>' +
          '<div class="manevr-curator-box">' + curatorMsg + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

window.execManevrAction = function(act) {
  if (act === "newspaper") {
    if (G.cash < 200000) { showToast("Недостаточно средств в кассе."); return; }
    G.cash -= 200000;
    manevrState.goncharov += 3;
    manevrState.lobanov -= 2;
    manevrState.popov += 1;
    G.yabloko = clamp(G.yabloko + 5, 0, 100);
    showToast("Спецвыпуск газеты роздан у станций метро Кунцево.");
  } else if (act === "debates") {
    manevrState.lobanov -= 4;
    manevrState.goncharov += 2;
    manevrState.popov += 2;
    G.fler = clamp(G.fler - 5, 0, 100);
    G.meria = clamp(G.meria + 5, 0, 100);
    showToast("Дебаты раскололи оппозиционный электорат.");
  } else if (act === "meeting") {
    if (G.cash < 150000) { showToast("Недостаточно средств в кассе."); return; }
    G.cash -= 150000;
    manevrState.goncharov += 4;
    G.fler = clamp(G.fler + 5, 0, 100);
    G.yabloko = clamp(G.yabloko + 3, 0, 100);
    showToast("Встреча в Раменках собрала 200 жителей.");
  } else if (act === "leak") {
    if (G.cash < 50000) { showToast("Недостаточно средств в кассе."); return; }
    G.cash -= 50000;
    manevrState.lobanov -= 5;
    G.kompro = clamp(G.kompro + 10, 0, 100);
    G.fler = clamp(G.fler - 10, 0, 100);
    showToast("Разоблачение разошлось по районным пабликам.");
  }

  manevrState.turn++;
  G.lobanov_threat = manevrState.lobanov;
  updateHUD();

  if (manevrState.turn >= manevrState.maxTurns) {
    finishManevr();
  } else {
    renderManevrUI();
  }
};

window.finishManevr = function() {
  closeWindow("manevr");
  showToast("Избирательная кампания завершена. Участки закрылись.");
  setTimeout(() => {
    startEvent203();
  }, 2000);
};

// =============================================
// MINIGAME 3: ДОСЬЕ (ЧИСТКА АКТИВА)
// =============================================
const dossiersData = [
  {
    name: "Сергей Прокопьев",
    district: "Гагаринский район",
    status: "pending",
    exp: "В партии с 2015 года. Избран муниципальным депутатом в 2017 г. Активный организатор кампаний. Поставил урны для батареек.",
    social: "2021: «Умное голосование — инструмент избирателя, а не враг». 2022: критиковал закрытость партийного руководства.",
    recom: "Рекомендация низовых активистов: Оставить. Сигнал куратора: Опасен, излишне автономен."
  },
  {
    name: "Илья Заславский",
    district: "Раменки",
    status: "pending",
    exp: "В партии с 2019 года. Волонтер избирательных штабов. Собирал подписи за независимых кандидатов.",
    social: "Открыто репостил расследования команды Навального. Призывал бойкотировать съезд из-за позиции по ДЭГ.",
    recom: "Рекомендация бюро: Немедленно исключить за нарушение партийной дисциплины."
  },
  {
    name: "Анна Волкова",
    district: "Кунцево",
    status: "pending",
    exp: "Юрист партии. Защищала задержанных на митингах активистов в судах без оплаты.",
    social: "Посты строго юридические. Никаких оскорблений руководства, но последовательная правозащитная позиция.",
    recom: "Рекомендация бюро: Оставить под предупреждение, ценный юрист."
  },
  {
    name: "Денис Зотов",
    district: "Дорогомилово",
    status: "pending",
    exp: "Активист молодежного отделения. Организовывал пикеты против реновации.",
    social: "«Если руководство боится улицы — руководство пора менять». Участвовал в несанкционированных акциях 2021 года.",
    recom: "Рекомендация: Исключить."
  },
  {
    name: "Михаил Соколов",
    district: "Академический район",
    status: "pending",
    exp: "Вступил в 2022 году. Идеальная отчетность, взносы платит вовремя, всегда голосует в унисон с бюро.",
    social: "Никакой оппозиционной активности. Идеально лоялен руководству.",
    recom: "Рекомендация: Образцовый партиец. (Скрытый информатор Лубянки)."
  },
  {
    name: "Елена Григорьева",
    district: "Ломоносовский район",
    status: "pending",
    exp: "Член партии с 2011 года. Руководила районным отделением. Организовала наблюдение на 40 участках.",
    social: "Нейтральные посты о благоустройстве района и парковых зонах.",
    recom: "Рекомендация местных членов: Сохранить в партии."
  }
];

let curDossierIdx = 0;
let curDossierTab = "exp";

function startDossierMinigame() {
  curDossierIdx = 0;
  curDossierTab = "exp";
  buildDossierWindow();
}

function buildDossierWindow() {
  const win = createWindow("dossier", "Комиссия по партийной этике — Досье членов РО", 740, 520);
  renderDossierUI();
  bringToFront("dossier");
}

function renderDossierUI() {
  const body = document.getElementById("wb-dossier");
  if (!body) return;

  let listHtml = dossiersData.map((d, i) => {
    let pillClass = "pill-pending";
    let pillText = "На рассмотрении";
    if (d.status === "keep") { pillClass = "pill-keep"; pillText = "Оставить"; }
    else if (d.status === "purge") { pillClass = "pill-purge"; pillText = "Исключить"; }

    return (
      '<div class="dossier-item' + (curDossierIdx === i ? " active" : "") + '" onclick="selectDossier(' + i + ')">' +
        '<div class="dossier-item-name">' + d.name + '</div>' +
        '<div class="dossier-item-district">' + d.district + '</div>' +
        '<span class="dossier-status-pill ' + pillClass + '">' + pillText + '</span>' +
      '</div>'
    );
  }).join("");

  const cur = dossiersData[curDossierIdx];
  let contentText = cur.exp;
  if (curDossierTab === "social") contentText = cur.social;
  else if (curDossierTab === "recom") contentText = cur.recom;

  const reviewedCount = dossiersData.filter(d => d.status !== "pending").length;

  body.innerHTML =
    '<div class="dossier-container">' +
      '<div class="dossier-list">' +
        '<div style="font-size:15px;font-weight:bold;margin-bottom:6px;color:#00126b;">Список на чистку (' + reviewedCount + '/6)</div>' +
        listHtml +
        '<button class="btn-primary" style="margin-top:auto;" onclick="submitDossiers()">Утвердить решение бюро</button>' +
      '</div>' +
      '<div class="dossier-view">' +
        '<div class="dossier-tabs">' +
          '<button class="dossier-tab-btn' + (curDossierTab === "exp" ? " active" : "") + '" onclick="setDossierTab(\'exp\')">Партийный стаж</button>' +
          '<button class="dossier-tab-btn' + (curDossierTab === "social" ? " active" : "") + '" onclick="setDossierTab(\'social\')">Соцсети</button>' +
          '<button class="dossier-tab-btn' + (curDossierTab === "recom" ? " active" : "") + '" onclick="setDossierTab(\'recom\')">Рекомендации</button>' +
        '</div>' +
        '<div class="dossier-content">' +
          '<div style="font-size:18px;font-weight:bold;margin-bottom:8px;color:#00126b;">' + cur.name + ' (' + cur.district + ')</div>' +
          contentText +
        '</div>' +
        '<div class="dossier-actions">' +
          '<button class="btn-primary" style="background:#2a9d8f;color:#fff;" onclick="markDossier(\'keep\')">[+] Оставить в партии</button>' +
          '<button class="btn-primary" style="background:#b71c1c;color:#fff;" onclick="markDossier(\'purge\')">[-] Исключить из партии</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

window.selectDossier = function(idx) {
  curDossierIdx = idx;
  renderDossierUI();
};

window.setDossierTab = function(tab) {
  curDossierTab = tab;
  renderDossierUI();
};

window.markDossier = function(status) {
  dossiersData[curDossierIdx].status = status;
  if (curDossierIdx < dossiersData.length - 1) {
    curDossierIdx++;
  }
  renderDossierUI();
};

window.submitDossiers = function() {
  const purged = dossiersData.filter(d => d.status === "purge");
  G.purge_count = purged.length;

  if (purged.length >= 4) {
    G.yabloko = clamp(G.yabloko + 20, 0, 100);
    G.rage = clamp(G.rage + 30, 0, 100);
    G.flags.kac_supporters_purged = true;
    showToast("Бюро утвердило жесткую чистку: исключено " + purged.length + " активистов.");
  } else if (purged.length >= 2) {
    G.yabloko = clamp(G.yabloko + 10, 0, 100);
    G.rage = clamp(G.rage + 15, 0, 100);
    showToast("Бюро исключило " + purged.length + " активистов.");
  } else {
    G.yabloko = clamp(G.yabloko - 15, 0, 100);
    G.rage = clamp(G.rage - 10, 0, 100);
    showToast("Григорий недоволен мягкостью чистки.");
  }

  updateHUD();
  closeWindow("dossier");

  setTimeout(() => {
    startEvent302();
  }, 2500);
};

// =============================================
// MINIGAME 4: СЛОВА (ЭФИРЫ У НОРКИНА НА НТВ)
// =============================================
let norkinSelectedWords = [];
let norkinCurrentTheme = "election";

const norkinBanks = {
  election: {
    question: "Андрей Норкин: «Кирилл Алексеевич, оппозиция в Москве — это конструктивная сила или деструктивные провокаторы?»",
    words: ["Яблоко", "конструктивная сила", "другой путь", "осуждаю провокации", "честные выборы", "популисты", "защита прав", "диалог с властью", "свобода", "не соглашусь"]
  },
  ukraine: {
    question: "Андрей Норкин: «Кирилл Алексеевич, как «Яблоко» относится к специальной военной операции? Вы поддерживаете армию?»",
    words: ["Яблоко", "за мир", "переговоры", "немедленно", "дипломатия", "осуждаем", "воздерживаемся от оценок", "в рамках закона", "сложная ситуация", "поддерживаем армию"]
  }
};

function startNorkinMinigame(theme) {
  norkinCurrentTheme = theme || "election";
  norkinSelectedWords = [];
  buildNorkinWindow();
}

function buildNorkinWindow() {
  const win = createWindow("norkin", "Прямой эфир — «Место встречи» (НТВ)", 720, 480);
  renderNorkinUI();
  bringToFront("norkin");
}

function renderNorkinUI() {
  const body = document.getElementById("wb-norkin");
  if (!body) return;

  const data = norkinBanks[norkinCurrentTheme] || norkinBanks.election;

  let speechHtml = norkinSelectedWords.map((w, idx) =>
    '<span class="word-tile selected" onclick="removeNorkinWord(' + idx + ')">' + w + ' [x]</span>'
  ).join("");

  if (norkinSelectedWords.length === 0) {
    speechHtml = '<span class="norkin-placeholder">Нажимайте на слова снизу, чтобы составить фразу ответа...</span>';
  }

  let bankHtml = data.words.map(w =>
    '<button class="word-tile" onclick="addNorkinWord(\'' + w + '\')">' + w + '</button>'
  ).join("");

  body.innerHTML =
    '<div class="norkin-container">' +
      '<div class="norkin-header">' +
        '<span>Телеканал НТВ — Студия прямого эфира</span>' +
        '<span class="norkin-onair">● В ЭФИРЕ</span>' +
      '</div>' +
      '<div class="norkin-prompt">' + data.question + '</div>' +
      '<div class="norkin-speech-field">' + speechHtml + '</div>' +
      '<div style="padding:4px 14px;font-size:13px;color:#aaa;">Доступный лексикон зампреда:</div>' +
      '<div class="norkin-tile-bank">' + bankHtml + '</div>' +
      '<div class="norkin-footer">' +
        '<button class="btn-primary" style="background:#444;color:#fff;" onclick="norkinSelectedWords=[] ;renderNorkinUI()">Очистить фразу</button>' +
        '<button class="btn-primary" style="background:#b71c1c;color:#fff;font-size:16px;" onclick="submitNorkinSpeech()">Сказать в эфир →</button>' +
      '</div>' +
    '</div>';
}

window.addNorkinWord = function(w) {
  if (norkinSelectedWords.length >= 7) {
    showToast("Фраза слишком длинная для реплики в эфире.");
    return;
  }
  norkinSelectedWords.push(w);
  renderNorkinUI();
};

window.removeNorkinWord = function(idx) {
  norkinSelectedWords.splice(idx, 1);
  renderNorkinUI();
};

window.submitNorkinSpeech = function() {
  G.ntv_count++;
  const phrase = norkinSelectedWords.join(" ").toLowerCase();

  let toastMsg = "";

  if (norkinCurrentTheme === "election") {
    if (phrase.includes("осуждаю провокации") || phrase.includes("популисты")) {
      G.meria = clamp(G.meria + 20, 0, 100);
      G.fler = clamp(G.fler - 15, 0, 100);
      G.cash += 150000;
      toastMsg = "Норкин: «Вот это зрелая позиция!» Гонорар 150 000 р. выплачен.";
    } else if (phrase.includes("свобода") || phrase.includes("честные выборы")) {
      G.fler = clamp(G.fler + 15, 0, 100);
      G.siloviki = clamp(G.siloviki + 10, 0, 100);
      toastMsg = "Норкин перебивает и кричит: «Это демагогия!» В зале гул.";
    } else {
      G.meria = clamp(G.meria + 10, 0, 100);
      G.cash += 150000;
      toastMsg = "Норкин: «Позиция понятна.» Гонорар 150 000 р. получен.";
    }
  } else {
    // Ukraine theme
    if (phrase.includes("осуждаем") || phrase.includes("немедленно")) {
      G.fler = clamp(G.fler + 25, 0, 100);
      G.siloviki = clamp(G.siloviki + 25, 0, 100);
      G.meria = clamp(G.meria - 30, 0, 100);
      toastMsg = "Эфир резко прерван на рекламу. Гонорар аннулирован.";
    } else if (phrase.includes("поддерживаем армию")) {
      G.meria = clamp(G.meria + 25, 0, 100);
      G.fler = clamp(G.fler - 25, 0, 100);
      G.cash += 200000;
      toastMsg = "Норкин жмет руку. Гонорар 200 000 р. в кармане.";
    } else {
      G.fler = clamp(G.fler + 5, 0, 100);
      G.cash += 200000;
      toastMsg = "Дипломатичный уход от ответа. Гонорар 200 000 р. выплачен.";
    }
  }

  updateHUD();
  closeWindow("norkin");
  showToast(toastMsg, 5000);

  setTimeout(() => {
    if (norkinCurrentTheme === "election") {
      startEvent205();
    } else {
      startEvent303();
    }
  }, 2500);
};

// =============================================
// MINIGAME 5: КОНФЕРЕНЦИЯ (ВЫБОРЫ ПРЕДСЕДАТЕЛЯ)
// =============================================
let confVotes = 12; // Лоялисты голосуют сразу
let confActionsTaken = {
  speech: false,
  money: false,
  calls: false
};

function startConferenceMinigame() {
  confVotes = 12;
  confActionsTaken = { speech: false, money: false, calls: false };
  buildConferenceWindow();
}

function buildConferenceWindow() {
  const win = createWindow("conference", "Внеочередная конференция МО «Яблоко» — Выборы председателя", 720, 500);
  renderConferenceUI();
  bringToFront("conference");
}

function renderConferenceUI() {
  const body = document.getElementById("wb-conference");
  if (!body) return;

  const votesClass = confVotes >= 20 ? "ok" : "warn";

  body.innerHTML =
    '<div class="conf-container">' +
      '<div class="conf-status-bar">' +
        '<span style="font-size:16px;">Голосов делегатов: <span class="conf-votes-counter ' + votesClass + '">' + confVotes + ' из 36</span> (нужно 20)</span>' +
        '<span style="font-size:14px;">Партийная касса: ' + fmtMoney(G.party_money) + '</span>' +
      '</div>' +
      '<div class="conf-delegates-list">' +
        '<div class="conf-group-card">' +
          '<div class="conf-group-header">' +
            '<span>1. Фракция аппарата и бюро (12 делегатов)</span>' +
            '<span style="color:#2a9d8f;font-weight:bold;">12 голосов ЗА</span>' +
          '</div>' +
          '<div class="conf-group-desc">Безусловные лоялисты Григория Алексеевича. Голосуют по указке президиума.</div>' +
        '</div>' +
        '<div class="conf-group-card">' +
          '<div class="conf-group-header">' +
            '<span>2. Нейтральные делегаты округов (14 делегатов)</span>' +
            '<span>' + (confActionsTaken.speech ? "+8 голосов" : "Колеблются") + '</span>' +
          '</div>' +
          '<div class="conf-group-desc">Хотят гарантий финансирования муниципальных кампаний и аппаратного мира.</div>' +
          '<div>' +
            '<button class="btn-primary" ' + (confActionsTaken.speech ? 'disabled' : '') + ' onclick="confDoAction(\'speech\')">Произнести программную речь (+8 голосов)</button> ' +
            '<button class="btn-primary" ' + (confActionsTaken.money ? 'disabled' : '') + ' onclick="confDoAction(\'money\')">Выделить 200 000 р. на округа (+6 голосов)</button>' +
          '</div>' +
        '</div>' +
        '<div class="conf-group-card">' +
          '<div class="conf-group-header">' +
            '<span>3. Скептики и ветераны (7 делегатов)</span>' +
            '<span>' + (confActionsTaken.calls ? "+4 голоса" : "Сомневаются") + '</span>' +
          '</div>' +
          '<div class="conf-group-desc">Помнят лекции 2012 года. Опасаются излишней лояльности мэрии.</div>' +
          '<div>' +
            '<button class="btn-primary" ' + (confActionsTaken.calls ? 'disabled' : '') + ' onclick="confDoAction(\'calls\')">Личный звонок зампреда каждому (+4 голоса)</button>' +
          '</div>' +
        '</div>' +
        '<div class="conf-group-card">' +
          '<div class="conf-group-header">' +
            '<span>4. Радикальные оппоненты (3 делегата)</span>' +
            '<span style="color:#b71c1c;">' + (G.flags.kac_supporters_purged ? "Исключены в 2023 г." : "Против") + '</span>' +
          '</div>' +
          '<div class="conf-group-desc">' + (G.flags.kac_supporters_purged ? "Были зачищены на комиссии по этике. Мандаты аннулированы." : "Голосуют строго против любой кандидатуры от бюро.") + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:10px;background:#cfcac2;border-top:2px solid #808080;display:flex;justify-content:flex-end;">' +
        '<button class="btn-primary" style="font-size:16px;padding:8px 16px;" onclick="submitConferenceVote()">Объявить результаты голосования →</button>' +
      '</div>' +
    '</div>';
}

window.confDoAction = function(act) {
  if (act === "speech") {
    confActionsTaken.speech = true;
    confVotes += 8;
    G.fler = clamp(G.fler + 5, 0, 100);
    showToast("Программная речь встречена аплодисментами зала.");
  } else if (act === "money") {
    if (G.party_money < 200000) { showToast("Недостаточно средств в партийной кассе."); return; }
    G.party_money -= 200000;
    confActionsTaken.money = true;
    confVotes += 6;
    showToast("Транш на округа убедил сомневающихся делегатов.");
  } else if (act === "calls") {
    confActionsTaken.calls = true;
    confVotes += 4;
    G.yabloko = clamp(G.yabloko + 5, 0, 100);
    showToast("Личные переговоры дали нужный результат.");
  }
  updateHUD();
  renderConferenceUI();
};

window.submitConferenceVote = function() {
  closeWindow("conference");
  if (confVotes >= 20) {
    G.flags.mo_chairman = true;
    G.yabloko = clamp(G.yabloko + 25, 0, 100);
    showToast("ИТОГ: Гончаров К.А. избран председателем Московского «Яблока» (" + confVotes + " голосов ЗА).", 5000);
  } else {
    showToast("ИТОГ: Не хватило голосов, но Григорий Алексеевич утвердил назначение личным решением.", 5000);
    G.flags.mo_chairman = true;
  }
  updateHUD();

  setTimeout(() => {
    startEvent404();
  }, 2500);
};


// =============================================
// NARRATIVE EVENTS & CYCLES
// =============================================

// --- PROLOGUE: P-02, P-03 ---
function startP02() {
  setBadge("telegram", 1);
  tgContacts[0].badge = 1;
  G.currentTgContact = "grigoriy_a";
  buildTelegramWindow();
}

window.p02_callNow = function() {
  G.flags.grigoriy_call_accepted = true;
  G.yabloko = clamp(G.yabloko + 5, 0, 100);
  updateHUD();
  addTgMessage("grigoriy_a", "out", "Слушаю вас, Григорий Алексеевич.", null, () => {
    setTimeout(() => {
      addTgMessage("grigoriy_a", "in",
        "Нам нужна структура, которая может работать с городом напрямую. Не через партию — партия слишком видна. Через НКО. Экология сейчас в тренде. Батарейки, парки, все такое. Ты справишься. Я поговорю с нужными людьми. Зарегистрируй фонд на себя, назови «Среда».",
        null,
        () => {
          setTgChoices("grigoriy_a", [
            { label: "Открыть форму Госуслуг", fn: "p02_openBrowser" }
          ]);
        }
      );
    }, 350);
  });
};

window.p02_callLater = function() {
  addTgMessage("grigoriy_a", "out", "Перезвоню позже.", null, () => {
    setTimeout(() => {
      addTgMessage("grigoriy_a", "in",
        "Кирилл, некогда откладывать. Мэрия утверждает списки программ до конца недели. Оформляй фонд прямо сейчас, иначе деньги уйдут другим. Заполни форму на Госуслугах, зарегистрируй «Среду».",
        null,
        () => {
          setTgChoices("grigoriy_a", [
            { label: "Открыть форму Госуслуг", fn: "p02_openBrowser" }
          ]);
        }
      );
    }, 350);
  });
};

window.p02_openBrowser = function() {
  addTgMessage("grigoriy_a", "out", "Открываю форму регистрации.", null, () => {
    setTgChoices("grigoriy_a", []);
    setTimeout(() => {
      startP03();
    }, 400);
  });
};

function startP03() {
  buildEGRULForm();
}

function buildEGRULForm() {
  const formHtml =
    '<div class="browser-form-title">Портал Госуслуги — Регистрация НКО</div>' +
    '<div class="browser-form-subtitle">Федеральная служба государственной регистрации. Форма P11001. Шаг 1 из 1.</div>' +
    '<div class="form-group">' +
      '<label class="form-label">Наименование организации</label>' +
      '<input class="form-input" id="org-name" placeholder="Введите название..." />' +
    '</div>' +
    '<div class="form-group">' +
      '<label class="form-label">Основной вид деятельности (ОКВЭД)</label>' +
      '<select class="form-select" id="okved-select">' +
        '<option value="64.99">64.99 — Прочие финансовые услуги</option>' +
        '<option value="38.32">38.32 — Восстановление отсортированного сырья</option>' +
        '<option value="85.41">85.41 — Образование для взрослых</option>' +
        '<option value="94.99">94.99 — Деятельность прочих общественных организаций</option>' +
      '</select>' +
    '</div>' +
    '<button class="btn-primary" onclick="submitEGRUL()">Зарегистрировать</button>';

  buildBrowserWithContent("gosuslugi.ru / Регистрация НКО", formHtml);
}

window.submitEGRUL = function() {
  const nameInput = document.getElementById("org-name");
  const okved = document.getElementById("okved-select");
  if (!nameInput || !okved) return;

  let orgName = nameInput.value.trim();
  const defaultName = 'Фонд защиты городской природы "Среда"';

  let customName = false;
  if (!orgName) {
    orgName = defaultName;
    nameInput.value = orgName;
  } else if (orgName !== defaultName) {
    customName = true;
  }

  const okvedVal = okved.value;
  if (okvedVal === "64.99") {
    G.kompro = clamp(G.kompro + 10, 0, 100);
  } else if (okvedVal === "38.32") {
    G.battery_audit = clamp(G.battery_audit - 20, 0, 200);
    G.meria = clamp(G.meria - 15, 0, 100);
  }
  updateHUD();

  const content = document.getElementById("browser-content");
  if (content) {
    content.innerHTML =
      '<div class="browser-loading">' +
        '<div class="browser-spinner"></div>' +
        '<div>Регистрация... Пожалуйста, подождите.</div>' +
      '</div>';
  }

  setTimeout(() => {
    if (content) {
      content.innerHTML =
        '<div class="browser-success">' +
          '<div class="browser-success-icon">[OK]</div>' +
          '<div style="font-size:22px;font-weight:bold;">Регистрация успешно завершена.</div>' +
          '<div style="font-size:17px;color:#555;">Дата: 30 сентября 2019 г.</div>' +
          '<div style="font-size:17px;margin-top:8px;">Организация: ' + orgName + '</div>' +
          '<div style="font-size:17px;">ОКВЭД: ' + okvedVal + '</div>' +
        '</div>';
    }

    G.date = "Март 2020";
    G.cycle = 1;
    updateHUD();

    setTimeout(() => {
      showToast("Цикл 1 начался. Первые деньги.");
      setTimeout(() => {
        startEvent101();
      }, 1500);
    }, 1200);
  }, 1800);
};

// =============================================
// CYCLE 1: ПЕРВЫЕ ДЕНЬГИ
// =============================================
function startEvent101() {
  const body101 =
    'Уважаемый Кирилл Алексеевич!\n\n' +
    'Уведомляем вас о поступлении денежных средств на расчетный счет Фонда защиты городской природы "Среда" ' +
    '(ИНН 7736324409) в размере 14 200 000,00 (четырнадцать миллионов двести тысяч) рублей.\n\n' +
    'Плательщик: АНО "Мой район" ИНН 7704443900.\n' +
    'Назначение платежа: Выполнение просветительских программ в сфере экологической безопасности г. Москвы, ' +
    'дог. N 23/МР-ЭКО.\n\n' +
    'Просим в течение 90 дней предоставить отчетность об использовании средств.';

  G.meria_total += 14200000;

  const actionsHtml =
    '<button class="mail-action-btn" onclick="openScheme()">Открыть схему распределения</button>';

  addMail(
    'АНО "Мой район" noreply@moyrayon.mos.ru',
    "Поступление средств по договору N 23/МР-ЭКО",
    body101,
    actionsHtml,
    true
  );

  setBadge("mail", 1);
  showToast("Новое письмо: поступление средств.");
}

function startEvent102() {
  const body102 =
    'Уважаемый Кирилл Алексеевич!\n\n' +
    'В рамках плановой проверки некоммерческих организаций, декларирующих природоохранную деятельность, ' +
    'просим предоставить:\n\n' +
    '1. Акты утилизации элементов питания за 2020 г.\n' +
    '2. Договоры с лицензированными организациями по переработке.\n' +
    '3. Фотоотчет о размещении приемных пунктов.\n\n' +
    'Срок: 10 рабочих дней с даты получения.\n' +
    'Инспектор: Носков А.П.';

  const actionsHtml =
    '<button class="mail-action-btn" id="btn-lawyer" onclick="respond102(\'lawyer\')">А: Нанять юриста (350 000 р.)</button>' +
    '<button class="mail-action-btn" id="btn-krapukhin" onclick="respond102(\'krapukhin\')">Б: Попросить Крапухина</button>' +
    '<button class="mail-action-btn" id="btn-ignore" onclick="respond102(\'ignore\')">В: Игнорировать</button>';

  addMail(
    "Росприроднадзор, Управление по г. Москве",
    "Плановая проверка НКО-экологов",
    body102,
    actionsHtml,
    true
  );

  showToast("Новое письмо: Росприроднадзор. Требуется реакция.");
}

window.respond102 = function(choice) {
  disableMail102Btns();

  if (choice === "lawyer") {
    G.cash = Math.max(0, G.cash - 350000);
    G.battery_audit = clamp(G.battery_audit - 15, 0, 200);
    G.siloviki = clamp(G.siloviki - 10, 0, 100);
    showToast("Юрист составил официальный ответ. Срок перенесен на 45 дней.");
  } else if (choice === "krapukhin") {
    G.battery_audit = clamp(G.battery_audit - 10, 0, 200);
    G.kompro = clamp(G.kompro + 20, 0, 100);
    G.krapukhin_trust = clamp(G.krapukhin_trust + 10, 0, 100);
    showToast("Крапухин нашел базу данных пунктов приема в Калуге. Отчет составлен.");
  } else if (choice === "ignore") {
    G.battery_audit = clamp(G.battery_audit + 30, 0, 200);
    G.siloviki = clamp(G.siloviki + 15, 0, 100);
    G.cash = Math.max(0, G.cash - 180000);
    showToast("ФНС выставила штраф за игнорирование запроса: 180 000 р.");
  }
  updateHUD();

  setTimeout(() => {
    startEvent103();
  }, 2200);
};

function disableMail102Btns() {
  const mailItem = mailbox.find(m => m.subject === "Плановая проверка НКО-экологов");
  if (mailItem) {
    mailItem.actions = '<div style="font-size:16px;color:#666;padding:8px 0;">Ответ направлен. Решение принято.</div>';
  }
  ["btn-lawyer", "btn-krapukhin", "btn-ignore"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("disabled");
    }
  });
}

// EVENT 1-03: ФНС и Апра
function startEvent103() {
  addTgMessage("krapukhin", "in",
    "Кирилл, привет. Слушай, ФНС заблокировала один счет «Апры». Не насовсем — требование прислали, надо ответить до пятницы. Подпиши мне доверенность на право ответа от лица фонда. Так быстрее все уладим.",
    null,
    () => {
      setTgChoices("krapukhin", [
        { label: "А: Подписать доверенность", fn: "p103_poa" },
        { label: "Б: Отказать, решить через партийного юриста", fn: "p103_lawyer" },
        { label: "В: Спросить подробности", fn: "p103_details" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram от: Крапухин А.");
}

window.p103_poa = function() {
  G.flags.apra_poa = true;
  G.krapukhin_trust = clamp(G.krapukhin_trust + 15, 0, 100);
  G.kompro = clamp(G.kompro + 15, 0, 100);
  G.siloviki = clamp(G.siloviki + 5, 0, 100);
  updateHUD();
  addTgMessage("krapukhin", "out", "Подписал доверенность. Действуй аккуратно.", null, () => {
    setTimeout(() => {
      addTgMessage("krapukhin", "in", "Договорились. Все сделаю в лучшем виде, не переживай.", null, () => {
        setTimeout(startEvent104, 2000);
      });
    }, 400);
  });
};

window.p103_lawyer = function() {
  G.party_money = Math.max(0, G.party_money - 100000);
  G.krapukhin_trust = clamp(G.krapukhin_trust - 10, 0, 100);
  G.siloviki = clamp(G.siloviki - 10, 0, 100);
  updateHUD();
  addTgMessage("krapukhin", "out", "Никаких доверенностей. Юрист фонда сам подготовит ответ.", null, () => {
    setTimeout(() => {
      addTgMessage("krapukhin", "in", "Ну и ладно. Просто дольше будет.", null, () => {
        setTimeout(startEvent104, 2000);
      });
    }, 400);
  });
};

window.p103_details = function() {
  G.kompro = clamp(G.kompro - 5, 0, 100);
  updateHUD();
  addTgMessage("krapukhin", "out", "Пришли скан требования. Я сам посмотрю назначение.", null, () => {
    setTimeout(() => {
      addTgMessage("krapukhin", "in", "Там счет ИП Зотова приплели случайно... Ладно, я сам все перепроверю.", null, () => {
        setTimeout(startEvent104, 2000);
      });
    }, 400);
  });
};

// EVENT 1-04: Публикации
function startEvent104() {
  addTgMessage("kurator", "in",
    "Кирилл, добрый день. Второй транш — еще 10 миллионов — запланирован на декабрь. Нужно одно условие: пара публикаций о батарейках в прессе. Список изданий прислать или сами выберете?",
    null,
    () => {
      setTgChoices("kurator", [
        { label: "А: Взять список изданий мэрии (80 000 р.)", fn: "p104_meria" },
        { label: "Б: Дать интервью независимым СМИ", fn: "p104_indie" },
        { label: "В: Опубликовать в своем Telegram-канале", fn: "p104_telegram" },
        { label: "Г: Отказаться публиковать", fn: "p104_refuse" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram: Куратор");
}

window.p104_meria = function() {
  G.cash = Math.max(0, G.cash - 80000);
  G.meria = clamp(G.meria + 15, 0, 100);
  G.fler = clamp(G.fler - 10, 0, 100);
  G.battery_audit = clamp(G.battery_audit - 5, 0, 200);
  updateHUD();
  addTgMessage("kurator", "out", "Присылайте список мэрии. Разместим в Вечерней Москве.", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in", "Отлично. Материал выйдет завтра. Второй транш подтвержден.", null, () => {
        setTimeout(startEvent105, 2000);
      });
    }, 400);
  });
};

window.p104_indie = function() {
  G.meria = clamp(G.meria - 10, 0, 100);
  G.fler = clamp(G.fler + 15, 0, 100);
  G.battery_audit = clamp(G.battery_audit - 5, 0, 200);
  updateHUD();
  addTgMessage("kurator", "out", "Дадим интервью Новой газете и Либеральной Москве.", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in", "Смело. Мэрия не в восторге от площадки, но охват есть.", null, () => {
        setTimeout(startEvent105, 2000);
      });
    }, 400);
  });
};

window.p104_telegram = function() {
  G.fler = clamp(G.fler + 5, 0, 100);
  G.meria = clamp(G.meria + 5, 0, 100);
  updateHUD();
  addTgMessage("kurator", "out", "Опубликую подробный разбор в своем личном канале.", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in", "Telegram — не совсем пресса, но как частичное выполнение зачтем.", null, () => {
        setTimeout(startEvent105, 2000);
      });
    }, 400);
  });
};

window.p104_refuse = function() {
  G.meria = clamp(G.meria - 20, 0, 100);
  G.flags.second_tranche_delayed = true;
  updateHUD();
  addTgMessage("kurator", "out", "Мы не занимаемся пиаром за бюджетный счет.", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in", "Зря. Второй транш в декабре тогда не ждите.", null, () => {
        setTimeout(startEvent105, 2000);
      });
    }, 400);
  });
};

// EVENT 1-05: Сергей Прокопьев
function startEvent105() {
  addTgMessage("sergey", "in",
    "Кирилл, привет! Слышал, у тебя фонд экологический. У нас в Гагаринском люди давно хотят урну для батареек поставить у метро «Академическая». Поможешь с согласованием? Дирекция парка отказывает, говорят — надо через НКО.",
    null,
    () => {
      setTgChoices("sergey", [
        { label: "А: Помочь активисту (50 000 р. партии)", fn: "p105_help" },
        { label: "Б: Пообещать и забыть", fn: "p105_forget" },
        { label: "В: Перенаправить к муниципалу от ЕР", fn: "p105_er" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram от: С. Прокопьев");
}

window.p105_help = function() {
  G.party_money = Math.max(0, G.party_money - 50000);
  G.fler = clamp(G.fler + 5, 0, 100);
  G.battery_audit = clamp(G.battery_audit - 5, 0, 200);
  G.flags.sergey_loyal = true;
  updateHUD();
  addTgMessage("sergey", "out", "Конечно помогу. Оформим через фонд, поставим на следующей неделе.", null, () => {
    setTimeout(() => {
      addTgMessage("sergey", "in", "Кирилл, спасибо огромное! Настоящее дело. Жители оценят.", null, () => {
        setTimeout(startEvent106, 2000);
      });
    }, 400);
  });
};

window.p105_forget = function() {
  G.flags.sergey_hostile = true;
  G.rage = clamp(G.rage + 15, 0, 100);
  updateHUD();
  addTgMessage("sergey", "out", "Да, я посмотрю что можно сделать, напишу на днях.", null, () => {
    setTimeout(() => {
      addTgMessage("sergey", "in", "Понятно... Надеюсь, не как в прошлый раз.", null, () => {
        setTimeout(startEvent106, 2000);
      });
    }, 400);
  });
};

window.p105_er = function() {
  G.flags.sergey_neutral = true;
  G.fler = clamp(G.fler - 5, 0, 100);
  updateHUD();
  addTgMessage("sergey", "out", "Слушай, обратись к совету депутатов от Единой России, у них полномочия.", null, () => {
    setTimeout(() => {
      addTgMessage("sergey", "in", "К единороссам? Ты серьезно?", null, () => {
        setTimeout(startEvent106, 2000);
      });
    }, 400);
  });
};

// EVENT 1-06: Второй транш -> Переход в Цикл 2
function startEvent106() {
  G.cash += 2000000;
  G.party_money += 1000000;
  G.meria_total += 10000000;
  updateHUD();

  const body106 =
    'Уважаемый Кирилл Алексеевич!\n\n' +
    'Уведомляем о перечислении денежных средств по второму этапу договора N 23/МР-ЭКО ' +
    'в размере 10 000 000,00 (десять миллионов) рублей.\n\n' +
    'Назначение: Финансирование экологических программ в ЮЗАО и ЗАО г. Москвы.\n' +
    'Средства зачислены на счета фонда «Среда».\n\n' +
    'Впереди избирательная кампания по выборам в Государственную думу (Округ 197).';

  const actionsHtml =
    '<button class="mail-action-btn" onclick="startCycle2()">Принять транш и перейти к выборам 2021</button>';

  addMail(
    'АНО "Мой район" noreply@moyrayon.mos.ru',
    "Второй этап финансирования договора N 23/МР-ЭКО",
    body106,
    actionsHtml,
    true
  );

  showToast("Второй транш поступил: +10 000 000 р.");
}

// =============================================
// CYCLE 2: ОКРУГ 197 (2021)
// =============================================
function startCycle2() {
  closeWindow("mail");
  G.cycle = 2;
  G.date = "Июнь 2021";
  updateHUD();
  showToast("Цикл 2 начался: Выборы в Госдуму. Округ 197.", 5000);

  setTimeout(() => {
    startEvent201();
  }, 2200);
}

function startEvent201() {
  addTgMessage("kurator", "in",
    "Добрый день. Нас беспокоит ситуация в 197-м округе. Лобанов консолидирует протестную аудиторию вокруг МГУ. «Яблоко» может сыграть важную роль. Звоните, есть предложение.",
    null,
    () => {
      setTgChoices("kurator", [
        { label: "А: Позвонить куратору", fn: "p201_call" },
        { label: "Б: Не отвечать на звонок", fn: "p201_ignore" },
        { label: "В: Спросить «Кто это?»", fn: "p201_who" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram: Куратор");
}

window.p201_call = function() {
  addTgMessage("kurator", "out", "Слушаю вас. В чем заключается предложение?", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in",
        "Мы готовы профинансировать вашу кампанию. Задача — оттянуть у Лобанова 10%. Он сейчас на 46%, нужно сбить до 38%. ДЭГ сделает остальное.",
        null,
        () => {
          setTimeout(startEvent202, 1200);
        }
      );
    }, 400);
  });
};

window.p201_ignore = function() {
  addTgMessage("kurator", "out", "...", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in",
        "Смотрите закрытую социологию: Лобанов 46%, Попов 38%. Если не вмешается Яблоко — власть проиграет округ. Мы ждем вашего решения.",
        null,
        () => {
          setTimeout(startEvent202, 1200);
        }
      );
    }, 400);
  });
};

window.p201_who = function() {
  G.kompro = clamp(G.kompro + 5, 0, 100);
  updateHUD();
  addTgMessage("kurator", "out", "С кем я говорю?", null, () => {
    setTimeout(() => {
      addTgMessage("kurator", "in", "Это не имеет значения. Важно то, что нам с вами по пути.", null, () => {
        setTimeout(startEvent202, 1200);
      });
    }, 400);
  });
};

function startEvent202() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:#00126b;">Стратегия кампании в Госдуму — Округ 197</div>' +
      '<div style="font-size:15px;line-height:1.4;margin-bottom:16px;">' +
        'Противники: Евгений Попов (Единая Россия / Мэрия) и Михаил Лобанов (КПРФ / Умное Голосование).<br>' +
        'Выберите стратегию ведения кампании:' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<button class="btn-primary" style="padding:10px;text-align:left;" onclick="chooseCampaignDirection(\'A\')">' +
          '<strong>Направление A: Принять теневую поддержку мэрии</strong><br>' +
          '<span style="font-size:13px;color:#555;">+3 500 000 р. на кампанию. Задача: мочить Лобанова и обеспечить победу Попова через ДЭГ.</span>' +
        '</button>' +
        '<button class="btn-primary" style="padding:10px;text-align:left;" onclick="chooseCampaignDirection(\'B\')">' +
          '<strong>Направление B: Вести честную кампанию</strong><br>' +
          '<span style="font-size:13px;color:#555;">Кампания только на свои средства. Честная борьба за демократический электорат.</span>' +
        '</button>' +
        '<button class="btn-primary" style="padding:10px;text-align:left;background:#b71c1c;color:#fff;" onclick="chooseCampaignDirection(\'C\')">' +
          '<strong>Направление C: Снять кандидатуру в пользу Лобанова</strong><br>' +
          '<span style="font-size:13px;color:#ffe;">Скандал с мэрией. Лобанов гарантированно побеждает.</span>' +
        '</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("vybory2021.cikrf.ru / Округ 197", content);
}

window.chooseCampaignDirection = function(dir) {
  closeWindow("browser");

  if (dir === "A") {
    G.cash += 3500000;
    G.flags.deg_manipulation = true;
    G.flags.lobanov_attack_agreed = true;
    showToast("Принята поддержка мэрии: +3 500 000 р. на штаб.");
    updateHUD();
    setTimeout(startManevr, 1500);
  } else if (dir === "B") {
    G.flags.honest_candidate = true;
    G.yabloko = clamp(G.yabloko + 20, 0, 100);
    G.fler = clamp(G.fler + 15, 0, 100);
    G.meria = clamp(G.meria - 20, 0, 100);
    showToast("Выбрана независимая кампания.");
    updateHUD();
    setTimeout(startManevr, 1500);
  } else if (dir === "C") {
    G.lobanov_threat = 0;
    G.flags.honest_candidate = true;
    G.yabloko = clamp(G.yabloko + 30, 0, 100);
    G.fler = clamp(G.fler + 30, 0, 100);
    G.meria = clamp(G.meria - 50, 0, 100);
    updateHUD();
    showToast("Кандидатура снята! Михаил Лобанов празднует победу.", 6000);
    setTimeout(() => {
      resolveEnding("E");
    }, 3000);
  }
};

// EVENT 2-03: Лобанов
function startEvent203() {
  addTgMessage("lobanov", "in",
    "Кирилл, привет. Я знаю, что ты ведешь активную кампанию в Кунцево. У нас общие избиратели. Давай не мочить друг друга публично — пусть москвичи сами выберут оппозиционного кандидата.",
    null,
    () => {
      setTgChoices("lobanov", [
        { label: "А: Пообещать честную борьбу", fn: "p203_promise" },
        { label: "Б: Отказать в соглашении", fn: "p203_refuse" },
        { label: "В: Слить разговор куратору", fn: "p203_betray" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram от: Михаил Лобанов");
}

window.p203_promise = function() {
  G.fler = clamp(G.fler + 15, 0, 100);
  updateHUD();
  addTgMessage("lobanov", "out", "Договорились, Михаил. Никаких грязных атак.", null, () => {
    setTimeout(() => {
      addTgMessage("lobanov", "in", "Спасибо за честность, Кирилл. Увидимся на дебатах.", null, () => {
        setTimeout(startEvent204, 2000);
      });
    }, 400);
  });
};

window.p203_refuse = function() {
  G.meria = clamp(G.meria + 5, 0, 100);
  G.fler = clamp(G.fler - 5, 0, 100);
  updateHUD();
  addTgMessage("lobanov", "out", "Каждый борется сам за себя. Мы оппоненты.", null, () => {
    setTimeout(() => {
      addTgMessage("lobanov", "in", "Понятно. Жаль.", null, () => {
        setTimeout(startEvent204, 2000);
      });
    }, 400);
  });
};

window.p203_betray = function() {
  G.flags.lobanov_betrayed = true;
  G.kompro = clamp(G.kompro + 15, 0, 100);
  G.meria = clamp(G.meria + 15, 0, 100);
  updateHUD();
  addTgMessage("lobanov", "out", "Посмотрим.", null, () => {
    addTgMessage("kurator", "in", "Спасибо за информацию по Лобанову. Зачтем.", null, () => {
      setTimeout(startEvent204, 2000);
    });
  });
};

// EVENT 2-04: НТВ (Эфир 1)
function startEvent204() {
  addTgMessage("ntv_prod", "in",
    "Кирилл, привет! Андрей Норкин зовет тебя в прямой эфир «Место встречи» на НТВ. Тема — выборы и оппозиция. Гонорар 150 000 р. наличными сразу после съемки. Идешь?",
    null,
    () => {
      setTgChoices("ntv_prod", [
        { label: "А: Согласиться пойти в студию", fn: "p204_accept" },
        { label: "Б: Отказаться от эфира", fn: "p204_decline" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram: Продюсер НТВ");
}

window.p204_accept = function() {
  addTgMessage("ntv_prod", "out", "Буду в Останкино к 14:00.", null, () => {
    setTimeout(() => {
      startNorkinMinigame("election");
    }, 1200);
  });
};

window.p204_decline = function() {
  G.fler = clamp(G.fler + 10, 0, 100);
  G.meria = clamp(G.meria - 5, 0, 100);
  updateHUD();
  addTgMessage("ntv_prod", "out", "В этот раз воздержусь, плотный график встреч.", null, () => {
    setTimeout(startEvent205, 2000);
  });
};

// EVENT 2-05: Ночь подсчета
function startEvent205() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:#b71c1c;">ЦИК РФ: Подсчет голосов — Округ 197 (02:17 ночи)</div>' +
      '<div style="font-size:15px;line-height:1.5;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #ccc;">' +
        '22:30 — Михаил Лобанов лидирует на бумажных участках (+11 400 голосов).<br>' +
        '00:15 — Задержка публикации протоколов электронного голосования (ДЭГ).<br>' +
        '02:17 — Ввод данных ДЭГ: Евгений Попов (+22 000 голосов по ДЭГ) выходит вперед!<br>' +
      '</div>' +
      '<div style="font-size:16px;font-weight:bold;margin-bottom:8px;">Ваша позиция по итогам ДЭГ:</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '<button class="btn-primary" onclick="respond205(\'statement\')">А: Публично заявить о фальсификациях ДЭГ и поддержать протест</button>' +
        '<button class="btn-primary" onclick="respond205(\'silent\')">Б: Промолчать и признать поражение округа</button>' +
        '<button class="btn-primary" onclick="respond205(\'both\')">В: Осторожный пресс-релиз «с обеих сторон»</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("cikrf.ru / Выборы 2021 — Ночь подсчета", content);
}

window.respond205 = function(choice) {
  closeWindow("browser");

  if (choice === "statement") {
    G.fler = clamp(G.fler + 25, 0, 100);
    G.siloviki = clamp(G.siloviki + 20, 0, 100);
    G.yabloko = clamp(G.yabloko + 15, 0, 100);
    G.meria = clamp(G.meria - 30, 0, 100);
    G.flags.deg_statement = true;
    showToast("Заявление о фальсификациях ДЭГ разошлось по всем СМИ!");
  } else if (choice === "silent") {
    G.fler = clamp(G.fler - 10, 0, 100);
    G.meria = clamp(G.meria + 10, 0, 100);
    showToast("Тишина в штабе. Попов объявлен победителем.");
  } else if (choice === "both") {
    G.kompro = clamp(G.kompro + 10, 0, 100);
    showToast("Осторожный релиз никого не устроил.");
  }

  updateHUD();
  setTimeout(startEvent206, 2200);
};

// EVENT 2-06: Утро после выборов
function startEvent206() {
  const body206 =
    'Официальные итоги выборов в Госдуму по округу 197 (Кунцево):\n\n' +
    '1. Попов Евгений Георгиевич (ЕР) — 38,4% (ПОБЕДИТЕЛЬ)\n' +
    '2. Лобанов Михаил Сергеевич (КПРФ) — 34,2%\n' +
    '3. Гончаров Кирилл Алексеевич (Яблоко) — 11,8%\n\n' +
    'Куратор: «Кирилл, задача выполнена. С тебя причитается. Двигаемся дальше.»';

  const actionsHtml =
    '<button class="mail-action-btn" onclick="startCycle3()">Перейти к Циклу 3 (2022-2024)</button>';

  addMail(
    "Штаб избирательной кампании",
    "Протокол голосования по округу 197 утвержден",
    body206,
    actionsHtml,
    true
  );

  showToast("Выборы в Госдуму 2021 завершены.");
}

// =============================================
// CYCLE 3: ТЕЛЕВИЗОР И ЗАЧИСТКИ (2022-2024)
// =============================================
function startCycle3() {
  closeWindow("mail");
  G.cycle = 3;
  G.date = "Март 2023";
  updateHUD();
  showToast("Цикл 3 начался: Чистки в партии и эфиры.", 5000);

  setTimeout(() => {
    startEvent301();
  }, 2200);
}

function startEvent301() {
  addTgMessage("grigoriy_a", "in",
    "Кирилл. В московском отделении сложная ситуация. Слишком много людей с «умным голосованием» в анамнезе. Нам нужен контролируемый состав к следующему съезду. Ты зампред — проведи чистку актива через комиссию по этике.",
    null,
    () => {
      setTgChoices("grigoriy_a", [
        { label: "Открыть досье членов РО", fn: "p301_dossier" }
      ]);
    }
  );
  showToast("Новое поручение в Telegram: Григорий Ал.");
}

window.p301_dossier = function() {
  addTgMessage("grigoriy_a", "out", "Открываю материалы комиссии.", null, () => {
    setTimeout(startDossierMinigame, 800);
  });
};

function startEvent302() {
  addTgMessage("ntv_prod", "in",
    "Кирилл, привет! Срочно нужен спикер от оппозиции в студию. Тема — специальная военная операция и позиция партий. Гонорар 200 000 р. Готов зайти в эфир?",
    null,
    () => {
      setTgChoices("ntv_prod", [
        { label: "А: Идти в эфир у Норкина", fn: "p302_accept" },
        { label: "Б: Отказаться сославшись на занятость", fn: "p302_decline" }
      ]);
    }
  );
  showToast("Новое сообщение в Telegram: Продюсер НТВ");
}

window.p302_accept = function() {
  addTgMessage("ntv_prod", "out", "Выезжаю в Останкино.", null, () => {
    setTimeout(() => {
      startNorkinMinigame("ukraine");
    }, 1200);
  });
};

window.p302_decline = function() {
  G.fler = clamp(G.fler + 10, 0, 100);
  G.meria = clamp(G.meria - 5, 0, 100);
  updateHUD();
  addTgMessage("ntv_prod", "out", "По семейным обстоятельствам сегодня не смогу.", null, () => {
    setTimeout(startEvent303, 2000);
  });
};

// EVENT 3-03: Утечка The Insider
function startEvent303() {
  addTgMessage("the_insider", "in",
    "Кирилл Алексеевич, добрый день. Мы журналисты-расследователи. У нас на руках платежки фонда «Среда» от АНО «Мой район» на 24 миллиона рублей через ИП Крапухин. Комментарий с вашей стороны? 48 часов до публикации.",
    null,
    () => {
      setTgChoices("the_insider", [
        { label: "А: Не отвечать на запрос", fn: "p303_ignore" },
        { label: "Б: Нанять юриста для смягчения (500 000 р.)", fn: "p303_lawyer" },
        { label: "В: Попытаться лично договориться", fn: "p303_negotiate" }
      ]);
    }
  );
  showToast("ВНИМАНИЕ: Запрос комментария от The Insider!");
}

window.p303_ignore = function() {
  G.flags.apra_exposed = true;
  G.fler = clamp(G.fler - 25, 0, 100);
  G.siloviki = clamp(G.siloviki + 20, 0, 100);
  updateHUD();
  addTgMessage("the_insider", "out", "Без комментариев.", null, () => {
    showToast("Расследование вышло в лоб: скандал в соцсетях!");
    setTimeout(startEvent304, 2500);
  });
};

window.p303_lawyer = function() {
  G.cash = Math.max(0, G.cash - 500000);
  G.flags.apra_soft_exposure = true;
  G.fler = clamp(G.fler - 10, 0, 100);
  G.siloviki = clamp(G.siloviki + 10, 0, 100);
  updateHUD();
  addTgMessage("the_insider", "out", "Официальный юридический ответ направлен на редакционную почту.", null, () => {
    showToast("Материал опубликован в смягченной редакции.");
    setTimeout(startEvent304, 2500);
  });
};

window.p303_negotiate = function() {
  G.kompro = clamp(G.kompro + 20, 0, 100);
  updateHUD();
  addTgMessage("the_insider", "out", "Давайте созвонимся не под запись, я все объясню.", null, () => {
    showToast("Журналисты записали попытку переговоров: компромат вырос.");
    setTimeout(startEvent304, 2500);
  });
};

// EVENT 3-04: МГД-2024
function startEvent304() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:#00126b;">Выборы в Мосгордуму 2024 — Утверждение списков Яблока</div>' +
      '<div style="font-size:15px;line-height:1.4;margin-bottom:16px;">' +
        'Как зампред регионального отделения, вы определяете стратегию выдвижения кандидатов по 45 округам Москвы:' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<button class="btn-primary" style="padding:10px;text-align:left;" onclick="chooseMGDList(\'strong\')">' +
          '<strong>Опция A: Сильный список независимых активистов</strong><br>' +
          '<span style="font-size:13px;color:#555;">Реальные борцы и правозащитники. Конфликт с мэрией. Высокий риск снятия через суд.</span>' +
        '</button>' +
        '<button class="btn-primary" style="padding:10px;text-align:left;" onclick="chooseMGDList(\'controlled\')">' +
          '<strong>Опция B: Контролируемый список статистов</strong><br>' +
          '<span style="font-size:13px;color:#555;">Тихие лояльные партийцы. Мэрия гарантирует неприкосновенность и спокойные выборы.</span>' +
        '</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("mosyabloko.ru / Бюро: Списки МГД-2024", content);
}

window.chooseMGDList = function(opt) {
  closeWindow("browser");

  if (opt === "strong") {
    G.flags.mgd_strong_list = true;
    G.fler = clamp(G.fler + 20, 0, 100);
    G.yabloko = clamp(G.yabloko + 15, 0, 100);
    G.meria = clamp(G.meria - 30, 0, 100);
    showToast("Утвержден сильный список кандидатов!");
    updateHUD();
    setTimeout(startEvent305, 2200);
  } else {
    G.meria = clamp(G.meria + 20, 0, 100);
    G.yabloko = clamp(G.yabloko - 10, 0, 100);
    G.fler = clamp(G.fler - 15, 0, 100);
    showToast("Утвержден контролируемый список статистов.");
    updateHUD();
    setTimeout(startEvent306, 2200);
  }
};

// EVENT 3-05: Суд Мосгорсуда
function startEvent305() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:#b71c1c;">Мосгорсуд: Снятие 12 кандидатов «Яблока»</div>' +
      '<div style="font-size:15px;line-height:1.4;margin-bottom:16px;">' +
        'Суд забраковал подписи и признал нарушения в документах всех ключевых кандидатов.<br>' +
        'Ваша реакция:' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '<button class="btn-primary" onclick="respond305(\'protest\')">А: Вывести людей на улицу и объявить бойкот</button>' +
        '<button class="btn-primary" onclick="respond305(\'lawsuit\')">Б: Подать апелляции без уличных акций</button>' +
        '<button class="btn-primary" onclick="respond305(\'echr\')">В: Подать иск в ЕСПЧ и объявить власть нелегитимной</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("mos-gorsud.ru / Решения по избирательным спорам", content);
}

window.respond305 = function(choice) {
  closeWindow("browser");

  if (choice === "protest") {
    G.fler = clamp(G.fler + 20, 0, 100);
    G.siloviki = clamp(G.siloviki + 20, 0, 100);
    G.meria = clamp(G.meria - 40, 0, 100);
    showToast("Протесты у здания суда: силовики берут штаб под наблюдение.");
  } else if (choice === "lawsuit") {
    G.meria = clamp(G.meria + 5, 0, 100);
    G.fler = clamp(G.fler - 5, 0, 100);
    showToast("Апелляции отклонены в рабочем порядке.");
  } else if (choice === "echr") {
    G.fler = clamp(G.fler + 25, 0, 100);
    G.siloviki = clamp(G.siloviki + 15, 0, 100);
    G.meria = clamp(G.meria - 50, 0, 100);
    showToast("Жалоба направлена в ЕСПЧ. Контакты с мэрией заморожены.");
  }

  updateHUD();
  setTimeout(startEvent306, 2200);
};

// EVENT 3-06: Файл «прочти.txt»
function startEvent306() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:18px;font-weight:bold;margin-bottom:8px;color:#000;">Файл с рабочего стола: «прочти.txt»</div>' +
      '<div style="font-size:15px;line-height:1.5;background:#ffffd8;padding:12px;border:1px solid #999;margin-bottom:16px;">' +
        '«Кирилл Алексеевич.<br>' +
        'Это дружеское предупреждение, а не угроза.<br>' +
        'Вы понимаете, что у нас есть все документы по фонду «Среда» и ИП Крапухину.<br>' +
        'Сбавьте медийную активность. Это в общих интересах.<br>' +
        'Удалите этот файл.»' +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn-primary" onclick="respond306(\'delete\')">Удалить файл</button>' +
        '<button class="btn-primary" onclick="respond306(\'screenshot\')">Сделать скрытый скриншот</button>' +
        '<button class="btn-primary" onclick="respond306(\'publish\')">Опубликовать в Telegram</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("C:/Desktop/прочти.txt", content);
}

window.respond306 = function(choice) {
  closeWindow("browser");

  if (choice === "delete") {
    G.siloviki = clamp(G.siloviki - 15, 0, 100);
    G.kompro = clamp(G.kompro + 10, 0, 100);
    showToast("Файл удален в корзину.");
  } else if (choice === "screenshot") {
    G.flags.warning_screenshot = true;
    G.siloviki = clamp(G.siloviki - 5, 0, 100);
    G.kompro = clamp(G.kompro + 5, 0, 100);
    showToast("Скриншот сохранен в защищенный архив.");
  } else if (choice === "publish") {
    G.fler = clamp(G.fler + 30, 0, 100);
    G.siloviki = clamp(G.siloviki + 35, 0, 100);
    G.meria = clamp(G.meria - 40, 0, 100);
    showToast("Публикация взорвала Telegram: угрозы от силовиков!");
  }

  updateHUD();
  setTimeout(startEvent308, 2200);
};

// EVENT 3-08: Салон Mercedes
function startEvent308() {
  const canBuy = G.cash >= 4800000;
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:#00126b;">Автосалон «Авилон» — Каталог Mercedes-Benz</div>' +
      '<div style="font-size:15px;line-height:1.4;margin-bottom:12px;">' +
        'Модель: <strong>Mercedes-Benz GLE 400d Coupe</strong> (Цвет: Черный обсидиан).<br>' +
        'Стоимость: <strong>4 800 000 р.</strong><br>' +
        'Ваша личная касса: ' + fmtMoney(G.cash) +
      '</div>' +
      '<div style="display:flex;gap:10px;">' +
        (canBuy ? '<button class="btn-primary" style="background:#2a9d8f;color:#fff;" onclick="buyMercedes()">Оформить покупку за 4 800 000 р.</button>' : '<button class="btn-primary" disabled>Недостаточно средств (нужно 4.8 млн р.)</button>') +
        '<button class="btn-primary" onclick="startCycle4()">Перейти к Циклу 4 (2025) →</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("avilon.ru / Mercedes-Benz GLE", content);
}

window.buyMercedes = function() {
  G.cash -= 4800000;
  G.flags.mercedes_bought = true;
  updateHUD();
  showToast("Mercedes-Benz GLE оформлен! Ключи в кармане, паркинг на Панферова готов.");
  setTimeout(startCycle4, 2000);
};

// =============================================
// CYCLE 4: АРЕСТ КРУГЛОВА (2025)
// =============================================
function startCycle4() {
  closeWindow("browser");
  G.cycle = 4;
  G.date = "Ноябрь 2025";
  updateHUD();
  showToast("Цикл 4 начался: Арест Круглова. Борьба за кресло председателя.", 5000);

  setTimeout(() => {
    startEvent401();
  }, 2200);
}

function startEvent401() {
  addTgMessage("grigoriy_a", "in",
    "Кирилл. Максима Круглова забрали. Статья 207.3 УК РФ. Это политика. Нужно действовать быстро — конференция должна пройти до того, как медиа раскачаются. Созывай бюро.",
    null,
    () => {
      setTgChoices("grigoriy_a", [
        { label: "Подготовить заявление бюро", fn: "startEvent402" }
      ]);
    }
  );
  showToast("МОЛНИЯ: Максим Круглов задержан ФСБ!");
}

function startEvent402() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:#b71c1c;">Заявление Московского «Яблока» по аресту Максима Круглова</div>' +
      '<div style="font-size:15px;line-height:1.4;margin-bottom:16px;">' +
        'Руководитель фракции отправлен в СИЗО «Лефортово».<br>' +
        'Какую позицию займет региональное отделение?' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '<button class="btn-primary" onclick="respond402(\'support\')">А: Жесткое заявление в поддержку Круглова и требование освободить</button>' +
        '<button class="btn-primary" onclick="respond402(\'release\')">Б: Осторожный партийный пресс-релиз «следим за ситуацией»</button>' +
        '<button class="btn-primary" onclick="respond402(\'silent\')">В: Молчать первые 24 часа по совету Григория</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("mosyabloko.ru / Заявление по Круглову", content);
}

window.respond402 = function(choice) {
  closeWindow("browser");

  if (choice === "support") {
    G.fler = clamp(G.fler + 20, 0, 100);
    G.yabloko = clamp(G.yabloko + 15, 0, 100);
    G.siloviki = clamp(G.siloviki + 15, 0, 100);
    G.meria = clamp(G.meria - 20, 0, 100);
    showToast("Заявление опубликовано: тысячи репостов поддержки.");
  } else if (choice === "release") {
    G.fler = clamp(G.fler - 5, 0, 100);
    G.yabloko = clamp(G.yabloko - 10, 0, 100);
    G.meria = clamp(G.meria + 5, 0, 100);
    showToast("Осторожный релиз вызвал глухое раздражение актива.");
  } else if (choice === "silent") {
    G.fler = clamp(G.fler - 15, 0, 100);
    G.yabloko = clamp(G.yabloko - 20, 0, 100);
    G.meria = clamp(G.meria + 10, 0, 100);
    showToast("Григорий: «Так и надо. Тихо.»");
  }

  updateHUD();
  setTimeout(startConferenceMinigame, 2200);
};

// EVENT 4-04: Письмо из СИЗО
function startEvent404() {
  const content =
    '<div style="padding:16px;font-family:var(--font);">' +
      '<div style="font-size:18px;font-weight:bold;margin-bottom:8px;color:#00126b;">Записка Максима Круглова из СИЗО «Лефортово»</div>' +
      '<div style="font-size:15px;line-height:1.5;background:#fffbe6;padding:12px;border:1px solid #d4b106;margin-bottom:16px;">' +
        '«Кирилл, держи отделение. Верю, что партия устоит.<br>' +
        'Не идите на сделки с теми, кто нас закрывает.<br>' +
        'Свобода дороже любых субсидий.<br>' +
        'Максим Круглов.»' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '<button class="btn-primary" onclick="respond404(\'read\')">А: Зачитать письмо делегатам конференции</button>' +
        '<button class="btn-primary" onclick="respond404(\'hide\')">Б: Не зачитывать, убрать в сейф</button>' +
        '<button class="btn-primary" onclick="respond404(\'publish\')">В: Опубликовать в Telegram-канале</button>' +
      '</div>' +
    '</div>';

  buildBrowserWithContent("mosyabloko.ru / Письмо Круглова", content);
}

window.respond404 = function(choice) {
  closeWindow("browser");

  if (choice === "read") {
    G.yabloko = clamp(G.yabloko + 10, 0, 100);
    G.fler = clamp(G.fler - 5, 0, 100);
    G.flags.kruglov_letter_read = true;
    G.moral_debt += 1;
    showToast("Письмо зачитано под аплодисменты зала.");
  } else if (choice === "hide") {
    G.yabloko = clamp(G.yabloko - 5, 0, 100);
    showToast("Письмо убрано в партийный сейф.");
  } else if (choice === "publish") {
    G.fler = clamp(G.fler + 10, 0, 100);
    G.yabloko = clamp(G.yabloko - 5, 0, 100);
    G.media += 15;
    showToast("Письмо опубликовано в Telegram.");
  }

  updateHUD();
  setTimeout(startEvent405, 2200);
};

// EVENT 4-05: Финальный звонок Григория
function startEvent405() {
  addTgMessage("grigoriy_a", "in",
    "Кирилл, все прошло хорошо. Ты теперь председатель. Это важно для партии. Теперь — про Госдуму. У нас есть список. Ты под номером семь. Непроходной, но для вида. Ты понимаешь, что от тебя требуется?",
    null,
    () => {
      setTgChoices("grigoriy_a", [
        { label: "А: «Понимаю, Григорий Алексеевич.»", fn: "p405_understand" },
        { label: "Б: «Нет. Больше не понимаю.»", fn: "p405_rebel" }
      ]);
    }
  );
  showToast("Финальный звонок: Григорий Ал.");
}

window.p405_understand = function() {
  addTgMessage("grigoriy_a", "out", "Понимаю, Григорий Алексеевич. Все будет сделано.", null, () => {
    setTimeout(() => {
      resolveEnding("normal");
    }, 2000);
  });
};

window.p405_rebel = function() {
  addTgMessage("grigoriy_a", "out", "Нет. Больше не понимаю.", null, () => {
    setTimeout(() => {
      resolveEnding("rebel");
    }, 2000);
  });
};

// =============================================
// ENDINGS EVALUATION & FINAL SCREEN
// =============================================
function resolveEnding(choiceType) {
  let endingId = "G";
  let title = "«ВЕЧНЫЙ ЗАМПРЕД»";
  let badge = "НЕЙТРАЛЬНЫЙ ФИНАЛ";
  let narrative = "";

  if (choiceType === "rebel" && G.fler >= 55) {
    endingId = "D";
    title = "«ЯБЛОЧНЫЙ МУЧЕНИК»";
    badge = "ОППОЗИЦИОННЫЙ ФИНАЛ";
    narrative =
      "Октябрь 2026 года. Гончаров отказался играть роль спойлера и хлопнул дверью на пресс-конференции, выложив платежки фонда «Среда» и внутренние инструкции мэрии по ДЭГ.\\n\\n" +
      "Бюро исключило его тем же вечером единогласным голосованием — даже старые соратники отвели глаза и подняли карточки «за».\\n" +
      "В Госдуму спокойно зашел согласованный единоросс. Мандата нет, партийного оклада нет, все личные счета заблокированы налоговой.\\n" +
      "Зато под постом в соцсетях — четыре тысячи лайков и репост с подписью: «Надо же, нашелся один живой». Кормить семью этим, правда, пока не получается.";
  } else if (G.siloviki >= 80 || (G.kompro >= 75 && G.flags.apra_exposed)) {
    endingId = "B";
    title = "«СУДЬБА КРУГЛОВА»";
    badge = "АРЕСТ И ЛЕФОРТОВО";
    narrative =
      "06:17 утра. Тяжелый грохот в дверь и крики «Откройте, полиция!».\\n" +
      "Группа захвата, сонные понятые из соседней квартиры и следователь ГСУ с готовым постановлением по части 4 статьи 159 УК РФ.\\n\\n" +
      "Крапухин сбросил звонок еще в полночь — его накануне видели в Шереметьево на рейсе в Ереван.\\n" +
      "В Telegram висит последнее сообщение от куратора без точки:\\n" +
      "«Кирилл, материал ушел на самый верх, переиграть не вышло. Не поминай лихом».";
  } else if (G.yabloko <= 15) {
    endingId = "C";
    title = "«ПОЛИТИЧЕСКИЙ ТРУП»";
    badge = "ИСКЛЮЧЕНИЕ ИЗ ПАРТИИ";
    narrative =
      "Январь 2026 года. Внеочередная конференция. Явлинский лично вышел к трибуне и полтора часа громил «беспринципный карьеризм и моральное разложение аппарата».\\n" +
      "Исключили без права апелляции. Магнитный пропуск заблокировали еще до конца подсчета бюллетеней, а референт в коридоре даже не позволила забрать личную кружку.\\n\\n" +
      "Мэрии ты больше не нужен: отработанный спойлер без партийной печати не стоит и рубля.\\n" +
      "Остался только Telegram-канал на тысячу накрученных ботов и редкие заказные комментарии в районных пабликах за три тысячи рублей.";
  } else if (G.flags.mercedes_bought && G.meria >= 50 && G.siloviki <= 50) {
    endingId = "A";
    title = "«ИДЕАЛЬНЫЙ СПОЙЛЕР»";
    badge = "ЛУЧШИЙ ДЛЯ ГЕРОЯ";
    narrative =
      "Декабрь 2025 года. Гончаров — полновластный председатель Московского «Яблока» и лицо предвыборного плаката.\\n" +
      "В подземном паркинге клубного дома на Панферова тихо урчит новый Mercedes GLE, аккуратно записанный на мать Крапухина.\\n\\n" +
      "Фонд «Среда» ликвидирован без единой проверки — инспектор Носков получил повышение в префектуре ЮЗАО.\\n" +
      "Лобанов уехал из страны, Круглов шлет открытки из колонии, а на Старой площади твою фамилию подчеркнули зеленым маркером с пометкой: «Вменяемый. Продолжать работу».";
  } else if (G.flags.apra_exposed && G.rage >= 60) {
    endingId = "F";
    title = "«УТЕЧКА»";
    badge = "РАССЛЕДОВАНИЕ В СМИ";
    narrative =
      "The Insider выпустил расследование на первой полосе:\\n" +
      "«Зампред Яблока получил 24 миллиона рублей от мэрии Москвы через фиктивный экологический фонд».\\n\\n" +
      "Схема с фирмами-однодневками и обналиченными чеками Крапухина разошлась по всем телеграм-каналам.\\n" +
      "Репутация смыта в унитаз: либералы клеймят «собянинским кошельком», а в комментариях ставят клоунские смайлы.\\n" +
      "Зато деньги на счетах целы. Из партии показательно сняли с выборов, но из кабинета не выгнали — в конце концов, аренду офиса на Пятницкой кому-то нужно оплачивать.";
  } else {
    // Ending G
    endingId = "G";
    title = "«ВЕЧНЫЙ ЗАМПРЕД»";
    badge = "НЕЙТРАЛЬНЫЙ ФИНАЛ";
    narrative =
      "Ноябрь 2026 года. Гончаров — все так же зампред.\\n" +
      "Кабинет на Пятницкой остался за тобой. Оклад капает вовремя, чай в приемной подает референт.\\n\\n" +
      "Каждые два месяца звонит куратор: согласовать очередную беззубую резолюцию и перевести дежурные полмиллиона за спокойствие в округе.\\n" +
      "В телевизоре у Норкина ты стабильно изображаешь конструктивную оппозицию, в оппозиционных чатах тебя называют приспособленцем, но на новый диван в гостиную и спокойный сон денег хватает.\\n" +
      "Ни посадки, ни триумфа. Обычный серый вторник до пенсии.";
  }

  showEndingScreen(endingId, title, badge, narrative);
}

function showEndingScreen(endingId, title, badge, narrative) {
  const overlay = document.getElementById("ending-overlay");
  if (!overlay) return;
  overlay.classList.remove("hidden");

  overlay.innerHTML =
    '<div class="ending-win">' +
      '<div class="ending-header">' +
        '<span>ИТОГИ ИГРЫ: РАБОЧИЙ СТОЛ ЗАМПРЕДА</span>' +
      '</div>' +
      '<div class="ending-body">' +
        '<div class="ending-badge">' + badge + ' ' + title + '</div>' +
        '<div class="ending-text">' + narrative.replace(/\\n/g, "<br>") + '</div>' +
        '<div class="ending-stats">' +
          '<div>ЯБЛОКО: <strong>' + G.yabloko + ' / 100</strong></div>' +
          '<div>МЭРИЯ: <strong>' + G.meria + ' / 100</strong></div>' +
          '<div>СИЛОВИКИ: <strong>' + G.siloviki + ' / 100</strong></div>' +
          '<div>ФЛЕР: <strong>' + G.fler + ' / 100</strong></div>' +
          '<div>Личная касса: <strong>' + fmtMoney(G.cash) + '</strong></div>' +
          '<div>Партийная касса: <strong>' + fmtMoney(G.party_money) + '</strong></div>' +
          '<div>Получено от мэрии: <strong>' + fmtMoney(G.meria_total) + '</strong></div>' +
          '<div>Эфиров у Норкина: <strong>' + G.ntv_count + '</strong></div>' +
          '<div>Исключено активистов: <strong>' + G.purge_count + '</strong></div>' +
          '<div>Архивов прочитано: <strong>' + G.flashbacks_read + ' из 4</strong></div>' +
        '</div>' +
      '</div>' +
      '<div class="ending-footer">' +
        '<button class="btn-primary" style="font-size:16px;padding:6px 16px;" onclick="location.reload()">Начать заново</button>' +
        '<button class="btn-primary" onclick="openAboutModal()">О системе</button>' +
      '</div>' +
    '</div>';
}


// ============================================================================
// SECTION 6: INIT, START MENU, MODALS, CLOCK & APP LAUNCH
// ============================================================================

function initClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");

    const timeEl = document.getElementById("tray-time");
    if (timeEl) timeEl.textContent = h + ":" + m + ":" + s;

    const dateEl = document.getElementById("tray-date");
    if (dateEl) {
      dateEl.textContent = (G.month || "Сентябрь") + " " + (G.year || "2019");
    }
  }

  tick();
  setInterval(tick, 1000);
}

function toggleStartMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById("start-menu");
  const btn = document.getElementById("start-btn");
  if (!menu) return;

  const isHidden = menu.classList.contains("hidden");
  if (isHidden) {
    menu.classList.remove("hidden");
    if (btn) btn.classList.add("active");
  } else {
    menu.classList.add("hidden");
    if (btn) btn.classList.remove("active");
  }
}

function closeStartMenu() {
  const menu = document.getElementById("start-menu");
  const btn = document.getElementById("start-btn");
  if (menu) menu.classList.add("hidden");
  if (btn) btn.classList.remove("active");
}

function openShutdownModal() {
  const m = document.getElementById("shutdown-modal");
  if (m) m.classList.remove("hidden");
}

function closeShutdownModal() {
  const m = document.getElementById("shutdown-modal");
  if (m) m.classList.add("hidden");
}

function confirmShutdown() {
  closeShutdownModal();
  const d = document.getElementById("desktop");
  if (d) d.style.display = "none";
  const hud = document.getElementById("hud");
  if (hud) hud.style.display = "none";
  const bar = document.getElementById("taskbar");
  if (bar) bar.style.display = "none";

  const endOverlay = document.getElementById("ending-overlay");
  if (endOverlay) {
    endOverlay.classList.remove("hidden");
    endOverlay.innerHTML =
      '<div style="background:#000000;color:#ff9900;font-family:\'Courier New\',monospace;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box;">' +
        '<div style="font-size:30px;font-weight:bold;margin-bottom:18px;letter-spacing:1px;">СЕАНС РАБОТЫ ЗАВЕРШЕН</div>' +
        '<div style="font-size:18px;color:#cccccc;max-width:620px;line-height:1.6;margin-bottom:28px;">' +
          'Теперь питание компьютера можно отключить.<br>' +
          'Не забудьте убрать печать фонда «Среда» в сейф и запереть кабинет на два оборота.' +
        '</div>' +
        '<button class="win-btn" style="padding:10px 28px;font-size:15px;cursor:pointer;font-weight:bold;" onclick="location.reload()">' +
          'ВКЛЮЧИТЬ ПИТАНИЕ' +
        '</button>' +
      '</div>';
  }
}

function openAboutModal() {
  const m = document.getElementById("about-modal");
  if (m) m.classList.remove("hidden");
}

function closeAboutModal() {
  const m = document.getElementById("about-modal");
  if (m) m.classList.add("hidden");
}

function initDesktopIcons() {
  const icons = document.querySelectorAll(".desktop-icon");
  icons.forEach(ic => {
    ic.addEventListener("click", function(e) {
      e.stopPropagation();
      icons.forEach(other => other.classList.remove("selected"));
      ic.classList.add("selected");
    });

    ic.addEventListener("dblclick", function(e) {
      e.stopPropagation();
      const id = ic.getAttribute("data-window") || ic.id.replace("icon-", "");
      if (id === "scheme") {
        openScheme();
      } else {
        openWindow(id);
      }
    });
  });

  const desktop = document.getElementById("desktop");
  if (desktop) {
    desktop.addEventListener("click", function() {
      icons.forEach(other => other.classList.remove("selected"));
      closeStartMenu();
    });
  }

  // Handle taskbar click outside start button
  const taskbar = document.getElementById("taskbar");
  if (taskbar) {
    taskbar.addEventListener("click", function(e) {
      if (!e.target.closest("#start-btn") && !e.target.closest("#start-menu")) {
        closeStartMenu();
      }
    });
  }
}

// Global window bindings for HTML handlers
window.skipBoot = skipBoot;
window.openWindow = openWindow;
window.bringToFront = bringToFront;
window.closeWindow = closeWindow;
window.toggleMinimizeWindow = toggleMinimizeWindow;
window.toggleMaximizeWindow = toggleMaximizeWindow;
window.openScheme = openScheme;
window.selectTgContact = selectTgContact;
window.handleTgChoice = handleTgChoice;
window.openMail = openMail;
window.startCycle2 = startCycle2;
window.startCycle3 = startCycle3;
window.startCycle4 = startCycle4;
window.toggleStartMenu = toggleStartMenu;
window.closeStartMenu = closeStartMenu;
window.openShutdownModal = openShutdownModal;
window.closeShutdownModal = closeShutdownModal;
window.confirmShutdown = confirmShutdown;
window.openAboutModal = openAboutModal;
window.closeAboutModal = closeAboutModal;
window.restartGame = function() { location.reload(); };

function initGame() {
  initClock();
  initDesktopIcons();
  runBoot();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
