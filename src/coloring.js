const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const HISTORY_LIMIT = 35;

export class ColoringBoard {
  constructor({ svgMount, targetMount, drawCanvas, level, onStatus, onReact }) {
    this.svgMount = svgMount;
    this.targetMount = targetMount;
    this.canvas = drawCanvas;
    this.level = level;
    this.onStatus = onStatus;
    this.onReact = onReact;
    this.currentColor = "#ff6fae";
    this.tool = "fill";
    this.brushSize = 14;
    this.fills = {};
    this.history = [];
    this.future = [];
    this.isDrawing = false;
    this.lastPoint = null;

    this.canvas.width = SVG_WIDTH;
    this.canvas.height = SVG_HEIGHT;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.handleCanvasPointerDown = this.handleCanvasPointerDown.bind(this);
    this.handleCanvasPointerMove = this.handleCanvasPointerMove.bind(this);
    this.handleCanvasPointerUp = this.handleCanvasPointerUp.bind(this);
    this.handleFillTap = this.handleFillTap.bind(this);

    this.canvas.addEventListener("pointerdown", this.handleCanvasPointerDown);
    this.canvas.addEventListener("pointermove", this.handleCanvasPointerMove);
    window.addEventListener("pointerup", this.handleCanvasPointerUp);
    window.addEventListener("pointercancel", this.handleCanvasPointerUp);
  }

  async load(savedState = null) {
    const response = await fetch(this.level.asset);
    if (!response.ok) {
      throw new Error(`Could not load ${this.level.asset}`);
    }

    const markup = await response.text();
    this.svgMount.innerHTML = markup;
    this.svg = this.svgMount.querySelector("svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    this.svg.querySelectorAll(".color-area").forEach((area, index) => {
      if (!area.dataset.areaId) {
        area.dataset.areaId = `area-${index + 1}`;
      }
      area.addEventListener("click", this.handleFillTap);
      area.addEventListener("pointerdown", this.handleFillTap);
      area.style.touchAction = "manipulation";
    });
    this.renderTarget(markup);

    if (savedState) {
      await this.restoreState(savedState);
    } else {
      this.pushHistory();
    }

