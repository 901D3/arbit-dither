const d = {
  none: () => {},
  matrixThreshold: bayer,
  arithmetic: arithmetic,
  errDiffs: errDiffs,
  dotDiffs: dotDiffs,
};

function processFrame() {
  const imagePresets = gId("imagePresets").value;
  if (imagePresets === "threshold") thresholdImageGenerator(matrixThresholdInput);

  d[ditherDropdownValue](imageMatrixInput);

  const frame = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const imageData = frame.data;

  for (let i = 0, sqSz = canvasWidth * canvasHeight; i < sqSz; i++) {
    const v = Math.floor(imageMatrixInput[i] * 255);
    const i2 = i << 2;

    imageData[i2] = v;
    imageData[i2 + 1] = v;
    imageData[i2 + 2] = v;
  }

  ctx.putImageData(frame, 0, 0);
}
