let hasStarted = false;
let subtitleTarget = null;
let reactionTarget = null;
let subtitleTimer = null;
let reactionTimer = null;
let audioContext = null;
let audioUnlocked = false;
let girlSoundTimer = null;
const girlSoundCache = new Map();

const girlSoundVersion = "20260626-neuralvoice1";
const girlSoundSources = {
  welcome: "./assets/sounds/girl/welcome.mp3",
  choose_mila: "./assets/sounds/girl/choose_mila.mp3",
  choose_selena: "./assets/sounds/girl/choose_selena.mp3",
  saved_mila: "./assets/sounds/girl/saved_mila.mp3",
  saved_selena: "./assets/sounds/girl/saved_selena.mp3",
  saved_artwork: "./assets/sounds/girl/saved_artwork.mp3",
  one_star_mila: "./assets/sounds/girl/one_star_mila.mp3",
  one_star_selena: "./assets/sounds/girl/one_star_selena.mp3",
  two_stars_mila: "./assets/sounds/girl/two_stars_mila.mp3",
  two_stars_selena: "./assets/sounds/girl/two_stars_selena.mp3",
  three_stars_mila: "./assets/sounds/girl/three_stars_mila.mp3",
  three_stars_selena: "./assets/sounds/girl/three_stars_selena.mp3",
  sound_on: "./assets/sounds/girl/sound_on.mp3",
};

const fallbackMessages = [
  "You are doing amazing!",
  "Wow, your picture is beautiful!",
  "Let us color the next picture!",
];

export function enableVoiceAfterStart() {
  hasStarted = true;
  unlockAudio();
  preloadGirlSounds();
}

export function setSubtitleTarget(element) {
  subtitleTarget = element;
  clearTimeout(subtitleTimer);
  subtitleTimer = null;
}

export function setReactionTarget(element) {
  reactionTarget = element;
  clearTimeout(reactionTimer);
  reactionTimer = null;
}

export function setSubtitle(text) {
  if (subtitleTarget) {
    subtitleTarget.textContent = text || "";
    subtitleTarget.classList.toggle("is-visible", Boolean(text));
    clearTimeout(subtitleTimer);
    if (text) {
      subtitleTimer = setTimeout(() => {
        subtitleTarget.textContent = "";
        subtitleTarget.classList.remove("is-visible");
      }, 5600);
    }
  }
}

export function speak(text, voiceOn = true, options = {}) {
  setSubtitle(text);
  const reaction = options.reaction || "kind";
  playReaction(reaction, voiceOn);
  playGirlSound(options.girlSound || girlSoundForReaction(reaction), voiceOn);
}

export function speakForPlayer(playerName, voiceOn, messages = fallbackMessages) {
  const message = messages[Math.floor(Math.random() * messages.length)];
  speak(message.replace("{name}", playerName), voiceOn);
}

export function stopVoice() {
  clearTimeout(girlSoundTimer);
  girlSoundTimer = null;
  girlSoundCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

export function playReaction(type = "tap", voiceOn = true) {
  showReaction(type);
  if (!voiceOn || !hasStarted) {
    return;
  }

  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const play = () => {
    const now = context.currentTime + 0.03;
    const notes = reactionNotes(type);
    notes.forEach((note, index) => {
      playTone(context, note, now + index * noteGap(type), type);
    });
  };

  if (context.state === "suspended" && context.resume) {
    context.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

function ensureAudioContext() {
  if (audioContext) {
    return audioContext;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  audioContext = new AudioContextClass();
  return audioContext;
}

function unlockAudio() {
  const context = ensureAudioContext();
  if (!context) {
    return;
  }
  context.resume?.();

  if (audioUnlocked) {
    return;
  }

  const start = context.currentTime + 0.01;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.setValueAtTime(880, start);
  gain.gain.setValueAtTime(0.0001, start);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.03);
  audioUnlocked = true;
}

function reactionNotes(type) {
  if (type === "celebrate") {
    return [523.25, 659.25, 783.99, 1046.5, 1318.51];
  }
  if (type === "great") {
    return [523.25, 659.25, 783.99, 1046.5];
  }
  if (type === "gentle") {
    return [392, 523.25];
  }
  if (type === "save") {
    return [523.25, 659.25, 783.99];
  }
  if (type === "tap" || type === "fill") {
    return type === "fill" ? [659.25, 783.99] : [659.25];
  }
  return [523.25, 659.25];
}

function noteGap(type) {
  if (type === "celebrate") {
    return 0.155;
  }
  if (type === "great") {
    return 0.14;
  }
  if (type === "save") {
    return 0.13;
  }
  return 0.11;
}

function playTone(context, frequency, start, type) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type === "tap" || type === "fill" ? "sine" : "triangle";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(type === "tap" || type === "fill" ? 0.012 : 0.028, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + (type === "celebrate" ? 0.5 : 0.34));
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + (type === "celebrate" ? 0.52 : 0.36));
}

function girlSoundForReaction(type) {
  if (type === "celebrate") {
    return null;
  }
  if (type === "great") {
    return null;
  }
  if (type === "gentle") {
    return null;
  }
  if (type === "save") {
    return null;
  }
  return null;
}

function preloadGirlSounds() {
  Object.keys(girlSoundSources).forEach((soundName) => getGirlSound(soundName));
}

function getGirlSound(soundName) {
  const source = girlSoundSources[soundName];
  if (!source) {
    return null;
  }
  if (!girlSoundCache.has(soundName)) {
    const separator = source.includes("?") ? "&" : "?";
    const audio = new Audio(`${source}${separator}v=${girlSoundVersion}`);
    audio.preload = "auto";
    audio.volume = 0.95;
    girlSoundCache.set(soundName, audio);
  }
  return girlSoundCache.get(soundName);
}

function playGirlSound(soundName, voiceOn) {
  if (!voiceOn || !hasStarted || !soundName) {
    return;
  }
  const audio = getGirlSound(soundName);
  if (!audio) {
    return;
  }
  clearTimeout(girlSoundTimer);
  girlSoundCache.forEach((otherAudio) => {
    if (otherAudio !== audio) {
      otherAudio.pause();
      otherAudio.currentTime = 0;
    }
  });
  girlSoundTimer = window.setTimeout(() => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, 230);
}

function showReaction(type) {
  if (!reactionTarget) {
    return;
  }

  const sparkCount = type === "celebrate" ? 7 : type === "great" ? 5 : 3;
  reactionTarget.innerHTML = `
    <div class="reaction-card reaction-${type}">
      ${Array.from({ length: sparkCount })
        .map((_, index) => `<span class="reaction-spark spark-${index + 1}"></span>`)
        .join("")}
    </div>
  `;
  reactionTarget.classList.add("is-visible");
  clearTimeout(reactionTimer);
  reactionTimer = setTimeout(() => {
    reactionTarget.classList.remove("is-visible");
  }, type === "celebrate" ? 1500 : 950);
}

function installAudioUnlockListeners() {
  const unlock = () => {
    unlockAudio();
  };
  ["pointerdown", "touchend", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, unlock, { passive: true });
  });
}

installAudioUnlockListeners();
