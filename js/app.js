function startClock() {
  const nowEl = document.getElementById("nowTime");
  const dateEl = document.getElementById("nowDate");
  const dayEl = document.getElementById("nowDay");

  function tick() {
    const d = new Date();
    const t = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    nowEl.textContent = t;

    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    dateEl.textContent = `${day}/${month}/${year}`;

    const days = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
    dayEl.textContent = days[d.getDay()];
  }
  tick();
  setInterval(tick, 1000);
}

function money(x) {
  const num = Number(x) || 0;
  return `${num.toFixed(0)} ج.م`;
}

function setFormCalc({ startTimeEl, hoursEl, endTimeEl, priceEl }) {
  const PRICE_PER_HOUR = getPricePerHour();

  function recalc() {
    const startTime = startTimeEl.value;
    const hours = Number(hoursEl.value);

    if (!startTime || !hours || hours <= 0) {
      endTimeEl.textContent = "-";
      priceEl.textContent = "-";
      return;
    }

    const end = addHoursToTime(startTime, hours);
    endTimeEl.textContent = end;
    priceEl.textContent = money(hours * PRICE_PER_HOUR);
  }

  startTimeEl.addEventListener("input", recalc);
  hoursEl.addEventListener("input", recalc);
}

function renderBookingsToAccordion({ containerId, list, mode }) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `<div class="card mini">لا توجد حجوزات.</div>`;
    return;
  }

  list.forEach(bk => {
    const day = formatDay(bk.date);
    const titleSub = `${day} - ${bk.date} • ${bk.hours} ساعات`;

    const fields = [
      { label: "اسم الفريق", value: bk.teamName },
      { label: "تاريخ الحجز", value: bk.date },
      { label: "وقت البداية", value: bk.startTime },
      { label: "وقت الخروج", value: bk.endTime },
      { label: "عدد الساعات", value: String(bk.hours) },
      { label: "السعر", value: money(bk.price) }
    ];

    const actions = [];

    if (mode === "pending") {
      actions.push(makeBtn({
        text: "تعديل",
        className: "",
        onClick: () => {
          // fill edit mode via query params
          location.href = `new-booking.html?editPending=${encodeURIComponent(bk.id)}`;
        }
      }));

      actions.push(makeBtn({
        text: "حذف",
        className: "danger",
        onClick: () => {
          if (confirm("متأكد إنك عايز تحذف الحجز؟")) {
            deletePendingBooking(bk.id);
            location.reload();
          }
        }
      }));

      actions.push(makeBtn({
        text: "تأكيد الحجز",
        className: "success",
        onClick: () => {
          if (confirm("هل تريد تأكيد الحجز؟")) {
            confirmBooking(bk.id);
            location.reload();
          }
        }
      }));
    }

    if (mode === "confirmed") {
      actions.push(makeBtn({
        text: "تعديل",
        onClick: () => {
          location.href = `new-booking.html?editConfirmed=${encodeURIComponent(bk.id)}`;
        }
      }));

      actions.push(makeBtn({
        text: "حذف",
        className: "danger",
        onClick: () => {
          if (confirm("متأكد إنك عايز تحذف؟")) {
            deleteConfirmedBooking(bk.id);
            location.reload();
          }
        }
      }));
    }

    const item = buildAccItem({
      titleMain: bk.teamName,
      titleSub,
      fields,
      actions
    });

    container.appendChild(item);
  });

  bindAccordion("#" + containerId + " .accItem");
}
