// Logika aplikacji – dane jachtu są w pliku dane.js
const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- Podstawowe teksty ----------
document.querySelectorAll("[data-bind]").forEach((el) => {
  el.textContent = JACHT[el.dataset.bind] ?? "";
});
document.title = `${JACHT.nazwa} – mój jacht`;

// ---------- Dane techniczne ----------
$("#specs").innerHTML = JACHT.specyfikacja
  .map(
    (s) => `<div class="spec">
      <div class="icon">${esc(s.ikona)}</div>
      <div class="label">${esc(s.etykieta)}</div>
      <div class="value">${esc(s.wartosc)}</div>
    </div>`
  )
  .join("");

// ---------- Historia ----------
$("#timeline").innerHTML = JACHT.historia
  .map((h) => `<li><b>${esc(h.rok)}</b>${esc(h.tekst)}</li>`)
  .join("");

// ---------- Wyposażenie ----------
$("#equipment").innerHTML = JACHT.wyposazenie.map((w) => `<li>${esc(w)}</li>`).join("");

// ---------- Galeria (pliki z dane.js + zdjęcia dodane w przeglądarce, IndexedDB) ----------
const DB_NAME = "seamaster815";
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("zdjecia", { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbTx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("zdjecia", mode);
    const result = fn(tx.objectStore("zdjecia"));
    tx.oncomplete = () => resolve(result.result);
    tx.onerror = () => reject(tx.error);
  });
}

const objectUrls = [];
async function renderGallery() {
  objectUrls.splice(0).forEach(URL.revokeObjectURL);
  let stored = [];
  try {
    stored = await dbTx("readonly", (s) => s.getAll());
  } catch (e) {
    console.warn("IndexedDB niedostępne", e);
  }

  const items = [
    ...JACHT.zdjecia.map((z) => ({ src: z.plik, podpis: z.podpis })),
    ...stored.map((z) => {
      const url = URL.createObjectURL(z.blob);
      objectUrls.push(url);
      return { src: url, podpis: z.podpis, id: z.id };
    }),
  ];

  $("#galleryEmpty").hidden = items.length > 0;
  $("#gallery").innerHTML = items
    .map(
      (z) => `<figure data-src="${esc(z.src)}" data-caption="${esc(z.podpis)}">
        <img src="${esc(z.src)}" alt="${esc(z.podpis || "Zdjęcie jachtu")}" loading="lazy" />
        ${z.podpis ? `<figcaption>${esc(z.podpis)}</figcaption>` : ""}
        ${z.id != null ? `<button class="del" data-id="${z.id}" title="Usuń">✕</button>` : ""}
      </figure>`
    )
    .join("");
}

$("#photoInput").addEventListener("change", async (e) => {
  for (const file of e.target.files) {
    const podpis = $("#photoCaption").value.trim();
    try {
      await dbTx("readwrite", (s) => s.add({ blob: file, podpis }));
    } catch (err) {
      console.warn("Nie udało się zapisać zdjęcia", err);
    }
  }
  e.target.value = "";
  $("#photoCaption").value = "";
  renderGallery();
});

$("#gallery").addEventListener("click", async (e) => {
  const del = e.target.closest(".del");
  if (del) {
    e.stopPropagation();
    await dbTx("readwrite", (s) => s.delete(Number(del.dataset.id)));
    renderGallery();
    return;
  }
  const fig = e.target.closest("figure");
  if (fig) {
    $("#lightboxImg").src = fig.dataset.src;
    $("#lightboxCaption").textContent = fig.dataset.caption;
    $("#lightbox").hidden = false;
  }
});
$("#lightbox").addEventListener("click", () => ($("#lightbox").hidden = true));
document.addEventListener("keydown", (e) => e.key === "Escape" && ($("#lightbox").hidden = true));

renderGallery();

// ---------- Dziennik rejsów (localStorage) ----------
const LOG_KEY = "seamaster815-dziennik";
let memLog = [];
const loadLog = () => {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch { return memLog; }
};
const saveLog = (log) => {
  memLog = log;
  try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch {}
};

function renderLog() {
  const log = loadLog().sort((a, b) => b.data.localeCompare(a.data));
  const totalNm = log.reduce((sum, r) => sum + (parseFloat(r.mile) || 0), 0);
  $("#stats").innerHTML = `
    <div><b>${log.length}</b>rejsów</div>
    <div><b>${totalNm.toFixed(1)}</b>mil morskich</div>
    <div><b>${log[0] ? esc(log[0].data) : "—"}</b>ostatni rejs</div>`;
  $("#logBody").innerHTML = log.length
    ? log
        .map(
          (r) => `<tr>
          <td>${esc(r.data)}</td><td>${esc(r.trasa)}</td><td>${esc(r.mile)}</td>
          <td>${esc(r.wiatr)}</td><td>${esc(r.uwagi)}</td>
          <td><button data-id="${esc(r.id)}" title="Usuń">✕</button></td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="empty">Dziennik jest pusty – zapisz swój pierwszy rejs.</td></tr>`;
}

$("#logForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const entry = Object.fromEntries(new FormData(e.target));
  entry.id = Date.now().toString(36);
  saveLog([...loadLog(), entry]);
  e.target.reset();
  renderLog();
});

$("#logBody").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) {
    saveLog(loadLog().filter((r) => r.id !== btn.dataset.id));
    renderLog();
  }
});

renderLog();
