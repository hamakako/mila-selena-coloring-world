import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = path.join(root, "assets", "coloring-pages");
const levelsPath = path.join(root, "src", "levels.js");

const levelDefs = [
  ["Easy animals", "Cat"],
  ["Easy animals", "Bunny"],
  ["Easy animals", "Butterfly"],
  ["Easy animals", "Puppy"],
  ["Easy animals", "Fish"],
  ["Easy animals", "Bird"],
  ["Easy animals", "Turtle"],
  ["Easy animals", "Bear"],
  ["Easy animals", "Duck"],
  ["Easy animals", "Horse"],
  ["Cute nature", "Flower garden"],
  ["Cute nature", "Rainbow"],
  ["Cute nature", "Sun and clouds"],
  ["Cute nature", "Tree house"],
  ["Cute nature", "Stars and moon"],
  ["Cute nature", "Beach"],
  ["Cute nature", "Mountain"],
  ["Cute nature", "Apple tree"],
  ["Cute nature", "Snowman"],
  ["Cute nature", "Spring garden"],
  ["Toys and fun", "Teddy bear"],
  ["Toys and fun", "Doll"],
  ["Toys and fun", "Balloons"],
  ["Toys and fun", "Toy car"],
  ["Toys and fun", "Blocks"],
  ["Toys and fun", "Kite"],
  ["Toys and fun", "Cupcake"],
  ["Toys and fun", "Ice cream"],
  ["Toys and fun", "Birthday cake"],
  ["Toys and fun", "Party hat"],
  ["Mila and Selena adventure", "Two girls with balloons"],
  ["Mila and Selena adventure", "Two girls in a garden"],
  ["Mila and Selena adventure", "Two girls with teddy bears"],
  ["Mila and Selena adventure", "Two girls under rainbow"],
  ["Mila and Selena adventure", "Two girls at birthday party"],
  ["Mila and Selena adventure", "Two girls with flowers"],
  ["Mila and Selena adventure", "Two girls at playground"],
  ["Mila and Selena adventure", "Two girls with stars"],
  ["Mila and Selena adventure", "Two girls near a cute house"],
  ["Mila and Selena adventure", "Two girls with pets"],
  ["Magic coloring pages", "Castle"],
  ["Magic coloring pages", "Fantasy horse"],
  ["Magic coloring pages", "Magic garden"],
  ["Magic coloring pages", "Fairy lights"],
  ["Magic coloring pages", "Moon and stars"],
  ["Magic coloring pages", "Cute planet"],
  ["Magic coloring pages", "Candy land"],
  ["Magic coloring pages", "Princess-style dress"],
  ["Magic coloring pages", "Dream house"],
  ["Magic coloring pages", "Celebration page for Mila and Selena"],
].map(([category, title], index) => ({
  id: index + 1,
  category,
  title,
  slug: slugify(title),
}));

