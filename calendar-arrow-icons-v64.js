// START/NOW v64 — ensure calendar navigation controls render arrows, not dumbbell fallbacks.
(() => {
  const extraIcons = {
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'
  };

  const icons = window.START_NOW_ICONS;
  if (!icons || typeof icons.icon !== 'function') return;

  const baseIcon = icons.icon;
  icons.icon = function(name, className = '', size = 24, strokeWidth = 2.2) {
    const body = extraIcons[name];
    if (!body) return baseIcon(name, className, size, strokeWidth);
    return `<svg class="sn60-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  };

  window.START_NOW_CALENDAR_ARROW_ICONS = { version: 'v64' };
})();