    this.setTool(this.tool);
  }

  renderTarget(markup) {
    if (!this.targetMount) {
      return;
    }

    this.targetMount.innerHTML = markup;
    const targetSvg = this.targetMount.querySelector("svg");
    targetSvg.setAttribute("width", "100%");
    targetSvg.setAttribute("height", "100%");
    targetSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    targetSvg.querySelectorAll(".color-area").forEach((area) => {
      const color = this.level.targetColors?.[area.dataset.areaId] || "#ffffff";
      area.style.fill = color;
      area.setAttribute("fill", color);
    });
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.handleCanvasPointerDown);
    this.canvas.removeEventListener("pointermove", this.handleCanvasPointerMove);
    window.removeEventListener("pointerup", this.handleCanvasPointerUp);
    window.removeEventListener("pointercancel", this.handleCanvasPointerUp);
    this.svg?.querySelectorAll(".color-area").forEach((area) => {
      area.removeEventListener("click", this.handleFillTap);
      area.removeEventListener("pointerdown", this.handleFillTap);
    });
  }

  setColor(color) {
    this.currentColor = color;
  }

  setTool(tool) {
    this.tool = tool;
    this.canvas.classList.toggle("is-active", tool === "brush" || tool === "eraser");
    this.canvas.style.pointerEvents = tool === "fill" ? "none" : "auto";
    this.svgMount.style.pointerEvents = tool === "fill" ? "auto" : "none";
    this.onStatus?.(tool === "fill" ? "Tap a white shape to color it." : "Drag on the picture to draw.");
  }

  setBrushSize(size) {
    this.brushSize = Number(size);
  }

  handleFillTap(event) {
    if (this.tool !== "fill") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    const areaId = target.dataset.areaId;
    target.style.fill = this.currentColor;
    this.fills[areaId] = this.currentColor;
    this.onReact?.("fill");
    this.pushHistory();
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SVG_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * SVG_HEIGHT,
    };
  }

  handleCanvasPointerDown(event) {
    if (this.tool !== "brush" && this.tool !== "eraser") {
      return;
    }
    event.preventDefault();
    this.canvas.setPointerCapture?.(event.pointerId);
    this.isDrawing = true;
    this.lastPoint = this.getCanvasPoint(event);
    this.drawTo(this.lastPoint);
  }

  handleCanvasPointerMove(event) {
    if (!this.isDrawing || (this.tool !== "brush" && this.tool !== "eraser")) {
      return;
    }
    event.preventDefault();
    this.drawTo(this.getCanvasPoint(event));
  }

  handleCanvasPointerUp() {
    if (!this.isDrawing) {
      return;
    }
    this.isDrawing = false;
    this.lastPoint = null;
    this.ctx.globalCompositeOperation = "source-over";
    this.onReact?.("tap");
    this.pushHistory();
  }

  drawTo(point) {
    const previous = this.lastPoint || point;
    this.ctx.save();
    this.ctx.globalCompositeOperation = this.tool === "eraser" ? "destination-out" : "source-over";
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.beginPath();
    this.ctx.moveTo(previous.x, previous.y);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
    this.ctx.restore();
    this.lastPoint = point;
  }

  pushHistory() {
    this.history.push(this.createSnapshot());
    if (this.history.length > HISTORY_LIMIT) {
      this.history.shift();
    }
    this.future = [];
  }

  createSnapshot() {
    return {
      fills: { ...this.fills },
      canvasDataUrl: this.canvas.toDataURL("image/png"),
    };
  }

  async restoreState(snapshot) {
    this.fills = { ...(snapshot?.fills || {}) };
    this.applyFills();
    this.ctx.clearRect(0, 0, SVG_WIDTH, SVG_HEIGHT);
    if (snapshot?.canvasDataUrl) {
      await this.drawCanvasData(snapshot.canvasDataUrl);
    }
    this.history = [this.createSnapshot()];
    this.future = [];
  }

  applyFills() {
    this.svg?.querySelectorAll(".color-area").forEach((area) => {
      const fill = this.fills[area.dataset.areaId] || "#ffffff";
      area.style.fill = fill;
    });
  }

  async drawCanvasData(dataUrl) {
    const image = await loadImage(dataUrl);
    this.ctx.clearRect(0, 0, SVG_WIDTH, SVG_HEIGHT);
    this.ctx.drawImage(image, 0, 0, SVG_WIDTH, SVG_HEIGHT);
  }

  async undo() {
    if (this.history.length <= 1) {
      this.onStatus?.("Nothing to undo yet.");
      return;
    }
    this.future.push(this.history.pop());
    await this.applySnapshot(this.history[this.history.length - 1]);
  }

  async redo() {
    if (!this.future.length) {
      this.onStatus?.("Nothing to redo yet.");
      return;
    }
    const snapshot = this.future.pop();
    this.history.push(snapshot);
    await this.applySnapshot(snapshot);
  }

  async applySnapshot(snapshot) {
    this.fills = { ...snapshot.fills };
    this.applyFills();
    this.ctx.clearRect(0, 0, SVG_WIDTH, SVG_HEIGHT);
    if (snapshot.canvasDataUrl) {
      await this.drawCanvasData(snapshot.canvasDataUrl);
    }
  }

  clear() {
    this.fills = {};
    this.applyFills();
    this.ctx.clearRect(0, 0, SVG_WIDTH, SVG_HEIGHT);
    this.pushHistory();
  }

  getState() {
    return this.createSnapshot();
  }

  scoreAgainstTarget() {
    const targetColors = this.level.targetColors || {};
    const entries = Object.entries(targetColors);
    if (!entries.length) {
      return { stars: 1, matches: 0, total: 0, ratio: 0 };
    }

    const matches = entries.filter(([areaId, targetColor]) =>
      colorsAreClose(this.fills[areaId], targetColor),
    ).length;
    const ratio = matches / entries.length;
    const stars = ratio >= 0.8 ? 3 : ratio >= 0.45 ? 2 : 1;
    return { stars, matches, total: entries.length, ratio };
  }

  async getArtworkDataUrl() {
    const svgClone = this.svg.cloneNode(true);
    svgClone.querySelectorAll(".color-area").forEach((area) => {
      area.setAttribute("fill", this.fills[area.dataset.areaId] || "#ffffff");
      area.style.fill = this.fills[area.dataset.areaId] || "#ffffff";
    });

    const serialized = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = await loadImage(svgUrl);
    URL.revokeObjectURL(svgUrl);

    const output = document.createElement("canvas");
    output.width = SVG_WIDTH;
    output.height = SVG_HEIGHT;
    const outputContext = output.getContext("2d");
    outputContext.fillStyle = "#ffffff";
    outputContext.fillRect(0, 0, SVG_WIDTH, SVG_HEIGHT);
    outputContext.drawImage(image, 0, 0, SVG_WIDTH, SVG_HEIGHT);
    outputContext.drawImage(this.canvas, 0, 0, SVG_WIDTH, SVG_HEIGHT);
    return output.toDataURL("image/png");
  }
}

function colorsAreClose(actualColor, targetColor) {
  const actual = parseHexColor(actualColor);
  const target = parseHexColor(targetColor);
  if (!actual || !target) {
    return false;
  }
  const distance = Math.sqrt(
    (actual.r - target.r) ** 2 + (actual.g - target.g) ** 2 + (actual.b - target.b) ** 2,
  );
  return distance <= 42;
}

function parseHexColor(color) {
  if (!color || typeof color !== "string") {
    return null;
  }
  const clean = color.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(clean)) {
    return null;
  }
  return {
    r: Number.parseInt(clean.slice(1, 3), 16),
    g: Number.parseInt(clean.slice(3, 5), 16),
    b: Number.parseInt(clean.slice(5, 7), 16),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
