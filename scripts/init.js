function gId(i) {
  return document.getElementById(i);
}

function gIdV(i) {
  return document.getElementById(i).value;
}

function pFl(i) {
  return parseFloat(i);
}

function pIn(i) {
  return parseInt(i);
}

function lwC(i) {
  return i.toLowerCase();
}

function setDisp(i, s) {
  return (gId(i).style.display = s);
}

let A = 1.7976931348623157e308,
  B = 5e-324;

function hideElements() {
  elementsToHide.forEach((id) => setDisp(id, "none"));
}

var canvas = gId("canvas");
var ctx = canvas.getContext("2d", {
  willReadFrequently: true,
  alpha: false,
  colorSpace: "srgb",
  colorType: "float16",
  desynchronized: false,
});
var ditherDropdown = gId("dither");
var ditherDropdownValue = "none";
var canvasStream = canvas.captureStream();
var frm = 0;
var stT = 0;
var lsUpdT = 0;
var lLT = 0;
var t = false;
var sqSz;
var {
  floor,
  ceil,
  round,
  trunc,
  sign,
  abs,
  exp,
  log,
  log2,
  log10,
  pow,
  random,
  min,
  max,
  sqrt,
  cbrt,
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  atan2,
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  E,
  PI,
  SQRT2,
  SQRT1_2,
  LN2,
  LN10,
  LOG2E,
  LOG10E,
} = Math;
var PHI = (1 + sqrt(5)) / 2;
var _2PI = 2 * PI;

let canvasWidth = 480;
let canvasHeight = 270;

let useLinear;
let useSerpentine;
let useBuffer;

let matrixInput = [[1]];
let matrixInputLUT;
let divisionInput = 1;
let autoDiv;
let matrixThresholdInput = 0;

var arithmeticInput;

var errDiffsMatrixInput = [[-1]];
var errDiffsKernel;
var errDiffsMatrixInputXStart;
var errDiffsMatrixInputYStart;
var errDiffsDivisionInput;
var errDiffsAutoDiv;
var errDiffsBuffer;
let errDiffsBufferTarget;

let dotDiffsClassMatrixCanvasLUT;
let dotDiffsAvailableClassValues;

let imageMatrixInput;

var setErrDiffsTarget = () => {};
var getBufferValue = () => {};

var getLinear = useLinear ? (val) => linearLUT[val] : (val) => val;
var getBuffer = useBuffer ? (i) => errDiffsBuffer[i] : () => 0;
var getIndex = useSerpentine
  ? (x, yOffs, y) => (y & 1 ? canvasWidth - 1 - x : x) + yOffs
  : (x, yOffs) => x + yOffs;

var frameRate;

ctx.imageSmoothingEnabled = false;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

function escapeHTML(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function RAND(seed) {
  seed = (seed >> (PI * seed)) ^ (seed * 12902091);
  return seed;
}

const linearLUT = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  linearLUT[i] = (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) * 255;
}

function defV(v1, v2, vx) {
  //v1 for input value, v2 for default value, vx for returning v2 if v1 = vx
  if (isNaN(vx) || !isFinite(vx)) {
    vx = 1;
  }
  if (Number.isNaN(v1) || !isFinite(v1) || v1 === vx) {
    printLog("Returned default value of " + v2);
    return v2;
  } else {
    return v1;
  }
}

function defVAdv(v1, v2, vmin = 0, vmax = 100, ltvmin = false, gtvmax = false) {
  if (Number.isNaN(v1) || !isFinite(v1)) return v2;
  if (ltvmin && v1 < vmin) return v2;
  if (gtvmax && v1 > vmax) return v2;

  return v1;
}

function lengthRecursive(inArray) {
  let count = 0;

  for (const item of inArray) {
    if (Array.isArray(item)) {
      count += lengthRecursive(item);
    } else {
      count += 1;
    }
  }

  return count;
}

function findHighest(matrix) {
  let result = 0;
  const matrixLength = matrix.length;

  for (let i = 0; i < matrixLength; i++) {
    const v = matrix[i];
    if (v > result) result = v;
  }

  return result;
}

function matrixSum_1D(matrix) {
  let sum = 0;
  const mX = matrix.length;

  for (let i = 0; i < mX; i++) {
    const v = matrix[i];
    if (!isNaN(v) || v !== -1) sum += v;
  }

  return sum;
}

function matrixSum_2D(matrix, exclude) {
  let sum = 0;

  matrix.forEach((row) => {
    row.forEach((v) => {
      if (v != exclude) sum += v;
    });
  });

  return sum;
}

function findStart_2D(matrix, marker) {
  const matrixLength = matrix.length;
  for (let y = 0; y < matrixLength; y++) {
    const matrixYLength = matrix[y].length;
    for (let x = 0; x < matrixYLength; x++) {
      if (matrix[y][x] === marker) {
        return {x, y};
      }
    }
  }
}

function findStart_3D(matrix, marker) {
  const matrixLength = matrix.length;
  for (let y = 0; y < matrixLength; y++) {
    const matrixYLength = matrix[y].length;
    for (let x = 0; x < matrixYLength; x++) {
      const matrixXLength = matrix[y][x].length;
      for (let z = 0; z < matrixXLength; z++) {
        if (matrix[y][x][z] === marker) {
          return {x, y, z};
        }
      }
    }
  }
}

function noiseArray_1D(width, height, start = 0, end = 255) {
  const sqSz = width * height;
  const range = end - start;
  const array = new Int32Array(sqSz);

  for (let i = 0; i < sqSz; i++) {
    array[i] = start + round(random() * range);
  }

  return array;
}

function mirrorIdx(i, n) {
  if (i < n) return i;
  const j = i - n;
  return n - 1 - j;
}

function varSync(input, variable, defaultValue) {
  let value = Number(input.value);

  slider.value = defVAdv(value, defaultValue, sliderMin, sliderMax, true, true);
  window[variable] = value;
}

function sliderInputSync(slider, input, variable, defaultValue, source) {
  let value;
  source = source.toLowerCase();

  if (source === "input") {
    value = Number(input.value);
    const sliderMin = Number(slider.min);
    const sliderMax = Number(slider.max);

    if (value >= sliderMin && value <= sliderMax) {
      slider.value = value;
    } else {
      const fixed = defVAdv(value, defaultValue, sliderMin, sliderMax, true, true);
      slider.value = fixed;
    }
  } else if (source === "slider") {
    value = Number(slider.value);
    input.value = value;
  }

  window[variable] = value;
}

let bigContainer = document.getElementsByClassName("bigContainer")[0];

if (bigContainer) {
  let observer = new ResizeObserver(() => {
    document.body.style.minWidth = bigContainer.offsetWidth + "px";
  });
  observer.observe(bigContainer);
}
