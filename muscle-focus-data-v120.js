// START/NOW v120 — muscle-focus data only. No visual renderer lives in this module.
(() => {
  const MUSCLE_ORDER = [
    "Chest", "Shoulders", "Rear Delts", "Back", "Traps", "Biceps", "Triceps", "Forearms",
    "Core", "Lower Back", "Quads", "Adductors", "Hamstrings", "Glutes", "Calves"
  ];

  function canonicalMuscle(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
    if (raw.includes("rear delt")) return "Rear Delts";
    if (raw.includes("shoulder") || raw.includes("delt")) return "Shoulders";
    if (raw.includes("chest") || raw.includes("pec")) return "Chest";
    if (raw === "back" || raw.includes("lat")) return "Back";
    if (raw.includes("trap")) return "Traps";
    if (raw.includes("bicep")) return "Biceps";
    if (raw.includes("tricep")) return "Triceps";
    if (raw.includes("forearm")) return "Forearms";
    if (raw.includes("core") || raw.includes("ab")) return "Core";
    if (raw.includes("lower back")) return "Lower Back";
    if (raw.includes("quad")) return "Quads";
    if (raw.includes("adductor") || raw.includes("groin") || raw.includes("inner thigh")) return "Adductors";
    if (raw.includes("hamstring")) return "Hamstrings";
    if (raw.includes("glute")) return "Glutes";
    if (raw.includes("calf") || raw.includes("calves")) return "Calves";
    if (raw === "legs" || raw.includes("leg")) return "Legs";
    if (raw.includes("full body")) return "Full Body";
    return String(value || "").trim();
  }

  function directMuscles(exercise) {
    const declared = canonicalMuscle(exercise?.muscleGroups?.primary);
    if (declared && declared !== "Legs" && declared !== "Full Body") return [declared];

    const name = String(exercise?.name || "").toLowerCase();
    const base = declared || canonicalMuscle(exercise?.muscle);

    if (/romanian deadlift|stiff[- ]leg|good morning|nordic|leg curl/.test(name)) return ["Hamstrings"];
    if (/hip adduction|adductor|inner thigh|groin/.test(name)) return ["Adductors"];
    if (/hip thrust|glute bridge|glute drive|glute kickback|donkey kick|fire hydrant|frog pump|hip abduction|lateral band walk/.test(name)) return ["Glutes"];
    if (/leg press|hack squat|pendulum squat|front squat|goblet squat|split squat|bulgarian|step[- ]?up|step[- ]?down|lunge|squat/.test(name)) return ["Quads", "Glutes"];
    if (/calf raise|calf press|tibialis/.test(name)) return ["Calves"];
    if (/rear delt|reverse fly|face pull/.test(name)) return ["Rear Delts"];
    if (/shrug|trap bar shrug/.test(name)) return ["Traps"];
    if (/carry|farmer|suitcase/.test(name) && base === "Traps") return ["Traps"];
    if (/wood chop|pallof|plank|crunch|sit[- ]?up|hollow|v[- ]?up|toe touch|bird dog|ab wheel/.test(name)) return ["Core"];
    if (base === "Legs") return ["Quads", "Glutes"];
    if (base === "Full Body") return ["Chest", "Back", "Quads", "Glutes", "Core"];
    return base ? [base] : [];
  }

  function secondaryMuscles(exercise, direct) {
    if (Array.isArray(exercise?.muscleGroups?.secondary)) {
      return exercise.muscleGroups.secondary
        .map(canonicalMuscle)
        .filter(muscle => muscle && !direct.includes(muscle));
    }

    const name = String(exercise?.name || "").toLowerCase();
    const out = new Set();
    const has = value => direct.includes(value);

    if (has("Chest") && /press|push[- ]?up|dip/.test(name)) {
      out.add("Shoulders");
      out.add("Triceps");
    }
    if (has("Shoulders") && /press|pike/.test(name)) out.add("Triceps");
    if (has("Back") && /row|pulldown|pull[- ]?up|chin[- ]?up/.test(name)) {
      out.add("Biceps");
      if (/row/.test(name)) out.add("Rear Delts");
    }
    if (has("Rear Delts") && /face pull|row|reverse fly/.test(name)) out.add("Back");
    if (has("Quads") && /squat|leg press|lunge|split|step/.test(name)) out.add("Glutes");
    if (has("Hamstrings") && /deadlift|good morning|curl/.test(name)) out.add("Glutes");
    if (has("Glutes") && /hip thrust|bridge|kickback/.test(name)) out.add("Hamstrings");
    if (has("Core") && /carry|pallof|wood chop/.test(name)) out.add("Lower Back");

    direct.forEach(muscle => out.delete(muscle));
    return [...out];
  }

  function buildFocus(workout) {
    const directCounts = new Map();
    const secondaryCounts = new Map();

    for (const exercise of workout?.exercises || []) {
      const direct = directMuscles(exercise).filter(muscle => MUSCLE_ORDER.includes(muscle));
      direct.forEach(muscle => directCounts.set(muscle, (directCounts.get(muscle) || 0) + 1));
      secondaryMuscles(exercise, direct)
        .filter(muscle => MUSCLE_ORDER.includes(muscle))
        .forEach(muscle => secondaryCounts.set(muscle, (secondaryCounts.get(muscle) || 0) + 1));
    }

    if (!directCounts.size) return { primary: [], secondary: [], all: [] };

    const maxDirect = Math.max(...directCounts.values());
    const primary = MUSCLE_ORDER.filter(muscle => directCounts.get(muscle) === maxDirect);
    const secondary = MUSCLE_ORDER.filter(muscle =>
      !primary.includes(muscle) && (directCounts.has(muscle) || secondaryCounts.has(muscle))
    );

    return { primary, secondary, all: [...primary, ...secondary] };
  }

  // Kept under the established public name because the v59 anatomy renderer consumes buildFocus().
  window.START_NOW_MUSCLE_MAP = {
    version: "data-v120",
    buildFocus
  };
})();