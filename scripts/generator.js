const thresholdImageGenerator = (value) => {
  const sqSz = canvasWidth * canvasHeight;

  if (!ArrayBuffer.isView(imageMatrixInput)) {
    imageMatrixInput = new Float64Array(sqSz);
  }

  for (let i = 0; i < sqSz; i++) {
    imageMatrixInput[i] = value;
  }
};

const matrixInputLUTCreate = () => {
  const mY = matrixInput.length;
  const mX = matrixInput[0].length;

  matrixInputLUT = new Float32Array(mY * mX);

  for (let y = 0; y < mY; y++) {
    const yOffs = y * mX;

    for (let x = 0; x < mX; x++) {
      matrixInputLUT[yOffs + x] = matrixInput[y][x] / divisionInput;
    }
  }

  matrixInputLUT.mY = mY;
  matrixInputLUT.mX = mX;
};

function bayerGen(size) {
  let seed = [
    [0, 2],
    [3, 1],
  ];

  for (let cursor = seed.length; cursor < size; cursor <<= 1) {
    const newSize = cursor << 1;
    const mat = [];

    for (let y = 0; y < newSize; y++) {
      mat[y] = [];

      for (let x = 0; x < newSize; x++) {
        const matVal = seed[y % cursor][x % cursor] * 4;

        if (y < cursor) {
          if (x < cursor) {
            mat[y][x] = matVal;
          } else if (x >= cursor) {
            mat[y][x] = matVal + 2;
          }
        } else if (y >= cursor && x < cursor) mat[y][x] = matVal + 3;
        else mat[y][x] = matVal + 1;
      }
    }

    seed = mat;
  }

  return seed;
}

const dotDiffsClassInputLUTCreate = () => {
  const classHeight = matrixInput.length;
  const classWidth = matrixInput[0].length;

  // Find max/min class values in the clas matrix input
  let minClassValue = Infinity;
  let maxClassValue = -Infinity;

  for (let y = 0; y < classHeight; y++) {
    for (let x = 0; x < classWidth; x++) {
      const v = matrixInput[y][x];

      if (v < minClassValue) minClassValue = v;
      if (v > maxClassValue) maxClassValue = v;
    }
  }

  // Save all available class values, ignore skipped class values
  dotDiffsAvailableClassValues = [];
  for (let i = minClassValue; i <= maxClassValue; i++) {
    let exists = false;

    for (let y = 0; y < classHeight && !exists; y++) {
      for (let x = 0; x < classWidth && !exists; x++) {
        if (matrixInput[y][x] === i) exists = true;
      }
    }

    if (exists) dotDiffsAvailableClassValues.push(i);
  }

  // [classValue][index of the class value tiled on the canvas]
  dotDiffsClassMatrixCanvasLUT = [];
  const classToIndex = [];

  for (let i = 0, length = dotDiffsAvailableClassValues.length; i < length; i++) {
    dotDiffsClassMatrixCanvasLUT[i] = [];
    classToIndex[dotDiffsAvailableClassValues[i]] = i;
  }

  for (let y = 0; y < canvasHeight; y++) {
    const yOffs = y * canvasWidth;
    const classY = y % classHeight;

    for (let x = 0; x < canvasWidth; x++) {
      const classIndex = classToIndex[matrixInput[classY][x % classWidth]];
      if (!dotDiffsClassMatrixCanvasLUT[classIndex]) {
        dotDiffsClassMatrixCanvasLUT[classIndex] = [];
      }

      dotDiffsClassMatrixCanvasLUT[classIndex].push(yOffs + x);
    }
  }
};
