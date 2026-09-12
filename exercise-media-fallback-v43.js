// START/NOW v43 — deterministic illustrated fallback for every exercise.
// Verified source media stays preferred; this creates a truthful movement guide
// when the curated source manifest does not contain an exact demonstration.
(() => {
  const COLORS = {
    ink: '#172033',
    muted: '#64748b',
    line: '#dbe4ef',
    bg: '#f8fafc',
    blue: '#3b82f6',
    blueSoft: '#dbeafe'
  };

  const xml = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const line = (x1, y1, x2, y2, active = false, width = 9) =>
    '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + (active ? COLORS.blue : COLORS.ink) + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  const head = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="15" fill="#fff" stroke="' + COLORS.ink + '" stroke-width="5"/>';
  const arrow = (x1, y1, x2, y2) => '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + 'm-13 -2 13 2-5 12" stroke="' + COLORS.blue + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  const dumbbell = (x, y, angle = 0) =>
    '<g transform="translate(' + x + ' ' + y + ') rotate(' + angle + ')" stroke="' + COLORS.muted + '" stroke-width="5" stroke-linecap="round"><path d="M-18 0H18M-20 -9v18M-27 -7v14M20 -9v18M27 -7v14"/></g>';
  const barbell = (y, x1 = 84, x2 = 516) =>
    '<g stroke="' + COLORS.muted + '" stroke-width="5" stroke-linecap="round"><path d="M' + x1 + ' ' + y + 'H' + x2 + 'M' + (x1 + 14) + ' ' + (y - 17) + 'v34M' + (x1 + 27) + ' ' + (y - 13) + 'v26M' + (x2 - 14) + ' ' + (y - 17) + 'v34M' + (x2 - 27) + ' ' + (y - 13) + 'v26"/></g>';
  const bench = () => '<path d="M82 242h330M108 242v66M386 242v66" stroke="' + COLORS.muted + '" stroke-width="6" stroke-linecap="round" fill="none"/>';
  const machine = () => '<g stroke="' + COLORS.muted + '" stroke-width="6" stroke-linecap="round" fill="none"><path d="M92 72v242M508 72v242M92 88h416M150 170h300"/></g>';
  const cable = () => '<g stroke="' + COLORS.muted + '" stroke-width="6" stroke-linecap="round" fill="none"><rect x="62" y="58" width="44" height="260" rx="8"/><path d="M84 82h326M410 82v74M365 156h90"/></g>';
  const platform = () => '<path d="M390 96l112 50-13 24-112-50z" fill="' + COLORS.blueSoft + '" stroke="' + COLORS.muted + '" stroke-width="5"/>';

  function family(ex) {
    const text = String((ex && ex.name) || '') + ' ' + String((ex && ex.id) || '');
    const value = text.toLowerCase();
    if (/treadmill|bike|elliptical|stair|rowing machine|ski erg|jump rope|battle rope/.test(value)) return 'cardio';
    if (/plank|crunch|sit-up|hollow|bird dog|bear crawl|mountain climber|rollout|wood chop|rotation|knee raise|leg raise|v-up|toe touch|dead bug/.test(value)) return 'core';
    if (/calf|tibialis/.test(value)) return 'calf';
    if (/hip abduction|hip adduction|abductor|adductor|fire hydrant|donkey kick|kickback|frog pump/.test(value)) return 'hip';
    if (/carry|march|farmer|suitcase|dead hang|towel hang/.test(value)) return 'carry';
    if (/lunge|split squat|step-up|step down|curtsy|bulgarian/.test(value)) return 'lunge';
    if (/squat|leg press|leg extension|wall sit|sissy/.test(value)) return 'squat';
    if (/deadlift|romanian|good morning|back extension|hip thrust|glute bridge|pull-through|swing|rack pull/.test(value)) return 'hinge';
    if (/curl|preacher/.test(value)) return 'curl';
    if (/pushdown|triceps extension|skull crusher|pressdown/.test(value)) return 'extension';
    if (/fly|flye|reverse fly|rear delt/.test(value)) return 'fly';
    if (/raise|upright row/.test(value)) return 'raise';
    if (/row|pulldown|pull-up|pull up|chin-up|chin up|high row|low row|meadows/.test(value)) return 'pull';
    if (/press|push-up|push up|dip|chest press/.test(value)) return 'press';
    return 'movement';
  }

  function equipment(ex) {
    const value = String((ex && ex.name) || '').toLowerCase();
    if (/barbell|ez-bar|ez bar/.test(value)) return 'BARBELL';
    if (/dumbbell/.test(value)) return 'DUMBBELLS';
    if (/kettlebell/.test(value)) return 'KETTLEBELL';
    if (/cable|pulldown|pushdown|face pull|wood chop/.test(value)) return 'CABLE';
    if (/machine|leg press|pec deck|hack squat|smith/.test(value)) return 'MACHINE';
    if (/band/.test(value)) return 'BAND';
    if (/bodyweight|push-up|push up|pull-up|pull up|chin-up|chin up|plank|lunge|squat/.test(value)) return 'BODYWEIGHT';
    return 'MOVEMENT';
  }

  function figure(kind, phase) {
    const end = phase === 'finish';
    const bend = end ? 42 : 0;
    const high = end ? 42 : 0;
    if (kind === 'press') {
      return bench() + barbell(end ? 158 : 106) + head(175, 190) +
        line(185, 204, 305, 229, true) + line(260, 219, end ? 310 : 200, end ? 158 : 106, true) +
        line(305, 229, end ? 348 : 400, end ? 158 : 106, true) + line(305, 229, 375, 270) + line(305, 229, 400, 290) +
        arrow(438, 120, 438, 196);
    }
    if (kind === 'pull') {
      return cable() + head(290, 150) + line(290, 170, 290, 250, true) +
        line(290, 182, end ? 205 : 220, end ? 125 : 92, true) + line(290, 182, end ? 375 : 360, end ? 125 : 92, true) +
        line(290, 250, 260, 310) + line(290, 250, 320, 310) + arrow(456, 108, 456, end ? 184 : 128);
    }
    if (kind === 'squat') {
      return (equipment(exDummy(kind)) === 'MACHINE' ? machine() : '') + head(300, end ? 144 : 74) +
        line(300, end ? 164 : 94, 300, end ? 230 : 185, true) +
        line(300, end ? 184 : 112, end ? 228 : 250, end ? 220 : 135, true) + line(300, end ? 184 : 112, end ? 372 : 350, end ? 220 : 135, true) +
        line(300, end ? 230 : 185, end ? 220 : 250, end ? 278 : 270, true) + line(end ? 220 : 250, end ? 278 : 270, end ? 170 : 230, 310, true) +
        line(300, end ? 230 : 185, end ? 382 : 350, end ? 278 : 270, true) + line(end ? 382 : 350, end ? 278 : 270, end ? 440 : 390, 310, true) + arrow(468, 250, 468, end ? 180 : 248);
    }
    if (kind === 'lunge') {
      return head(290, end ? 92 : 68) + line(290, end ? 112 : 88, 290, end ? 194 : 178, true) +
        line(290, 118, 242, 146) + line(290, 118, 338, 146) +
        line(290, end ? 194 : 178, end ? 210 : 250, end ? 250 : 258, true) + line(end ? 210 : 250, end ? 250 : 258, end ? 132 : 170, 308, true) +
        line(290, end ? 194 : 178, end ? 370 : 330, end ? 248 : 220, true) + line(end ? 370 : 330, end ? 248 : 220, end ? 474 : 430, 300, true) + arrow(468, 190, 468, end ? 246 : 186);
    }
    if (kind === 'hinge') {
      return equipment(exDummy(kind)) === 'MACHINE' ? machine() : barbell(end ? 238 : 270, 190, 510) +
        head(end ? 226 : 250, 76) + line(end ? 236 : 260, 98, end ? 310 : 290, end ? 174 : 205, true) +
        line(end ? 310 : 290, end ? 174 : 205, end ? 252 : 220, end ? 232 : 270, true) + line(end ? 310 : 290, end ? 174 : 205, end ? 380 : 360, end ? 232 : 270, true) +
        line(end ? 252 : 220, end ? 232 : 205, 220, 310, true) + line(end ? 380 : 360, end ? 232 : 205, 400, 310, true) + arrow(468, 152, 468, end ? 228 : 150);
    }
    if (kind === 'curl' || kind === 'extension' || kind === 'raise') {
      return (kind === 'extension' ? cable() : '') + head(300, 74) + line(300, 96, 300, 188, true) +
        line(300, 120, end ? 232 : 270, end ? 82 : 148, true) + line(300, 120, end ? 368 : 330, end ? 82 : 148, true) +
        line(300, 188, 262, 310) + line(300, 188, 338, 310) +
        (kind === 'raise' ? dumbbell(end ? 230 : 272, end ? 80 : 148, -20) + dumbbell(end ? 370 : 328, end ? 80 : 148, 20) : dumbbell(end ? 232 : 270, end ? 84 : 152) + dumbbell(end ? 368 : 330, end ? 84 : 152)) +
        arrow(468, 110, 468, end ? 72 : 152);
    }
    if (kind === 'fly') {
      return bench() + head(170, 190) + line(185, 204, 305, 229, true) +
        line(245, 218, end ? 300 : 160, end ? 160 : 110, true) + line(305, 229, end ? 310 : 450, end ? 160 : 110, true) +
        line(305, 229, 375, 270) + line(305, 229, 400, 290) +
        dumbbell(end ? 300 : 160, end ? 160 : 110) + dumbbell(end ? 310 : 450, end ? 160 : 110) + arrow(470, 130, 470, end ? 176 : 126);
    }
    if (kind === 'core') {
      return end ? head(112, 174) + line(128, 178, 300, 218, true) + line(300, 218, 400, 262, true) + line(170, 188, 150, 280, true) + line(400, 262, 468, 290, true) + arrow(462, 128, 462, 218)
        : head(96, 218) + line(112, 222, 300, 222, true) + line(300, 222, 404, 248, true) + line(160, 222, 138, 300, true) + line(404, 248, 470, 280, true) + arrow(462, 288, 462, 218);
    }
    if (kind === 'calf') {
      return platform() + head(300, 70) + line(300, 92, 300, 192, true) + line(300, 122, 258, 156) + line(300, 122, 342, 156) +
        line(300, 192, 265, 292, true) + line(300, 192, 335, 292, true) + arrow(464, 280, 464, end ? 232 : 280);
    }
    if (kind === 'hip') {
      return machine() + head(300, 102) + line(300, 124, 300, 212, true) + line(300, 152, end ? 170 : 235, 170, true) + line(300, 152, end ? 430 : 365, 170, true) +
        line(300, 212, 250, 296) + line(300, 212, 350, 296) + arrow(470, 170, end ? 426 : 470, 170);
    }
    if (kind === 'carry') {
      return head(300, 70) + line(300, 92, 300, 190, true) + line(300, 120, 255, 170) + line(300, 120, 345, 170) +
        line(300, 190, 260, 310) + line(300, 190, 340, 310) + dumbbell(250, 184) + dumbbell(350, 184) + arrow(464, 160, 510, 160);
    }
    if (kind === 'cardio') {
      return head(285, 80) + line(285, 102, 300, 178, true) + line(300, 125, 250, 160, true) + line(300, 125, 360, 148, true) +
        line(300, 178, 245, 245, true) + line(245, 245, 180, 290, true) + line(300, 178, 370, 236, true) + line(370, 236, 452, 260, true) +
        '<path d="M120 310h360" stroke="' + COLORS.muted + '" stroke-width="7" stroke-linecap="round"/>' + arrow(470, 110, 470, 210);
    }
    return head(300, 72) + line(300, 94, 300, 190, true) + line(300, 120, 250, 160, true) + line(300, 120, 350, 160, true) +
      line(300, 190, 260, 310) + line(300, 190, 340, 310) + arrow(468, 120, 468, 215);
  }

  function exDummy(kind) {
    return { name: kind === 'hinge' ? 'machine hinge' : kind };
  }

  function svg(ex, phase) {
    const kind = family(ex);
    const label = kind === 'movement' ? 'MOVEMENT GUIDE' : kind.toUpperCase() + ' GUIDE';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" role="img"><rect width="600" height="360" rx="26" fill="' + COLORS.bg + '"/><rect x="2" y="2" width="596" height="356" rx="24" fill="none" stroke="' + COLORS.line + '" stroke-width="4"/><text x="34" y="42" fill="' + COLORS.blue + '" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="2">' + label + '</text><text x="34" y="72" fill="' + COLORS.ink + '" font-family="Arial,sans-serif" font-size="22" font-weight="700">' + xml((ex && ex.name) || 'Exercise') + '</text><g transform="translate(0 4)">' + figure(kind, phase) + '</g><text x="34" y="338" fill="' + COLORS.muted + '" font-family="Arial,sans-serif" font-size="15">' + (phase === 'finish' ? 'CONTROLLED FINISH' : 'START POSITION') + '  •  ' + equipment(ex) + '</text></svg>';
  }

  function forExercise(ex) {
    return {
      type: 'image-pair',
      fallback: true,
      verified: false,
      source: 'Level Up Fitness',
      sourceExerciseName: 'Illustrated movement guide',
      media: [
        'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg(ex, 'start')),
        'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg(ex, 'finish'))
      ]
    };
  }

  window.START_NOW_EXERCISE_ILLUSTRATED_FALLBACK = { version: 43, forExercise, family };
})();
