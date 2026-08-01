const STORAGE_KEYS = {
  pending: "stadium.pending",
  confirmed: "stadium.confirmed",
  theme: "stadium.theme"
};

// سعر الساعة (تقدر تعدله)
const PRICE_PER_HOUR = 100;

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}
function save(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}
function getPending() { return load(STORAGE_KEYS.pending); }
function getConfirmed() { return load(STORAGE_KEYS.confirmed); }

function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}
function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || "dark";
}

function pad2(n){ return String(n).padStart(2,"0"); }

// time: "HH:MM"
function addHoursToTime(timeStr, hours) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const totalMinutes = hh * 60 + mm + (hours * 60);
  const outH = Math.floor(totalMinutes / 60) % 24;
  const outM = totalMinutes % 60;
  return `${pad2(outH)}:${pad2(outM)}`;
}

function formatDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  return days[d.getDay()];
}

function isDuplicate(list, item) {
  // منع التكرار: فريق + تاريخ + وقت بداية
  return list.some(x =>
    x.teamName === item.teamName &&
    x.date === item.date &&
    x.startTime === item.startTime
  );
}

function createId() {
  return "bk_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function buildBooking({ teamName, date, startTime, hours }) {
  const hoursNum = Number(hours);
  const endTime = addHoursToTime(startTime, hoursNum);
  const price = hoursNum * PRICE_PER_HOUR;

  return {
    id: createId(),
    teamName,
    date,
    startTime,
    hours: hoursNum,
    endTime,
    price,
    createdAt: new Date().toISOString()
  };
}

// Pending add
function addPendingBooking(payload) {
  const pending = getPending();
  if (isDuplicate(pending, payload)) {
    return { ok: false, reason: "duplicate" };
  }
  const item = buildBooking(payload);
  pending.unshift(item);
  save(STORAGE_KEYS.pending, pending);
  return { ok: true, item };
}

function updatePendingBooking(id, payload) {
  const pending = getPending();
  const idx = pending.findIndex(x => x.id === id);
  if (idx === -1) return { ok:false, reason:"not_found" };

  const updated = buildBooking(payload);
  // احفظ نفس id
  updated.id = id;

  // منع التكرار بالنسبة لباقي العناصر (مع استثناء نفس id)
  const clone = pending.filter(x => x.id !== id);
  if (isDuplicate(clone, updated)) {
    return { ok:false, reason:"duplicate" };
  }

  pending[idx] = updated;
  save(STORAGE_KEYS.pending, pending);
  return { ok:true, item: updated };
}

function deletePendingBooking(id) {
  const pending = getPending().filter(x => x.id !== id);
  save(STORAGE_KEYS.pending, pending);
}

function confirmBooking(id) {
  const pending = getPending();
  const idx = pending.findIndex(x => x.id === id);
  if (idx === -1) return { ok:false, reason:"not_found" };

  const item = pending[idx];
  pending.splice(idx, 1);
  save(STORAGE_KEYS.pending, pending);

  const confirmed = getConfirmed();
  confirmed.unshift(item);
  save(STORAGE_KEYS.confirmed, confirmed);
  return { ok:true, item };
}

// Confirmed ops
function updateConfirmedBooking(id, payload) {
  const confirmed = getConfirmed();
  const idx = confirmed.findIndex(x => x.id === id);
  if (idx === -1) return { ok:false, reason:"not_found" };

  const updated = buildBooking(payload);
  updated.id = id;

  const clone = confirmed.filter(x => x.id !== id);
  if (isDuplicate(clone, updated)) {
    return { ok:false, reason:"duplicate" };
  }

  confirmed[idx] = updated;
  save(STORAGE_KEYS.confirmed, confirmed);
  return { ok:true, item: updated };
}

function deleteConfirmedBooking(id) {
  const confirmed = getConfirmed().filter(x => x.id !== id);
  save(STORAGE_KEYS.confirmed, confirmed);
}

function getPricePerHour(){ return PRICE_PER_HOUR; }

// Stats
function calcStatsForMonth(dateList, year, monthIndex0) {
  // monthIndex0: 0..11
  const start = new Date(year, monthIndex0, 1);
  const end = new Date(year, monthIndex0 + 1, 1);

  const inMonth = dateList.filter(x => {
    const d = new Date(x.date + "T00:00:00");
    return d >= start && d < end;
  });

  const totalHours = inMonth.reduce((s, x) => s + Number(x.hours), 0);
  const totalTeams = new Set(inMonth.map(x => x.teamName)).size;
  const totalAmount = inMonth.reduce((s, x) => s + Number(x.price), 0);

  return {
    totalHours,
    totalTeams,
    totalAmount,
    countBookings: inMonth.length
  };
}
