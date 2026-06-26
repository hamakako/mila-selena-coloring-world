import { ColoringBoard } from "./coloring.js?v=20260626-girlvoice1";
import { levels } from "./levels.js?v=20260626-girlvoice1";
import {
  addGalleryItem,
  clearAllProgress,
  completeLevel,
  deleteGalleryItem,
  loadState,
  saveState,
  setPlayer,
  setVoiceOn,
} from "./storage.js?v=20260626-girlvoice1";
import {
  enableVoiceAfterStart,
  playReaction,
  setReactionTarget,
  setSubtitleTarget,
  speak,
  stopVoice,
} from "./voice.js?v=20260626-girlvoice1";

const players = {
  mila: {
    id: "mila",
    name: "Mila",
    photo: "./assets/characters/mila/profile.jpg",
    color: "#74c7ff",
  },
  selena: {
    id: "selena",
    name: "Selena",
    photo: "./assets/characters/selena/profile.jpg",
    color: "#ff6fae",
  },
};

const palette = [
  "#ff6fae",
  "#ff9f6e",
  "#ffd166",
  "#9be564",
  "#61d394",
  "#72ddf7",
  "#74c7ff",
  "#a78bfa",
  "#f7a8ff",
  "#8d6e63",
  "#ffffff",
  "#222222",
];

const iconPaths = {
  fill: '<path d="M15 4 5 14l5 5 10-10-5-5Z"/><path d="M5 14h15"/><path d="M18 15c2 2 3 3.4 3 4.5a3 3 0 0 1-6 0c0-1.1 1-2.5 3-4.5Z"/>',
  brush: '<path d="M14 4c2-2 6 2 4 4l-7 7-4-4 7-7Z"/><path d="M7 11c-3 2-4 5-3 8 3 1 6 0 8-3"/><path d="M4 19c2 0 3-1 4-3"/>',
  eraser: '<path d="M4 15 13 6a3 3 0 0 1 4 0l3 3a3 3 0 0 1 0 4l-7 7H7l-3-3a1.5 1.5 0 0 1 0-2Z"/><path d="M10 9l7 7"/>',
  undo: '<path d="M9 7H4v5"/><path d="M4 12c3-5 12-6 16 1 2 4-1 8-6 8"/>',
  redo: '<path d="M15 7h5v5"/><path d="M20 12c-3-5-12-6-16 1-2 4 1 8 6 8"/>',
  clear: '<path d="M8 7h8"/><path d="M10 7V5h4v2"/><path d="M7 9h10l-1 11H8L7 9Z"/><path d="M10 12v5M14 12v5"/>',
  map: '<path d="M5 6l5-2 4 2 5-2v14l-5 2-4-2-5 2V6Z"/><path d="M10 4v14M14 6v14"/>',
  save: '<path d="M6 4h10l2 2v14H6V4Z"/><path d="M9 4v6h6V4"/><path d="M9 17h6"/>',
  finish: '<path d="M20 6 9 17l-5-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6"/>',
  palette: '<path d="M12 4a8 8 0 0 0 0 16h1.5a2 2 0 0 0 1.4-3.4 1.7 1.7 0 0 1 1.2-2.9H18a2 2 0 0 0 2-2A7.7 7.7 0 0 0 12 4Z"/><circle cx="8.5" cy="11" r="1"/><circle cx="11" cy="8" r="1"/><circle cx="14.5" cy="9" r="1"/>',
  gallery: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 17l5-5 4 4 2-2 5 5"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M7 10v10h10V10"/><path d="M10 20v-6h4v6"/>',
  next: '<path d="M8 5l7 7-7 7"/><path d="M15 5v14"/>',
  lock: '<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
  open: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
};

function icon(name) {
  return `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]}</svg>`;
}

function iconOnly(name, label) {
  return `${icon(name)}<span class="sr-only">${label}</span>`;
}

function sizeIcon(size, label) {
  return `<span class="size-dot size-dot-${size}" aria-hidden="true"></span><span class="sr-only">${label}</span>`;
}

function ratingStars(stars, className = "") {
  const rating = Math.min(3, Math.max(0, Number(stars) || 0));
  return `<span class="star-rating ${className}" aria-label="${rating} out of 3 stars">
    ${[1, 2, 3]
      .map((index) => `<span class="star ${index <= rating ? "is-filled" : ""}">${icon("star")}</span>`)
      .join("")}
  </span>`;
}

