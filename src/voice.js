let hasStarted = false;
let subtitleTarget = null;
let reactionTarget = null;
let subtitleTimer = null;
let reactionTimer = null;
let audioContext = null;
let audioUnlocked = false;

const fallbackMessages = [
  "You are doing amazing!",
  "Wow, your picture is beautiful!",
  "Let us color the next picture!",
];

export function enableVoiceAfterStart() {
  hasStarted = true;
  unlockAudio();
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
  playReaction(options.reaction || "kind", voiceOn);
}

export function speakForPlayer(playerName, voiceOn, messages = fallbackMessages) {
  const message = messages[Math.floor(Math.random() * messages.length)];
  speak(message.replace("{name}", playerName), voiceOn);
}

export function stopVoice() {
  // Sounds are short Web Audio notes, so there is no queued speech to stop.
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
  gain.gain.exponentialRampToValueAtTime(type === "tap" || type === "fill" ? 0.025 : 0.075, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + (type === "celebrate" ? 0.5 : 0.34));
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + (type === "celebrate" ? 0.52 : 0.36));
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
