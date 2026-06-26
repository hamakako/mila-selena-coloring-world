const STORAGE_KEY = "mila-selena-coloring-world-v1";
const MAX_GALLERY_ITEMS = 24;

const defaultState = {
  player: null,
  voiceOn: true,
  unlockedLevel: 1,
  completedLevels: [],
  levelStars: {},
  gallery: [],
};

function normalizeState(value) {
  const state = { ...defaultState, ...(value || {}) };
  state.unlockedLevel = Math.min(50, Math.max(1, Number(state.unlockedLevel) || 1));
  state.completedLevels = Array.isArray(state.completedLevels)
    ? [...new Set(state.completedLevels.map(Number).filter(Boolean))]
    : [];
  state.levelStars =
    state.levelStars && typeof state.levelStars === "object" && !Array.isArray(state.levelStars)
      ? Object.fromEntries(
          Object.entries(state.levelStars)
            .map(([levelId, stars]) => [String(Number(levelId)), Math.min(3, Math.max(1, Number(stars) || 1))])
            .filter(([levelId]) => levelId !== "NaN"),
        )
      : {};
  state.completedLevels.forEach((levelId) => {
    if (!state.levelStars[String(levelId)]) {
      state.levelStars[String(levelId)] = 1;
    }
  });
  state.gallery = Array.isArray(state.gallery) ? state.gallery : [];
  return state;
}

export function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

export function setPlayer(state, player) {
  const next = { ...state, player };
  saveState(next);
  return next;
}

export function setVoiceOn(state, voiceOn) {
  const next = { ...state, voiceOn };
  saveState(next);
  return next;
}

export function completeLevel(state, levelId, stars = 1) {
  const completed = new Set(state.completedLevels);
  completed.add(levelId);
  const normalizedStars = Math.min(3, Math.max(1, Number(stars) || 1));
  const currentStars = Number(state.levelStars?.[String(levelId)]) || 0;
  const next = {
    ...state,
    completedLevels: [...completed].sort((a, b) => a - b),
    levelStars: {
      ...(state.levelStars || {}),
      [String(levelId)]: Math.max(currentStars, normalizedStars),
    },
    unlockedLevel: Math.min(50, Math.max(state.unlockedLevel, levelId + 1)),
  };
  saveState(next);
  return next;
}

export function addGalleryItem(state, item) {
  const next = {
    ...state,
    gallery: [item, ...state.gallery].slice(0, MAX_GALLERY_ITEMS),
  };
  saveState(next);
  return next;
}

export function deleteGalleryItem(state, itemId) {
  const next = {
    ...state,
    gallery: state.gallery.filter((item) => item.id !== itemId),
  };
  saveState(next);
  return next;
}

export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultState };
}
