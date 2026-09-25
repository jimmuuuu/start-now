/* Original START/NOW routine prescriptions, shared by the new editor. */
(() => {
  const templates = {
    ppl: {
      name: "Push / Pull / Legs",
      days: ["Monday", "Wednesday", "Friday"],
      workouts: [
        [
          "Push Day",
          [
            [["Chest Press", "Machine Chest Press"], "Chest", 3, 8, 10],
            [
              ["Shoulder Press", "Machine Shoulder Press"],
              "Shoulders",
              3,
              8,
              10,
            ],
            [["Cable Fly", "Pec Deck Fly"], "Chest", 2, 10, 12],
            [
              ["Lateral Raise", "Machine Lateral Raise"],
              "Shoulders",
              3,
              10,
              15,
            ],
            [["Triceps Pushdown"], "Triceps", 3, 10, 12],
          ],
        ],
        [
          "Pull Day",
          [
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Seated Row", "Machine Row"], "Back", 3, 8, 10],
            [["Reverse Fly", "Machine Reverse Fly"], "Rear Delts", 3, 10, 15],
            [["Biceps Curl", "Preacher Curl Machine"], "Biceps", 3, 10, 12],
            [["Hammer Curl"], "Biceps", 2, 10, 12],
          ],
        ],
        [
          "Legs Day",
          [
            [["Leg Press"], "Legs", 3, 8, 12],
            [["Leg Curl", "Seated Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 3, 10, 12],
            [["Hip Abduction"], "Glutes", 2, 12, 15],
            [["Calf Raise", "Seated Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
      ],
    },
    upperLower: {
      name: "Upper / Lower",
      days: ["Monday", "Tuesday", "Thursday", "Friday"],
      workouts: [
        [
          "Upper A",
          [
            [["Chest Press"], "Chest", 3, 8, 10],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Shoulder Press"], "Shoulders", 3, 8, 10],
            [["Seated Row"], "Back", 3, 8, 10],
            [["Triceps Pushdown"], "Triceps", 2, 10, 12],
            [["Biceps Curl"], "Biceps", 2, 10, 12],
          ],
        ],
        [
          "Lower A",
          [
            [["Leg Press"], "Legs", 3, 8, 12],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 2, 10, 12],
            [["Hip Abduction"], "Glutes", 2, 12, 15],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
        [
          "Upper B",
          [
            [
              ["Incline Dumbbell Bench Press", "Incline Press"],
              "Chest",
              3,
              8,
              10,
            ],
            [["Seated Row"], "Back", 3, 8, 10],
            [["Lateral Raise"], "Shoulders", 3, 10, 15],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Triceps Pushdown"], "Triceps", 2, 10, 12],
            [["Hammer Curl"], "Biceps", 2, 10, 12],
          ],
        ],
        [
          "Lower B",
          [
            [["Hack Squat", "Leg Press"], "Quads", 3, 8, 12],
            [
              ["Dumbbell Romanian Deadlift", "Romanian Deadlift"],
              "Hamstrings",
              3,
              8,
              10,
            ],
            [["Leg Curl"], "Hamstrings", 2, 10, 12],
            [["Leg Extension"], "Quads", 2, 10, 12],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
      ],
    },
    fullBody: {
      name: "Full Body",
      days: ["Monday", "Wednesday", "Friday"],
      workouts: [
        [
          "Full Body A",
          [
            [["Leg Press"], "Legs", 3, 8, 12],
            [["Chest Press"], "Chest", 3, 8, 10],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Leg Curl"], "Hamstrings", 2, 10, 12],
            [["Lateral Raise"], "Shoulders", 2, 10, 15],
          ],
        ],
        [
          "Full Body B",
          [
            [["Hack Squat", "Leg Press"], "Quads", 3, 8, 12],
            [["Seated Row"], "Back", 3, 8, 10],
            [["Shoulder Press"], "Shoulders", 3, 8, 10],
            [["Hip Abduction"], "Glutes", 2, 12, 15],
            [["Biceps Curl"], "Biceps", 2, 10, 12],
          ],
        ],
        [
          "Full Body C",
          [
            [["Leg Press"], "Legs", 3, 8, 12],
            [
              ["Incline Dumbbell Bench Press", "Incline Press"],
              "Chest",
              3,
              8,
              10,
            ],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Leg Curl"], "Hamstrings", 2, 10, 12],
            [["Triceps Pushdown"], "Triceps", 2, 10, 12],
          ],
        ],
      ],
    },
    arnold: {
      name: "Arnold Split",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      workouts: [
        [
          "Chest & Back A",
          [
            [["Chest Press", "Smith Machine Bench Press"], "Chest", 3, 8, 10],
            [
              ["Incline Dumbbell Bench Press", "Incline Press"],
              "Chest",
              3,
              8,
              10,
            ],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Seated Row"], "Back", 3, 8, 10],
            [["Cable Fly"], "Chest", 2, 10, 12],
          ],
        ],
        [
          "Shoulders & Arms A",
          [
            [["Arnold Press", "Shoulder Press"], "Shoulders", 3, 8, 10],
            [["Lateral Raise"], "Shoulders", 3, 10, 15],
            [["Reverse Fly"], "Rear Delts", 2, 10, 15],
            [["Biceps Curl"], "Biceps", 3, 10, 12],
            [["Triceps Pushdown"], "Triceps", 3, 10, 12],
          ],
        ],
        [
          "Legs A",
          [
            [["Leg Press"], "Legs", 3, 8, 12],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 3, 10, 12],
            [["Hip Abduction"], "Glutes", 2, 12, 15],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
        [
          "Chest & Back B",
          [
            [
              ["Incline Dumbbell Bench Press", "Incline Press"],
              "Chest",
              3,
              8,
              10,
            ],
            [["Chest Press"], "Chest", 3, 8, 10],
            [["Seated Row"], "Back", 3, 8, 10],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Pec Deck Fly", "Cable Fly"], "Chest", 2, 10, 12],
          ],
        ],
        [
          "Shoulders & Arms B",
          [
            [["Shoulder Press"], "Shoulders", 3, 8, 10],
            [["Cable Lateral Raise", "Lateral Raise"], "Shoulders", 3, 10, 15],
            [["Face Pull", "Reverse Fly"], "Rear Delts", 2, 10, 15],
            [["Hammer Curl"], "Biceps", 3, 10, 12],
            [
              ["Overhead Cable Triceps Extension", "Triceps Pushdown"],
              "Triceps",
              3,
              10,
              12,
            ],
          ],
        ],
        [
          "Legs B",
          [
            [["Hack Squat", "Leg Press"], "Quads", 3, 8, 12],
            [
              ["Dumbbell Romanian Deadlift", "Romanian Deadlift"],
              "Hamstrings",
              3,
              8,
              10,
            ],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 2, 10, 12],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
      ],
    },
  };

  const splits = {
    fullBody: templates.fullBody,
    upperLower: templates.upperLower,
    ppl: {
      name: "Push / Pull / Legs",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      workouts: [
        [
          "Push",
          [
            [["Chest Press"], "Chest", 3, 8, 10],
            [["Shoulder Press"], "Shoulders", 3, 8, 10],
            [["Cable Fly"], "Chest", 2, 10, 12],
            [["Lateral Raise"], "Shoulders", 3, 10, 15],
            [["Triceps Pushdown"], "Triceps", 3, 10, 12],
          ],
        ],
        [
          "Pull",
          [
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Seated Row"], "Back", 3, 8, 10],
            [["Reverse Fly"], "Rear Delts", 3, 10, 15],
            [["Biceps Curl"], "Biceps", 3, 10, 12],
            [["Hammer Curl"], "Biceps", 2, 10, 12],
          ],
        ],
        [
          "Legs",
          [
            [["Leg Press"], "Legs", 3, 8, 12],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 3, 10, 12],
            [["Hip Abduction"], "Glutes", 2, 12, 15],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
        [
          "Push B",
          [
            [["Incline Press"], "Chest", 3, 8, 10],
            [["Shoulder Press"], "Shoulders", 3, 8, 10],
            [["Lateral Raise"], "Shoulders", 3, 10, 15],
            [["Cable Fly"], "Chest", 2, 10, 12],
            [["Triceps Pushdown"], "Triceps", 3, 10, 12],
          ],
        ],
        [
          "Pull B",
          [
            [["Seated Row"], "Back", 3, 8, 10],
            [["Lat Pulldown"], "Back", 3, 8, 10],
            [["Reverse Fly"], "Rear Delts", 2, 10, 15],
            [["Hammer Curl"], "Biceps", 3, 10, 12],
            [["Biceps Curl"], "Biceps", 2, 10, 12],
          ],
        ],
        [
          "Legs B",
          [
            [["Hack Squat"], "Quads", 3, 8, 10],
            [["Romanian Deadlift"], "Hamstrings", 3, 8, 10],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 2, 10, 12],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
      ],
    },
    broSplit: {
      name: "Bro Split",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workouts: [
        [
          "Chest",
          [
            [["Chest Press"], "Chest", 4, 8, 10],
            [["Incline Press"], "Chest", 3, 8, 10],
            [["Cable Fly"], "Chest", 3, 10, 12],
          ],
        ],
        [
          "Back",
          [
            [["Lat Pulldown"], "Back", 4, 8, 10],
            [["Seated Row"], "Back", 4, 8, 10],
            [["Reverse Fly"], "Rear Delts", 3, 10, 15],
          ],
        ],
        [
          "Shoulders",
          [
            [["Shoulder Press"], "Shoulders", 4, 8, 10],
            [["Lateral Raise"], "Shoulders", 4, 10, 15],
            [["Reverse Fly"], "Rear Delts", 3, 10, 15],
          ],
        ],
        [
          "Arms",
          [
            [["Biceps Curl"], "Biceps", 4, 10, 12],
            [["Hammer Curl"], "Biceps", 3, 10, 12],
            [["Triceps Pushdown"], "Triceps", 4, 10, 12],
          ],
        ],
        [
          "Legs",
          [
            [["Leg Press"], "Legs", 4, 8, 12],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Leg Extension"], "Quads", 3, 10, 12],
            [["Calf Raise"], "Calves", 3, 12, 15],
          ],
        ],
      ],
    },
    phul: {
      name: "PHUL",
      days: ["Monday", "Tuesday", "Thursday", "Friday"],
      workouts: [
        [
          "Upper Power",
          [
            [["Chest Press"], "Chest", 4, 5, 8],
            [["Lat Pulldown"], "Back", 4, 5, 8],
            [["Shoulder Press"], "Shoulders", 3, 6, 8],
            [["Seated Row"], "Back", 3, 6, 8],
          ],
        ],
        [
          "Lower Power",
          [
            [["Leg Press"], "Legs", 4, 5, 8],
            [["Leg Curl"], "Hamstrings", 4, 6, 8],
            [["Leg Extension"], "Quads", 3, 6, 8],
            [["Calf Raise"], "Calves", 4, 8, 10],
          ],
        ],
        [
          "Upper Hypertrophy",
          [
            [["Incline Press"], "Chest", 3, 10, 12],
            [["Seated Row"], "Back", 3, 10, 12],
            [["Lateral Raise"], "Shoulders", 3, 12, 15],
            [["Biceps Curl"], "Biceps", 3, 10, 12],
            [["Triceps Pushdown"], "Triceps", 3, 10, 12],
          ],
        ],
        [
          "Lower Hypertrophy",
          [
            [["Hack Squat"], "Quads", 3, 10, 12],
            [["Leg Curl"], "Hamstrings", 3, 10, 12],
            [["Hip Abduction"], "Glutes", 3, 12, 15],
            [["Leg Extension"], "Quads", 3, 12, 15],
            [["Calf Raise"], "Calves", 4, 12, 15],
          ],
        ],
      ],
    },
  };

  window.START_NOW_ROUTINES = { templates, splits };
})();
