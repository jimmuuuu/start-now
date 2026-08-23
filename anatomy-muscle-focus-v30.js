// START/NOW v30 — high-quality anatomical muscle focus using generated front/back anatomy art.
(() => {
  const ANATOMY_IMAGE = "assets/muscle_anatomy_base.webp?v=anatomy-v30";
  const ACTIVE = "#3B82F6";
  const ACTIVE_STROKE = "#1D4ED8";

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  }

  function normalizeMuscle(exercise) {
    const name = String(exercise?.name || "").toLowerCase();
    if (name.includes("romanian deadlift")) return "Hamstrings";
    return String(exercise?.muscle || "Other");
  }

  function musclesFor(workout) {
    const raw = [...new Set((workout?.exercises || []).map(normalizeMuscle).filter(Boolean))];
    const specificLegs = raw.some(m => ["Quads","Hamstrings","Glutes","Calves"].includes(m));
    return raw.filter(m => !(m === "Legs" && specificLegs));
  }

  function zonesFor(workout) {
    const zones = new Set();
    musclesFor(workout).forEach(muscle => {
      const key = muscle.toLowerCase();
      if (key.includes("chest")) zones.add("chest");
      if (key.includes("shoulder")) zones.add("front-delts");
      if (key.includes("shoulder") || key.includes("rear delt")) zones.add("rear-delts");
      if (key.includes("trap")) zones.add("traps");
      if (key === "back" || key.includes("lat")) { zones.add("upper-back"); zones.add("lats"); }
      if (key.includes("lower back")) zones.add("lower-back");
      if (key.includes("bicep")) zones.add("biceps");
      if (key.includes("tricep")) zones.add("triceps");
      if (key.includes("core") || key.includes("ab")) zones.add("abs");
      if (key.includes("quad")) zones.add("quads");
      if (key.includes("hamstring")) zones.add("hamstrings");
      if (key.includes("glute")) zones.add("glutes");
      if (key.includes("calf")) zones.add("calves");
      if (key === "legs") ["quads","hamstrings","glutes","calves"].forEach(z => zones.add(z));
    });
    return zones;
  }

  function active(zones, zone) { return zones.has(zone); }
  function fill(zones, zone) { return active(zones, zone) ? ACTIVE : "transparent"; }
  function stroke(zones, zone) { return active(zones, zone) ? ACTIVE_STROKE : "transparent"; }

  function installStyles() {
    if (document.getElementById("sn-anatomy-focus-v30-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-anatomy-focus-v30-styles";
    style.textContent = `
      .body-visual{min-height:290px;display:flex;align-items:center;justify-content:center}
      .sn-anatomy-wrap{position:relative;width:100%;max-width:365px;margin:0 auto}
      .sn-anatomy-img{display:block;width:100%;height:auto;position:relative;z-index:1}
      .sn-anatomy-overlay{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;overflow:visible}
      .sn-anatomy-overlay .active-zone{mix-blend-mode:multiply;filter:drop-shadow(0 0 1.5px rgba(29,78,216,.45))}
      .sn-anatomy-label{margin-top:8px;text-align:center;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.05em}
      .dark .sn-anatomy-img{filter:brightness(.92) contrast(1.04)}
    `;
    document.head.appendChild(style);
  }

  function zonePath(zones, zone, d) {
    if (!active(zones, zone)) return "";
    return `<path class="active-zone" d="${d}" fill="${fill(zones, zone)}" fill-opacity=".63" stroke="${stroke(zones, zone)}" stroke-width="2" stroke-linejoin="round"/>`;
  }

  function zoneEllipse(zones, zone, cx, cy, rx, ry, rotate = 0) {
    if (!active(zones, zone)) return "";
    const transform = rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : "";
    return `<ellipse class="active-zone" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${transform} fill="${fill(zones, zone)}" fill-opacity=".63" stroke="${stroke(zones, zone)}" stroke-width="2"/>`;
  }

  function overlayMarkup(workout) {
    const zones = zonesFor(workout);
    return `
      <svg class="sn-anatomy-overlay" viewBox="0 0 900 774" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${zonePath(zones,"chest","M185 183 C215 161 255 159 278 181 C300 159 340 161 367 184 C357 226 330 247 279 249 C227 247 199 227 185 183 Z")}
        ${zoneEllipse(zones,"front-delts",165,205,31,42,-12)}
        ${zoneEllipse(zones,"front-delts",391,205,31,42,12)}
        ${zoneEllipse(zones,"biceps",151,292,21,60,12)}
        ${zoneEllipse(zones,"biceps",404,292,21,60,-12)}
        ${zonePath(zones,"abs","M238 250 C252 241 264 240 279 247 C294 240 306 241 319 250 L313 373 C302 390 255 390 244 373 Z")}
        ${zonePath(zones,"quads","M194 424 C216 410 244 410 264 427 L258 557 C243 580 212 579 199 555 Z")}
        ${zonePath(zones,"quads","M292 427 C312 410 341 410 361 424 L356 555 C343 579 312 580 297 557 Z")}
        ${zonePath(zones,"calves","M204 570 C219 557 240 558 252 575 L246 687 C234 710 212 706 204 681 Z")}
        ${zonePath(zones,"calves","M304 575 C316 558 337 557 352 570 L352 681 C344 706 322 710 310 687 Z")}
        ${zonePath(zones,"traps","M629 135 C651 111 690 111 712 136 L695 196 C678 214 648 214 630 196 Z")}
        ${zoneEllipse(zones,"rear-delts",594,202,34,43,-12)}
        ${zoneEllipse(zones,"rear-delts",749,202,34,43,12)}
        ${zonePath(zones,"upper-back","M607 188 C628 168 653 166 672 179 C692 166 717 169 737 188 L727 286 C708 310 692 320 672 326 C650 320 633 309 617 286 Z")}
        ${zonePath(zones,"lats","M602 229 C625 228 642 240 651 263 L650 371 C630 386 609 373 596 351 Z")}
        ${zonePath(zones,"lats","M742 229 C719 228 702 240 693 263 L694 371 C714 386 735 373 748 351 Z")}
        ${zoneEllipse(zones,"triceps",569,292,22,61,12)}
        ${zoneEllipse(zones,"triceps",775,292,22,61,-12)}
        ${zonePath(zones,"lower-back","M642 302 C655 291 690 291 702 302 L709 391 C692 409 652 409 635 391 Z")}
        ${zonePath(zones,"glutes","M613 385 C633 365 661 366 674 387 L670 464 C649 482 622 475 608 452 Z")}
        ${zonePath(zones,"glutes","M731 385 C711 365 683 366 670 387 L674 464 C695 482 722 475 736 452 Z")}
        ${zonePath(zones,"hamstrings","M610 471 C628 459 651 459 666 475 L660 586 C647 605 623 603 612 583 Z")}
        ${zonePath(zones,"hamstrings","M734 471 C716 459 693 459 678 475 L684 586 C697 605 721 603 732 583 Z")}
        ${zonePath(zones,"calves","M616 588 C629 574 649 574 660 590 L654 689 C642 710 622 706 615 684 Z")}
        ${zonePath(zones,"calves","M728 588 C715 574 695 574 684 590 L690 689 C702 710 722 706 729 684 Z")}
      </svg>`;
  }

  function bodyMarkup(workout) {
    workout ||= typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
    const names = musclesFor(workout).join(", ") || "Full body";
    return `
      <div class="sn-anatomy-wrap" aria-label="Muscle focus: ${esc(names)}">
        <img class="sn-anatomy-img" src="${ANATOMY_IMAGE}" alt="Detailed front and back anatomical muscle diagram" />
        ${overlayMarkup(workout)}
        <div class="sn-anatomy-label">BLUE = TODAY’S FOCUS</div>
      </div>`;
  }

  function patchFocusCard(workout) {
    if (!workout) return;
    const body = document.querySelector(".body-visual");
    const copy = document.querySelector(".focus-copy");
    if (!body || !copy) return;
    const muscles = musclesFor(workout).slice(0, 4);
    body.innerHTML = bodyMarkup(workout);
    const heading = copy.querySelector("h3");
    if (heading) heading.textContent = muscles.join(", ") || "Full body";
    const list = copy.querySelector(".muscle-list");
    if (list) list.innerHTML = muscles.map((muscle,index) => `<div class="muscle-row"><span><i class="dot"></i>${esc(muscle)}</span><span>${index === 0 ? "Primary" : "Focus"}</span></div>`).join("");
  }

  installStyles();
  if (typeof bodySvg === "function") bodySvg = workout => bodyMarkup(workout);
  if (typeof workoutMuscles === "function") workoutMuscles = workout => musclesFor(workout).slice(0,4).join(", ") || "Full body";
  if (typeof renderHome === "function") {
    const prior = renderHome;
    renderHome = function() {
      const result = prior();
      const workout = typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
      patchFocusCard(workout);
      return result;
    };
  }
  if (typeof render === "function") render();
})();