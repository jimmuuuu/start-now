// START/NOW v74 — stable public route into the existing Exercise Library renderer.
(() => {
  if (typeof window.render !== 'function' || typeof state === 'undefined') return;

  // Capture the render chain immediately after product-pages-v36.js loads.
  // At this point the existing Exercise Library renderer is already installed,
  // but later Quick Action/router wrappers have not been added yet.
  const productPagesRender = window.render;

  function renderExerciseLibrary() {
    const previousPage = state.page;
    state.page = 'exerciseLibrary';
    productPagesRender.call(window);

    const page = document.querySelector('#app .sn-page');
    const title = page?.querySelector('h1')?.textContent || '';
    const search = page?.querySelector('#snLibrarySearch');
    const list = page?.querySelector('.sn-library-list');

    if (!page || !/Find an exercise/i.test(title) || !search || !list) {
      state.page = previousPage;
      throw new Error('Existing Exercise Library renderer did not mount correctly');
    }

    return page;
  }

  window.START_NOW_EXERCISE_LIBRARY_ROUTE = {
    version: 'v74',
    render: renderExerciseLibrary
  };
})();