export function createGame(root) {
  let state = loadState();
  let currentBoard = null;
  let selectedColor = players[state.player]?.color || "#74c7ff";

  const render = (view) => {
    stopVoice();
    currentBoard?.destroy();
    currentBoard = null;
    root.innerHTML = appFrame(view);
    setSubtitleTarget(root.querySelector("[data-subtitles]"));
    setReactionTarget(root.querySelector("[data-reaction]"));
    bindChrome();
  };

  const bindChrome = () => {
    root.querySelectorAll("[data-action='home']").forEach((button) => {
      button.addEventListener("click", () => renderLevelMap());
    });
    root.querySelectorAll("[data-action='gallery']").forEach((button) => {
      button.addEventListener("click", () => renderGallery());
    });
    root.querySelectorAll("[data-action='voice']").forEach((button) => {
      button.addEventListener("click", () => {
        state = setVoiceOn(state, !state.voiceOn);
        root.querySelectorAll("[data-action='voice']").forEach((voiceButton) => {
          voiceButton.textContent = state.voiceOn ? "Sound On" : "Sound Off";
          voiceButton.setAttribute("aria-pressed", String(state.voiceOn));
        });
        speak(state.voiceOn ? "Sound on!" : "Quiet mode.", state.voiceOn, {
          reaction: state.voiceOn ? "great" : "tap",
          girlSound: state.voiceOn ? "sound_on" : null,
        });
      });
    });
  };

  const playerName = () => players[state.player]?.name || "artist";

  const appFrame = (content) => `
    <div class="background-dots" aria-hidden="true"></div>
    <header class="topbar">
      <button class="icon-button" type="button" data-action="home" aria-label="Home">Home</button>
      <div>
        <p class="eyebrow">Safe kids coloring game</p>
        <h1>Mila & Selena Coloring World</h1>
      </div>
      <div class="topbar-actions">
        <button class="icon-button" type="button" data-action="gallery">Gallery</button>
        <button class="icon-button" type="button" data-action="voice" aria-pressed="${state.voiceOn}">
          ${state.voiceOn ? "Sound On" : "Sound Off"}
        </button>
      </div>
    </header>
    <main>${content}</main>
    <div class="reaction-pop" data-reaction aria-hidden="true"></div>
    <div class="subtitles" data-subtitles aria-live="polite"></div>
  `;

  const renderWelcome = () => {
    render(`
      <section class="hero-screen">
        <div class="cloud cloud-one"></div>
        <div class="cloud cloud-two"></div>
        <div class="hero-copy">
          <p class="eyebrow">50 happy coloring pages</p>
          <h2>Mila & Selena Coloring World</h2>
          <p>Pick a player, choose a picture, and color with big friendly tools.</p>
          <div class="hero-actions">
            <button class="primary-button big-button" type="button" data-start>Start</button>
            <button class="secondary-button big-button" type="button" data-action="voice" aria-pressed="${state.voiceOn}">
              ${state.voiceOn ? "Sound On" : "Sound Off"}
            </button>
          </div>
        </div>
        <div class="floating-stars" aria-hidden="true">* * *</div>
      </section>
    `);
    root.querySelector("[data-start]").addEventListener("click", () => {
      enableVoiceAfterStart();
      renderPlayerSelect();
      speak("Hi! Let us color together.", state.voiceOn, {
        reaction: "great",
        girlSound: "lets_color",
      });
    });
  };

  const renderPlayerSelect = () => {
    render(`
      <section class="panel player-screen">
        <h2>Who is playing today?</h2>
        <div class="player-grid">
          ${Object.values(players)
            .map(
              (player) => `
                <button class="player-card" type="button" data-player="${player.id}">
                  <img src="${player.photo}" alt="${player.name}" />
                  <span>${player.name}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>
    `);
    root.querySelectorAll("[data-player]").forEach((button) => {
      button.addEventListener("click", () => {
        const player = players[button.dataset.player];
        state = setPlayer(state, player.id);
        selectedColor = player.color;
        renderLevelMap();
        speak(`Hi, ${player.name}! Pick a picture.`, state.voiceOn, {
          reaction: "great",
          girlSound: "pick_picture",
        });
      });
    });
  };

  const renderLevelMap = () => {
    if (!state.player) {
      renderPlayerSelect();
      return;
    }
    const levelStars = state.levelStars || {};
    const completedCount = Object.keys(levelStars).length || state.completedLevels.length;
    render(`
      <section class="panel map-screen">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Hello, ${playerName()}</p>
            <h2>Choose a coloring page</h2>
          </div>
          <div class="progress-pill">${completedCount} / 50 completed</div>
        </div>
        <div class="map-actions">
          <button class="secondary-button" type="button" data-change-player>Change Player</button>
          <button class="secondary-button" type="button" data-reset>Reset Progress</button>
        </div>
        <div class="level-grid">
          ${levels
            .map((level) => {
              const locked = level.id > state.unlockedLevel;
              const completed = state.completedLevels.includes(level.id);
              const stars = Number(levelStars[String(level.id)]) || (completed ? 1 : 0);
              return `
                <button class="level-tile ${locked ? "is-locked" : ""} ${completed ? "is-complete" : ""}"
                  type="button"
                  data-level="${level.id}"
                  ${locked ? "disabled" : ""}
                  aria-label="${locked ? "Locked" : "Open"} level ${level.id}, ${level.title}">
                  <span class="level-number">${level.id}</span>
                  <span class="level-title">${level.title}</span>
                  <span class="level-state">${
                    locked ? icon("lock") : stars ? ratingStars(stars, "mini") : icon("open")
                  }</span>
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `);
    root.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", () => renderColoring(Number(button.dataset.level)));
    });
    root.querySelector("[data-change-player]").addEventListener("click", renderPlayerSelect);
    root.querySelector("[data-reset]").addEventListener("click", () => {
      if (window.confirm("Start fresh and clear local progress?")) {
        state = clearAllProgress();
        saveState(state);
        renderWelcome();
      }
    });
  };

  const renderColoring = async (levelId, savedArtwork = null) => {
    const level = levels.find((item) => item.id === levelId);
    if (!level) {
      renderLevelMap();
      return;
    }
    render(`
      <section class="coloring-screen">
        <div class="coloring-heading">
          <div>
            <p class="eyebrow">Level ${level.id} of 50</p>
            <h2>${level.title}</h2>
          </div>
          <div class="coloring-actions">
            <button class="secondary-button icon-action" type="button" data-action="home" aria-label="Level map">
              ${iconOnly("map", "Level map")}
            </button>
            <button class="secondary-button icon-action" type="button" data-save aria-label="Save artwork">
              ${iconOnly("save", "Save artwork")}
            </button>
            <button class="primary-button icon-action" type="button" data-finish aria-label="Finish level">
              ${iconOnly("finish", "Finish level")}
            </button>
          </div>
        </div>
        <div class="workspace">
          <aside class="toolbox" aria-label="Coloring tools">
            <div class="tool-group">
              <h3 class="icon-heading">${iconOnly("palette", "Colors")}</h3>
              <div class="palette">
                ${palette
                  .map(
                    (color) => `
                    <button class="swatch ${color === selectedColor ? "is-selected" : ""}" type="button"
                      data-color="${color}" style="--swatch:${color}" aria-label="Use color ${color}"></button>
                  `,
                  )
                  .join("")}
              </div>
              <label class="color-picker">
                ${iconOnly("palette", "Custom color")}
                <input type="color" value="${selectedColor}" data-custom-color />
              </label>
            </div>
            <div class="tool-group">
              <h3 class="icon-heading">${iconOnly("fill", "Tools")}</h3>
              <div class="segmented">
                <button class="icon-tool is-selected" type="button" data-tool="fill" aria-label="Fill bucket">
                  ${iconOnly("fill", "Fill bucket")}
                </button>
                <button class="icon-tool" type="button" data-tool="brush" aria-label="Brush">
                  ${iconOnly("brush", "Brush")}
                </button>
                <button class="icon-tool" type="button" data-tool="eraser" aria-label="Eraser">
                  ${iconOnly("eraser", "Eraser")}
                </button>
              </div>
            </div>
            <div class="tool-group">
              <h3 class="icon-heading">${iconOnly("brush", "Brush size")}</h3>
              <div class="segmented">
                <button class="icon-tool" type="button" data-size="8" aria-label="Small brush">
                  ${sizeIcon("small", "Small brush")}
                </button>
                <button class="icon-tool is-selected" type="button" data-size="14" aria-label="Medium brush">
                  ${sizeIcon("medium", "Medium brush")}
                </button>
                <button class="icon-tool" type="button" data-size="26" aria-label="Big brush">
                  ${sizeIcon("big", "Big brush")}
                </button>
              </div>
            </div>
            <div class="tool-group">
              <h3 class="icon-heading">${iconOnly("undo", "Fix")}</h3>
              <div class="tool-buttons">
                <button class="icon-tool" type="button" data-undo aria-label="Undo">
                  ${iconOnly("undo", "Undo")}
                </button>
                <button class="icon-tool" type="button" data-redo aria-label="Redo">
                  ${iconOnly("redo", "Redo")}
                </button>
                <button class="icon-tool" type="button" data-clear aria-label="Clear">
                  ${iconOnly("clear", "Clear")}
                </button>
              </div>
            </div>
            <p class="tool-status" data-tool-status>Tap a white shape to color it.</p>
          </aside>
          <div class="artboard-wrap">
            <div class="target-card" aria-label="Copy this colored picture">
              <div class="target-title">
                ${icon("target")}
                <div>
                  <p class="eyebrow">Copy picture</p>
                  <h3>3-star colors</h3>
                </div>
              </div>
              <div class="target-art" data-target-mount></div>
            </div>
            <div class="artboard" aria-label="${level.title} coloring page">
              <div class="svg-layer" data-svg-mount></div>
              <canvas class="draw-layer" data-draw-canvas></canvas>
            </div>
          </div>
        </div>
      </section>
    `);

    const status = root.querySelector("[data-tool-status]");
    currentBoard = new ColoringBoard({
      svgMount: root.querySelector("[data-svg-mount]"),
      targetMount: root.querySelector("[data-target-mount]"),
      drawCanvas: root.querySelector("[data-draw-canvas]"),
      level,
      onStatus: (message) => {
        status.textContent = message;
      },
      onReact: (type) => playReaction(type, state.voiceOn),
    });

    await currentBoard.load(savedArtwork?.state || null);
    currentBoard.setColor(selectedColor);

    root.querySelectorAll("[data-color]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedColor = button.dataset.color;
        currentBoard.setColor(selectedColor);
        playReaction("tap", state.voiceOn);
        root.querySelectorAll(".swatch").forEach((swatch) => swatch.classList.remove("is-selected"));
        button.classList.add("is-selected");
        root.querySelector("[data-custom-color]").value = selectedColor;
      });
    });

    root.querySelector("[data-custom-color]").addEventListener("input", (event) => {
      selectedColor = event.target.value;
      currentBoard.setColor(selectedColor);
      playReaction("tap", state.voiceOn);
      root.querySelectorAll(".swatch").forEach((swatch) => swatch.classList.remove("is-selected"));
    });

    root.querySelectorAll("[data-tool]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-tool]").forEach((toolButton) => toolButton.classList.remove("is-selected"));
        button.classList.add("is-selected");
        currentBoard.setTool(button.dataset.tool);
        playReaction("tap", state.voiceOn);
      });
    });

    root.querySelectorAll("[data-size]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-size]").forEach((sizeButton) => sizeButton.classList.remove("is-selected"));
        button.classList.add("is-selected");
        currentBoard.setBrushSize(button.dataset.size);
        playReaction("tap", state.voiceOn);
      });
    });

    root.querySelector("[data-undo]").addEventListener("click", () => currentBoard.undo());
    root.querySelector("[data-redo]").addEventListener("click", () => currentBoard.redo());
    root.querySelector("[data-clear]").addEventListener("click", () => {
      if (window.confirm("Clear this picture and keep coloring?")) {
        currentBoard.clear();
      }
    });
    root.querySelector("[data-save]").addEventListener("click", () => saveCurrentArtwork(level, false));
    root.querySelector("[data-finish]").addEventListener("click", () => finishLevel(level));
  };

  const saveCurrentArtwork = async (level, speakAfterSave = true, score = null) => {
    const previewDataUrl = await currentBoard.getArtworkDataUrl();
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      levelId: level.id,
      levelTitle: level.title,
      playerName: playerName(),
      createdAt: new Date().toISOString(),
      previewDataUrl,
      state: currentBoard.getState(),
      stars: score?.stars || null,
    };
    state = addGalleryItem(state, item);
    if (speakAfterSave) {
      speak(`Saved! Good job, ${playerName()}.`, state.voiceOn, {
        reaction: "save",
        girlSound: "saved",
      });
    } else {
      speak("Saved! Good job.", state.voiceOn, {
        reaction: "save",
        girlSound: "saved",
      });
    }
    return item;
  };

  const finishLevel = async (level) => {
    const score = currentBoard.scoreAgainstTarget();
    await saveCurrentArtwork(level, true, score);
    state = completeLevel(state, level.id, score.stars);
    renderReward(level, score);
  };

  const renderReward = (level, score) => {
    const nextLevel = levels.find((item) => item.id === level.id + 1);
    const scoreMessage =
      score.stars === 3
        ? "Perfect match!"
        : score.stars === 2
          ? "Great try. You matched many colors!"
          : "Good start. Keep coloring!";
    const voiceMessage =
      score.stars === 3
        ? `Wow, ${playerName()}! Three stars!`
        : score.stars === 2
          ? `Nice work, ${playerName()}! Two stars!`
          : `Good try, ${playerName()}. One star.`;
    render(`
      <section class="panel reward-screen">
        <div class="sparkle-burst" aria-hidden="true">
          <span>*</span><span>*</span><span>*</span><span>*</span><span>*</span>
        </div>
        <p class="eyebrow">Finished Level ${level.id}</p>
        <h2>${scoreMessage}</h2>
        ${ratingStars(score.stars, "big")}
        <p class="score-line">${score.matches} / ${score.total} colors matched.</p>
        <p>${nextLevel ? `Level ${nextLevel.id} is unlocked.` : "You completed all 50 pages."}</p>
        <div class="hero-actions">
          ${
            nextLevel
              ? `<button class="primary-button big-button icon-action" type="button" data-next="${nextLevel.id}" aria-label="Next level">${iconOnly("next", "Next level")}</button>`
              : ""
          }
          <button class="secondary-button big-button icon-action" type="button" data-action="home" aria-label="Level map">
            ${iconOnly("map", "Level map")}
          </button>
          <button class="secondary-button big-button icon-action" type="button" data-action="gallery" aria-label="Gallery">
            ${iconOnly("gallery", "Gallery")}
          </button>
        </div>
      </section>
    `);
    speak(voiceMessage, state.voiceOn, {
      reaction: score.stars === 3 ? "celebrate" : score.stars === 2 ? "great" : "gentle",
      girlSound: score.stars === 3 ? "three_stars" : score.stars === 2 ? "two_stars" : "good_try",
    });
    root.querySelector("[data-next]")?.addEventListener("click", (event) => {
      renderColoring(Number(event.currentTarget.dataset.next));
    });
  };

  const renderGallery = () => {
    render(`
      <section class="panel gallery-screen">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Saved in this browser</p>
            <h2>Gallery</h2>
          </div>
          <button class="secondary-button" type="button" data-action="home">Back to map</button>
        </div>
        ${
          state.gallery.length
            ? `<div class="gallery-grid">
                ${state.gallery
                  .map(
                    (item) => `
                      <article class="gallery-card">
                        <img src="${item.previewDataUrl}" alt="${item.levelTitle} artwork by ${item.playerName}" />
                        <div>
                          <h3>${item.levelTitle}</h3>
                          <p>${item.playerName} made this artwork.</p>
                          ${item.stars ? ratingStars(item.stars, "mini") : ""}
                        </div>
                        <div class="gallery-actions">
                          <button class="secondary-button" type="button" data-open-art="${item.id}">Open</button>
                          <button class="secondary-button" type="button" data-download-art="${item.id}">Download PNG</button>
                          <button class="secondary-button danger" type="button" data-delete-art="${item.id}">Delete</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")}
              </div>`
            : `<div class="empty-state">
                <h3>No saved artwork yet</h3>
                <p>Finish or save a coloring page and it will appear here.</p>
              </div>`
        }
      </section>
    `);
    root.querySelectorAll("[data-open-art]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = state.gallery.find((galleryItem) => galleryItem.id === button.dataset.openArt);
        if (item) {
          renderColoring(item.levelId, item);
        }
      });
    });
    root.querySelectorAll("[data-download-art]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = state.gallery.find((galleryItem) => galleryItem.id === button.dataset.downloadArt);
        if (item) {
          downloadDataUrl(item.previewDataUrl, `${slugify(item.levelTitle)}-${item.playerName}.png`);
        }
      });
    });
    root.querySelectorAll("[data-delete-art]").forEach((button) => {
      button.addEventListener("click", () => {
        if (window.confirm("Delete this saved artwork?")) {
          state = deleteGalleryItem(state, button.dataset.deleteArt);
          renderGallery();
        }
      });
    });
  };

  renderWelcome();
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
