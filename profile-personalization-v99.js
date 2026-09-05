// START/NOW v137 - editable training level and a persistent profile photo.
(() => {
  const SN = window.SN36;
  if (!SN || typeof window.renderProfile !== "function") return;

  const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
  const PHOTO_SIZE = 320;

  const levels = {
    Beginner: { sets: 2, reps: 10, label: "2 sets x 8-12 reps" },
    Intermediate: { sets: 3, reps: 10, label: "3 sets x 8-12 reps" },
    Advanced: { sets: 4, reps: 8, label: "4 sets x 6-10 reps" }
  };

  function profile() {
    return {
      experience: "Beginner",
      goal: "Build muscle",
      days: ["Monday", "Wednesday", "Friday"],
      location: "Gym",
      duration: 45,
      avoid: "",
      ...(SN.profile?.() || {})
    };
  }

  function installStyles() {
    if (document.getElementById("snProfilePersonalizationStyles")) return;
    const style = document.createElement("style");
    style.id = "snProfilePersonalizationStyles";
    style.textContent = `
      .avatar.sn-has-photo,.profile-avatar.sn-has-photo{background-size:cover!important;background-position:center!important;color:transparent!important}
      .profile-avatar.sn-profile-photo-trigger{box-sizing:border-box;border:2px solid transparent;cursor:pointer;transition:border-color .16s ease,transform .16s ease}
      .profile-avatar.sn-profile-photo-trigger:hover{border-color:rgba(255,90,95,.5)}
      .profile-avatar.sn-profile-photo-trigger:active{transform:scale(.98)}
      .profile-avatar.sn-profile-photo-trigger:focus-visible{outline:3px solid rgba(255,90,95,.28);outline-offset:3px}
      .sn-profile-photo-action{display:inline-flex;align-items:center;justify-content:center;min-height:38px;margin:8px 0 4px;padding:0 14px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text);font:inherit;font-size:12px;font-weight:800;cursor:pointer}
      .sn-profile-photo-action:hover{border-color:rgba(255,90,95,.5)}.sn-profile-photo-action:disabled{opacity:.55;cursor:wait}
      .sn-profile-level{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;box-sizing:border-box;margin-top:12px;padding:15px 0;border:0;border-top:1px solid var(--line);appearance:none;background:transparent;color:var(--text);font:inherit;text-align:left;cursor:pointer}
      .sn-profile-level span{display:grid;gap:3px}.sn-profile-level small{color:var(--muted);font-size:12px}.sn-profile-level b{color:#ff5a5f;font-size:13px}
      .sn-level-modal{position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(8,10,13,.68);backdrop-filter:blur(5px)}
      .sn-level-sheet{width:min(100%,430px);box-sizing:border-box;padding:22px;border:1px solid var(--line);border-radius:8px;background:var(--surface);box-shadow:0 24px 80px rgba(0,0,0,.32)}
      .sn-level-sheet header{display:flex;align-items:start;justify-content:space-between;gap:12px}.sn-level-sheet h2{margin:3px 0 0;font-size:24px}.sn-level-sheet header span{color:var(--muted);font-size:11px;font-weight:800}.sn-level-close{width:36px;height:36px;border:1px solid var(--line);border-radius:8px;background:transparent;color:var(--text);font:inherit;font-size:22px;cursor:pointer}
      .sn-level-field{display:grid;gap:7px;margin-top:20px;text-align:left}.sn-level-field span{font-size:12px;font-weight:800}.sn-level-field select{min-height:48px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text);font:inherit}
      .sn-level-summary{margin:12px 0 0;color:var(--muted);font-size:13px;line-height:1.45}.sn-level-check{display:flex;align-items:flex-start;gap:9px;margin:20px 0;color:var(--text);font-size:13px;line-height:1.35;text-align:left}.sn-level-check input{margin-top:2px;accent-color:#ff5a5f}
      .sn-level-save{width:100%;min-height:50px;border:0;border-radius:8px;background:#ff5a5f;color:white;font:inherit;font-size:15px;font-weight:900;cursor:pointer}
    `;
    document.head.appendChild(style);
  }

  function applyPhoto() {
    const photo = profile().photo;
    document.querySelectorAll(".avatar, .profile-avatar").forEach(node => {
      if (photo) {
        node.style.backgroundImage = `url("${photo}")`;
        node.classList.add("sn-has-photo");
      } else {
        node.style.removeProperty("background-image");
        node.classList.remove("sn-has-photo");
      }
    });
    const profileAvatar = document.querySelector(".profile-avatar");
    profileAvatar?.setAttribute("aria-label", photo ? "Change profile photo" : "Add profile photo");
    document.querySelectorAll(".sn-profile-photo-action").forEach(button => {
      if (!button.disabled) button.textContent = photo ? "Change photo" : "Add photo";
    });
  }

  function setPhotoBusy(busy) {
    const button = document.querySelector(".sn-profile-photo-action");
    const avatar = document.querySelector(".profile-avatar");
    if (button) {
      button.disabled = busy;
      button.textContent = busy ? "Updating..." : (profile().photo ? "Change photo" : "Add photo");
    }
    avatar?.setAttribute("aria-busy", String(busy));
  }

  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => resolve(event.target.result);
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    });
  }

  function decodePhoto(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("decode-failed"));
      image.src = source;
    });
  }

  function updateCurrentPlan(level) {
    const prescription = levels[level];
    if (!prescription) return 0;
    let changed = 0;
    const tune = workout => {
      if (!(workout.days || []).length) return workout;
      changed++;
      return {
        ...workout,
        exercises: (workout.exercises || []).map(exercise => ({
          ...exercise,
          sets: prescription.sets,
          reps: prescription.reps,
          repMin: level === "Advanced" ? 6 : 8,
          repMax: level === "Advanced" ? 10 : 12
        }))
      };
    };

    state.customWorkouts = (state.customWorkouts || []).map(tune);
    (defaultWorkout.exercises || []).forEach(exercise => {
      exercise.sets = prescription.sets;
      exercise.reps = prescription.reps;
      exercise.repMin = level === "Advanced" ? 6 : 8;
      exercise.repMax = level === "Advanced" ? 10 : 12;
    });
    saveCustomWorkouts();
    return changed;
  }

  function closeModal() {
    document.getElementById("snLevelModal")?.remove();
  }

  function openLevelModal() {
    closeModal();
    const current = profile();
    const modal = document.createElement("div");
    modal.className = "sn-level-modal";
    modal.id = "snLevelModal";
    modal.innerHTML = `
      <section class="sn-level-sheet" role="dialog" aria-modal="true" aria-labelledby="snLevelTitle">
        <header><div><span>TRAINING PROFILE</span><h2 id="snLevelTitle">Training level</h2></div><button class="sn-level-close" type="button" aria-label="Close">x</button></header>
        <label class="sn-level-field"><span>Experience</span><select id="snLevelSelect"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <p class="sn-level-summary" id="snLevelSummary"></p>
        <label class="sn-level-check"><input id="snLevelApplyPlan" type="checkbox" checked><span>Update my current scheduled workouts to match this level.</span></label>
        <button class="sn-level-save" id="snLevelSave" type="button">Save training level</button>
      </section>
    `;
    document.body.appendChild(modal);

    const select = modal.querySelector("#snLevelSelect");
    const summary = modal.querySelector("#snLevelSummary");
    select.value = levels[current.experience] ? current.experience : "Beginner";
    const describe = () => {
      summary.textContent = `${select.value} training uses ${levels[select.value].label} across your scheduled workouts.`;
    };
    describe();
    select.addEventListener("change", describe);
    modal.querySelector(".sn-level-close").addEventListener("click", closeModal);
    modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
    modal.querySelector("#snLevelSave").addEventListener("click", () => {
      const level = select.value;
      const next = { ...current, experience: level };
      if (!SN.saveProfile(next)) return;
      const updated = modal.querySelector("#snLevelApplyPlan").checked ? updateCurrentPlan(level) : 0;
      closeModal();
      render();
      showToast(updated ? `${level} level saved. ${updated} scheduled workout${updated === 1 ? "" : "s"} updated.` : `${level} level saved.`);
    });
  }

  async function savePhoto(file) {
    if (!file) return;
    const looksLikeImage = file.type?.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name || "");
    if (!looksLikeImage) {
      showToast("Choose an image file");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showToast("Choose an image smaller than 15 MB");
      return;
    }

    setPhotoBusy(true);
    try {
      const source = await readPhoto(file);
      const image = await decodePhoto(source);
      const scale = Math.max(PHOTO_SIZE / image.width, PHOTO_SIZE / image.height);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas-unavailable");
      context.drawImage(
        image,
        Math.round((PHOTO_SIZE - width) / 2),
        Math.round((PHOTO_SIZE - height) / 2),
        width,
        height
      );

      const next = {
        ...profile(),
        photo: canvas.toDataURL("image/jpeg", 0.82),
        photoUpdatedAt: Date.now()
      };
      if (!SN.saveProfile(next)) throw new Error("save-failed");
      applyPhoto();
      showToast("Profile photo updated");
      Promise.resolve(window.SN_AUTH?.syncNow?.()).catch(error => {
        console.warn("Level Up Fitness profile photo cloud sync deferred", error);
      });
    } catch (error) {
      console.error("Level Up Fitness profile photo update failed", error);
      showToast(error?.message === "decode-failed" ? "Choose a JPEG, PNG, or WebP image" : "Couldn’t update the profile photo");
    } finally {
      setPhotoBusy(false);
    }
  }

  function addProfileControls() {
    installStyles();
    const card = document.querySelector(".profile-card");
    if (!card) return;

    const avatar = card.querySelector(".profile-avatar");
    if (avatar && !card.querySelector("#snProfilePhotoInput")) {
      const photoInput = document.createElement("input");
      photoInput.id = "snProfilePhotoInput";
      photoInput.type = "file";
      photoInput.accept = "image/*";
      photoInput.hidden = true;
      const photoButton = document.createElement("button");
      photoButton.className = "sn-profile-photo-action";
      photoButton.type = "button";
      photoButton.textContent = profile().photo ? "Change photo" : "Add photo";
      avatar.insertAdjacentElement("afterend", photoButton);
      photoButton.insertAdjacentElement("afterend", photoInput);
      const choosePhoto = () => { if (!photoButton.disabled) photoInput.click(); };
      avatar.classList.add("sn-profile-photo-trigger");
      avatar.setAttribute("role", "button");
      avatar.setAttribute("tabindex", "0");
      avatar.setAttribute("aria-label", profile().photo ? "Change profile photo" : "Add profile photo");
      avatar.addEventListener("click", choosePhoto);
      avatar.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        choosePhoto();
      });
      photoButton.addEventListener("click", choosePhoto);
      photoInput.addEventListener("change", async event => {
        await savePhoto(event.target.files?.[0]);
        event.target.value = "";
      });
    }

    if (!card.querySelector("#snProfileLevel")) {
      const current = profile();
      const level = document.createElement("button");
      level.id = "snProfileLevel";
      level.className = "sn-profile-level";
      level.type = "button";
      level.innerHTML = `<span><strong>Training level</strong><small>${escapeHtml(current.experience)}</small></span><b>Change</b>`;
      const marker = card.querySelector(".toggle-row");
      if (marker) marker.insertAdjacentElement("beforebegin", level);
      else card.appendChild(level);
      level.addEventListener("click", openLevelModal);
    }
    applyPhoto();
  }

  const priorProfile = window.renderProfile;
  window.renderProfile = function (...args) {
    const result = priorProfile.apply(this, args);
    addProfileControls();
    return result;
  };

  if (typeof window.render === "function") {
    const priorRender = window.render;
    window.render = function (...args) {
      const result = priorRender.apply(this, args);
      applyPhoto();
      return result;
    };
  }

  installStyles();
  applyPhoto();
})();
