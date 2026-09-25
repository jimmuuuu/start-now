/* Shared state; the existing sn_* storage schema remains compatible. */
const app = document.getElementById("app");
const toast = document.getElementById("toast");
function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
}
function cloneWorkout(value) {
  return JSON.parse(JSON.stringify(value));
}
const state = {
  page: "home",
  customWorkouts: loadJSON("sn_custom_workouts", []),
  dark: localStorage.getItem("sn_dark") === "true",
  activeWorkout: null,
};
document.documentElement.classList.toggle("dark", state.dark);
function saveCustomWorkouts() {
  return window.SN36 ? SN36.saveWorkouts(state.customWorkouts) : false;
}
function dayName() {
  return SN36.todayName();
}
function getTodayWorkout() {
  return SN36.scheduledWorkout();
}
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 4000);
}
function render() {
  window.UI?.render();
}
function startWorkout(workout) {
  window.Workout?.start(workout);
}