const targetPalettes = {
  "Easy animals": ["#ff9f6e", "#ffd166", "#9be564", "#61d394", "#74c7ff", "#a78bfa", "#f7a8ff", "#8d6e63"],
  "Cute nature": ["#9be564", "#61d394", "#ffd166", "#72ddf7", "#74c7ff", "#ff6fae", "#f7a8ff", "#ff9f6e"],
  "Toys and fun": ["#ff6fae", "#ffd166", "#74c7ff", "#a78bfa", "#ff9f6e", "#9be564", "#f7a8ff", "#61d394"],
  "Mila and Selena adventure": ["#74c7ff", "#ff6fae", "#ffd166", "#61d394", "#a78bfa", "#ff9f6e", "#9be564", "#72ddf7"],
  "Magic coloring pages": ["#a78bfa", "#f7a8ff", "#ffd166", "#72ddf7", "#ff6fae", "#9be564", "#61d394", "#74c7ff"],
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function shapeTools(seed) {
  let count = 0;
  const attrs = (values) =>
    Object.entries(values)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
      .join(" ");
  const nextId = () => `${seed}-${++count}`;

  return {
    A(tag, values) {
      return `<${tag} class="color-area" data-area-id="${nextId()}" ${attrs(values)} />`;
    },
    L(tag, values) {
      return `<${tag} class="line" ${attrs(values)} />`;
    },
    D(tag, values) {
      return `<${tag} class="detail" ${attrs(values)} />`;
    },
    T(text, values) {
      return `<text class="page-label" ${attrs(values)}>${text}</text>`;
    },
  };
}

function wrapPage(def, content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${escapeAttr(def.title)} coloring page">
  <title>${escapeAttr(def.title)}</title>
  <style>
    .color-area{fill:#fff;stroke:#171421;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
    .line{fill:none;stroke:#171421;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
    .detail{fill:#171421;stroke:none}
    .page-label{font-family:Arial,sans-serif;font-size:38px;font-weight:800;fill:#171421;text-anchor:middle}
  </style>
  ${content}
</svg>
`;
}

function ground(L) {
  return L("path", { d: "M90 506 C210 480 310 520 430 500 C545 480 635 506 720 488" });
}

function flower(A, L, x, y, scale = 1) {
  const r = 18 * scale;
  return `
    ${L("path", { d: `M${x} ${y + 72 * scale} C${x - 8 * scale} ${y + 34 * scale} ${x + 8 * scale} ${y + 15 * scale} ${x} ${y}` })}
    ${A("ellipse", { cx: x - r, cy: y, rx: 17 * scale, ry: 23 * scale, transform: `rotate(-28 ${x - r} ${y})` })}
    ${A("ellipse", { cx: x + r, cy: y, rx: 17 * scale, ry: 23 * scale, transform: `rotate(28 ${x + r} ${y})` })}
    ${A("ellipse", { cx: x, cy: y - r, rx: 17 * scale, ry: 23 * scale })}
    ${A("ellipse", { cx: x, cy: y + r, rx: 17 * scale, ry: 23 * scale })}
    ${A("circle", { cx: x, cy: y, r: 14 * scale })}
  `;
}

function star(A, x, y, size = 24) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? size : size * 0.42;
    points.push(`${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`);
  }
  return A("polygon", { points: points.join(" ") });
}

function cloud(A, x, y, scale = 1) {
  return `
    ${A("path", {
      d: `M${x - 84 * scale} ${y + 20 * scale}
        C${x - 78 * scale} ${y - 20 * scale} ${x - 38 * scale} ${y - 34 * scale} ${x - 12 * scale} ${y - 12 * scale}
        C${x + 4 * scale} ${y - 52 * scale} ${x + 60 * scale} ${y - 40 * scale} ${x + 62 * scale} ${y - 4 * scale}
        C${x + 96 * scale} ${y - 4 * scale} ${x + 106 * scale} ${y + 42 * scale} ${x + 68 * scale} ${y + 46 * scale}
        L${x - 58 * scale} ${y + 46 * scale}
        C${x - 86 * scale} ${y + 48 * scale} ${x - 104 * scale} ${y + 38 * scale} ${x - 84 * scale} ${y + 20 * scale} Z`,
    })}
  `;
}

function rainbow(A, x = 400, y = 470, scale = 1) {
  const arc = (outer, inner) =>
    A("path", {
      d: `M${x - outer * scale} ${y}
          A${outer * scale} ${outer * 0.78 * scale} 0 0 1 ${x + outer * scale} ${y}
          L${x + inner * scale} ${y}
          A${inner * scale} ${inner * 0.78 * scale} 0 0 0 ${x - inner * scale} ${y} Z`,
    });
  return `
    ${arc(300, 250)}
    ${arc(240, 195)}
    ${arc(185, 145)}
    ${arc(135, 96)}
  `;
}

function girl(A, L, D, x, y, variant = "left") {
  const hair = variant === "left"
    ? `M${x - 58} ${y - 112} C${x - 110} ${y - 74} ${x - 90} ${y + 6} ${x - 52} ${y + 20} C${x - 22} ${y + 4} ${x + 30} ${y + 12} ${x + 60} ${y + 28} C${x + 100} ${y - 44} ${x + 72} ${y - 104} ${x + 20} ${y - 118} Z`
    : `M${x - 62} ${y - 104} C${x - 98} ${y - 38} ${x - 58} ${y + 20} ${x - 18} ${y + 10} C${x + 12} ${y + 34} ${x + 76} ${y + 8} ${x + 62} ${y - 74} C${x + 40} ${y - 122} ${x - 22} ${y - 130} ${x - 62} ${y - 104} Z`;
  return `
    ${A("path", { d: hair })}
    ${A("circle", { cx: x, cy: y - 66, r: 52 })}
    ${D("circle", { cx: x - 18, cy: y - 74, r: 5 })}
    ${D("circle", { cx: x + 18, cy: y - 74, r: 5 })}
    ${L("path", { d: `M${x - 16} ${y - 48} Q${x} ${y - 36} ${x + 16} ${y - 48}` })}
    ${A("path", { d: `M${x - 50} ${y + 5} L${x + 50} ${y + 5} L${x + 75} ${y + 160} L${x - 75} ${y + 160} Z` })}
    ${A("path", { d: `M${x - 50} ${y + 18} C${x - 105} ${y + 48} ${x - 118} ${y + 104} ${x - 78} ${y + 124}` })}
    ${A("path", { d: `M${x + 50} ${y + 18} C${x + 105} ${y + 48} ${x + 118} ${y + 104} ${x + 78} ${y + 124}` })}
    ${A("path", { d: `M${x - 34} ${y + 158} L${x - 42} ${y + 246}` })}
    ${A("path", { d: `M${x + 34} ${y + 158} L${x + 42} ${y + 246}` })}
    ${A("ellipse", { cx: x - 43, cy: y + 252, rx: 26, ry: 12 })}
    ${A("ellipse", { cx: x + 43, cy: y + 252, rx: 26, ry: 12 })}
  `;
}

function animalPage(def, kind) {
  const { A, L, D, T } = shapeTools(def.slug);
  let body = "";

  if (kind === "Cat") {
    body = `
      ${A("ellipse", { cx: 390, cy: 355, rx: 135, ry: 115 })}
      ${A("circle", { cx: 380, cy: 220, r: 92 })}
      ${A("polygon", { points: "300,164 328,78 366,168" })}
      ${A("polygon", { points: "458,168 494,80 524,170" })}
      ${A("path", { d: "M510 365 C655 310 672 450 548 448 C508 446 492 410 520 390" })}
      ${A("ellipse", { cx: 390, cy: 368, rx: 55, ry: 70 })}
      ${D("circle", { cx: 346, cy: 218, r: 7 })}
      ${D("circle", { cx: 414, cy: 218, r: 7 })}
      ${L("path", { d: "M382 238 Q380 252 370 260 M330 245 L250 225 M330 262 L250 262 M430 245 L510 225 M430 262 L510 262" })}
    `;
  } else if (kind === "Bunny") {
    body = `
      ${A("ellipse", { cx: 400, cy: 370, rx: 120, ry: 112 })}
      ${A("ellipse", { cx: 345, cy: 144, rx: 38, ry: 112, transform: "rotate(-15 345 144)" })}
      ${A("ellipse", { cx: 455, cy: 144, rx: 38, ry: 112, transform: "rotate(15 455 144)" })}
      ${A("circle", { cx: 400, cy: 250, r: 96 })}
      ${A("ellipse", { cx: 345, cy: 475, rx: 50, ry: 26 })}
      ${A("ellipse", { cx: 455, cy: 475, rx: 50, ry: 26 })}
      ${D("circle", { cx: 365, cy: 240, r: 7 })}
      ${D("circle", { cx: 435, cy: 240, r: 7 })}
      ${A("ellipse", { cx: 400, cy: 268, rx: 15, ry: 11 })}
      ${L("path", { d: "M400 280 Q384 300 360 292 M400 280 Q418 302 440 292" })}
    `;
  } else if (kind === "Butterfly") {
    body = `
      ${A("ellipse", { cx: 305, cy: 245, rx: 105, ry: 135, transform: "rotate(-24 305 245)" })}
      ${A("ellipse", { cx: 495, cy: 245, rx: 105, ry: 135, transform: "rotate(24 495 245)" })}
      ${A("ellipse", { cx: 315, cy: 390, rx: 92, ry: 80, transform: "rotate(20 315 390)" })}
      ${A("ellipse", { cx: 485, cy: 390, rx: 92, ry: 80, transform: "rotate(-20 485 390)" })}
      ${A("ellipse", { cx: 400, cy: 322, rx: 38, ry: 150 })}
      ${A("circle", { cx: 400, cy: 168, r: 36 })}
      ${L("path", { d: "M384 136 C340 82 305 94 288 118 M416 136 C460 82 495 94 512 118" })}
      ${A("circle", { cx: 300, cy: 232, r: 24 })}
      ${A("circle", { cx: 500, cy: 232, r: 24 })}
      ${A("circle", { cx: 335, cy: 392, r: 21 })}
      ${A("circle", { cx: 465, cy: 392, r: 21 })}
    `;
  } else if (kind === "Puppy") {
    body = `
      ${A("ellipse", { cx: 400, cy: 370, rx: 128, ry: 110 })}
      ${A("circle", { cx: 400, cy: 238, r: 92 })}
      ${A("ellipse", { cx: 312, cy: 238, rx: 40, ry: 88, transform: "rotate(20 312 238)" })}
      ${A("ellipse", { cx: 488, cy: 238, rx: 40, ry: 88, transform: "rotate(-20 488 238)" })}
      ${A("path", { d: "M520 350 C650 300 668 410 560 420" })}
      ${A("ellipse", { cx: 400, cy: 270, rx: 30, ry: 24 })}
      ${D("circle", { cx: 365, cy: 232, r: 7 })}
      ${D("circle", { cx: 435, cy: 232, r: 7 })}
      ${L("path", { d: "M400 292 Q378 312 356 298 M400 292 Q422 312 444 298" })}
      ${A("ellipse", { cx: 340, cy: 470, rx: 44, ry: 24 })}
      ${A("ellipse", { cx: 460, cy: 470, rx: 44, ry: 24 })}
    `;
  } else if (kind === "Fish") {
    body = `
      ${A("ellipse", { cx: 390, cy: 300, rx: 160, ry: 92 })}
      ${A("polygon", { points: "540,300 685,205 682,395" })}
      ${A("path", { d: "M310 226 C360 150 445 150 490 230" })}
      ${A("path", { d: "M320 374 C375 452 455 448 505 370" })}
      ${A("path", { d: "M250 300 C210 268 210 332 250 300" })}
      ${D("circle", { cx: 300, cy: 270, r: 9 })}
      ${L("path", { d: "M372 220 C340 268 342 334 382 382 M450 220 C420 274 420 326 458 380" })}
      ${A("circle", { cx: 165, cy: 180, r: 24 })}
      ${A("circle", { cx: 125, cy: 255, r: 16 })}
      ${A("circle", { cx: 178, cy: 340, r: 20 })}
    `;
  } else if (kind === "Bird") {
    body = `
      ${A("ellipse", { cx: 420, cy: 320, rx: 125, ry: 98 })}
      ${A("circle", { cx: 330, cy: 236, r: 74 })}
      ${A("polygon", { points: "266,236 185,198 190,274" })}
      ${A("path", { d: "M430 300 C520 230 620 300 552 380 C510 424 446 382 430 300 Z" })}
      ${A("path", { d: "M520 375 L620 432 L538 430" })}
      ${A("path", { d: "M410 398 L385 482 M450 398 L480 482" })}
      ${D("circle", { cx: 314, cy: 224, r: 8 })}
      ${L("path", { d: "M120 488 C240 468 352 492 492 470 C610 452 666 466 720 458" })}
    `;
  } else if (kind === "Turtle") {
    body = `
      ${A("ellipse", { cx: 405, cy: 330, rx: 165, ry: 112 })}
      ${A("circle", { cx: 585, cy: 302, r: 55 })}
      ${A("ellipse", { cx: 288, cy: 430, rx: 48, ry: 26, transform: "rotate(-18 288 430)" })}
      ${A("ellipse", { cx: 470, cy: 436, rx: 48, ry: 26, transform: "rotate(18 470 436)" })}
      ${A("ellipse", { cx: 295, cy: 232, rx: 48, ry: 26, transform: "rotate(20 295 232)" })}
      ${A("ellipse", { cx: 470, cy: 226, rx: 48, ry: 26, transform: "rotate(-20 470 226)" })}
      ${A("polygon", { points: "225,330 160,300 160,360" })}
      ${L("path", { d: "M302 250 L405 440 M405 220 L405 440 M508 250 L405 440 M275 330 L535 330" })}
      ${D("circle", { cx: 604, cy: 290, r: 7 })}
    `;
  } else if (kind === "Bear") {
    body = `
      ${A("ellipse", { cx: 400, cy: 360, rx: 132, ry: 122 })}
      ${A("circle", { cx: 400, cy: 235, r: 96 })}
      ${A("circle", { cx: 318, cy: 160, r: 38 })}
      ${A("circle", { cx: 482, cy: 160, r: 38 })}
      ${A("ellipse", { cx: 400, cy: 266, rx: 46, ry: 34 })}
      ${D("circle", { cx: 365, cy: 230, r: 8 })}
      ${D("circle", { cx: 435, cy: 230, r: 8 })}
      ${A("ellipse", { cx: 300, cy: 365, rx: 44, ry: 80 })}
      ${A("ellipse", { cx: 500, cy: 365, rx: 44, ry: 80 })}
      ${A("ellipse", { cx: 342, cy: 482, rx: 50, ry: 24 })}
      ${A("ellipse", { cx: 458, cy: 482, rx: 50, ry: 24 })}
    `;
  } else if (kind === "Duck") {
    body = `
      ${A("ellipse", { cx: 420, cy: 365, rx: 142, ry: 92 })}
      ${A("circle", { cx: 305, cy: 260, r: 78 })}
      ${A("polygon", { points: "235,258 132,220 140,296" })}
      ${A("path", { d: "M435 344 C512 294 588 342 532 404 C492 436 444 406 435 344 Z" })}
      ${A("path", { d: "M360 440 L332 508 M462 438 L498 508" })}
      ${A("ellipse", { cx: 322, cy: 520, rx: 48, ry: 17 })}
      ${A("ellipse", { cx: 508, cy: 520, rx: 48, ry: 17 })}
      ${D("circle", { cx: 300, cy: 244, r: 7 })}
      ${L("path", { d: "M110 500 C210 462 310 512 430 485 C558 455 625 488 704 466" })}
    `;
  } else {
    body = `
      ${A("ellipse", { cx: 418, cy: 342, rx: 156, ry: 88 })}
      ${A("path", { d: "M285 318 C242 232 282 158 350 188 C372 206 352 282 330 318 Z" })}
      ${A("circle", { cx: 340, cy: 184, r: 52 })}
      ${A("path", { d: "M384 176 L430 118 L438 196" })}
      ${A("path", { d: "M552 335 C650 286 686 374 604 404" })}
      ${A("path", { d: "M350 418 L328 510 M444 420 L430 514 M502 410 L528 506" })}
      ${A("ellipse", { cx: 323, cy: 520, rx: 32, ry: 12 })}
      ${A("ellipse", { cx: 426, cy: 524, rx: 32, ry: 12 })}
      ${A("ellipse", { cx: 530, cy: 516, rx: 32, ry: 12 })}
      ${D("circle", { cx: 322, cy: 174, r: 7 })}
      ${L("path", { d: "M300 205 Q328 220 358 205" })}
    `;
  }

  return wrapPage(def, `${T(kind, { x: 400, y: 66 })}${body}${ground(L)}`);
}

function naturePage(def) {
  const { A, L, D, T } = shapeTools(def.slug);
  const title = def.title;
  let body = "";

  if (title === "Flower garden") {
    body = `
      ${flower(A, L, 170, 335, 0.9)}
      ${flower(A, L, 285, 315, 1.1)}
      ${flower(A, L, 420, 342, 0.85)}
      ${flower(A, L, 550, 310, 1.15)}
      ${flower(A, L, 650, 356, 0.8)}
      ${A("path", { d: "M105 500 C210 448 340 520 460 488 C578 456 650 494 724 470 L724 542 L105 542 Z" })}
    `;
  } else if (title === "Rainbow") {
    body = `${rainbow(A)}${cloud(A, 170, 450, 0.72)}${cloud(A, 630, 450, 0.72)}${A("circle", { cx: 640, cy: 135, r: 55 })}`;
  } else if (title === "Sun and clouds") {
    body = `
      ${A("circle", { cx: 400, cy: 225, r: 88 })}
      ${L("path", { d: "M400 78 L400 18 M400 432 L400 510 M246 225 L168 225 M554 225 L632 225 M292 118 L238 64 M508 118 L562 64 M292 332 L238 386 M508 332 L562 386" })}
      ${cloud(A, 210, 380, 0.8)}
      ${cloud(A, 595, 350, 0.9)}
    `;
  } else if (title === "Tree house") {
    body = `
      ${A("path", { d: "M360 500 L382 255 L438 255 L460 500 Z" })}
      ${A("circle", { cx: 320, cy: 220, r: 95 })}
      ${A("circle", { cx: 430, cy: 190, r: 105 })}
      ${A("circle", { cx: 520, cy: 238, r: 92 })}
      ${A("rect", { x: 295, y: 260, width: 210, height: 150, rx: 14 })}
      ${A("polygon", { points: "270,262 400,165 532,262" })}
      ${A("rect", { x: 380, y: 324, width: 54, height: 86, rx: 6 })}
      ${A("rect", { x: 322, y: 298, width: 40, height: 42, rx: 6 })}
      ${A("rect", { x: 448, y: 298, width: 40, height: 42, rx: 6 })}
      ${L("path", { d: "M250 430 L550 430 M340 430 L312 510 M460 430 L488 510" })}
    `;
  } else if (title === "Stars and moon") {
    body = `
      ${A("path", { d: "M438 145 C358 182 336 306 410 372 C332 360 270 294 270 214 C270 114 372 58 438 145 Z" })}
      ${star(A, 180, 140, 34)}
      ${star(A, 612, 130, 42)}
      ${star(A, 550, 325, 30)}
      ${star(A, 230, 390, 28)}
      ${star(A, 400, 480, 36)}
      ${L("path", { d: "M100 515 C220 492 300 520 410 504 C520 488 610 515 710 490" })}
    `;
  } else if (title === "Beach") {
    body = `
      ${A("circle", { cx: 655, cy: 118, r: 58 })}
      ${A("path", { d: "M115 430 C215 392 310 462 410 430 C520 394 590 452 705 420 L705 535 L115 535 Z" })}
      ${A("path", { d: "M220 338 L420 278 L612 338 C525 392 318 394 220 338 Z" })}
      ${L("path", { d: "M416 338 L380 520" })}
      ${A("rect", { x: 520, y: 430, width: 88, height: 82, rx: 12 })}
      ${A("path", { d: "M505 430 L622 430 L604 390 L522 390 Z" })}
      ${A("circle", { cx: 230, cy: 455, r: 42 })}
      ${L("path", { d: "M95 350 C150 330 200 370 255 350 C310 330 365 370 420 350 M92 390 C150 370 200 410 258 390 C314 370 370 410 425 390" })}
    `;
  } else if (title === "Mountain") {
    body = `
      ${A("polygon", { points: "70,500 260,190 445,500" })}
      ${A("polygon", { points: "290,500 530,140 744,500" })}
      ${A("polygon", { points: "210,270 260,190 312,275 265,254" })}
      ${A("polygon", { points: "482,212 530,140 586,230 534,206" })}
      ${A("path", { d: "M120 505 C230 445 340 545 454 496 C575 445 650 500 728 470 L728 545 L120 545 Z" })}
      ${cloud(A, 190, 135, 0.55)}
      ${cloud(A, 620, 105, 0.6)}
    `;
  } else if (title === "Apple tree") {
    body = `
      ${A("path", { d: "M360 510 L382 290 L432 290 L460 510 Z" })}
      ${A("circle", { cx: 330, cy: 245, r: 92 })}
      ${A("circle", { cx: 430, cy: 205, r: 106 })}
      ${A("circle", { cx: 520, cy: 258, r: 88 })}
      ${A("circle", { cx: 360, cy: 250, r: 18 })}
      ${A("circle", { cx: 455, cy: 285, r: 18 })}
      ${A("circle", { cx: 510, cy: 225, r: 18 })}
      ${A("circle", { cx: 410, cy: 168, r: 18 })}
      ${ground(L)}
    `;
  } else if (title === "Snowman") {
    body = `
      ${A("circle", { cx: 400, cy: 410, r: 95 })}
      ${A("circle", { cx: 400, cy: 285, r: 72 })}
      ${A("circle", { cx: 400, cy: 190, r: 54 })}
      ${A("rect", { x: 340, y: 104, width: 120, height: 38, rx: 6 })}
      ${A("rect", { x: 362, y: 48, width: 78, height: 72, rx: 8 })}
      ${A("path", { d: "M334 272 L466 272 L442 312 L360 312 Z" })}
      ${A("polygon", { points: "402,192 482,210 402,226" })}
      ${L("path", { d: "M328 292 L220 240 M472 292 L580 240" })}
      ${D("circle", { cx: 380, cy: 178, r: 6 })}
      ${D("circle", { cx: 420, cy: 178, r: 6 })}
      ${ground(L)}
    `;
  } else {
    body = `
      ${A("circle", { cx: 640, cy: 125, r: 52 })}
      ${cloud(A, 185, 140, 0.65)}
      ${flower(A, L, 180, 360, 0.85)}
      ${flower(A, L, 315, 340, 1)}
      ${flower(A, L, 455, 365, 0.8)}
      ${flower(A, L, 590, 335, 1.05)}
      ${A("path", { d: "M110 500 C214 455 340 525 460 488 C574 455 650 500 725 472 L725 545 L110 545 Z" })}
      ${A("ellipse", { cx: 380, cy: 230, rx: 52, ry: 72, transform: "rotate(-30 380 230)" })}
      ${A("ellipse", { cx: 460, cy: 230, rx: 52, ry: 72, transform: "rotate(30 460 230)" })}
      ${A("ellipse", { cx: 420, cy: 250, rx: 18, ry: 62 })}
    `;
  }

  return wrapPage(def, `${T(title, { x: 400, y: 66 })}${body}`);
}

function toyPage(def) {
  const { A, L, D, T } = shapeTools(def.slug);
  const title = def.title;
  let body = "";

  if (title === "Teddy bear") {
    body = `
      ${A("circle", { cx: 400, cy: 245, r: 92 })}
      ${A("circle", { cx: 318, cy: 168, r: 38 })}
      ${A("circle", { cx: 482, cy: 168, r: 38 })}
      ${A("ellipse", { cx: 400, cy: 392, rx: 126, ry: 116 })}
      ${A("ellipse", { cx: 282, cy: 380, rx: 45, ry: 82, transform: "rotate(25 282 380)" })}
      ${A("ellipse", { cx: 518, cy: 380, rx: 45, ry: 82, transform: "rotate(-25 518 380)" })}
      ${A("ellipse", { cx: 342, cy: 505, rx: 54, ry: 28 })}
      ${A("ellipse", { cx: 458, cy: 505, rx: 54, ry: 28 })}
      ${A("ellipse", { cx: 400, cy: 275, rx: 42, ry: 32 })}
      ${D("circle", { cx: 365, cy: 235, r: 7 })}
      ${D("circle", { cx: 435, cy: 235, r: 7 })}
    `;
  } else if (title === "Doll") {
    body = `
      ${A("path", { d: "M320 200 C320 110 480 110 480 200 C480 280 320 280 320 200 Z" })}
      ${A("circle", { cx: 400, cy: 218, r: 74 })}
      ${D("circle", { cx: 370, cy: 210, r: 7 })}
      ${D("circle", { cx: 430, cy: 210, r: 7 })}
      ${L("path", { d: "M374 246 Q400 266 426 246" })}
      ${A("path", { d: "M330 312 L470 312 L520 500 L280 500 Z" })}
      ${A("path", { d: "M330 328 C250 352 220 420 266 450" })}
      ${A("path", { d: "M470 328 C550 352 580 420 534 450" })}
      ${A("ellipse", { cx: 330, cy: 524, rx: 38, ry: 15 })}
      ${A("ellipse", { cx: 470, cy: 524, rx: 38, ry: 15 })}
      ${A("path", { d: "M322 312 L400 390 L478 312" })}
    `;
  } else if (title === "Balloons") {
    body = `
      ${A("ellipse", { cx: 260, cy: 210, rx: 70, ry: 92 })}
      ${A("ellipse", { cx: 400, cy: 170, rx: 72, ry: 98 })}
      ${A("ellipse", { cx: 540, cy: 215, rx: 70, ry: 92 })}
      ${A("ellipse", { cx: 335, cy: 300, rx: 65, ry: 84 })}
      ${A("ellipse", { cx: 475, cy: 300, rx: 65, ry: 84 })}
      ${L("path", { d: "M260 304 C250 385 345 410 385 522 M400 268 C418 350 350 415 385 522 M540 307 C562 388 420 428 385 522 M335 384 C330 435 365 475 385 522 M475 384 C480 438 410 476 385 522" })}
      ${A("path", { d: "M348 522 C370 496 405 496 426 522 C405 545 370 545 348 522 Z" })}
    `;
  } else if (title === "Toy car") {
    body = `
      ${A("path", { d: "M160 360 L235 250 L515 250 L630 360 Z" })}
      ${A("rect", { x: 135, y: 340, width: 530, height: 120, rx: 36 })}
      ${A("path", { d: "M270 260 L332 190 L455 190 L520 260 Z" })}
      ${A("circle", { cx: 260, cy: 470, r: 55 })}
      ${A("circle", { cx: 540, cy: 470, r: 55 })}
      ${A("circle", { cx: 260, cy: 470, r: 22 })}
      ${A("circle", { cx: 540, cy: 470, r: 22 })}
      ${A("rect", { x: 350, y: 302, width: 90, height: 46, rx: 12 })}
      ${L("path", { d: "M110 530 L700 530" })}
    `;
  } else if (title === "Blocks") {
    body = `
      ${A("rect", { x: 185, y: 340, width: 140, height: 140, rx: 12 })}
      ${A("rect", { x: 330, y: 340, width: 140, height: 140, rx: 12 })}
      ${A("rect", { x: 475, y: 340, width: 140, height: 140, rx: 12 })}
      ${A("rect", { x: 255, y: 200, width: 140, height: 140, rx: 12 })}
      ${A("rect", { x: 405, y: 200, width: 140, height: 140, rx: 12 })}
      ${T("A", { x: 255, y: 425 })}
      ${T("B", { x: 400, y: 425 })}
      ${T("C", { x: 545, y: 425 })}
      ${T("1", { x: 325, y: 285 })}
      ${T("2", { x: 475, y: 285 })}
      ${L("path", { d: "M145 500 L655 500" })}
    `;
  } else if (title === "Kite") {
    body = `
      ${A("polygon", { points: "400,100 560,260 400,430 240,260" })}
      ${L("path", { d: "M400 100 L400 430 M240 260 L560 260" })}
      ${L("path", { d: "M400 430 C330 492 455 510 390 565" })}
      ${A("path", { d: "M344 486 L302 460 L308 512 Z" })}
      ${A("path", { d: "M438 520 L490 498 L482 552 Z" })}
      ${cloud(A, 165, 170, 0.6)}
      ${cloud(A, 635, 150, 0.55)}
    `;
  } else if (title === "Cupcake") {
    body = `
      ${A("path", { d: "M260 300 C248 212 340 210 365 252 C390 178 500 205 485 292 C560 296 572 380 508 402 L292 402 C230 380 218 316 260 300 Z" })}
      ${A("path", { d: "M285 400 L515 400 L478 535 L322 535 Z" })}
      ${L("path", { d: "M325 410 L340 528 M382 410 L388 532 M440 410 L430 532 M490 410 L464 530" })}
      ${A("circle", { cx: 400, cy: 190, r: 22 })}
      ${A("circle", { cx: 330, cy: 300, r: 14 })}
      ${A("circle", { cx: 455, cy: 282, r: 14 })}
    `;
  } else if (title === "Ice cream") {
    body = `
      ${A("polygon", { points: "290,300 510,300 400,540" })}
      ${L("path", { d: "M330 380 L470 380 M350 430 L450 430 M370 480 L430 480" })}
      ${A("circle", { cx: 325, cy: 245, r: 74 })}
      ${A("circle", { cx: 400, cy: 205, r: 82 })}
      ${A("circle", { cx: 480, cy: 245, r: 74 })}
      ${A("path", { d: "M260 300 C320 340 480 340 540 300" })}
      ${A("circle", { cx: 398, cy: 110, r: 20 })}
    `;
  } else if (title === "Birthday cake") {
    body = `
      ${A("rect", { x: 235, y: 330, width: 330, height: 150, rx: 18 })}
      ${A("rect", { x: 285, y: 230, width: 230, height: 105, rx: 18 })}
      ${A("path", { d: "M236 360 C280 405 312 330 358 365 C402 400 440 330 484 365 C520 395 545 350 565 360" })}
      ${A("path", { d: "M286 260 C320 296 350 232 382 260 C414 292 450 232 514 260" })}
      ${A("rect", { x: 315, y: 148, width: 28, height: 82, rx: 8 })}
      ${A("rect", { x: 386, y: 128, width: 28, height: 102, rx: 8 })}
      ${A("rect", { x: 458, y: 148, width: 28, height: 82, rx: 8 })}
      ${A("path", { d: "M329 148 C304 120 330 92 344 124 C350 136 340 148 329 148 Z" })}
      ${A("path", { d: "M400 128 C375 100 401 72 415 104 C421 116 411 128 400 128 Z" })}
      ${A("path", { d: "M472 148 C447 120 473 92 487 124 C493 136 483 148 472 148 Z" })}
    `;
  } else {
    body = `
      ${A("polygon", { points: "400,90 560,500 240,500" })}
      ${L("path", { d: "M308 330 C370 294 432 366 496 330 M278 420 C352 382 448 458 526 420" })}
      ${A("circle", { cx: 400, cy: 85, r: 38 })}
      ${A("circle", { cx: 355, cy: 260, r: 18 })}
      ${A("circle", { cx: 440, cy: 350, r: 18 })}
      ${A("circle", { cx: 392, cy: 442, r: 18 })}
      ${star(A, 520, 170, 26)}
      ${star(A, 265, 180, 24)}
    `;
  }

  return wrapPage(def, `${T(title, { x: 400, y: 66 })}${body}`);
}

function adventurePage(def) {
  const { A, L, D, T } = shapeTools(def.slug);
  const title = def.title;
  let props = "";

  if (title.includes("balloons")) {
    props = `
      ${A("ellipse", { cx: 190, cy: 150, rx: 44, ry: 58 })}
      ${A("ellipse", { cx: 610, cy: 150, rx: 44, ry: 58 })}
      ${L("path", { d: "M190 208 C210 295 245 315 280 345 M610 208 C590 295 555 315 520 345" })}
    `;
  } else if (title.includes("garden")) {
    props = `${flower(A, L, 130, 420, 0.7)}${flower(A, L, 650, 420, 0.7)}${flower(A, L, 400, 430, 0.65)}`;
  } else if (title.includes("teddy")) {
    props = `
      ${A("circle", { cx: 220, cy: 405, r: 38 })}
      ${A("circle", { cx: 190, cy: 372, r: 15 })}
      ${A("circle", { cx: 250, cy: 372, r: 15 })}
      ${A("ellipse", { cx: 220, cy: 465, rx: 42, ry: 52 })}
      ${A("circle", { cx: 580, cy: 405, r: 38 })}
      ${A("circle", { cx: 550, cy: 372, r: 15 })}
      ${A("circle", { cx: 610, cy: 372, r: 15 })}
      ${A("ellipse", { cx: 580, cy: 465, rx: 42, ry: 52 })}
    `;
  } else if (title.includes("rainbow")) {
    props = rainbow(A, 400, 300, 0.72);
  } else if (title.includes("birthday")) {
    props = `
      ${A("rect", { x: 330, y: 395, width: 140, height: 82, rx: 12 })}
      ${A("path", { d: "M330 420 C360 452 390 398 420 424 C444 445 458 420 470 420" })}
      ${A("rect", { x: 388, y: 332, width: 24, height: 62, rx: 8 })}
      ${A("path", { d: "M400 332 C380 310 402 284 414 313 C420 324 410 332 400 332 Z" })}
    `;
  } else if (title.includes("flowers")) {
    props = `${flower(A, L, 245, 370, 0.68)}${flower(A, L, 555, 370, 0.68)}${A("path", { d: "M275 382 C330 338 470 338 525 382" })}`;
  } else if (title.includes("playground")) {
    props = `
      ${L("path", { d: "M116 465 L250 210 L390 465 M250 210 L520 210 L685 465" })}
      ${A("rect", { x: 350, y: 300, width: 118, height: 28, rx: 14 })}
      ${L("path", { d: "M380 210 L380 300 M440 210 L440 300 M120 465 L690 465" })}
    `;
  } else if (title.includes("stars")) {
    props = `${star(A, 170, 150, 30)}${star(A, 620, 145, 32)}${star(A, 400, 125, 26)}${star(A, 690, 310, 24)}`;
  } else if (title.includes("house")) {
    props = `
      ${A("rect", { x: 310, y: 255, width: 180, height: 150, rx: 12 })}
      ${A("polygon", { points: "285,256 400,162 515,256" })}
      ${A("rect", { x: 378, y: 320, width: 48, height: 85, rx: 6 })}
      ${A("rect", { x: 328, y: 292, width: 38, height: 38, rx: 5 })}
      ${A("rect", { x: 436, y: 292, width: 38, height: 38, rx: 5 })}
    `;
  } else {
    props = `
      ${A("ellipse", { cx: 205, cy: 455, rx: 55, ry: 35 })}
      ${A("circle", { cx: 260, cy: 430, r: 28 })}
      ${A("path", { d: "M165 438 C115 400 102 474 158 470" })}
      ${A("ellipse", { cx: 595, cy: 455, rx: 55, ry: 35 })}
      ${A("circle", { cx: 540, cy: 430, r: 28 })}
      ${A("ellipse", { cx: 522, cy: 406, rx: 13, ry: 24, transform: "rotate(-20 522 406)" })}
      ${A("ellipse", { cx: 558, cy: 406, rx: 13, ry: 24, transform: "rotate(20 558 406)" })}
    `;
  }

  return wrapPage(
    def,
    `${T(title, { x: 400, y: 66 })}
    ${props}
    ${girl(A, L, D, 310, 250, "left")}
    ${girl(A, L, D, 500, 250, "right")}
    ${ground(L)}`,
  );
}

function magicPage(def) {
  const { A, L, D, T } = shapeTools(def.slug);
  const title = def.title;
  let body = "";

  if (title === "Castle") {
    body = `
      ${A("rect", { x: 220, y: 250, width: 360, height: 230, rx: 10 })}
      ${A("rect", { x: 145, y: 205, width: 110, height: 275, rx: 8 })}
      ${A("rect", { x: 545, y: 205, width: 110, height: 275, rx: 8 })}
      ${A("polygon", { points: "145,205 200,112 255,205" })}
      ${A("polygon", { points: "545,205 600,112 655,205" })}
      ${A("polygon", { points: "310,250 400,120 490,250" })}
      ${A("path", { d: "M360 480 L360 390 C360 340 440 340 440 390 L440 480 Z" })}
      ${A("rect", { x: 280, y: 300, width: 50, height: 60, rx: 8 })}
      ${A("rect", { x: 470, y: 300, width: 50, height: 60, rx: 8 })}
      ${L("path", { d: "M220 250 L250 220 L280 250 L310 220 L340 250 L370 220 L400 250 L430 220 L460 250 L490 220 L520 250 L550 220 L580 250" })}
    `;
  } else if (title === "Fantasy horse") {
    body = `
      ${A("ellipse", { cx: 430, cy: 340, rx: 150, ry: 82 })}
      ${A("path", { d: "M305 320 C238 250 280 150 360 178 C386 198 364 276 342 324 Z" })}
      ${A("circle", { cx: 352, cy: 178, r: 50 })}
      ${A("polygon", { points: "350,122 382,42 402,136" })}
      ${A("path", { d: "M408 172 C470 92 550 105 585 170 C510 165 460 195 408 172 Z" })}
      ${A("path", { d: "M560 330 C668 268 714 372 610 414" })}
      ${A("path", { d: "M350 414 L328 514 M440 418 L426 516 M510 410 L538 510" })}
      ${A("ellipse", { cx: 325, cy: 526, rx: 30, ry: 12 })}
      ${A("ellipse", { cx: 426, cy: 528, rx: 30, ry: 12 })}
      ${A("ellipse", { cx: 540, cy: 520, rx: 30, ry: 12 })}
      ${D("circle", { cx: 334, cy: 170, r: 7 })}
      ${star(A, 190, 145, 28)}
      ${star(A, 640, 145, 30)}
    `;
  } else if (title === "Magic garden") {
    body = `
      ${flower(A, L, 155, 378, 1)}
      ${flower(A, L, 300, 335, 1.25)}
      ${flower(A, L, 485, 360, 1.1)}
      ${flower(A, L, 640, 330, 1)}
      ${A("path", { d: "M122 508 C210 442 330 530 450 488 C580 442 650 500 724 470 L724 544 L122 544 Z" })}
      ${A("path", { d: "M360 250 C385 180 448 180 470 250 C442 235 390 235 360 250 Z" })}
      ${star(A, 250, 135, 22)}
      ${star(A, 548, 150, 26)}
      ${star(A, 405, 118, 20)}
    `;
  } else if (title === "Fairy lights") {
    body = `
      ${L("path", { d: "M90 178 C220 88 315 250 420 160 C535 62 620 220 710 130" })}
      ${A("ellipse", { cx: 140, cy: 165, rx: 26, ry: 38 })}
      ${A("ellipse", { cx: 245, cy: 160, rx: 26, ry: 38 })}
      ${A("ellipse", { cx: 350, cy: 185, rx: 26, ry: 38 })}
      ${A("ellipse", { cx: 460, cy: 150, rx: 26, ry: 38 })}
      ${A("ellipse", { cx: 565, cy: 150, rx: 26, ry: 38 })}
      ${A("ellipse", { cx: 670, cy: 135, rx: 26, ry: 38 })}
      ${A("rect", { x: 250, y: 300, width: 300, height: 170, rx: 22 })}
      ${A("path", { d: "M250 330 C300 380 350 300 400 340 C460 388 495 310 550 330" })}
      ${star(A, 205, 420, 24)}
      ${star(A, 600, 415, 24)}
    `;
  } else if (title === "Moon and stars") {
    body = `
      ${A("path", { d: "M455 118 C348 162 318 336 412 424 C292 400 218 306 230 206 C244 90 362 42 455 118 Z" })}
      ${star(A, 150, 145, 32)}
      ${star(A, 650, 145, 34)}
      ${star(A, 590, 330, 28)}
      ${star(A, 260, 430, 30)}
      ${star(A, 440, 500, 24)}
    `;
  } else if (title === "Cute planet") {
    body = `
      ${A("circle", { cx: 400, cy: 300, r: 125 })}
      ${A("path", { d: "M170 320 C260 230 540 230 630 320 C540 398 260 398 170 320 Z" })}
      ${A("circle", { cx: 360, cy: 270, r: 22 })}
      ${A("circle", { cx: 455, cy: 335, r: 26 })}
      ${D("circle", { cx: 360, cy: 300, r: 7 })}
      ${D("circle", { cx: 440, cy: 300, r: 7 })}
      ${L("path", { d: "M370 345 Q400 370 430 345" })}
      ${star(A, 155, 150, 28)}
      ${star(A, 650, 430, 30)}
      ${star(A, 612, 145, 22)}
    `;
  } else if (title === "Candy land") {
    body = `
      ${A("path", { d: "M95 500 C180 430 280 540 390 480 C520 410 620 520 705 455 L705 548 L95 548 Z" })}
      ${A("circle", { cx: 205, cy: 290, r: 58 })}
      ${L("path", { d: "M205 348 L205 505 M160 250 C190 278 220 278 250 250 M160 330 C190 302 220 302 250 330" })}
      ${A("circle", { cx: 575, cy: 285, r: 58 })}
      ${L("path", { d: "M575 343 L575 505 M530 245 C560 275 590 275 620 245 M530 325 C560 300 590 300 620 325" })}
      ${A("path", { d: "M330 360 C330 250 470 250 470 360 L470 505 L330 505 Z" })}
      ${L("path", { d: "M350 290 C390 330 410 330 450 290 M345 370 C390 420 415 420 455 370" })}
    `;
  } else if (title === "Princess-style dress") {
    body = `
      ${A("path", { d: "M340 135 C380 178 420 178 460 135 L510 300 L290 300 Z" })}
      ${A("path", { d: "M290 300 C220 390 185 470 155 535 L645 535 C610 470 580 390 510 300 Z" })}
      ${A("path", { d: "M335 160 C288 190 260 238 290 300" })}
      ${A("path", { d: "M465 160 C512 190 540 238 510 300" })}
      ${A("path", { d: "M355 135 L400 230 L445 135" })}
      ${L("path", { d: "M250 395 C320 430 480 430 550 395 M215 465 C330 515 470 515 585 465" })}
      ${star(A, 400, 94, 25)}
    `;
  } else if (title === "Dream house") {
    body = `
      ${A("rect", { x: 245, y: 255, width: 310, height: 230, rx: 22 })}
      ${A("polygon", { points: "210,255 400,110 590,255" })}
      ${A("rect", { x: 370, y: 360, width: 62, height: 125, rx: 10 })}
      ${A("rect", { x: 288, y: 310, width: 60, height: 58, rx: 10 })}
      ${A("rect", { x: 452, y: 310, width: 60, height: 58, rx: 10 })}
      ${A("path", { d: "M245 485 C320 440 485 440 555 485" })}
      ${cloud(A, 170, 140, 0.55)}
      ${cloud(A, 635, 155, 0.55)}
      ${flower(A, L, 155, 430, 0.55)}
      ${flower(A, L, 645, 430, 0.55)}
    `;
  } else {
    body = `
      ${girl(A, L, D, 310, 250, "left")}
      ${girl(A, L, D, 500, 250, "right")}
      ${A("path", { d: "M210 160 C260 80 350 120 310 205 C285 250 230 220 210 160 Z" })}
      ${A("path", { d: "M590 160 C540 80 450 120 490 205 C515 250 570 220 590 160 Z" })}
      ${A("rect", { x: 332, y: 390, width: 136, height: 80, rx: 12 })}
      ${A("path", { d: "M332 410 C360 438 385 385 412 412 C438 440 452 410 468 410" })}
      ${star(A, 160, 120, 28)}
      ${star(A, 640, 120, 28)}
      ${star(A, 400, 95, 24)}
      ${ground(L)}
    `;
  }

  return wrapPage(def, `${T(title, { x: 400, y: 66 })}${body}`);
}

function renderPage(def) {
  if (def.id <= 10) {
    return animalPage(def, def.title);
  }
  if (def.id <= 20) {
    return naturePage(def);
  }
  if (def.id <= 30) {
    return toyPage(def);
  }
  if (def.id <= 40) {
    return adventurePage(def);
  }
  return magicPage(def);
}

function createTargetColors(def, svg) {
  const areaIds = [...svg.matchAll(/data-area-id="([^"]+)"/g)].map((match) => match[1]);
  const palette = targetPalettes[def.category] || targetPalettes["Toys and fun"];
  const titleOffset = [...def.title].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;

  return Object.fromEntries(
    areaIds.map((areaId, index) => {
      const color = palette[(index + titleOffset + Math.floor(index / 3)) % palette.length];
      return [areaId, color];
    }),
  );
}

await mkdir(pagesDir, { recursive: true });

for (const def of levelDefs) {
  const filename = `level-${String(def.id).padStart(2, "0")}-${def.slug}.svg`;
  const svg = renderPage(def);
  await writeFile(path.join(pagesDir, filename), svg, "utf8");
  def.asset = `./assets/coloring-pages/${filename}`;
  def.targetColors = createTargetColors(def, svg);
}

const levelsSource = `export const levels = ${JSON.stringify(
  levelDefs.map(({ id, category, title, asset, targetColors }) => ({ id, category, title, asset, targetColors })),
  null,
  2,
)};
`;

await writeFile(levelsPath, levelsSource, "utf8");
console.log(`Generated ${levelDefs.length} coloring pages.`);
