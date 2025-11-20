gId("useSerpentine").addEventListener("input", function () {
  useSerpentine = gId("useSerpentine").checked;
  processFrame();
});

gId("useBuffer").addEventListener("input", function () {
  useBuffer = gId("useBuffer").checked;

  if (useBuffer) {
    gId("bufferSelectDisp").classList.remove("disabled");
    errDiffsBuffer = bufferChange(canvasWidth, canvasHeight);

    setErrDiffsTarget = () => {
      errDiffsBufferTarget = errDiffsBuffer;
    };

    getBufferValue = (i) => errDiffsBuffer[i];
  } else {
    gId("bufferSelectDisp").classList.add("disabled");
    errDiffsBuffer = null;

    setErrDiffsTarget = (d) => {
      errDiffsBufferTarget = d;
    };

    getBufferValue = () => 0;
  }

  processFrame();
});

gId("buffer").addEventListener("change", function () {
  buffer = gId("buffer").value;
  errDiffsBuffer = bufferChange(canvasWidth, canvasHeight);
});

function autoDivWrapper() {
  if (autoDiv) {
    divisionInput = findHighest(matrixInput.flat()) + 1;
    gId("divisionInput").value = findHighest(matrixInput.flat()) + 1;
  } else if (!autoDiv) {
    divisionInput = Number(gId("divisionInput").value);
  }
}

function errDiffsAutoDivWrapper() {
  if (errDiffsAutoDiv) {
    errDiffsDivisionInput = matrixSum_2D(errDiffsMatrixInput) + 1;
    gId("errDiffsDivisionInput").value = matrixSum_2D(errDiffsMatrixInput) + 1;
  } else if (!errDiffsAutoDiv) {
    errDiffsDivisionInput = Number(gId("errDiffsDivisionInput").value);
  }
}

gId("matrixInput").addEventListener("input", function () {
  matrixInput = JSON.parse(gId("matrixInput").value);
  autoDiv = gId("autoDiv").checked;
  autoDivWrapper();
  matrixInputLUTCreate();

  if (ditherDropdown.value === "dotDiffs") dotDiffsClassInputLUTCreate();
});

gId("divisionInput").addEventListener("input", function () {
  autoDivWrapper();
  matrixInputLUTCreate();
});

gId("autoDiv").addEventListener("input", function () {
  autoDiv = gId("autoDiv").checked;
  autoDivWrapper();
  matrixInputLUTCreate();
});

gId("arithmeticInput").addEventListener("input", function () {
  arithmeticInput = gId("arithmeticInput").value;
});

gId("errDiffsMatrixInput").addEventListener("input", function () {
  errDiffsMatrixInput = JSON.parse(gId("errDiffsMatrixInput").value);

  errDiffsAutoDivWrapper();
  errDiffsKernel = parseKernelErrDiffs(errDiffsMatrixInput, errDiffsDivisionInput);

  if (ditherDropdown.value === "dotDiffs") dotDiffsClassInputLUTCreate();
});

gId("errDiffsDivisionInput").addEventListener("input", function () {
  errDiffsAutoDivWrapper();
  errDiffsKernel = parseKernelErrDiffs(errDiffsMatrixInput, errDiffsDivisionInput);

  if (ditherDropdown.value === "dotDiffs") dotDiffsClassInputLUTCreate();
});

gId("errDiffsAutoDiv").addEventListener("input", function () {
  errDiffsAutoDiv = gId("errDiffsAutoDiv").checked;
  errDiffsAutoDivWrapper();

  if (ditherDropdown.value === "dotDiffs") dotDiffsClassInputLUTCreate();
});

gId("thresholdInput").addEventListener("input", function () {
  matrixThresholdInput = Number(gId("thresholdInput").value);

  processFrame();
});

gId("thresholdInputIncrement").addEventListener("mousedown", async function () {
  matrixThresholdInput += Number(gId("thresholdInputSteps").value);
  gId("thresholdInput").value = matrixThresholdInput;

  processFrame();
});

gId("thresholdInputDecrement").addEventListener("mousedown", async function () {
  matrixThresholdInput -= Number(gId("thresholdInputSteps").value);
  gId("thresholdInput").value = matrixThresholdInput;

  processFrame();
});

function disableAll() {
  gId("matrixDisp").classList.add("disabled");
  gId("arithmeticDisp").classList.add("disabled");
  gId("errDiffs").classList.add("disabled");

  gId("errDiffsInputDisp").classList.add("disabled");
  gId("serpentineDisp").classList.add("disabled");
  gId("bufferDisp").classList.add("disabled");
}

gId("dither").addEventListener("change", function () {
  let dropdownValue = gId("dither").value;
  if (dropdownValue === "none") {
    disableAll();
  } else if (dropdownValue === "matrixThreshold") {
    disableAll();
    gId("matrixDisp").classList.remove("disabled");
  } else if (dropdownValue === "arithmetic") {
    disableAll();
    gId("arithmetic").classList.remove("disabled");
    gId("arithmeticDisp").classList.remove("disabled");
  } else if (dropdownValue === "errDiffs") {
    disableAll();
    gId("errDiffs").classList.remove("disabled");
    gId("errDiffsInputDisp").classList.remove("disabled");
    gId("serpentineDisp").classList.remove("disabled");
    gId("bufferDisp").classList.remove("disabled");
  } else if (dropdownValue === "dotDiffs") {
    disableAll();
    gId("matrixDisp").classList.remove("disabled");

    gId("errDiffs").classList.remove("disabled");
    gId("errDiffsInputDisp").classList.remove("disabled");
    gId("bufferDisp").classList.remove("disabled");
  }
});

(function () {
  useSerpentine = gId("useSerpentine").checked;
  useBuffer = gId("useBuffer").checked;
  buffer = gId("buffer").value;
  autoDiv = gId("autoDiv").checked;
  errDiffsAutoDiv = gId("errDiffsAutoDiv").checked;
  autoDivWrapper();
  errDiffsAutoDivWrapper();
  matrixInputLUTCreate();
  dotDiffsClassInputLUTCreate();

  errDiffsBuffer = [];
  setErrDiffsTarget = (d) => {
    errDiffsBufferTarget = d;
  };
  if (useBuffer) {
    getBufferValue = (i, c) => errDiffsBuffer[i + c]; // read from buffer
  } else {
    getBufferValue = () => 0; // always return 0
  }
})();
