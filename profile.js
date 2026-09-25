/* Profile and preferences use the same form and sheet primitives as training. */
(() => {
  const SN = SN36,
    U = UI,
    { esc, icon, button, iconButton, header, section, menu } = U;
  const profile = () => ({
    displayName: "",
    experience: "Beginner",
    goal: "Build muscle",
    days: ["Monday", "Wednesday", "Friday"],
    location: "Gym",
    duration: 45,
    avoid: "",
    ...SN.profile(),
  });
  function renderProfile() {
    const p = profile(),
      name =
        p.displayName ||
        p.name ||
        window.SN_CLOUD_USER?.user_metadata?.display_name ||
        "Your profile",
      stats = SN.summary(),
      grade = SN.overallGrade();
    app.innerHTML =
      header("Profile", iconButton("settings", "Settings", "go", "settings")) +
      '<section class="profile-identity"><button class="profile-picture" ' +
      U.attr("editProfile") +
      ' aria-label="Edit profile">' +
      (p.photo
        ? '<img src="' + esc(p.photo) + '" alt="Your profile photo">'
        : esc(
            name === "Your profile"
              ? "ME"
              : name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join("")
                  .toUpperCase(),
          )) +
      "</button><div><h2>" +
      esc(name) +
      '</h2><p class="meta">' +
      esc(p.experience) +
      " · " +
      esc(p.goal) +
      "</p>" +
      button("Edit profile", "editProfile", "", "text-btn") +
      "</div></section>" +
      '<div class="profile-stats"><div><strong>' +
      stats.workouts +
      "</strong><small>Workouts</small></div><div><strong>" +
      stats.streaks.current +
      "</strong><small>Current streak</small></div><div><strong>" +
      stats.streaks.longest +
      "</strong><small>Best streak</small></div></div>" +
      section(
        "Training",
        menu(
          "Training preferences",
          p.experience + " · " + p.location + " · " + p.duration + " min",
          "settings",
          "preferences",
        ) +
          menu(
            "Weekly schedule",
            SN.scheduleDays().size +
              (SN.scheduleDays().size === 1
                ? " training day"
                : " training days"),
            "calendar",
            "schedule",
          ) +
          menu(
            "Training grade",
            grade
              ? grade.letter + " · " + grade.score + "/100"
              : "Log a workout to earn your first grade",
            "award",
            "grade",
          ),
      ) +
      '<section class="section" id="accountSection"></section><div class="sn-legal-links"><a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="support.html" target="_blank" rel="noopener">Support</a></div>';
    window.SN_AUTH?.renderAccount?.();
  }
  function settings() {
    const prefs = SN.restPrefs();
    app.innerHTML =
      header("Settings", "", true) +
      '<label class="menu-row"><span><strong>Dark appearance</strong><small>Use a dark background throughout the app</small></span><input id="darkMode" type="checkbox" ' +
      (state.dark ? "checked" : "") +
      "></label>" +
      '<label class="menu-row"><span><strong>Automatic rest timer</strong><small>Start after completing a set</small></span><input id="autoRestSetting" type="checkbox" ' +
      (prefs.autoStart ? "checked" : "") +
      "></label>" +
      '<label class="menu-row"><span><strong>Default rest</strong></span><select id="defaultRest">' +
      [30, 45, 60, 90, 120, 180, 240, 300]
        .map(
          (n) =>
            '<option value="' +
            n +
            '" ' +
            (prefs.seconds === n ? "selected" : "") +
            ">" +
            n +
            " seconds</option>",
        )
        .join("") +
      "</select></label>" +
      menu(
        "Install START/NOW",
        "Add to your Home Screen",
        "plus",
        "installApp",
      ) +
      menu(
        "Cloud backup",
        "Account and sync settings",
        "cloud",
        "go",
        "profile",
      ) +
      '<div class="section"><p class="meta">START/NOW · Web app</p><p class="meta">Weights are logged in pounds (lb).</p></div>';
    document.getElementById("darkMode").onchange = (e) => {
      state.dark = e.target.checked;
      localStorage.setItem("sn_dark", String(state.dark));
      document.documentElement.classList.toggle("dark", state.dark);
      document.querySelector('meta[name="theme-color"]').content = state.dark
        ? "#121418"
        : "#ffffff";
    };
    const save = () => {
      SN.saveRestPrefs({
        autoStart: document.getElementById("autoRestSetting").checked,
        seconds: +document.getElementById("defaultRest").value,
      });
      showToast("Rest preferences saved.");
    };
    document.getElementById("autoRestSetting").onchange = save;
    document.getElementById("defaultRest").onchange = save;
  }
  function preferences() {
    const p = profile();
    const select = (label, id, values, value) =>
      '<label class="field">' +
      label +
      '<select id="' +
      id +
      '" aria-label="' +
      esc(label) +
      '">' +
      values
        .map(
          (v) =>
            "<option " +
            (String(v) === String(value) ? "selected" : "") +
            ">" +
            esc(v) +
            "</option>",
        )
        .join("") +
      "</select></label>";
    const m = U.sheet(
      "Training preferences",
      select(
        "Training level",
        "prefLevel",
        ["Beginner", "Intermediate", "Advanced"],
        p.experience,
      ) +
        select(
          "Goal",
          "prefGoal",
          ["Build muscle", "Get stronger", "General fitness", "Learn the gym"],
          p.goal,
        ) +
        select(
          "Location",
          "prefLocation",
          ["Gym", "Mostly machines", "Home"],
          p.location,
        ) +
        select(
          "Workout length · minutes",
          "prefDuration",
          [15, 30, 45, 60],
          p.duration,
        ) +
        '<label class="field">Exercises to avoid<input id="prefAvoid" maxlength="300" value="' +
        esc(p.avoid) +
        '" placeholder="e.g. barbell squat"><span class="field-help">Separate exercise names with commas.</span></label><label class="menu-row"><span><strong>Adjust saved routines to this level</strong><small>Beginner: 2–3 sets · Intermediate: 3 · Advanced: 4</small></span><input id="applyLevel" type="checkbox"></label>',
      {
        footer:
          '<button id="preferencesSave" class="btn primary full">Save preferences</button>',
      },
    );
    m.querySelector("#preferencesSave").onclick = () => {
      const next = {
        ...p,
        experience: m.querySelector("#prefLevel").value,
        goal: m.querySelector("#prefGoal").value,
        location: m.querySelector("#prefLocation").value,
        duration: +m.querySelector("#prefDuration").value,
        avoid: m.querySelector("#prefAvoid").value.trim(),
      };
      next.profileUpdatedAt = Date.now();
      if (!SN.saveProfile(next)) return;
      if (m.querySelector("#applyLevel").checked)
        SN.saveWorkouts(
          SN.workouts().map((w) => ({
            ...w,
            updatedAt: Date.now(),
            exercises: w.exercises.map((e) => ({
              ...e,
              sets:
                next.experience === "Advanced"
                  ? 4
                  : next.experience === "Intermediate"
                    ? 3
                    : Math.min(e.sets, 3),
            })),
          })),
        );
      U.closeSheet();
      U.render();
      showToast("Preferences saved.");
      window.SN_AUTH?.syncNow?.({ silent: true });
    };
  }
  function editProfile() {
    const p = profile(),
      m = U.sheet(
        "Edit profile",
        '<label class="field">Display name<input id="profileName" maxlength="80" autocomplete="name" value="' +
          esc(p.displayName || p.name || "") +
          '"></label><label class="field">Profile photo<input id="profilePhoto" aria-label="Profile photo" type="file" accept="image/jpeg,image/png,image/webp"><span class="field-help">JPEG, PNG, or WebP · up to 15 MB</span></label>' +
          (p.photo
            ? '<button class="text-btn danger" id="removePhoto">Remove photo</button>'
            : "") +
          '<p class="error-note" id="profileError" role="alert"></p>',
        {
          footer:
            '<button id="profileSave" class="btn primary full">Save profile</button>',
        },
      );
    let photo = p.photo,
      photoChanged = false;
    m.querySelector("#removePhoto")?.addEventListener("click", () => {
      photo = null;
      photoChanged = true;
      m.querySelector("#removePhoto").textContent = "Photo removed";
    });
    m.querySelector("#profileSave").onclick = async () => {
      const save = m.querySelector("#profileSave"),
        error = m.querySelector("#profileError"),
        file = m.querySelector("#profilePhoto").files[0];
      save.disabled = true;
      save.textContent = "Saving…";
      error.textContent = "";
      try {
        if (file) {
          if (
            !/^image\/(jpeg|png|webp)$/.test(file.type) ||
            file.size > 15 * 1024 * 1024
          )
            throw new Error(
              "Choose a JPEG, PNG, or WebP image smaller than 15 MB.",
            );
          const src = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = () => reject(new Error("Couldn’t read this photo."));
            r.readAsDataURL(file);
          });
          const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error("Couldn’t open this photo. Try another image."));
            img.src = src;
          });
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 256;
          const scale = Math.max(256 / image.width, 256 / image.height);
          canvas
            .getContext("2d")
            .drawImage(
              image,
              (256 - image.width * scale) / 2,
              (256 - image.height * scale) / 2,
              image.width * scale,
              image.height * scale,
            );
          photo = canvas.toDataURL("image/jpeg", 0.82);
          photoChanged = true;
        }
        const next = {
          ...p,
          displayName: m.querySelector("#profileName").value.trim(),
          photo: photo || undefined,
          ...(photoChanged ? { photoUpdatedAt: Date.now() } : {}),
        };
        next.profileUpdatedAt = Date.now();
        if (!SN.saveProfile(next))
          throw new Error("Couldn’t save. Check your device storage.");
        U.closeSheet();
        renderProfile();
        showToast("Profile saved.");
        window.SN_AUTH?.syncNow?.({ silent: true });
      } catch (e) {
        error.textContent = e.message;
      } finally {
        save.disabled = false;
        save.textContent = "Save profile";
      }
    };
  }
  Object.assign(U.actions, {
    editProfile,
    preferences,
    grade: () => {
      const g = SN.overallGrade();
      U.sheet(
        "Training grade",
        g
          ? '<div class="metric-pair"><div><strong>' +
              esc(g.letter) +
              "</strong><small>" +
              g.score +
              ' / 100</small></div></div><p class="sheet-copy">Your recent workout quality is ' +
              g.quality +
              "%. Your 30-day schedule adherence is " +
              g.adherence +
              "%. Recent workouts carry more weight.</p>"
          : '<p class="sheet-copy">Complete a workout to build your training grade. It reflects completion, rep targets, and consistency.</p>',
      );
    },
    installApp: () => window.START_NOW_PWA?.install(),
    signOut: async () => {
      if (
        await U.confirm(
          "Sign out?",
          "Your latest changes will be backed up before this account is removed from this device.",
          "Sign out",
        )
      ) {
        showToast("Backing up your changes…");
        await SN_AUTH.signOut();
      }
    },
  });
  U.routes.profile = renderProfile;
  U.routes.settings = settings;
  window.renderProfile = renderProfile;
  SN.openPreferences = preferences;
})();
