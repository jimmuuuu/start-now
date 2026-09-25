(() => {
  Workout.restore();
  const page = location.hash.startsWith("#/") ? location.hash.slice(2) : "home";
  state.sessionId = history.state?.sessionId;
  state.exerciseHistoryId = history.state?.exerciseHistoryId;
  state.page = UI.routes[page] ? page : "home";
  history.replaceState(
    {
      routeIndex: history.state?.routeIndex || 0,
      page: state.page,
      sessionId: state.sessionId,
      exerciseHistoryId: state.exerciseHistoryId,
    },
    "",
    "#/" + state.page,
  );
  render();
  document.querySelector('meta[name="theme-color"]').content = state.dark
    ? "#121418"
    : "#ffffff";
  window.addEventListener("online", () => {
    showToast("Back online.");
    window.SN_AUTH?.syncNow?.({ silent: true });
  });
  window.addEventListener("startnow:datachange", (event) => {
    if (
      event.detail?.external &&
      state.page !== "activeWorkout" &&
      state.page !== "builder"
    )
      render();
  });
})();
