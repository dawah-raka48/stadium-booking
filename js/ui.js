function el(id){ return document.getElementById(id); }

function showToast(message, type="success") {
  const t = el("toast");
  t.textContent = message;
  t.classList.remove("success","danger");
  t.classList.add(type);
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

function setupThemeToggle() {
  const theme = getTheme();
  document.documentElement.setAttribute("data-theme", theme);

  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.value = theme;

  toggle.addEventListener("change", (e) => {
    const next = e.target.value;
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  });
}

function bindAccordion(containerSelector) {
  document.querySelectorAll(containerSelector).forEach(item => {
    const head = item.querySelector(".accHead");
    if (!head) return;

    head.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });
}

function buildAccItem({
  titleMain,
  titleSub,
  fields,
  actions
}) {
  const item = document.createElement("div");
  item.className = "accItem";

  const head = document.createElement("div");
  head.className = "accHead";

  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = titleMain;

  const sub = document.createElement("div");
  sub.className = "sub";
  sub.textContent = titleSub;

  meta.appendChild(title);
  meta.appendChild(sub);

  const arrow = document.createElement("div");
  arrow.className = "mini";
  arrow.textContent = "▼";

  head.appendChild(meta);
  head.appendChild(arrow);

  const body = document.createElement("div");
  body.className = "accBody";

  const kv = document.createElement("div");
  kv.className = "kv";
  fields.forEach(f => {
    const box = document.createElement("div");
    box.className = "box";
    box.innerHTML = `<div class="mini">${f.label}</div><div style="font-weight:800">${f.value}</div>`;
    kv.appendChild(box);
  });

  const footer = document.createElement("div");
  footer.className = "footerActions";
  actions.forEach(a => footer.appendChild(a));

  body.appendChild(kv);
  body.appendChild(document.createElement("hr")).className = "sep";
  body.appendChild(footer);

  item.appendChild(head);
  item.appendChild(body);

  return item;
}

function makeBtn({ text, className="", onClick=null }) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `btn small ${className}`.trim();
  b.textContent = text;
  if (onClick) b.addEventListener("click", onClick);
  return b;
}
